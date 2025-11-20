/**
 * Script para aplicar la migración de validación de email
 *
 * Uso:
 *   npx ts-node apply-email-validation-migration.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

async function applyMigration() {
  console.log('🚀 Aplicando migración de validación de email...\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Leer archivo de migración
  const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20251120000001_add_email_validation_to_clientes.sql');

  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Error: No se encontró el archivo de migración en ${migrationPath}`);
    process.exit(1);
  }

  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

  console.log('📄 Archivo de migración cargado');
  console.log('📍 Ruta:', migrationPath);
  console.log('');

  // Ejecutar la migración
  try {
    console.log('⏳ Ejecutando SQL...');

    const { data, error } = await supabase.rpc('exec', {
      sql: migrationSQL
    });

    if (error) {
      throw error;
    }

    console.log('✅ Migración aplicada exitosamente!\n');

    // Verificar que los campos existen
    console.log('🔍 Verificando campos creados...');

    const { data: columns, error: verifyError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'clientes')
      .in('column_name', ['email_validado', 'codigo_validacion', 'codigo_validacion_expires_at', 'validacion_enviada_at']);

    if (verifyError) {
      console.warn('⚠️  No se pudo verificar los campos:', verifyError.message);
    } else if (columns && columns.length === 4) {
      console.log('✅ Todos los campos fueron creados correctamente:');
      columns.forEach((col: any) => {
        console.log(`   - ${col.column_name} (${col.data_type})`);
      });
    } else {
      console.warn('⚠️  Algunos campos pueden no haberse creado correctamente');
    }

    console.log('');
    console.log('🎉 ¡Migración completada!');
    console.log('');
    console.log('📋 Próximos pasos:');
    console.log('   1. Reiniciar el backend para que use los nuevos campos');
    console.log('   2. Probar los endpoints de validación de email');
    console.log('   3. Ver FEATURE_VALIDACION_EMAIL_CLIENTES.md para más detalles');

  } catch (error: any) {
    console.error('❌ Error al aplicar la migración:', error.message);
    console.error('');
    console.error('💡 Solución alternativa:');
    console.error('   1. Ve a Supabase Dashboard → SQL Editor');
    console.error('   2. Copia y pega el contenido de:');
    console.error(`      ${migrationPath}`);
    console.error('   3. Ejecuta el SQL manualmente');
    process.exit(1);
  }
}

applyMigration();
