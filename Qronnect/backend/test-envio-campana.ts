import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ajyiuhujexwrjmjfycxh.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqeWl1aHVqZXh3cmptamZ5Y3hoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjcxMDA3OCwiZXhwIjoyMDc4Mjg2MDc4fQ.vlxkhTIaz5UpbjSx1vN4P6yrbFs5Soi7_W4ovLne3zw';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const campanaId = '683862d9-8d53-420d-a3ae-fccea71e5163';
const clienteId = '4308856f-9799-4a01-8fd6-1a3c6b5966e5';

async function verificar() {
  console.log('\n🔍 Verificando destinatarios de la campaña...\n');

  const { data, error } = await supabase
    .from('campanas_destinatarios')
    .select(`
      id,
      estado,
      id_cliente,
      clientes (nombre, email)
    `)
    .eq('id_campana', campanaId);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`📊 Total destinatarios encontrados: ${data?.length || 0}\n`);

  if (data && data.length > 0) {
    data.forEach((dest: any) => {
      console.log(`  - ${dest.clientes.nombre} (${dest.clientes.email})`);
      console.log(`    Estado: ${dest.estado}`);
      console.log(`    ID: ${dest.id}\n`);
    });
  } else {
    console.log('⚠️  No se encontraron destinatarios para esta campaña');
    console.log('\n📝 Creando destinatario...\n');

    const { data: newDest, error: insertError } = await supabase
      .from('campanas_destinatarios')
      .insert({
        id_campana: campanaId,
        id_cliente: clienteId,
        estado: 'pendiente',
      })
      .select();

    if (insertError) {
      console.error('❌ Error creando destinatario:', insertError);
    } else {
      console.log('✅ Destinatario creado correctamente:', newDest);
    }
  }
}

verificar().then(() => process.exit(0));
