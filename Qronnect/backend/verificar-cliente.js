// Script para verificar el estado de un cliente en la BD
// Uso: node verificar-cliente.js email@ejemplo.com

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const email = process.argv[2];

if (!email) {
  console.log('❌ Debes proporcionar un email');
  console.log('Uso: node verificar-cliente.js email@ejemplo.com');
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Falta configuración de Supabase en .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarCliente() {
  console.log('🔍 Buscando cliente:', email);
  console.log('');

  // Buscar el cliente
  const { data: clientes, error } = await supabase
    .from('clientes')
    .select(`
      *,
      tiendas (
        id,
        nombre,
        nombre_comercial,
        dominio
      )
    `)
    .eq('email', email)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!clientes || clientes.length === 0) {
    console.log('❌ No se encontró ningún cliente con ese email');
    return;
  }

  console.log(`✅ Encontrados ${clientes.length} cliente(s)\n`);

  clientes.forEach((cliente, index) => {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`CLIENTE #${index + 1}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log('📋 Información General:');
    console.log('   ID:', cliente.id);
    console.log('   Email:', cliente.email);
    console.log('   Nombre:', cliente.nombre);
    console.log('   Teléfono:', cliente.telefono);
    console.log('   Activo:', cliente.activo ? '✅' : '❌');
    console.log('   Creado:', new Date(cliente.created_at).toLocaleString('es-ES'));
    console.log('');

    console.log('🏪 Tienda:');
    if (cliente.tiendas) {
      console.log('   ID:', cliente.id_tienda);
      console.log('   Nombre:', cliente.tiendas.nombre_comercial || cliente.tiendas.nombre);
      console.log('   Dominio:', cliente.tiendas.dominio);
    } else {
      console.log('   ⚠️  No se pudo obtener información de la tienda');
    }
    console.log('');

    console.log('📧 Estado de Validación de Email:');
    console.log('   Email validado:', cliente.email_validado ? '✅ SÍ' : '❌ NO');

    if (!cliente.email_validado) {
      console.log('   Token de validación:', cliente.codigo_validacion ? '✅ Existe' : '❌ No existe');

      if (cliente.codigo_validacion) {
        console.log('   Token:', cliente.codigo_validacion);

        const expiraEn = new Date(cliente.codigo_validacion_expires_at);
        const ahora = new Date();
        const expirado = ahora > expiraEn;

        console.log('   Expira en:', expiraEn.toLocaleString('es-ES'));
        console.log('   Estado:', expirado ? '⏰ EXPIRADO' : '✅ VÁLIDO');

        if (cliente.validacion_enviada_at) {
          console.log('   Enviado:', new Date(cliente.validacion_enviada_at).toLocaleString('es-ES'));
        }

        // Construir URL de validación
        const dominio = cliente.tiendas?.dominio || 'DESCONOCIDO';
        const baseDomain = 'qronnect.es';
        const validationUrl = `https://${dominio}.${baseDomain}/validar-email?token=${cliente.codigo_validacion}`;

        console.log('');
        console.log('🔗 URL de Validación:');
        console.log('   ', validationUrl);
        console.log('');
        console.log('💡 Prueba haciendo clic en este enlace para validar tu email');
      }
    }
    console.log('');
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

verificarCliente();
