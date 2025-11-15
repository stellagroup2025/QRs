const bcrypt = require('bcrypt');

// Cambia este PIN al que quieras usar
const pin = '1234';

const hash = bcrypt.hashSync(pin, 10);

console.log('\n========================================');
console.log('🔐 PIN HASH GENERADO');
console.log('========================================');
console.log(`PIN original: ${pin}`);
console.log(`Hash: ${hash}`);
console.log('========================================\n');
console.log('Copia el hash para usarlo en el INSERT SQL');
console.log('\n');
