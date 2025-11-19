# ✅ Verificación de Tiendas Demo

## 🎯 Sistema Configurado Correctamente

¡Felicidades! Tu sistema multitenancy está funcionando. Aquí tienes cómo verificar cada tienda.

---

## 🧪 Pruebas Rápidas

### Opción 1: Usando Subdominios (Si ejecutaste el script PowerShell)

Abre tu navegador y visita estas URLs:

```
http://stylecut.localhost:3001/api/config/branding
http://burgerco.localhost:3001/api/config/branding
http://fitzone.localhost:3001/api/config/branding
```

Deberías ver los datos de branding de cada tienda (colores diferentes para cada una).

---

### Opción 2: Usando Headers (Alternativa sin editar hosts)

Con curl:

```bash
# Style&Cut (Rosa - Belleza)
curl http://localhost:3001/api/config/branding -H "X-Tenant-Domain: stylecut"

# Burger&Co (Naranja - Comida)
curl http://localhost:3001/api/config/branding -H "X-Tenant-Domain: burgerco"

# FitZone (Rojo - Deporte)
curl http://localhost:3001/api/config/branding -H "X-Tenant-Domain: fitzone"

# Dolce Frío (Naranja - Heladería)
curl http://localhost:3001/api/config/branding -H "X-Tenant-Domain: dolcefrio"
```

---

## 📋 Lista Completa de Verificación

Copia y pega estos comandos para verificar TODAS las tiendas:

```bash
echo "=== BELLEZA Y BIENESTAR ==="
curl -s http://localhost:3001/api/config/branding -H "X-Tenant-Domain: stylecut" | grep -o '"nombre_comercial":"[^"]*"'
curl -s http://localhost:3001/api/config/branding -H "X-Tenant-Domain: urbancut" | grep -o '"nombre_comercial":"[^"]*"'
curl -s http://localhost:3001/api/config/branding -H "X-Tenant-Domain: bellaskin" | grep -o '"nombre_comercial":"[^"]*"'
curl -s http://localhost:3001/api/config/branding -H "X-Tenant-Domain: perfectnails" | grep -o '"nombre_comercial":"[^"]*"'
curl -s http://localhost:3001/api/config/branding -H "X-Tenant-Domain: aquarelax" | grep -o '"nombre_comercial":"[^"]*"'
curl -s http://localhost:3001/api/config/branding -H "X-Tenant-Domain: visionplus" | grep -o '"nombre_comercial":"[^"]*"'

echo ""
echo "=== FOODIE Y RESTAURACION ==="
curl -s http://localhost:3001/api/config/branding -H "X-Tenant-Domain: elrincon" | grep -o '"nombre_comercial":"[^"]*"'
curl -s http://localhost:3001/api/config/branding -H "X-Tenant-Domain: dolcefrio" | grep -o '"nombre_comercial":"[^"]*"'
curl -s http://localhost:3001/api/config/branding -H "X-Tenant-Domain: laparrilla" | grep -o '"nombre_comercial":"[^"]*"'
curl -s http://localhost:3001/api/config/branding -H "X-Tenant-Domain: donnapoli" | grep -o '"nombre_comercial":"[^"]*"'
curl -s http://localhost:3001/api/config/branding -H "X-Tenant-Domain: burgerco" | grep -o '"nombre_comercial":"[^"]*"'

echo ""
echo "=== MASCOTAS ==="
curl -s http://localhost:3001/api/config/branding -H "X-Tenant-Domain: huellafeliz" | grep -o '"nombre_comercial":"[^"]*"'
curl -s http://localhost:3001/api/config/branding -H "X-Tenant-Domain: doggystyle" | grep -o '"nombre_comercial":"[^"]*"'
curl -s http://localhost:3001/api/config/branding -H "X-Tenant-Domain: vetcare" | grep -o '"nombre_comercial":"[^"]*"'

echo ""
echo "=== INFANTIL Y FAMILIA ==="
curl -s http://localhost:3001/api/config/branding -H "X-Tenant-Domain: mundopeques" | grep -o '"nombre_comercial":"[^"]*"'
curl -s http://localhost:3001/api/config/branding -H "X-Tenant-Domain: cuentosmas" | grep -o '"nombre_comercial":"[^"]*"'
curl -s http://localhost:3001/api/config/branding -H "X-Tenant-Domain: pequelook" | grep -o '"nombre_comercial":"[^"]*"'

echo ""
echo "=== SALUD Y DEPORTE ==="
curl -s http://localhost:3001/api/config/branding -H "X-Tenant-Domain: fitzone" | grep -o '"nombre_comercial":"[^"]*"'
curl -s http://localhost:3001/api/config/branding -H "X-Tenant-Domain: fisioplus" | grep -o '"nombre_comercial":"[^"]*"'
curl -s http://localhost:3001/api/config/branding -H "X-Tenant-Domain: nutrishop" | grep -o '"nombre_comercial":"[^"]*"'
```

**Salida esperada:**
```
=== BELLEZA Y BIENESTAR ===
"nombre_comercial":"Style&Cut"
"nombre_comercial":"UrbanCut Barbershop"
"nombre_comercial":"BellaSkin Estética"
"nombre_comercial":"Perfect Nails Studio"
"nombre_comercial":"AquaRelax Wellness Spa"
"nombre_comercial":"VisiónPlus Ópticas"

=== FOODIE Y RESTAURACION ===
"nombre_comercial":"El Rincón Café"
"nombre_comercial":"Dolce Frío Gelato"
"nombre_comercial":"La Parrilla Grill"
"nombre_comercial":"Don Nápoli Pizzeria"
"nombre_comercial":"Burger&Co"

=== MASCOTAS ===
"nombre_comercial":"Huella Feliz Pet Shop"
"nombre_comercial":"DoggyStyle Grooming"
"nombre_comercial":"VetCare Veterinaria"

=== INFANTIL Y FAMILIA ===
"nombre_comercial":"MundoPeques Juguetes"
"nombre_comercial":"Cuentos&Más Librería"
"nombre_comercial":"PequeLook Kids Salon"

=== SALUD Y DEPORTE ===
"nombre_comercial":"FitZone Gym"
"nombre_comercial":"FisioPlus Fisioterapia"
"nombre_comercial":"NutriShop Nutrición"
```

---

## 🎨 Verificar Colores Únicos

Cada tienda tiene su propia paleta de colores:

```bash
# Style&Cut - Rosa (#E91E63)
curl -s http://localhost:3001/api/config/branding -H "X-Tenant-Domain: stylecut" | grep color_primario

# Burger&Co - Naranja (#FF9800)
curl -s http://localhost:3001/api/config/branding -H "X-Tenant-Domain: burgerco" | grep color_primario

# FitZone - Rojo (#F44336)
curl -s http://localhost:3001/api/config/branding -H "X-Tenant-Domain: fitzone" | grep color_primario

# AquaRelax - Cyan (#00BCD4)
curl -s http://localhost:3001/api/config/branding -H "X-Tenant-Domain: aquarelax" | grep color_primario
```

---

## 🗄️ Verificar en Base de Datos

### Query SQL: Ver todas las tiendas demo

```sql
SELECT
  nombre,
  dominio,
  nombre_comercial,
  color_primario,
  metadata->>'sector' as sector,
  plan,
  activo
FROM tiendas
WHERE metadata->>'es_demo' = 'true'
ORDER BY metadata->>'sector', nombre;
```

### Query SQL: Contar por sector

```sql
SELECT
  metadata->>'sector' as sector,
  COUNT(*) as total,
  STRING_AGG(dominio, ', ') as tiendas
FROM tiendas
WHERE metadata->>'es_demo' = 'true'
GROUP BY metadata->>'sector'
ORDER BY total DESC;
```

### Query SQL: Verificar landing configs

```sql
SELECT
  t.nombre,
  t.dominio,
  CASE
    WHEN lc.id IS NOT NULL THEN 'OK - Landing configurado'
    ELSE 'FALTA - Landing config'
  END as estado_landing
FROM tiendas t
LEFT JOIN landing_config lc ON t.id = lc.id_tienda
WHERE t.metadata->>'es_demo' = 'true'
ORDER BY t.nombre;
```

---

## 🌐 Probar en el Navegador

### URLs con subdominios locales:

Una vez configurado el archivo hosts, abre estas URLs en tu navegador:

**Belleza:**
- http://stylecut.localhost:3001/api/config/branding
- http://bellaskin.localhost:3001/api/config/branding

**Comida:**
- http://burgerco.localhost:3001/api/config/branding
- http://laparrilla.localhost:3001/api/config/branding

**Deporte:**
- http://fitzone.localhost:3001/api/config/branding

**Mascotas:**
- http://huellafeliz.localhost:3001/api/config/branding

Deberías ver JSON con datos diferentes para cada tienda.

---

## 🔧 Troubleshooting

### ❌ Error: "Tienda no encontrada"

**Causa:** El seed no se ejecutó correctamente.

**Solución:**
```sql
-- Verificar si existen las tiendas
SELECT COUNT(*) FROM tiendas WHERE metadata->>'es_demo' = 'true';
-- Debería retornar: 18

-- Si retorna 0, ejecuta el seed de nuevo:
-- Copia database/seed-tiendas-ejemplo.sql en Supabase SQL Editor
```

---

### ❌ Error: "Cannot GET /api/config/branding"

**Causa:** El backend no está corriendo.

**Solución:**
```bash
cd backend
npm run start:dev
```

---

### ❌ Los subdominios no funcionan en el navegador

**Causa:** El archivo hosts no está configurado.

**Solución:**
```powershell
# Ejecuta el script PowerShell como Administrador
.\setup-hosts-windows.ps1

# O edita manualmente:
# C:\Windows\System32\drivers\etc\hosts
# Agrega: 127.0.0.1    stylecut.localhost
```

---

## ✅ Checklist de Verificación

- [ ] Backend corriendo en puerto 3001
- [ ] Seed SQL ejecutado (18 tiendas creadas)
- [ ] Script PowerShell ejecutado (archivo hosts configurado)
- [ ] Probado al menos 3 tiendas con curl
- [ ] Probado al menos 1 tienda en el navegador
- [ ] Verificado que cada tienda tiene colores diferentes
- [ ] Landing configs creados automáticamente

---

## 🎯 Próximos Pasos

Ahora que tienes las tiendas funcionando, puedes:

1. **Crear usuarios admin** para cada tienda
2. **Agregar logos** personalizados (subir a Supabase Storage)
3. **Crear clientes de ejemplo** para cada tienda
4. **Generar compras ficticias** para tener historial
5. **Configurar landing pages** personalizadas
6. **Crear promociones** por sector

---

## 📊 Estadísticas Actuales

```bash
# Total de tiendas demo
curl -s "http://localhost:3001/api/superadmin/tiendas" | grep -o '"nombre"' | wc -l

# O en Supabase:
SELECT COUNT(*) FROM tiendas WHERE metadata->>'es_demo' = 'true';
# Resultado esperado: 18
```

---

¡Todo listo! 🎉 Tu sistema multitenancy está funcionando perfectamente.
