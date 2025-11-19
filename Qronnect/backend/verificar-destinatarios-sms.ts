import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ajyiuhujexwrjmjfycxh.supabase.co';
const SUPABASE_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqeWl1aHVqZXh3cmptamZ5Y3hoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjcxMDA3OCwiZXhwIjoyMDc4Mjg2MDc4fQ.vlxkhTIaz5UpbjSx1vN4P6yrbFs5Soi7_W4ovLne3zw';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const campanaId = '585c1cff-4893-4876-9903-5fd4a17face6';

async function verificar() {
  console.log('\n🔍 Verificando destinatarios de la campaña SMS...\n');

  const { data, error } = await supabase
    .from('campanas_sms_destinatarios')
    .select(`
      id,
      estado,
      id_cliente,
      clientes (
        id,
        nombre,
        telefono,
        email
      )
    `)
    .eq('id_campana', campanaId);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`📊 Total destinatarios encontrados: ${data?.length || 0}\n`);

  if (data && data.length > 0) {
    data.forEach((dest: any) => {
      const cliente = dest.clientes;
      console.log(`Destinatario ID: ${dest.id}`);
      console.log(`  Cliente ID: ${dest.id_cliente}`);
      console.log(`  Nombre: ${cliente?.nombre || 'N/A'}`);
      console.log(`  Teléfono: ${cliente?.telefono || 'SIN TELEFONO'}`);
      console.log(`  Email: ${cliente?.email || 'N/A'}`);
      console.log(`  Estado: ${dest.estado}\n`);
    });
  } else {
    console.log('⚠️  No se encontraron destinatarios para esta campaña');
  }
}

verificar().then(() => process.exit(0));
