import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration(migrationPath: string, migrationName: string) {
  console.log(`\n🔄 Aplicando migración: ${migrationName}`);

  const sql = fs.readFileSync(migrationPath, 'utf-8');

  try {
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });

    if (error) {
      console.error(`❌ Error en ${migrationName}:`, error);
      return false;
    }

    console.log(`✅ Migración ${migrationName} aplicada exitosamente`);
    return true;
  } catch (err) {
    console.error(`❌ Excepción al aplicar ${migrationName}:`, err);
    return false;
  }
}

async function main() {
  console.log('🚀 Aplicando migraciones de campañas...\n');

  const migrationsDir = path.join(__dirname, 'supabase', 'migrations');

  const migrations = [
    {
      name: '20250111000008_create_envios_campanas.sql',
      path: path.join(migrationsDir, '20250111000008_create_envios_campanas.sql'),
    },
    {
      name: '20250111000009_add_tipo_to_campanas.sql',
      path: path.join(migrationsDir, '20250111000009_add_tipo_to_campanas.sql'),
    },
    {
      name: '20250111000010_create_filtrar_clientes_function.sql',
      path: path.join(migrationsDir, '20250111000010_create_filtrar_clientes_function.sql'),
    },
  ];

  let success = true;

  for (const migration of migrations) {
    if (fs.existsSync(migration.path)) {
      const result = await applyMigration(migration.path, migration.name);
      if (!result) {
        success = false;
        break;
      }
    } else {
      console.log(`⚠️ Archivo de migración no encontrado: ${migration.name}`);
      success = false;
      break;
    }
  }

  if (success) {
    console.log('\n✅ Todas las migraciones se aplicaron correctamente\n');
  } else {
    console.log('\n❌ Algunas migraciones fallaron\n');
    process.exit(1);
  }
}

main();
