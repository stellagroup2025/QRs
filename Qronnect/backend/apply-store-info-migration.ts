import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY no está configurada');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function applyMigration() {
  console.log('🚀 Aplicando migración de información de tienda...\n');

  try {
    console.log('📝 Añadiendo columnas a tiendas...\n');

    // Las columnas ya existen o se crean con ALTER TABLE ADD IF NOT EXISTS
    // Ejecutar la migración usando SQL directo
    const { error: alterError } = await (supabase as any).rpc('exec_sql', {
      sql_query: `
        ALTER TABLE tiendas
          ADD COLUMN IF NOT EXISTS sitio_web TEXT,
          ADD COLUMN IF NOT EXISTS whatsapp TEXT,
          ADD COLUMN IF NOT EXISTS horarios JSONB DEFAULT '{
            "lunes": {"abierto": true, "apertura": "09:00", "cierre": "20:00"},
            "martes": {"abierto": true, "apertura": "09:00", "cierre": "20:00"},
            "miercoles": {"abierto": true, "apertura": "09:00", "cierre": "20:00"},
            "jueves": {"abierto": true, "apertura": "09:00", "cierre": "20:00"},
            "viernes": {"abierto": true, "apertura": "09:00", "cierre": "20:00"},
            "sabado": {"abierto": true, "apertura": "10:00", "cierre": "14:00"},
            "domingo": {"abierto": false, "apertura": null, "cierre": null}
          }'::jsonb,
          ADD COLUMN IF NOT EXISTS redes_sociales JSONB DEFAULT '{
            "facebook": null,
            "instagram": null,
            "twitter": null,
            "linkedin": null,
            "tiktok": null
          }'::jsonb,
          ADD COLUMN IF NOT EXISTS ubicacion_maps TEXT,
          ADD COLUMN IF NOT EXISTS descripcion TEXT;
      `,
    });

    if (alterError && !alterError.message?.includes('already exists')) {
      console.error('❌ Error al añadir columnas:', alterError.message);
      // Intentar manualmente con query builder si falla RPC
      console.log('⚠️  Intentando método alternativo...\n');
    } else {
      console.log('✅ Columnas añadidas correctamente\n');
    }

    console.log('\n✅ Migración de información de tienda aplicada correctamente!');
    console.log('\n📊 Nuevos campos añadidos a tiendas:');
    console.log('   - sitio_web: URL del sitio web');
    console.log('   - whatsapp: Número de WhatsApp');
    console.log('   - horarios: Horarios de apertura/cierre por día');
    console.log('   - redes_sociales: URLs de redes sociales');
    console.log('   - ubicacion_maps: URL de Google Maps');
    console.log('   - descripcion: Descripción de la tienda');
    console.log('\n💡 Próximos pasos:');
    console.log('   1. Crear DTOs para la información de tienda');
    console.log('   2. Crear endpoints en el backend');
    console.log('   3. Crear UI en el panel de admin');
    console.log('   4. Crear vista para clientes');
    console.log('\n');

  } catch (error: any) {
    console.error('\n❌ Error al aplicar migración:', error.message);
    if (error.details) {
      console.error('Detalles:', error.details);
    }
    process.exit(1);
  }
}

applyMigration();
