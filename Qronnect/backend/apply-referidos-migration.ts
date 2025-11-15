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
    console.log('🚀 Aplicando migración del sistema de referidos...\n');

    // Leer el archivo SQL
    const migrationPath = path.join(
      __dirname,
      'supabase',
      'migrations',
      '20251114000003_sistema_referidos.sql',
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
    console.log('   ✓ Tabla creada:');
    console.log('     - programas_referidos');
    console.log('     - referidos');
    console.log('');
    console.log('   ✓ Campos agregados a clientes:');
    console.log('     - codigo_referido_personal (VARCHAR)');
    console.log('     - total_referidos (INTEGER)');
    console.log('     - referido_por (UUID)');
    console.log('');
    console.log('   ✓ Funciones creadas:');
    console.log('     - generar_codigo_referido()');
    console.log('     - registrar_referido()');
    console.log('     - verificar_objetivos_referidos()');
    console.log('     - progreso_referidos_cliente()');
    console.log('     - estadisticas_referidos()');
    console.log('');
    console.log('   ✓ Vista creada:');
    console.log('     - vista_referidos_dashboard');
    console.log('');
    console.log('   ✓ Trigger configurado:');
    console.log('     - trigger_asignar_codigo_referido');
    console.log('     - Se asigna código único a cada cliente automáticamente');
    console.log('');
    console.log('🤝 Sistema de referidos listo para usar!');
  } catch (error) {
    console.error('\n❌ Error fatal:', error.message);
    console.error(error);
    process.exit(1);
  }
}

applyMigration();
