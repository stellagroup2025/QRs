// Script simple para aplicar migraciones SQL a Supabase
// Uso: node run-migration.js 002_create_promociones_canjes.sql

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar en .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration(fileName) {
  try {
    console.log(`\n📄 Leyendo migración: ${fileName}`);

    const filePath = path.join(__dirname, 'migrations', fileName);
    const sql = fs.readFileSync(filePath, 'utf-8');

    console.log(`📊 Tamaño del archivo: ${sql.length} caracteres`);
    console.log(`\n🚀 Aplicando migración a Supabase...\n`);

    // Ejecutar el SQL completo
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sql
    });

    if (error) {
      console.error('❌ Error al ejecutar la migración:', error.message);
      console.error('Detalles:', error);

      // Mensaje más amigable
      console.log('\n💡 Sugerencias:');
      console.log('   1. Verifica que la función exec_sql() existe en tu base de datos');
      console.log('   2. Copia y pega manualmente el SQL en el SQL Editor de Supabase Dashboard');
      console.log(`   3. Dashboard URL: ${supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/')}/sql`);

      return false;
    }

    console.log('✅ Migración aplicada exitosamente');
    if (data) {
      console.log('Resultado:', data);
    }

    return true;

  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
    return false;
  }
}

// Obtener el nombre del archivo de migración
const migrationFile = process.argv[2] || '002_create_promociones_canjes.sql';

console.log('🔧 Herramienta de Migración de Supabase');
console.log('=====================================');

runMigration(migrationFile).then(success => {
  if (success) {
    console.log('\n✨ Proceso completado con éxito\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  La migración no se pudo aplicar automáticamente');
    console.log('   Por favor, aplícala manualmente en Supabase Dashboard\n');
    process.exit(1);
  }
});
