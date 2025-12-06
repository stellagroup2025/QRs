/**
 * Script para generar QR codes masivamente
 *
 * Uso:
 * npm run generar-qrs -- --cantidad=1000 --lote="LOTE-2024-001"
 *
 * Este script:
 * 1. Se conecta a Supabase
 * 2. Genera N QR codes únicos en la BD
 * 3. Exporta un CSV con las URLs
 * 4. Opcionalmente genera imágenes QR (requiere qrcode library)
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Configuración
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Parsear argumentos de línea de comandos
const args = process.argv.slice(2);
const getArg = (name: string, defaultValue: string = '') => {
  const arg = args.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.split('=')[1] : defaultValue;
};

const cantidad = parseInt(getArg('cantidad', '100'));
const lote = getArg('lote', `LOTE-${new Date().toISOString().split('T')[0]}`);
const exportarImagen = getArg('exportar-imagen', 'false') === 'true';

async function generarQrCodes() {
  console.log('\n🎯 Generando QR Codes...');
  console.log(`   Cantidad: ${cantidad}`);
  console.log(`   Lote: ${lote}\n`);

  try {
    // Llamar a la función de PostgreSQL para generar QR codes
    const { data, error } = await supabase.rpc('generar_qr_codes_batch', {
      p_cantidad: cantidad,
      p_lote: lote,
      p_admin_id: null,
    });

    if (error) {
      console.error('❌ Error generando QR codes:', error);
      return;
    }

    console.log(`✅ ${data.length} QR codes generados exitosamente\n`);

    // Exportar a CSV
    await exportarACsv(data, lote);

    // Opcionalmente exportar imágenes
    if (exportarImagen) {
      await exportarImagenes(data, lote);
    }

    console.log('\n🎉 Proceso completado exitosamente!');
    console.log(`\n📋 Resumen:`);
    console.log(`   - Lote: ${lote}`);
    console.log(`   - QR codes generados: ${data.length}`);
    console.log(`   - Archivo CSV: output/qr-codes-${lote}.csv`);
    if (exportarImagen) {
      console.log(`   - Imágenes QR: output/${lote}/`);
    }
  } catch (err) {
    console.error('❌ Error inesperado:', err);
  }
}

async function exportarACsv(data: any[], lote: string) {
  console.log('📝 Exportando a CSV...');

  // Crear directorio output si no existe
  const outputDir = path.join(__dirname, '..', 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // Generar CSV
  const headers = ['Hash', 'URL', 'Lote'];
  const rows = data.map((qr) => [qr.hash, qr.qr_url, lote]);

  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

  // Guardar archivo
  const filename = path.join(outputDir, `qr-codes-${lote}.csv`);
  fs.writeFileSync(filename, csv, 'utf-8');

  console.log(`✅ CSV exportado: ${filename}`);
}

async function exportarImagenes(data: any[], lote: string) {
  console.log('🖼️  Generando imágenes QR...');

  // Verificar si qrcode está instalado
  try {
    const QRCode = require('qrcode');

    // Crear directorio para imágenes
    const outputDir = path.join(__dirname, '..', 'output', lote);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generar imágenes en lotes de 50
    const batchSize = 50;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const promises = batch.map(async (qr) => {
        const filename = path.join(outputDir, `${qr.hash}.png`);
        await QRCode.toFile(filename, qr.qr_url, {
          width: 512,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
      });

      await Promise.all(promises);
      console.log(`   Generadas ${Math.min(i + batchSize, data.length)}/${data.length} imágenes`);
    }

    console.log(`✅ Imágenes generadas en: output/${lote}/`);
  } catch (err) {
    console.error('⚠️  No se pudo generar imágenes. Instala qrcode: npm install qrcode');
  }
}

// Ejecutar
generarQrCodes()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
