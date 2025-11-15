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
    console.log('🚀 Aplicando migración de extensión de campañas SMS...\n');

    // Leer el archivo SQL
    const migrationPath = path.join(
      __dirname,
      'supabase',
      'migrations',
      '20251114000001_extend_campanas_sms.sql',
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
    console.log('   ✓ Campos agregados a campanas_sms:');
    console.log('     - asunto (VARCHAR)');
    console.log('     - remitente_nombre (VARCHAR)');
    console.log('     - hora_programada (TIME)');
    console.log('     - zona_horaria (VARCHAR)');
    console.log('     - costo_estimado (DECIMAL)');
    console.log('     - costo_real (DECIMAL)');
    console.log('     - estadisticas (JSONB)');
    console.log('');
    console.log('   ✓ Campos agregados a campanas_sms_destinatarios:');
    console.log('     - operador (VARCHAR)');
    console.log('     - tiempo_entrega (INTEGER)');
    console.log('     - fecha_entregado (TIMESTAMPTZ)');
    console.log('     - intentos_envio (INTEGER)');
    console.log('');
    console.log('   ✓ Funciones creadas:');
    console.log('     - calcular_estadisticas_campana_sms()');
    console.log('     - detectar_operador_espana()');
    console.log('     - calcular_costo_estimado_sms()');
    console.log('');
    console.log('   ✓ Vista creada:');
    console.log('     - vista_campanas_sms_dashboard');
    console.log('');
    console.log('   ✓ Triggers configurados para actualización automática de estadísticas');
    console.log('');
    console.log('🎉 Sistema de campañas SMS completamente actualizado!');
  } catch (error) {
    console.error('\n❌ Error fatal:', error.message);
    console.error(error);
    process.exit(1);
  }
}

applyMigration();
