import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ajyiuhujexwrjmjfycxh.supabase.co';
const SUPABASE_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqeWl1aHVqZXh3cmptamZ5Y3hoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjcxMDA3OCwiZXhwIjoyMDc4Mjg2MDc4fQ.vlxkhTIaz5UpbjSx1vN4P6yrbFs5Soi7_W4ovLne3zw';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  db: { schema: 'public' },
});

async function main() {
  console.log('🔧 Aplicando fix para campanas_sms.creado_por...\n');

  try {
    // Ejecutar directamente con el cliente admin
    const adminClient = supabase;

    // Hacer el campo nullable
    const { error } = await adminClient.rpc('exec', {
      sql: 'ALTER TABLE campanas_sms ALTER COLUMN creado_por DROP NOT NULL',
    });

    if (error) {
      console.log('⚠️  No se puede usar exec, intentando alternativa...\n');
      console.log('Por favor, ejecuta este SQL manualmente en Supabase Dashboard:');
      console.log('\nALTER TABLE campanas_sms ALTER COLUMN creado_por DROP NOT NULL;\n');
      console.log('O usa el script Python si tienes psql instalado.');
      return;
    }

    console.log('✅ Migración aplicada exitosamente!');
  } catch (err: any) {
    console.error('Error:', err.message);
    console.log('\n📝 Ejecuta este SQL manualmente en Supabase Dashboard:\n');
    console.log('ALTER TABLE campanas_sms ALTER COLUMN creado_por DROP NOT NULL;\n');
  }
}

main();
