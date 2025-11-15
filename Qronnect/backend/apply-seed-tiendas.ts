/**
 * =====================================================
 * Script: Aplicar Seed de Tiendas de Ejemplo
 * =====================================================
 *
 * Este script aplica el seed de tiendas de ejemplo leyendo
 * el archivo SQL y ejecutándolo contra Supabase.
 *
 * Ejecutar con:
 *   npx ts-node apply-seed-tiendas.ts
 *
 * =====================================================
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Configuración de Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

async function applySeedTiendas() {
  console.log('🌱 Aplicando seed de tiendas de ejemplo...\n');

  // Crear cliente de Supabase con service role
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Leer el archivo SQL
  const sqlPath = path.join(__dirname, 'database', 'seed-tiendas-ejemplo.sql');

  if (!fs.existsSync(sqlPath)) {
    console.error('❌ Error: No se encontró el archivo seed-tiendas-ejemplo.sql');
    console.error(`   Buscado en: ${sqlPath}`);
    process.exit(1);
  }

  console.log('📁 Leyendo archivo de seed...');
  const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

  console.log('🚀 Ejecutando seed contra Supabase...\n');

  try {
    // Intentar ejecutar usando la función exec_sql si existe
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sqlContent
    });

    if (error) {
      console.error('❌ Error al aplicar seed:', error);
      console.log('\n💡 Tip: Copia el contenido de database/seed-tiendas-ejemplo.sql');
      console.log('   y ejecútalo directamente en el SQL Editor de Supabase Dashboard');
      process.exit(1);
    }

    console.log('✅ Seed aplicado exitosamente!\n');

    // Verificar tiendas creadas
    const { data: tiendas, error: errorTiendas } = await supabase
      .from('tiendas')
      .select('nombre, dominio, metadata')
      .eq('metadata->>es_demo', 'true')
      .order('nombre');

    if (errorTiendas) {
      console.error('⚠️  No se pudieron verificar las tiendas:', errorTiendas);
    } else {
      console.log(`📊 Total de tiendas demo creadas: ${tiendas?.length || 0}\n`);

      if (tiendas && tiendas.length > 0) {
        console.log('📋 Tiendas creadas:');
        console.log('─'.repeat(60));

        // Agrupar por sector
        const porSector: Record<string, any[]> = {};
        tiendas.forEach(t => {
          const sector = (t.metadata as any)?.sector || 'sin_sector';
          if (!porSector[sector]) {
            porSector[sector] = [];
          }
          porSector[sector].push(t);
        });

        Object.entries(porSector).forEach(([sector, tiendas]) => {
          console.log(`\n🏷️  Sector: ${sector.toUpperCase()}`);
          tiendas.forEach(t => {
            console.log(`   ✓ ${t.nombre} (${t.dominio})`);
          });
        });

        console.log('\n' + '─'.repeat(60));
        console.log('\n✨ Proceso completado con éxito!');
        console.log('\n📝 Próximos pasos:');
        console.log('   1. Accede a las tiendas usando sus dominios (ej: stylecut.tudominio.com)');
        console.log('   2. Crea usuarios admin para cada tienda si es necesario');
        console.log('   3. Prueba el sistema de fidelización con estas tiendas demo');
      }
    }

  } catch (err) {
    console.error('❌ Error inesperado:', err);
    console.log('\n💡 Solución alternativa:');
    console.log('   Ejecuta el SQL directamente en Supabase SQL Editor:');
    console.log(`   ${sqlPath}`);
    process.exit(1);
  }
}

// Ejecutar el script
applySeedTiendas()
  .then(() => {
    console.log('\n👋 Script finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
