const { Resend } = require('resend');

const resend = new Resend('re_9oPTkYsE_EnsXoPVzKkjPuYVxdRUJvCZT');

async function diagnosticoCompleto() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DE EMAIL\n');
  console.log('='.repeat(60));

  // 1. Verificar configuración
  console.log('\n📋 1. CONFIGURACIÓN:');
  console.log('   API Key:', 're_9oPT...JvCZT (configurada)');
  console.log('   From Email:', 'noreply@qronnect.es');
  console.log('   NODE_ENV:', 'development');

  // 2. Test con email de onboarding de Resend (siempre funciona)
  console.log('\n🧪 2. TEST CON EMAIL DE ONBOARDING (debe funcionar):');
  try {
    const { data: data1, error: error1 } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'delivered@resend.dev',
      subject: 'Test 1: Email de Onboarding',
      html: '<p>Este test usa el dominio de onboarding de Resend</p>',
    });

    if (error1) {
      console.error('   ❌ FALLÓ:', error1);
    } else {
      console.log('   ✅ ÉXITO! Message ID:', data1.id);
    }
  } catch (err) {
    console.error('   💥 EXCEPCIÓN:', err.message);
  }

  // 3. Test con TU dominio (puede fallar si no está verificado)
  console.log('\n🧪 3. TEST CON TU DOMINIO qronnect.es:');
  try {
    const { data: data2, error: error2 } = await resend.emails.send({
      from: 'noreply@qronnect.es',
      to: 'delivered@resend.dev', // Email de test de Resend
      subject: 'Test 2: Validación desde qronnect.es',
      html: '<p>Este test usa tu dominio configurado</p>',
    });

    if (error2) {
      console.error('   ❌ FALLÓ:', JSON.stringify(error2, null, 2));
      console.log('\n   🔍 DIAGNÓSTICO:');

      if (error2.message && error2.message.includes('not verified')) {
        console.log('   ⚠️  El dominio qronnect.es NO está verificado en Resend');
        console.log('   📝 Soluciones:');
        console.log('      1. Ir a https://resend.com/domains');
        console.log('      2. Agregar el dominio qronnect.es');
        console.log('      3. Configurar los registros DNS (MX, TXT, DKIM)');
        console.log('      4. Esperar la verificación (~5-10 minutos)');
        console.log('\n   🔧 SOLUCIÓN TEMPORAL:');
        console.log('      Usar "onboarding@resend.dev" como remitente temporalmente');
      } else {
        console.log('   ⚠️  Error desconocido:', error2.message);
      }
    } else {
      console.log('   ✅ ÉXITO! Message ID:', data2.id);
      console.log('   ✅ El dominio qronnect.es está correctamente verificado');
    }
  } catch (err) {
    console.error('   💥 EXCEPCIÓN:', err.message);
  }

  // 4. Test enviando a un email REAL que puedas verificar
  console.log('\n🧪 4. TEST ENVIANDO A EMAIL REAL:');
  console.log('   ⚠️  CAMBIA "TU_EMAIL_AQUI@gmail.com" por tu email real en el código\n');

  const tuEmail = 'TU_EMAIL_AQUI@gmail.com'; // ⬅️ CAMBIA ESTO

  if (tuEmail === 'TU_EMAIL_AQUI@gmail.com') {
    console.log('   ⏭️  SALTADO - Edita el script y pon tu email real');
  } else {
    try {
      const { data: data3, error: error3 } = await resend.emails.send({
        from: 'noreply@qronnect.es',
        to: tuEmail,
        subject: '🧪 Test de Validación - Qronnect',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
              <h1 style="color: #667eea;">✅ Email de Validación - TEST</h1>
              <p><strong>Si ves este email, el sistema funciona correctamente.</strong></p>
              <p>Revisa también tu carpeta de SPAM por si acaso.</p>
              <hr>
              <p style="font-size: 12px; color: #666;">
                Este es un email de prueba del sistema de validación de Qronnect.
              </p>
            </div>
          </body>
          </html>
        `,
      });

      if (error3) {
        console.error('   ❌ FALLÓ:', error3);
      } else {
        console.log('   ✅ ÉXITO! Email enviado a:', tuEmail);
        console.log('   📧 Message ID:', data3.id);
        console.log('   ⏰ Espera 1-2 minutos y revisa tu bandeja de entrada (y SPAM)');
      }
    } catch (err) {
      console.error('   💥 EXCEPCIÓN:', err.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 RESUMEN:');
  console.log('   • Si los tests 1 y 2 funcionan: El problema NO es Resend');
  console.log('   • Si el test 2 falla: Necesitas verificar el dominio en Resend');
  console.log('   • Si el test 3 no llega: Revisa SPAM o usa otro email');
  console.log('\n💡 PRÓXIMOS PASOS:');
  console.log('   1. Si el dominio no está verificado: Usa onboarding@resend.dev temporalmente');
  console.log('   2. Revisa los logs del backend cuando te registres');
  console.log('   3. Verifica que el email del usuario sea válido');
  console.log('\n');
}

diagnosticoCompleto();
