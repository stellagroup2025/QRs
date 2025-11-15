import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY no está definida');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function applyMigration() {
  try {
    console.log('🚀 Aplicando migración de configuración extensa para IA...\n');

    // Leer el archivo SQL
    const migrationPath = path.join(
      __dirname,
      'supabase',
      'migrations',
      '20251114000004_config_ia_extensa.sql',
    );

    console.log(`📄 Leyendo migración desde: ${migrationPath}`);

    if (!fs.existsSync(migrationPath)) {
      throw new Error(`No se encontró el archivo de migración en: ${migrationPath}`);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📊 Ejecutando SQL...\n');
    console.log('─'.repeat(60));

    // Ejecutar la migración usando rpc
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_string: migrationSQL,
    });

    if (error) {
      console.error('❌ Error al ejecutar la migración:', error);
      throw error;
    }

    console.log('─'.repeat(60));
    console.log('\n✅ Migración aplicada exitosamente!\n');

    console.log('📋 Cambios aplicados:');
    console.log('   ✓ Campo agregado a tiendas:');
    console.log('     - config_ia (JSONB)');
    console.log('');
    console.log('   ✓ Estructura JSON incluye:');
    console.log('     - tipo_negocio');
    console.log('     - publico_objetivo (edad, géneros, intereses)');
    console.log('     - valores_marca');
    console.log('     - tono_comunicacion');
    console.log('     - productos_principales');
    console.log('     - rango_precios');
    console.log('     - ubicacion (barrio, ciudad)');
    console.log('     - promociones_recurrentes');
    console.log('     - slogan y hashtags');
    console.log('');
    console.log('⚙️ Configuración de IA extensa lista para personalizar contenido!');
  } catch (error) {
    console.error('\n❌ Error fatal:', error.message);
    console.error(error);
    process.exit(1);
  }
}

applyMigration();
