import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = 'https://ajyiuhujexwrjmjfycxh.supabase.co';
const SUPABASE_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqeWl1aHVqZXh3cmptamZ5Y3hoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjcxMDA3OCwiZXhwIjoyMDc4Mjg2MDc4fQ.vlxkhTIaz5UpbjSx1vN4P6yrbFs5Soi7_W4ovLne3zw';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  console.log('🔧 Aplicando fix para campanas_sms.creado_por...\n');

  const migrationPath = path.join(
    __dirname,
    'supabase/migrations/20251116000001_fix_campanas_sms_creado_por.sql',
  );

  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('📝 Ejecutando SQL:\n');
  console.log(sql);
  console.log('\n');

  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  console.log('✅ Migración aplicada exitosamente!\n');
  console.log('   Ahora creado_por puede ser NULL en campanas_sms');
}

main();
