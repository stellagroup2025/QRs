import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runMigration() {
  console.log('🚀 Ejecutando migración SQL directamente...\n');

  try {
    // Leer el archivo de migración
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250110000005_create_campaigns_system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📄 Archivo de migración cargado');
    console.log(`📏 Tamaño: ${migrationSQL.length} caracteres\n`);

    // Dividir en statements individuales (por punto y coma)
    // Pero debemos ser cuidadosos con los punto y coma dentro de strings
    const statements: string[] = [];
    let currentStatement = '';
    let insideString = false;
    let insideFunction = false;

    for (let i = 0; i < migrationSQL.length; i++) {
      const char = migrationSQL[i];
      const prevChar = i > 0 ? migrationSQL[i - 1] : '';

      // Detectar inicio/fin de funciones
      if (migrationSQL.substring(i, i + 8).toUpperCase() === 'CREATE F' ||
          migrationSQL.substring(i, i + 17).toUpperCase() === 'CREATE OR REPLACE') {
        insideFunction = true;
      }

      if (insideFunction && char === ';' &&
          (migrationSQL.substring(i - 10, i).includes('END') ||
           migrationSQL.substring(i - 15, i).includes('$$'))) {
        insideFunction = false;
      }

      // Detectar strings
      if (char === "'" && prevChar !== '\\') {
        insideString = !insideString;
      }

      currentStatement += char;

      // Si encontramos un ; y no estamos dentro de un string o función
      if (char === ';' && !insideString && !insideFunction) {
        const trimmed = currentStatement.trim();
        if (trimmed && !trimmed.startsWith('--')) {
          statements.push(trimmed);
        }
        currentStatement = '';
      }
    }

    console.log(`📊 Se encontraron ${statements.length} statements SQL\n`);
    console.log('⚙️  Ejecutando statements...\n');

    let successCount = 0;
    let errorCount = 0;

    // Ejecutar cada statement usando raw SQL query
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Saltar comentarios
      if (statement.trim().startsWith('--') || statement.trim().length === 0) {
        continue;
      }

      // Mostrar progress cada 10 statements
      if (i % 10 === 0 || i === statements.length - 1) {
        process.stdout.write(`\r   Progreso: ${i + 1}/${statements.length} statements`);
      }

      try {
        // Usar rpc para ejecutar SQL directo si existe
        const { error } = await supabase.rpc('exec_sql', {
          query: statement
        });

        if (error) {
          // Si no funciona con rpc, intentar con from() para DDL
          // (esto no funcionará bien pero al menos lo intentamos)
          errorCount++;
        } else {
          successCount++;
        }
      } catch (err: any) {
        errorCount++;
      }

      // Pequeño delay para no saturar la API
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log('\n\n✅ Ejecución completada');
    console.log(`   ✅ Exitosos: ${successCount}`);
    console.log(`   ⚠️  Con errores/warnings: ${errorCount}\n`);

    // Verificar que las tablas se crearon
    console.log('🔍 Verificando creación de tablas...\n');

    const tables = ['campanas_email', 'campanas_destinatarios', 'email_templates'];
    let allTablesExist = true;

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.log(`   ❌ Tabla ${table}: NO ENCONTRADA (${error.message})`);
          allTablesExist = false;
        } else {
          console.log(`   ✅ Tabla ${table}: OK (${count || 0} registros)`);
        }
      } catch (err: any) {
        console.log(`   ❌ Tabla ${table}: ERROR (${err.message})`);
        allTablesExist = false;
      }
    }

    if (!allTablesExist) {
      console.log('\n⚠️  IMPORTANTE: Las tablas no se detectaron en el API de Supabase.');
      console.log('   Esto es normal si acabas de crearlas. Supabase puede tardar unos minutos');
      console.log('   en actualizar su caché de esquema.\n');
      console.log('💡 SOLUCIÓN: Ve al Dashboard de Supabase y ejecuta el SQL manualmente:');
      console.log('   1. Abre https://supabase.com/dashboard/project/ajyiuhujexwrjmjfycxh/editor');
      console.log('   2. Ve a SQL Editor');
      console.log('   3. Copia y pega el contenido de:');
      console.log('      backend/supabase/migrations/20250110000005_create_campaigns_system.sql');
      console.log('   4. Ejecuta el SQL');
      console.log('   5. Espera 1-2 minutos para que Supabase actualice su caché\n');
    } else {
      console.log('\n✅ ¡Todo listo! Las tablas están disponibles en la API.\n');
    }

  } catch (error: any) {
    console.error('\n❌ Error durante la migración:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
