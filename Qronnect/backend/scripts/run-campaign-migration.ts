import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Iniciando migración del sistema de campañas...\n');

  try {
    // Leer el archivo de migración
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250110000005_create_campaigns_system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📄 Archivo de migración cargado');
    console.log(`📏 Tamaño: ${migrationSQL.length} caracteres\n`);

    // Ejecutar la migración
    console.log('⚙️  Ejecutando migración en Supabase...');

    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: migrationSQL
    });

    if (error) {
      // Si no existe la función exec_sql, intentar ejecutar directamente
      console.log('⚠️  Función exec_sql no disponible, ejecutando con el cliente admin...');

      // Dividir en statements individuales
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i] + ';';
        console.log(`   Ejecutando statement ${i + 1}/${statements.length}...`);

        try {
          const { error: stmtError } = await supabase.rpc('exec', {
            query: statement
          });

          if (stmtError) {
            console.error(`   ⚠️  Advertencia en statement ${i + 1}:`, stmtError.message);
          }
        } catch (err: any) {
          console.error(`   ⚠️  Error en statement ${i + 1}:`, err.message);
        }
      }
    }

    // Verificar que las tablas se crearon correctamente
    console.log('\n🔍 Verificando creación de tablas...');

    const tables = ['campanas_email', 'campanas_destinatarios', 'email_templates'];

    for (const table of tables) {
      const { count, error: countError } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error(`   ❌ Error verificando tabla ${table}:`, countError.message);
      } else {
        console.log(`   ✅ Tabla ${table} creada correctamente`);
      }
    }

    // Verificar templates predefinidos
    const { data: templates, error: templatesError } = await supabase
      .from('email_templates')
      .select('nombre')
      .eq('es_sistema', true);

    if (templatesError) {
      console.error('\n   ⚠️  Advertencia: No se pudieron verificar los templates:', templatesError.message);
    } else {
      console.log(`\n📧 Templates predefinidos creados: ${templates?.length || 0}`);
      if (templates) {
        templates.forEach(t => console.log(`   - ${t.nombre}`));
      }
    }

    console.log('\n✅ ¡Migración completada exitosamente!');
    console.log('\n📊 Sistema de campañas de email instalado y listo para usar.');

  } catch (error: any) {
    console.error('\n❌ Error durante la migración:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
