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
    console.log('🚀 Aplicando migración de límites y gestión de API keys IA...\n');

    // Leer el archivo SQL
    const migrationPath = path.join(
      __dirname,
      'supabase',
      'migrations',
      '20251114000005_limites_api_keys_ia.sql',
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
    console.log('   ✓ Campos agregados a tiendas:');
    console.log('     - ia_modo (VARCHAR)');
    console.log('     - ia_api_key_propia (TEXT)');
    console.log('     - ia_limite_mensual (INTEGER)');
    console.log('     - ia_consumo_actual (INTEGER)');
    console.log('     - ia_ultimo_reset (DATE)');
    console.log('');
    console.log('   ✓ Tabla creada:');
    console.log('     - ia_uso (auditoría de uso)');
    console.log('');
    console.log('   ✓ Funciones creadas:');
    console.log('     - verificar_limite_ia()');
    console.log('     - incrementar_consumo_ia()');
    console.log('     - registrar_uso_ia()');
    console.log('     - estadisticas_uso_ia()');
    console.log('');
    console.log('   ✓ Vista creada:');
    console.log('     - vista_ia_uso_dashboard');
    console.log('');
    console.log('🤖 Sistema de límites y gestión de API keys IA listo!');
  } catch (error) {
    console.error('\n❌ Error fatal:', error.message);
    console.error(error);
    process.exit(1);
  }
}

applyMigration();
