# 🧪 Guía Completa de Pruebas

## 📋 Checklist de Verificación

Usa esta guía para probar todas las funcionalidades implementadas y asegurarte de que todo funciona correctamente.

---

## ✅ Preparación

### Paso 1: Verificar Instalación
```bash
cd /mnt/c/Users/Omar/Documents/Qrs/Qronnect/QRs

# Verificar que qrcode.react está instalado
npm list qrcode.react

# Si da error, instalar:
npm install qrcode.react --legacy-peer-deps
```

### Paso 2: Iniciar el Backend
```bash
cd /mnt/c/Users/Omar/Documents/Qrs/Qronnect/backend
npm run start:dev
```

### Paso 3: Iniciar el Frontend
```bash
cd /mnt/c/Users/Omar/Documents/Qrs/Qronnect/QRs
npm run dev
```

### Paso 4: Obtener Token de Admin
```bash
# Login como admin
curl -X POST http://localhost:3001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Domain: lokeyokiera" \
  -d '{
    "email": "admin@lokeyokiera.com",
    "pin": "1234"
  }'

# Guardar el access_token que devuelve
```

---

## 🎁 1. Regalos de Bienvenida (Admin)

### URL
`http://localhost:3000/admin/configuracion/regalos`

### Tests a Realizar

#### Test 1.1: Cargar Página
- [ ] La página carga sin errores
- [ ] Se muestran 3 tarjetas de estadísticas
- [ ] El formulario de configuración está visible

#### Test 1.2: Activar Sistema de Puntos
- [ ] Activar el switch "Sistema Activo"
- [ ] Seleccionar tipo "Puntos"
- [ ] Ingresar valor: `100`
- [ ] Mensaje: "¡Bienvenido! Te regalamos 100 puntos"
- [ ] Activar "Enviar Email"
- [ ] Click en "Guardar Configuración"
- [ ] Debe mostrar toast de éxito

#### Test 1.3: Cambiar a Cupón
- [ ] Seleccionar tipo "Cupón de Descuento"
- [ ] Ingresar: `10%`
- [ ] Guardar
- [ ] Verificar que se guardó correctamente

#### Test 1.4: Verificar Estadísticas
- [ ] Registrar un nuevo cliente (desde app cliente)
- [ ] Volver a la página de regalos
- [ ] Verificar que "Últimos 30 días" aumentó en 1
- [ ] Verificar que aparece en el historial

#### Test 1.5: Desactivar Sistema
- [ ] Desactivar el switch
- [ ] Guardar
- [ ] Verificar que el estado cambió a "Inactivo"

---

## 👥 2. Sistema de Referidos (Admin)

### URL
`http://localhost:3000/admin/referidos`

### Tests a Realizar

#### Test 2.1: Tab Configuración

##### Crear Programa
- [ ] Click en tab "Configuración"
- [ ] Activar "Programa Activo"
- [ ] Nombre: "Trae un amigo"
- [ ] Descripción: "Invita a tus amigos y gana recompensas"

##### Recompensas por Registro
- [ ] Para quien refiere: Puntos, 50
- [ ] Para el nuevo cliente: Puntos, 30
- [ ] Guardar

##### Agregar Milestones
- [ ] Click en "+ Agregar" en la sección Milestones
- [ ] Objetivo: 5 referidos
- [ ] Tipo: Puntos
- [ ] Valor: 500
- [ ] Descripción: "500 puntos bonus por 5 referidos"
- [ ] Click "Agregar"
- [ ] Verificar que aparece en la lista

#### Test 2.2: Tab Estadísticas
- [ ] Click en tab "Estadísticas"
- [ ] Verificar que muestra 4 tarjetas de métricas
- [ ] Sección "Top Referidores" debe estar vacía inicialmente

#### Test 2.3: Tab Referidos
- [ ] Click en tab "Referidos"
- [ ] Debe mostrar lista vacía o lista de referidos

---

## 🌟 3. Sistema de Referidos (Cliente)

### URL
`http://localhost:3000/{slug}/mis-referidos`
Ejemplo: `http://localhost:3000/lokeyokiera/mis-referidos`

### Tests a Realizar

#### Test 3.1: Cargar Página
- [ ] Iniciar sesión como cliente
- [ ] Ir a "Invita Amigos" desde el menú
- [ ] Verificar que muestra código personal (ej: JUAN-A3F2)

#### Test 3.2: Copiar Código
- [ ] Click en "Copiar Código"
- [ ] Verificar toast "Código copiado"
- [ ] Pegar en un editor de texto
- [ ] Verificar que el código es correcto

#### Test 3.3: Copiar Link
- [ ] Click en "Copiar Link"
- [ ] Verificar toast "Link copiado"
- [ ] Pegar en un navegador
- [ ] Verificar que el link funciona

#### Test 3.4: Ver QR Code
- [ ] Click en "Ver QR"
- [ ] Verificar que aparece el código QR
- [ ] Escanear con el móvil
- [ ] Verificar que lleva a la página de registro

#### Test 3.5: Compartir en WhatsApp
- [ ] Click en "WhatsApp"
- [ ] Verificar que abre WhatsApp Web
- [ ] Verificar que el mensaje incluye:
  - Nombre de la tienda
  - Código personal
  - Link de registro

#### Test 3.6: Compartir por Email
- [ ] Click en "Email"
- [ ] Verificar que abre cliente de email
- [ ] Verificar asunto y cuerpo del mensaje

#### Test 3.7: Ver Progreso
- [ ] Verificar sección "Tu Progreso"
- [ ] Debe mostrar:
  - X de Y referidos
  - Barra de progreso
  - Próxima recompensa

#### Test 3.8: Lista de Referidos
- [ ] Sección "Tus Amigos Referidos"
- [ ] Si está vacía, debe mostrar mensaje
- [ ] Si hay referidos, debe mostrar:
  - Nombre
  - Fecha de registro
  - Estado de primera compra

---

## 🤖 4. Configuración de IA (Admin)

### URL
`http://localhost:3000/admin/configuracion/ia`

### Tests a Realizar

#### Test 4.1: Información Básica
- [ ] Tipo de negocio: "gimnasio"
- [ ] Tono: "Motivador"
- [ ] Slogan: "Tu mejor versión comienza aquí"
- [ ] Rango de precios: "Medio"

#### Test 4.2: Público Objetivo
- [ ] Edad mínima: 25
- [ ] Edad máxima: 45
- [ ] Agregar interés: "fitness"
- [ ] Agregar interés: "salud"
- [ ] Agregar interés: "bienestar"
- [ ] Verificar que aparecen como badges

#### Test 4.3: Valores de Marca
- [ ] Agregar: "motivación"
- [ ] Agregar: "comunidad"
- [ ] Agregar: "resultados"
- [ ] Verificar badges

#### Test 4.4: Productos Principales
- [ ] Agregar: "Clases de CrossFit"
- [ ] Agregar: "Entrenamiento personal"
- [ ] Agregar: "Yoga"

#### Test 4.5: Ubicación
- [ ] Barrio: "Chamberí"
- [ ] Ciudad: "Madrid"

#### Test 4.6: Hashtags
- [ ] Agregar: "#GymFitMadrid"
- [ ] Agregar: "#TuMejorVersion"
- [ ] Verificar que se agrega el # automáticamente

#### Test 4.7: Guardar
- [ ] Click en "Guardar Configuración"
- [ ] Verificar toast de éxito
- [ ] Recargar página
- [ ] Verificar que todo se guardó

---

## 🧠 5. Configuración IA (SuperAdmin)

### URL
`http://localhost:3000/superadmin/tiendas/[id]`

### Tests a Realizar

#### Test 5.1: Acceder al Tab
- [ ] Login como superadmin
- [ ] Ir a lista de tiendas
- [ ] Click en una tienda
- [ ] Click en tab "Configuración IA"
- [ ] Verificar que carga el formulario

#### Test 5.2: Modo Global
- [ ] Seleccionar "Global (Qronnect)"
- [ ] Configurar límite: 100
- [ ] Guardar
- [ ] Verificar toast de éxito

#### Test 5.3: Ver Estadísticas (Modo Global)
- [ ] Verificar que muestra:
  - Consumo actual
  - Límite mensual
  - Restantes
- [ ] Verificar barra de progreso visual

#### Test 5.4: Modo Propio
- [ ] Seleccionar "Propio (API Key propia)"
- [ ] Ingresar API key válida de Gemini
- [ ] Guardar
- [ ] Verificar que muestra "API Key configurada"

#### Test 5.5: Eliminar API Key
- [ ] Click en "Eliminar"
- [ ] Confirmar
- [ ] Verificar que vuelve a modo global

#### Test 5.6: Estadísticas Detalladas
- [ ] Verificar sección "Uso por Tipo"
- [ ] Verificar "Total este mes"
- [ ] Verificar "Total histórico"
- [ ] Si hay datos, verificar tokens y costo

---

## 🎨 6. Navegación (Admin)

### Tests a Realizar

#### Test 6.1: AdminNav Component
- [ ] Ir a `/admin/dashboard`
- [ ] Verificar que aparece la barra de navegación arriba
- [ ] Verificar links:
  - Dashboard
  - Referidos (con badge "Nuevo")
  - Configuración (con dropdown)

#### Test 6.2: Dropdown de Configuración
- [ ] Hover sobre "Configuración"
- [ ] Verificar que aparece dropdown con:
  - Regalos de Bienvenida (badge "Nuevo")
  - Configuración IA (badge "Nuevo")

#### Test 6.3: Navegación Desktop
- [ ] Click en cada link
- [ ] Verificar que navega correctamente
- [ ] Verificar que el link activo tiene estilo diferente

#### Test 6.4: Navegación Mobile
- [ ] Reducir ventana a tamaño móvil
- [ ] Verificar que aparece menú mobile
- [ ] Todos los links deben estar visibles

#### Test 6.5: Botón Logout
- [ ] Click en "Salir"
- [ ] Verificar que cierra sesión
- [ ] Verificar que redirige a login

---

## 📱 7. Navegación (Cliente)

### Tests a Realizar

#### Test 7.1: ClientNav Component
- [ ] Iniciar sesión como cliente
- [ ] Verificar que aparece barra de navegación
- [ ] Verificar 5 links:
  - Mi Cuenta
  - Mi QR
  - Promociones
  - Mis Cupones
  - Invita Amigos (NUEVO)

#### Test 7.2: Link "Invita Amigos"
- [ ] Click en "Invita Amigos"
- [ ] Verificar que navega a `/mis-referidos`
- [ ] Verificar que el icono es Users
- [ ] Verificar que se marca como activo

---

## 🔗 8. Tests de Integración

### Test 8.1: Flujo Completo de Referidos

1. **Configurar programa (Admin)**
   - [ ] Activar programa de referidos
   - [ ] Configurar recompensas

2. **Cliente 1: Obtener código**
   - [ ] Login como cliente 1
   - [ ] Ir a "Invita Amigos"
   - [ ] Copiar código (ej: JUAN-A3F2)

3. **Cliente 2: Registrarse con código**
   - [ ] Abrir ventana incógnito
   - [ ] Ir a página de registro
   - [ ] Agregar `?ref=JUAN-A3F2` al URL
   - [ ] Completar registro

4. **Verificar recompensas**
   - [ ] Cliente 1: Ver "Mis Referidos"
   - [ ] Debe aparecer Cliente 2 en la lista
   - [ ] Cliente 1: Verificar puntos ganados
   - [ ] Cliente 2: Verificar puntos de bienvenida

### Test 8.2: Flujo de Regalos de Bienvenida

1. **Configurar regalo (Admin)**
   - [ ] Activar sistema
   - [ ] Tipo: Puntos, 100
   - [ ] Activar email

2. **Registrar nuevo cliente**
   - [ ] Crear cuenta nueva
   - [ ] Verificar que recibe 100 puntos

3. **Verificar en admin**
   - [ ] Ir a `/admin/configuracion/regalos`
   - [ ] Verificar que incrementó contador
   - [ ] Verificar en historial

### Test 8.3: Generación de Contenido con IA

1. **Configurar contexto (Admin)**
   - [ ] Completar toda la config de IA
   - [ ] Guardar

2. **Generar campaña de email**
   - [ ] Ir a campañas
   - [ ] Usar IA para generar contenido
   - [ ] Verificar que el contenido refleja el contexto

3. **Comparar con/sin contexto**
   - [ ] Generar sin contexto configurado
   - [ ] Configurar contexto
   - [ ] Generar nuevamente
   - [ ] Verificar mejora en personalización

---

## 🐛 Problemas Comunes y Soluciones

### Error: "qrcode.react not found"
```bash
npm install qrcode.react --legacy-peer-deps
```

### Error: "AdminNav is not defined"
Verificar que el import está correcto:
```tsx
import { AdminNav } from '@/components/AdminNav'
```

### Error: "Cannot read property 'codigo'"
El cliente no tiene código de referido todavía. Esperar a que se genere automáticamente.

### La barra de navegación no se ve
Verificar que agregaste `<AdminNav />` en el componente.

### El QR no se genera
Verificar que qrcode.react está instalado y el import es:
```tsx
import { QRCodeSVG } from 'qrcode.react'
```

---

## 📊 Reporte de Pruebas

### Formato de Reporte

```
FUNCIONALIDAD: Regalos de Bienvenida
FECHA: 2025-11-15
TESTER: [Tu nombre]

✅ PASÓ:
- Cargar página
- Activar sistema
- Guardar configuración
- Ver estadísticas

❌ FALLÓ:
- [Ninguno]

🐛 BUGS ENCONTRADOS:
- [Ninguno]

📝 NOTAS:
- Todo funciona correctamente
```

---

## 🎯 Checklist Final de Pruebas

### Funcionalidades Core
- [ ] Regalos de Bienvenida - Admin (5 tests)
- [ ] Sistema de Referidos - Admin (3 tabs)
- [ ] Sistema de Referidos - Cliente (8 tests)
- [ ] Configuración IA - Admin (7 tests)
- [ ] Configuración IA - SuperAdmin (6 tests)

### Navegación
- [ ] AdminNav (5 tests)
- [ ] ClientNav (2 tests)

### Integraciones
- [ ] Flujo completo de referidos (4 pasos)
- [ ] Flujo de regalos (3 pasos)
- [ ] Generación con IA (3 pasos)

### Total de Tests
**52 tests individuales** + **10 tests de integración** = **62 tests total**

---

## ✅ Criterios de Aceptación

Para considerar que TODO está funcionando correctamente:

1. ✅ Todas las páginas cargan sin errores
2. ✅ Todos los formularios guardan datos
3. ✅ Las estadísticas se actualizan en tiempo real
4. ✅ La navegación funciona en desktop y mobile
5. ✅ Los QR codes se generan correctamente
6. ✅ Los compartir en redes sociales funcionan
7. ✅ Los flujos de integración funcionan de principio a fin
8. ✅ No hay errores en la consola del navegador
9. ✅ No hay errores en la consola del servidor
10. ✅ Los toasts de éxito/error aparecen correctamente

---

**Última actualización**: 2025-11-15
**Versión**: 1.0
**Estado**: ✅ COMPLETO
