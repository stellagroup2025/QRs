import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🚀 Aplicando migración de usuarios de tienda...\n');

  try {
    // Leer el archivo SQL
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20251115000002_create_usuarios_tienda.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📄 Archivo de migración leído correctamente');
    console.log(`📦 Tamaño: ${sql.length} caracteres\n`);

    // Ejecutar la migración usando exec_sql
    console.log('⚙️  Ejecutando migración...\n');

    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sql
    });

    if (error) {
      console.error('❌ Error al ejecutar la migración:');
      console.error(error);
      process.exit(1);
    }

    console.log('✅ Migración ejecutada exitosamente!\n');

    // Verificar que las tablas se crearon
    console.log('🔍 Verificando tablas creadas...\n');

    const { data: usuarios, error: errorUsuarios } = await supabase
      .from('usuarios_tienda')
      .select('count');

    if (errorUsuarios) {
      console.error('⚠️  Advertencia: No se pudo verificar la tabla usuarios_tienda');
      console.error(errorUsuarios);
    } else {
      console.log('✅ Tabla usuarios_tienda creada correctamente');
    }

    const { data: codes, error: errorCodes } = await supabase
      .from('usuarios_tienda_2fa_codes')
      .select('count');

    if (errorCodes) {
      console.error('⚠️  Advertencia: No se pudo verificar la tabla usuarios_tienda_2fa_codes');
      console.error(errorCodes);
    } else {
      console.log('✅ Tabla usuarios_tienda_2fa_codes creada correctamente');
    }

    console.log('\n✨ Migración completada!\n');
    console.log('📋 Resumen:');
    console.log('   - Tabla: usuarios_tienda');
    console.log('   - Tabla: usuarios_tienda_2fa_codes');
    console.log('   - Roles disponibles: owner, comercial');
    console.log('   - 2FA por SMS: opcional\n');

  } catch (error) {
    console.error('❌ Error inesperado:');
    console.error(error);
    process.exit(1);
  }
}

applyMigration();
