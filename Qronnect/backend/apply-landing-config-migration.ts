import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY no está configurada')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration() {
  try {
    console.log('📁 Leyendo archivo de migración...')

    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20251115000001_create_landing_config.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    console.log('🚀 Aplicando migración de configuración de landing...')

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      console.error('❌ Error al aplicar migración:', error)
      process.exit(1)
    }

    console.log('✅ Migración aplicada exitosamente')
    console.log('')
    console.log('📊 Tabla creada: landing_config')
    console.log('   - Configuración de textos de landing page por tienda')
    console.log('   - Incluye todos los textos editables (Hero, Servicios, Beneficios, Testimonios, CTA)')
    console.log('   - RLS habilitado para SuperAdmin, Admin y acceso público')
    console.log('   - Configuración por defecto insertada para todas las tiendas')
    console.log('')
    console.log('🎯 Próximos pasos:')
    console.log('   1. Crear endpoint GET /api/config/landing')
    console.log('   2. Crear endpoint PUT /api/admin/landing-config (para admin)')
    console.log('   3. Crear endpoint PUT /api/superadmin/tiendas/:id/landing-config')
    console.log('   4. Actualizar frontend para usar estos textos')

  } catch (err) {
    console.error('❌ Error inesperado:', err)
    process.exit(1)
  }
}

applyMigration()
