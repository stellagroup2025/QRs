import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Variables de entorno no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyGeneroMigration() {
  try {
    console.log('Aplicando migración de género...');

    // Ejecutar ALTER TABLE directamente
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE clientes
        ADD COLUMN IF NOT EXISTS genero VARCHAR(20);

        CREATE INDEX IF NOT EXISTS idx_clientes_genero ON clientes(genero);
      `
    });

    if (error) {
      console.error('Error:', error);
      throw error;
    }

    console.log('✅ Migración aplicada exitosamente');
    console.log('Columna "genero" agregada a la tabla clientes');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

applyGeneroMigration().then(() => process.exit(0));
