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

// Lista de migraciones en orden
const migrations = [
  {
    file: '20251114000001_extend_campanas_sms.sql',
    name: '📱 Campañas SMS Mejoradas',
  },
  {
    file: '20251114000002_sistema_regalos_bienvenida.sql',
    name: '🎁 Sistema de Regalos de Bienvenida',
  },
  {
    file: '20251114000003_sistema_referidos.sql',
    name: '🤝 Sistema de Referidos',
  },
  {
    file: '20251114000004_config_ia_extensa.sql',
    name: '⚙️ Configuración IA Extensa',
  },
  {
    file: '20251114000005_limites_api_keys_ia.sql',
    name: '🤖 Límites y API Keys IA',
  },
];

async function applyMigration(migrationFile: string, migrationName: string) {
  const migrationPath = path.join(__dirname, 'supabase', 'migrations', migrationFile);

  if (!fs.existsSync(migrationPath)) {
    console.log(`⚠️  Saltando ${migrationName}: archivo no encontrado`);
    return false;
  }

  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  const { data, error } = await supabase.rpc('exec_sql', {
    sql_string: migrationSQL,
  });

  if (error) {
    console.error(`❌ Error en ${migrationName}:`, error);
    throw error;
  }

  return true;
}

async function createExecFunction() {
  console.log('📦 Verificando función exec_sql...\n');

  const execFunctionSQL = `
CREATE OR REPLACE FUNCTION exec_sql(sql_string text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_string;
END;
$$;

GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
  `;

  try {
    // Intentar ejecutar directamente el SQL sin usar RPC
    const { error } = await supabase.rpc('exec_sql', {
      sql_string: execFunctionSQL,
    });

    if (error) {
      console.log('⚠️  Función exec_sql no existe, creándola con método alternativo...\n');
      // Si falla, necesitamos usar psql directamente
      return false;
    }

    console.log('✅ Función exec_sql lista\n');
    return true;
  } catch (err) {
    console.log('⚠️  No se pudo verificar exec_sql, se intentará crearla de otra forma\n');
    return false;
  }
}

async function applyAllMigrations() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   🚀 APLICANDO TODAS LAS MIGRACIONES DEL ROADMAP 14/11    ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  // Primero crear la función exec_sql
  await createExecFunction();

  let successCount = 0;
  let failCount = 0;

  for (const migration of migrations) {
    console.log('━'.repeat(60));
    console.log(`\n${migration.name}`);
    console.log(`Archivo: ${migration.file}\n`);

    try {
      const success = await applyMigration(migration.file, migration.name);
      if (success) {
        console.log(`✅ ${migration.name} aplicada correctamente\n`);
        successCount++;
      }
    } catch (error) {
      console.error(`❌ Falló ${migration.name}\n`);
      failCount++;

      // Continuar con las demás migraciones aunque falle una
      console.log('⚠️  Continuando con las siguientes migraciones...\n');
    }
  }

  console.log('━'.repeat(60));
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    📊 RESUMEN FINAL                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log(`✅ Migraciones exitosas: ${successCount}/${migrations.length}`);
  console.log(`❌ Migraciones fallidas: ${failCount}/${migrations.length}\n`);

  if (failCount === 0) {
    console.log('🎉 ¡TODAS LAS MIGRACIONES APLICADAS EXITOSAMENTE!\n');
    console.log('📋 Sistemas habilitados:');
    console.log('   ✓ Campañas SMS con IA y estadísticas detalladas');
    console.log('   ✓ Regalos de bienvenida automáticos');
    console.log('   ✓ Sistema de referidos con códigos personales');
    console.log('   ✓ Configuración extensa para IA');
    console.log('   ✓ Límites y gestión de API keys IA\n');
    console.log('🚀 El sistema está listo para usar!\n');
  } else {
    console.log('⚠️  Algunas migraciones fallaron. Revisa los errores arriba.\n');
  }
}

applyAllMigrations();
