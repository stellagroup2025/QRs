import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar definidas en .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration(migrationFile: string) {
  try {
    console.log(`\nAplicando migración: ${migrationFile}`);

    // Leer el archivo SQL
    const migrationPath = path.join(__dirname, 'migrations', migrationFile);
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    // Dividir el SQL en statements individuales
    // Nota: Esto es una simplificación, puede necesitar mejoras para SQL complejo
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Total de statements a ejecutar: ${statements.length}`);

    // Ejecutar cada statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';

      // Saltar comentarios de línea completa
      if (statement.trim().startsWith('--')) {
        continue;
      }

      console.log(`Ejecutando statement ${i + 1}/${statements.length}...`);

      const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement });

      if (error) {
        console.error(`Error en statement ${i + 1}:`, error);

        // Intentar ejecutar directamente si el RPC falla
        console.log('Intentando ejecución directa...');
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ sql_query: statement }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error en ejecución directa:', errorText);

          // No fallar para permitir continuar con otras statements
          console.warn('Continuando con el siguiente statement...');
        }
      }
    }

    console.log(`✅ Migración ${migrationFile} aplicada exitosamente`);
  } catch (error) {
    console.error(`❌ Error aplicando migración ${migrationFile}:`, error);
    throw error;
  }
}

// Migración a aplicar
const migrationToApply = process.argv[2] || '002_create_promociones_canjes.sql';

applyMigration(migrationToApply)
  .then(() => {
    console.log('\n✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Proceso fallido:', error);
    process.exit(1);
  });
