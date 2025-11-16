import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const SUPABASE_URL = 'https://ajyiuhujexwrjmjfycxh.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqeWl1aHVqZXh3cmptamZ5Y3hoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjcxMDA3OCwiZXhwIjoyMDc4Mjg2MDc4fQ.vlxkhTIaz5UpbjSx1vN4P6yrbFs5Soi7_W4ovLne3zw';
const RESEND_API_KEY = 're_9oPTkYsE_EnsXoPVzKkjPuYVxdRUJvCZT';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const resend = new Resend(RESEND_API_KEY);

const campanaId = '683862d9-8d53-420d-a3ae-fccea71e5163';
const tiendaId = '11bf2433-4232-4c58-a446-a805e1b78f9b';

async function enviarCampana() {
  console.log('\n📧 Iniciando envío manual de campaña...\n');

  // 1. Obtener datos de la campaña
  const { data: campana, error: campanaError } = await supabase
    .from('campanas_email')
    .select('*')
    .eq('id', campanaId)
    .single();

  if (campanaError || !campana) {
    console.error('❌ Error obteniendo campaña:', campanaError);
    return;
  }

  console.log(`📝 Campaña: ${campana.nombre}`);
  console.log(`📨 Asunto: ${campana.asunto}\n`);

  // 2. Obtener información de la tienda para el remitente
  const { data: tienda } = await supabase
    .from('tiendas')
    .select('nombre, dominio')
    .eq('id', tiendaId)
    .single();

  const nombreTienda = tienda?.nombre || 'Qronnect';
  const dominioTienda = tienda?.dominio || 'qronnect';

  const useWildcard = process.env.RESEND_WILDCARD_ENABLED === 'true';
  const fromEmail = useWildcard
    ? `${nombreTienda} <noreply@${dominioTienda}.qronnect.es>`
    : `${nombreTienda} <noreply@qronnect.es>`;

  console.log(`📬 Remitente: ${fromEmail}\n`);

  // 3. Obtener destinatarios
  const { data: destinatarios, error: destError } = await supabase
    .from('campanas_destinatarios')
    .select(`
      id,
      id_cliente,
      estado,
      clientes (
        id,
        nombre,
        email
      )
    `)
    .eq('id_campana', campanaId)
    .eq('estado', 'pendiente');

  if (destError) {
    console.error('❌ Error obteniendo destinatarios:', destError);
    return;
  }

  if (!destinatarios || destinatarios.length === 0) {
    console.log('⚠️  No hay destinatarios pendientes');
    return;
  }

  console.log(`👥 Destinatarios: ${destinatarios.length}\n`);

  // 4. Enviar emails
  let enviados = 0;
  let fallidos = 0;

  for (const dest of destinatarios) {
    const cliente = dest.clientes as any;

    if (!cliente || !cliente.email) {
      console.warn(`⚠️  Cliente sin email, saltando destinatario ${dest.id}`);
      fallidos++;
      continue;
    }

    console.log(`\n📤 Enviando a ${cliente.nombre} (${cliente.email})...`);

    // Personalizar HTML
    let htmlPersonalizado = campana.contenido_html;
    htmlPersonalizado = htmlPersonalizado.replace(/\{\{nombre\}\}/g, cliente.nombre || '');
    htmlPersonalizado = htmlPersonalizado.replace(/\{\{email\}\}/g, cliente.email || '');

    try {
      const result = await resend.emails.send({
        from: fromEmail,
        to: cliente.email,
        subject: campana.asunto,
        html: htmlPersonalizado,
      });

      console.log(`✅ Email enviado exitosamente`);
      console.log(`   Resend ID: ${result.data?.id}`);

      enviados++;

      // Actualizar estado del destinatario
      await supabase
        .from('campanas_destinatarios')
        .update({
          estado: 'enviado',
          fecha_enviado: new Date().toISOString(),
        })
        .eq('id', dest.id);

      // Registrar en envios_campanas
      await supabase.from('envios_campanas').insert({
        id_campana: campanaId,
        id_cliente: cliente.id,
        id_tienda: tiendaId,
        fecha_envio: new Date().toISOString(),
        estado: 'enviado',
        email_destinatario: cliente.email,
      });
    } catch (error: any) {
      console.error(`❌ Error enviando email:`, error.message);
      fallidos++;

      await supabase
        .from('campanas_destinatarios')
        .update({
          estado: 'fallido',
          error_mensaje: error.message,
        })
        .eq('id', dest.id);
    }
  }

  // 5. Actualizar estadísticas de la campaña
  await supabase
    .from('campanas_email')
    .update({
      estado: 'enviada',
      fecha_enviada: new Date().toISOString(),
      enviados: enviados,
    })
    .eq('id', campanaId);

  console.log(`\n
========================================
📊 RESUMEN DEL ENVÍO
========================================
✅ Enviados: ${enviados}
❌ Fallidos: ${fallidos}
📧 Remitente: ${fromEmail}
========================================
`);
}

enviarCampana().then(() => process.exit(0)).catch((err) => {
  console.error('Error fatal:', err);
  process.exit(1);
});
