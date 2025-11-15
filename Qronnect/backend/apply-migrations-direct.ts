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
  '20251114000001_extend_campanas_sms.sql',
  '20251114000002_sistema_regalos_bienvenida.sql',
  '20251114000003_sistema_referidos.sql',
  '20251114000004_config_ia_extensa.sql',
  '20251114000005_limites_api_keys_ia.sql',
];

async function executeSQLDirect(sql: string) {
  // Dividir el SQL en statements individuales
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMIT'));

  for (const statement of statements) {
    if (statement.length === 0) continue;

    try {
      // Ejecutar cada statement directamente
      const { error } = await supabase.rpc('query', {
        query_text: statement + ';',
      });

      if (error) {
        // Intentar con from si falla con rpc
        const { error: error2 } = await (supabase as any).from('_').select('*').limit(0);
        // Este approach no funcionará, necesitamos otra estrategia
      }
    } catch (err) {
      console.error('Error ejecutando:', statement.substring(0, 100));
    }
  }
}

async function applyMigrations() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║      🚀 APLICANDO MIGRACIONES CON MÉTODO DIRECTO          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('⚠️  IMPORTANTE: Las migraciones deben aplicarse manualmente.');
  console.log('📝 Instrucciones:\n');
  console.log('1. Abre Supabase Studio en: http://127.0.0.1:54323');
  console.log('2. Ve a SQL Editor');
  console.log('3. Copia y ejecuta cada archivo SQL en orden:\n');

  migrations.forEach((file, index) => {
    const fullPath = path.join(__dirname, 'supabase', 'migrations', file);
    console.log(`   ${index + 1}. ${file}`);
    console.log(`      Ruta: ${fullPath}\n`);
  });

  console.log('💡 O usa el siguiente comando si tienes supabase CLI instalado:');
  console.log('   supabase db reset\n');
}

applyMigrations();
