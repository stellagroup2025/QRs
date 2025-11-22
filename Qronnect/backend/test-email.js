const { Resend } = require('resend');

const resend = new Resend('re_9oPTkYsE_EnsXoPVzKkjPuYVxdRUJvCZT');

async function testEmail() {
  console.log('🧪 Probando envío de email con Resend...\n');

  try {
    const { data, error } = await resend.emails.send({
      from: 'noreply@qronnect.es',
      to: 'test@example.com', // Cambia esto a tu email real para probar
      subject: 'Test de Validación - Qronnect',
      html: '<h1>Email de prueba</h1><p>Si ves esto, Resend funciona correctamente.</p>',
    });

    if (error) {
      console.error('❌ Error al enviar email:');
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    console.log('✅ Email enviado exitosamente!');
    console.log('📧 Message ID:', data.id);
  } catch (err) {
    console.error('💥 Excepción capturada:');
    console.error('   Mensaje:', err.message);
    console.error('   Stack:', err.stack);
  }
}

testEmail();
