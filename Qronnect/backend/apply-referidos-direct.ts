import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: {
    schema: 'public',
  },
});

async function aplicarMigracionReferidos() {
  console.log('🚀 Aplicando migración del sistema de referidos directamente...\n');

  const migrationPath = path.join(__dirname, 'supabase/migrations/20251114000003_sistema_referidos.sql');

  console.log(`📄 Leyendo archivo: ${migrationPath}`);
  const sqlContent = fs.readFileSync(migrationPath, 'utf-8');

  // Dividir en statements individuales (por punto y coma + salto de línea)
  const statements = sqlContent
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && s !== '');

  console.log(`📊 Encontrados ${statements.length} statements SQL\n`);

  let exitosos = 0;
  let fallidos = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';';

    // Mostrar preview del statement
    const preview = stmt.substring(0, 100).replace(/\n/g, ' ');
    console.log(`\n[${i + 1}/${statements.length}] Ejecutando: ${preview}...`);

    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_string: stmt,
      });

      if (error) {
        // Si falla por la función exec_sql, intentar método alternativo
        if (error.code === 'PGRST202') {
          console.log('⚠️  Función exec_sql no disponible, usando método directo...');

          // Para CREATE TABLE, ALTER TABLE, etc. usar query directo
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({ query: stmt }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }

          console.log('✅ Ejecutado correctamente (método directo)');
          exitosos++;
        } else {
          throw error;
        }
      } else {
        console.log('✅ Ejecutado correctamente');
        exitosos++;
      }
    } catch (err: any) {
      console.error(`❌ Error:`, err.message || err);
      fallidos++;

      // Si es un error de "ya existe", continuar
      if (err.message?.includes('already exists') || err.code === '42P07' || err.code === '42710') {
        console.log('ℹ️  El objeto ya existe, continuando...');
        exitosos++;
        fallidos--;
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN:');
  console.log(`   ✅ Exitosos: ${exitosos}`);
  console.log(`   ❌ Fallidos: ${fallidos}`);
  console.log('='.repeat(60));

  if (fallidos === 0) {
    console.log('\n🎉 ¡Migración completada exitosamente!');
    console.log('\n✅ La tabla clientes ahora tiene:');
    console.log('   - codigo_referido_personal (VARCHAR)');
    console.log('   - total_referidos (INTEGER)');
    console.log('   - referido_por (UUID)');
    console.log('\n✅ Tablas creadas:');
    console.log('   - programas_referidos');
    console.log('   - historial_referidos');
    console.log('   - vista_referidos_dashboard');
    console.log('\n✅ Funciones creadas:');
    console.log('   - registrar_referido()');
    console.log('   - progreso_referidos_cliente()');
    console.log('   - estadisticas_referidos()');
    console.log('\n🔄 Recarga la página de mis-referidos para ver los cambios');
  } else {
    console.log('\n⚠️  Algunos statements fallaron. Revisa los errores arriba.');
  }
}

aplicarMigracionReferidos()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
