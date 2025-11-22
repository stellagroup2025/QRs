# 📋 CASOS DE USO COMPLETOS - QRONNECT

## Índice por Tipo de Usuario

- [🔴 SUPERADMIN](#-superadmin) - Gestión global del sistema
- [🟠 ADMIN (Staff de Tienda)](#-admin-staff-de-tienda) - Gestión de la tienda
- [🟢 CLIENTE](#-cliente) - Experiencia del usuario final

---

## 🔴 SUPERADMIN

Gestión global del sistema multi-tenant. Acceso completo a todas las tiendas.

### SA-001: Login de Superadmin

**URL:** `https://app.qronnect.es/superadmin/login`

**Descripción Técnica:**
Autenticación del superadministrador con credenciales únicas. Genera token JWT con rol 'superadmin'.

**Descripción Comercial:**
Acceso seguro al panel de control maestro de Qronnect.

**Instrucciones de Uso:**
1. Navegar a la URL
2. Ingresar email de superadmin
3. Ingresar contraseña
4. Click en "Iniciar Sesión"
5. Redirige a `/superadmin/dashboard`

**Criterios de Éxito:**
- [ ] Formulario de login visible
- [ ] Credenciales válidas aceptadas
- [ ] Token JWT generado correctamente
- [ ] Redirección a dashboard
- [ ] Rol 'superadmin' en token verificado

---

### SA-002: Dashboard de Superadmin

**URL:** `https://app.qronnect.es/superadmin/dashboard`

**Descripción Técnica:**
Panel con métricas globales: total tiendas, clientes, transacciones, ingresos. Gráficos de actividad.

**Descripción Comercial:**
Vista panorámica de todas las tiendas en la plataforma con KPIs en tiempo real.

**Instrucciones de Uso:**
1. Login como superadmin
2. Dashboard se carga automáticamente
3. Ver cards de métricas globales
4. Revisar gráficos de tendencias
5. Acceder a secciones desde menú lateral

**Criterios de Éxito:**
- [ ] Métricas globales correctas
- [ ] Gráficos se renderizan
- [ ] Datos en tiempo real
- [ ] Navegación a subsecciones funciona
- [ ] Performance < 2 segundos de carga

---

### SA-003: Gestión de Tiendas

**URL:** `https://app.qronnect.es/superadmin/tiendas`

**Descripción Técnica:**
CRUD completo de tiendas. Tabla paginada con filtros, búsqueda, y acciones (crear, editar, desactivar).

**Descripción Comercial:**
Administración centralizada de todas las tiendas en Qronnect. Onboarding y configuración de nuevos clientes.

**Instrucciones de Uso:**
1. Login como superadmin
2. Click en "Tiendas" en menú lateral
3. Ver lista de todas las tiendas
4. **Crear nueva tienda:**
   - Click en "Nueva Tienda"
   - Rellenar formulario (nombre, dominio, plan, etc.)
   - Click en "Crear"
5. **Editar tienda:**
   - Click en icono de editar
   - Modificar campos
   - Click en "Guardar"
6. **Desactivar tienda:**
   - Click en toggle "Activo/Inactivo"
   - Confirmar acción

**Criterios de Éxito:**
- [ ] Lista de tiendas se carga
- [ ] Crear tienda funciona
- [ ] Editar tienda persiste cambios
- [ ] Desactivar tienda bloquea acceso
- [ ] Búsqueda y filtros funcionan
- [ ] Paginación correcta

---

### SA-004: Gestión de Planes y Facturación

**URL:** `https://app.qronnect.es/superadmin/facturacion`

**Descripción Técnica:**
Configuración de planes (Free, Pro, Enterprise), límites, precios. Vista de facturación por tienda.

**Descripción Comercial:**
Control de suscripciones y facturación. Define qué features tiene cada plan.

**Instrucciones de Uso:**
1. Login como superadmin
2. Click en "Facturación"
3. **Configurar planes:**
   - Editar límites (clientes, campañas, usuarios)
   - Definir precios mensuales/anuales
   - Activar/desactivar features
4. **Ver facturas:**
   - Filtrar por tienda
   - Ver historial de pagos
   - Descargar facturas

**Criterios de Éxito:**
- [ ] Planes configurables
- [ ] Límites se aplican correctamente
- [ ] Facturación se genera automáticamente
- [ ] Descarga de facturas PDF funciona
- [ ] Integración con Stripe funciona

---

### SA-005: Monitoreo de Sistema

**URL:** `https://app.qronnect.es/superadmin/monitoreo`

**Descripción Técnica:**
Logs de sistema, errores, performance. Integración con Sentry/Datadog. Alertas configurables.

**Descripción Comercial:**
Observabilidad completa del sistema para prevenir y resolver incidencias.

**Instrucciones de Uso:**
1. Login como superadmin
2. Click en "Monitoreo"
3. **Ver logs:**
   - Filtrar por nivel (error, warning, info)
   - Filtrar por servicio (API, frontend, BD)
   - Ver detalles de stack trace
4. **Configurar alertas:**
   - Definir umbrales (ej: >100 errores/min)
   - Configurar notificaciones (email, Slack)

**Criterios de Éxito:**
- [ ] Logs se visualizan en tiempo real
- [ ] Filtros funcionan
- [ ] Alertas se disparan correctamente
- [ ] Stack traces completos
- [ ] Performance del dashboard aceptable

---

## 🟠 ADMIN (Staff de Tienda)

Gestión de operaciones diarias de una tienda específica. Sin acceso a otras tiendas.

### A-001: Login de Admin

**URL:** `https://{dominio-tienda}.qronnect.es/admin/login`

**Descripción Técnica:**
Autenticación con email + contraseña o código OTP. Genera token JWT con rol 'admin' y tenant ID.

**Descripción Comercial:**
Acceso seguro al panel de gestión de tu tienda.

**Instrucciones de Uso:**
1. Navegar a URL de tu tienda
2. Ingresar email de staff
3. Ingresar contraseña (o solicitar código OTP)
4. Click en "Iniciar Sesión"
5. Redirige a `/admin/dashboard`

**Criterios de Éxito:**
- [ ] Formulario de login visible
- [ ] Login con contraseña funciona
- [ ] Login con OTP funciona
- [ ] Token JWT con tenant ID correcto
- [ ] Redirección a dashboard

---

### A-002: Dashboard de Admin

**URL:** `https://{dominio-tienda}.qronnect.es/admin/dashboard`

**Descripción Técnica:**
Panel con KPIs de la tienda: clientes activos, compras del día/mes, puntos otorgados, campañas activas.

**Descripción Comercial:**
Vista general del desempeño de tu programa de fidelización en tiempo real.

**Instrucciones de Uso:**
1. Login como admin
2. Dashboard se carga automáticamente
3. Ver cards de métricas principales
4. Revisar gráficos de tendencias (últimos 7/30 días)
5. Click en secciones para detalles

**Criterios de Éxito:**
- [ ] Métricas correctas y actualizadas
- [ ] Gráficos de líneas/barras visibles
- [ ] Filtros de fecha funcionan
- [ ] Links a subsecciones activos
- [ ] Responsive en tablet

---

### A-003: Gestión de Clientes

**URL:** `https://{dominio-tienda}.qronnect.es/admin/clientes`

**Descripción Técnica:**
CRUD de clientes. Búsqueda, filtros, edición de datos, ajuste manual de puntos, historial de compras.

**Descripción Comercial:**
Administra la base de datos de tus clientes y gestiona sus puntos de fidelización.

**Instrucciones de Uso:**
1. Login como admin
2. Click en "Clientes"
3. **Buscar cliente:**
   - Escribir nombre, email o teléfono
   - Ver resultados en tiempo real
4. **Ver detalle de cliente:**
   - Click en cliente
   - Ver historial de compras
   - Ver puntos totales
   - Ver referidos (si aplica)
5. **Editar cliente:**
   - Click en "Editar"
   - Modificar datos (nombre, email, teléfono)
   - Click en "Guardar"
6. **Ajustar puntos manualmente:**
   - Click en "Ajustar Puntos"
   - Ingresar cantidad (+/-)
   - Ingresar motivo
   - Click en "Aplicar"

**Criterios de Éxito:**
- [ ] Búsqueda funciona en tiempo real
- [ ] Filtros (activos, inactivos) funcionan
- [ ] Historial de compras completo
- [ ] Edición persiste cambios
- [ ] Ajuste manual de puntos se registra
- [ ] Paginación correcta

---

### A-004: Registrar Compra (QR)

**URL:** `https://{dominio-tienda}.qronnect.es/admin/scanner`

**Descripción Técnica:**
Escaneo de QR del cliente para registrar compra. Entrada de importe, cálculo automático de puntos, confirmación.

**Descripción Comercial:**
Escanea el QR del cliente y otorga puntos de forma instantánea.

**Instrucciones de Uso:**
1. Login como admin
2. Click en "Escanear QR"
3. **Escanear QR del cliente:**
   - Permitir acceso a cámara
   - Apuntar cámara al QR del cliente
   - Sistema detecta automáticamente
4. **Registrar compra:**
   - Ver datos del cliente (nombre, puntos actuales)
   - Ingresar importe de la compra (€)
   - Ver cálculo automático de puntos
   - (Opcional) Agregar notas
   - Click en "Registrar Compra"
5. **Confirmación:**
   - Ver mensaje de éxito
   - Ver nuevos puntos del cliente
   - Opción de escanear otro cliente

**Criterios de Éxito:**
- [ ] Scanner de QR funciona
- [ ] Detecta QR correctamente
- [ ] Cálculo de puntos correcto
- [ ] Compra se registra en BD
- [ ] Puntos se suman al cliente
- [ ] Funciona en móvil

---

### A-005: Canjear Puntos

**URL:** `https://{dominio-tienda}.qronnect.es/admin/canjear`

**Descripción Técnica:**
Escaneo de QR, selección de recompensa del catálogo, validación de puntos suficientes, canje y descuento de puntos.

**Descripción Comercial:**
Permite a tus clientes canjear sus puntos por recompensas y descuentos.

**Instrucciones de Uso:**
1. Login como admin
2. Click en "Canjear Puntos"
3. **Escanear QR del cliente:**
   - Escanear QR
   - Ver datos del cliente y puntos disponibles
4. **Seleccionar recompensa:**
   - Ver catálogo de recompensas
   - Seleccionar recompensa deseada
   - Verificar puntos suficientes
5. **Confirmar canje:**
   - Click en "Canjear"
   - Ver confirmación
   - Puntos se descuentan automáticamente

**Criterios de Éxito:**
- [ ] Scanner funciona
- [ ] Catálogo de recompensas se carga
- [ ] Validación de puntos suficientes
- [ ] Canje se registra en historial
- [ ] Puntos se descuentan correctamente
- [ ] No permite canjear sin puntos suficientes

---

### A-006: Validar Cupón de Regalo

**URL:** `https://{dominio-tienda}.qronnect.es/admin/validar-cupon`

**Descripción Técnica:**
Escaneo de QR o entrada manual de código de cupón. Validación de estado, expiración. Marcado como "usado".

**Descripción Comercial:**
Valida los cupones de regalo que tus clientes han ganado (bienvenida, referidos, milestones).

**Instrucciones de Uso:**
1. Login como admin
2. Click en "Validar Cupón"
3. **Opción 1: Escanear QR del cupón:**
   - Cliente muestra QR en su móvil
   - Escanear con cámara
4. **Opción 2: Ingresar código manualmente:**
   - Cliente dicta código (8 caracteres)
   - Ingresar en campo de texto
   - Click en "Validar"
5. **Verificación:**
   - Sistema muestra datos del cupón (nombre del regalo, cliente)
   - Verifica estado "disponible"
   - Verifica no expirado
6. **Marcar como usado:**
   - Click en "Marcar como Usado"
   - Confirmación
   - Cupón pasa a estado "usado"

**Criterios de Éxito:**
- [ ] Scanner de QR funciona
- [ ] Entrada manual funciona
- [ ] Valida estado del cupón
- [ ] Valida fecha de expiración
- [ ] No permite usar cupón expirado
- [ ] No permite usar cupón ya usado
- [ ] Marca como usado correctamente
- [ ] Registra quién validó el cupón

---

### A-007: Configurar Programa de Referidos

**URL:** `https://{dominio-tienda}.qronnect.es/admin/referidos/configuracion`

**Descripción Técnica:**
Configuración del programa: puntos por referido (referidor y referido), mensaje de bienvenida, términos y condiciones.

**Descripción Comercial:**
Configura cuántos puntos ganan tus clientes al invitar amigos.

**Instrucciones de Uso:**
1. Login como admin
2. Click en "Referidos" → "Configuración"
3. **Configurar recompensas:**
   - Puntos para referidor (quien invita)
   - Puntos para referido (nuevo cliente)
   - Activar/desactivar programa
4. **Personalizar mensajes:**
   - Mensaje de invitación
   - Email de bienvenida
5. **Click en "Guardar Cambios"**

**Criterios de Éxito:**
- [ ] Formulario se carga con valores actuales
- [ ] Cambios se persisten en BD
- [ ] Nuevos registros usan nueva configuración
- [ ] Validación de campos (puntos > 0)

---

### A-008: Gestionar Catálogo de Regalos

**URL:** `https://{dominio-tienda}.qronnect.es/admin/regalos`

**Descripción Técnica:**
CRUD de regalos concretos. Crear regalo (nombre, tipo, detalles JSONB, días validez, instrucciones), editar, activar/desactivar.

**Descripción Comercial:**
Define los regalos tangibles que tus clientes pueden ganar (café gratis, descuentos, servicios).

**Instrucciones de Uso:**
1. Login como admin
2. Click en "Regalos" → "Catálogo"
3. **Crear nuevo regalo:**
   - Click en "Nuevo Regalo"
   - Ingresar nombre (ej: "Café Gratis")
   - Seleccionar tipo (producto, descuento, servicio, puntos)
   - Ingresar descripción
   - Configurar detalles (cantidad, valor, etc.)
   - Ingresar instrucciones de canje
   - Seleccionar icono
   - Configurar días de validez
   - Click en "Crear"
4. **Editar regalo:**
   - Click en icono de editar
   - Modificar campos
   - Click en "Guardar"
5. **Activar/Desactivar:**
   - Toggle "Activo"
   - Regalos inactivos no se pueden otorgar

**Criterios de Éxito:**
- [ ] Lista de regalos se carga
- [ ] Crear regalo funciona
- [ ] Campos JSONB se guardan correctamente
- [ ] Editar persiste cambios
- [ ] Desactivar previene otorgamiento
- [ ] Iconos se muestran correctamente

---

### A-009: Configurar Milestones de Referidos

**URL:** `https://{dominio-tienda}.qronnect.es/admin/referidos/milestones`

**Descripción Técnica:**
CRUD de milestones. Definir cantidad de referidos objetivo, tipo de recompensa (regalo, puntos, ambos), orden de presentación.

**Descripción Comercial:**
Crea objetivos progresivos para incentivar a tus clientes a invitar más amigos.

**Instrucciones de Uso:**
1. Login como admin
2. Click en "Referidos" → "Milestones"
3. **Crear milestone:**
   - Click en "Nuevo Milestone"
   - Ingresar nombre (ej: "Invita 6 amigos")
   - Ingresar descripción
   - Definir cantidad de referidos objetivo (6)
   - Seleccionar tipo de recompensa:
     * Solo regalo: seleccionar del catálogo
     * Solo puntos: ingresar cantidad
     * Ambos: seleccionar regalo + puntos extra
   - Definir orden de presentación (1, 2, 3...)
   - Click en "Crear"
4. **Ver milestones existentes:**
   - Ver lista ordenada
   - Ver cuántos clientes han alcanzado cada uno

**Criterios de Éxito:**
- [ ] Lista de milestones ordenada
- [ ] Crear milestone funciona
- [ ] Tipos de recompensa se guardan
- [ ] Orden se respeta en frontend
- [ ] Editar milestone funciona
- [ ] Stats de alcanzados correctos

---

### A-010: Configurar Regalo de Bienvenida

**URL:** `https://{dominio-tienda}.qronnect.es/admin/configuracion/bienvenida`

**Descripción Técnica:**
Configuración del regalo al validar email. Opciones: puntos (clásico) o regalo concreto del catálogo.

**Descripción Comercial:**
Define qué reciben los nuevos clientes al registrarse: puntos o un regalo específico.

**Instrucciones de Uso:**
1. Login como admin
2. Click en "Configuración" → "Regalo de Bienvenida"
3. **Activar/desactivar programa:**
   - Toggle "Activo"
4. **Seleccionar tipo de regalo:**
   - **Opción 1: Puntos**
     * Radio button "Puntos"
     * Ingresar cantidad de puntos
   - **Opción 2: Regalo concreto**
     * Radio button "Regalo Concreto"
     * Seleccionar regalo del catálogo
5. **Click en "Guardar"**

**Criterios de Éxito:**
- [ ] Configuración se carga
- [ ] Tipo "puntos" funciona (comportamiento actual)
- [ ] Tipo "regalo concreto" funciona (nuevo)
- [ ] Nuevos registros reciben configuración correcta
- [ ] Email con cupón se envía (si regalo concreto)

---

### A-011: Crear y Enviar Campaña de Email

**URL:** `https://{dominio-tienda}.qronnect.es/admin/campanas/email`

**Descripción Técnica:**
Editor de email con plantillas, segmentación de clientes (puntos, última compra, referidos), programación, envío.

**Descripción Comercial:**
Envía campañas de email personalizadas a tus clientes para promociones y comunicaciones.

**Instrucciones de Uso:**
1. Login como admin
2. Click en "Campañas" → "Email"
3. **Crear nueva campaña:**
   - Click en "Nueva Campaña"
   - Ingresar nombre interno
4. **Diseñar email:**
   - Seleccionar plantilla o crear desde cero
   - Ingresar asunto
   - Editar contenido (HTML o visual)
   - Insertar variables: {{nombre}}, {{puntos}}, etc.
5. **Segmentar audiencia:**
   - Todos los clientes
   - Filtros: puntos > X, última compra < Y días, etc.
   - Ver count de destinatarios
6. **Programar envío:**
   - Enviar ahora
   - Programar fecha y hora
7. **Click en "Enviar" o "Programar"**

**Criterios de Éxito:**
- [ ] Editor visual funciona
- [ ] Plantillas se cargan
- [ ] Variables se reemplazan correctamente
- [ ] Segmentación filtra correctamente
- [ ] Envío inmediato funciona
- [ ] Programación funciona
- [ ] Stats de apertura/clicks disponibles

---

### A-012: Crear y Enviar Campaña de SMS

**URL:** `https://{dominio-tienda}.qronnect.es/admin/campanas/sms`

**Descripción Técnica:**
Editor de SMS (160 caracteres), segmentación, programación, integración con Twilio, tracking de entrega.

**Descripción Comercial:**
Envía mensajes SMS masivos a tus clientes para promociones urgentes.

**Instrucciones de Uso:**
1. Login como admin
2. Click en "Campañas" → "SMS"
3. **Crear nueva campaña:**
   - Click en "Nueva Campaña SMS"
   - Ingresar nombre interno
4. **Escribir mensaje:**
   - Ingresar texto (máx 160 caracteres)
   - Insertar variables: {{nombre}}, {{puntos}}
   - Ver preview con contador de caracteres
5. **Segmentar audiencia:**
   - Filtros (igual que email)
   - Solo clientes con acepta_marketing_sms = true
   - Ver count de destinatarios
6. **Programar envío:**
   - Enviar ahora
   - Programar fecha y hora
7. **Click en "Enviar" o "Programar"**

**Criterios de Éxito:**
- [ ] Contador de caracteres funciona
- [ ] Variables se reemplazan
- [ ] Segmentación respeta opt-out SMS
- [ ] Texto STOP se añade automáticamente
- [ ] Envío vía Twilio funciona
- [ ] Stats de entrega disponibles

---

### A-013: Ver Reportes y Estadísticas

**URL:** `https://{dominio-tienda}.qronnect.es/admin/reportes`

**Descripción Técnica:**
Dashboard de analytics: clientes nuevos/activos, compras por período, puntos otorgados/canjeados, ROI del programa.

**Descripción Comercial:**
Analiza el desempeño de tu programa de fidelización con reportes detallados.

**Instrucciones de Uso:**
1. Login como admin
2. Click en "Reportes"
3. **Seleccionar período:**
   - Hoy, Última semana, Último mes, Personalizado
4. **Ver métricas:**
   - Clientes nuevos
   - Compras totales
   - Ticket promedio
   - Puntos otorgados vs canjeados
   - Tasa de retención
   - ROI del programa
5. **Exportar datos:**
   - Click en "Exportar CSV"
   - Click en "Exportar PDF"

**Criterios de Éxito:**
- [ ] Gráficos se renderizan
- [ ] Filtros de fecha funcionan
- [ ] Métricas calculadas correctamente
- [ ] Exportación CSV funciona
- [ ] Exportación PDF funciona
- [ ] Performance < 3 segundos

---

### A-014: Gestión de Usuarios Staff

**URL:** `https://{dominio-tienda}.qronnect.es/admin/usuarios`

**Descripción Técnica:**
CRUD de usuarios admin/staff de la tienda. Asignación de roles (admin, staff), permisos granulares.

**Descripción Comercial:**
Administra qué empleados tienen acceso al panel y qué pueden hacer.

**Instrucciones de Uso:**
1. Login como admin (rol propietario)
2. Click en "Usuarios"
3. **Invitar nuevo usuario:**
   - Click en "Invitar Usuario"
   - Ingresar email
   - Seleccionar rol (Admin, Staff)
   - Seleccionar permisos específicos
   - Click en "Enviar Invitación"
4. **Editar usuario:**
   - Click en usuario
   - Modificar rol o permisos
   - Click en "Guardar"
5. **Desactivar usuario:**
   - Toggle "Activo"

**Criterios de Éxito:**
- [ ] Lista de usuarios se carga
- [ ] Invitación se envía por email
- [ ] Usuario puede aceptar invitación
- [ ] Roles se aplican correctamente
- [ ] Permisos granulares funcionan
- [ ] Desactivar revoca acceso

---

## 🟢 CLIENTE

Experiencia del usuario final. Registro, acumulación de puntos, canjes, referidos.

### C-001: Registro de Cliente (con Código de Referido)

**URL:** `https://{dominio-tienda}.qronnect.es/registro?ref={codigo}`

**Descripción Técnica:**
Formulario de registro con campos personalizables. Captura código de referido de URL. Genera QR único. Envía email de validación.

**Descripción Comercial:**
Únete al programa de fidelización y empieza a ganar puntos y recompensas.

**Instrucciones de Uso:**
1. **Llegar a la página:**
   - Escanear QR de amigo (redirige con ?ref=CODIGO)
   - O navegar directamente
2. **Rellenar formulario:**
   - Nombre completo
   - Email
   - Teléfono
   - Código postal (opcional)
   - Fecha de nacimiento (opcional)
   - Género (opcional)
3. **Aceptar términos:**
   - Checkbox de términos y condiciones
   - Checkbox de marketing (opcional)
4. **Click en "Registrarse"**
5. **Mensaje de confirmación:**
   - "Revisa tu email para validar tu cuenta"

**Criterios de Éxito:**
- [ ] Formulario se renderiza
- [ ] Código de referido se pre-rellena desde URL
- [ ] Validación de campos funciona
- [ ] Registro crea cliente en BD
- [ ] QR se genera automáticamente
- [ ] Email de validación se envía
- [ ] Si hay código de referido, se procesa

---

### C-002: Validación de Email

**URL:** `https://{dominio-tienda}.qronnect.es/validar-email?token={token}`

**Descripción Técnica:**
Click en enlace del email. Valida token, marca email_validado = true, otorga regalo de bienvenida (puntos o cupón), auto-login.

**Descripción Comercial:**
Confirma tu email y recibe tu regalo de bienvenida.

**Instrucciones de Uso:**
1. **Abrir email de bienvenida:**
   - Bandeja de entrada
   - Email de "{Nombre de Tienda}"
   - Asunto: "Confirma tu email - {Tienda}"
2. **Click en botón "Confirmar mi email"**
3. **Automático:**
   - Token se valida
   - Email marcado como validado
   - Regalo de bienvenida otorgado
   - Auto-login (token JWT guardado)
   - Redirige a `/mi-perfil`
4. **Ver mensaje de éxito:**
   - "¡Email validado exitosamente!"
   - Si regalo concreto: "Revisa tu email para ver tu cupón"

**Criterios de Éxito:**
- [ ] Link del email funciona
- [ ] Token válido se acepta
- [ ] Token expirado muestra error y reenvía nuevo
- [ ] Email se marca como validado
- [ ] Regalo de bienvenida se otorga (puntos o cupón)
- [ ] Auto-login funciona
- [ ] Redirige a perfil
- [ ] Si cupón, email adicional se envía

---

### C-003: Login de Cliente (OTP)

**URL:** `https://{dominio-tienda}.qronnect.es/login`

**Descripción Técnica:**
Login passwordless con código OTP. Ingresa email, recibe código de 6 dígitos válido 10 min, ingresa código, genera JWT.

**Descripción Comercial:**
Accede a tu perfil de forma rápida y segura sin contraseñas.

**Instrucciones de Uso:**
1. Navegar a la URL
2. **Ingresar email:**
   - Campo de email
   - Click en "Enviar Código"
3. **Revisar email:**
   - Código de 6 dígitos
   - Válido por 10 minutos
4. **Ingresar código:**
   - 6 campos numéricos
   - Auto-avanza al siguiente campo
   - Click en "Iniciar Sesión"
5. **Redirige a `/mi-perfil`**

**Criterios de Éxito:**
- [ ] Email válido acepta envío
- [ ] Email con código llega < 1 minuto
- [ ] Código de 6 dígitos correcto
- [ ] Código expira a los 10 minutos
- [ ] Código incorrecto muestra error
- [ ] Login exitoso genera JWT
- [ ] Redirige a perfil

---

### C-004: Ver Mi Perfil y Puntos

**URL:** `https://{dominio-tienda}.qronnect.es/mi-perfil`

**Descripción Técnica:**
Dashboard del cliente: puntos totales, QR personal, historial de compras (últimas 10), próxima recompensa.

**Descripción Comercial:**
Tu perfil personal con todos tus puntos, historial y QR para acumular.

**Instrucciones de Uso:**
1. Login como cliente
2. Automáticamente carga `/mi-perfil`
3. **Ver información:**
   - Card grande con puntos totales
   - QR personal (para mostrar en tienda)
   - Próxima recompensa y progreso
   - Historial de compras (fecha, importe, puntos)
4. **Acciones:**
   - Descargar QR (PNG)
   - Ver todas las compras
   - Ir a catálogo de recompensas

**Criterios de Éxito:**
- [ ] Puntos totales correctos
- [ ] QR se renderiza
- [ ] Historial de compras se carga
- [ ] Progreso a recompensa correcto
- [ ] Descarga de QR funciona
- [ ] Responsive en móvil

---

### C-005: Ver Catálogo de Recompensas

**URL:** `https://{dominio-tienda}.qronnect.es/recompensas`

**Descripción Técnica:**
Listado de recompensas disponibles con costo en puntos, descripción, imagen. Indicador de puntos suficientes/insuficientes.

**Descripción Comercial:**
Descubre todos los regalos y descuentos que puedes obtener con tus puntos.

**Instrucciones de Uso:**
1. Login como cliente
2. Click en "Recompensas" en menú
3. **Ver catálogo:**
   - Cards con imagen de recompensa
   - Nombre y descripción
   - Costo en puntos
   - Badge "Disponible" o "Necesitas X puntos más"
4. **Filtrar:**
   - Por categoría (descuentos, productos, servicios)
   - Solo disponibles (puntos suficientes)
5. **Solicitar canje:**
   - Click en recompensa
   - Confirmar canje
   - Se genera cupón de canje
   - Instrucciones: "Muestra este cupón en tienda"

**Criterios de Éxito:**
- [ ] Catálogo se carga
- [ ] Imágenes se muestran
- [ ] Cálculo de disponibilidad correcto
- [ ] Filtros funcionan
- [ ] Canje genera cupón
- [ ] No permite canje sin puntos

---

### C-006: Ver Mis Cupones de Regalo

**URL:** `https://{dominio-tienda}.qronnect.es/mis-cupones`

**Descripción Técnica:**
Lista de cupones otorgados (bienvenida, referidos, milestones). Filtro disponibles/usados. QR code, código alfanumérico, fecha expiración.

**Descripción Comercial:**
Todos tus cupones y regalos en un solo lugar. Muéstralos en tienda para canjearlos.

**Instrucciones de Uso:**
1. Login como cliente
2. Click en "Mis Cupones"
3. **Ver cupones disponibles:**
   - Cards con nombre del regalo
   - Descripción
   - Código del cupón (grande, monospace)
   - Botón "Ver QR"
4. **Expandir QR:**
   - Click en "Ver QR"
   - QR se muestra (200x200px)
   - Instrucciones de canje
5. **Filtrar:**
   - "Disponibles" (default)
   - "Todos" (incluye usados y expirados)
6. **Ver detalles:**
   - Fecha de recepción
   - Válido hasta
   - Estado (disponible, usado, expirado)
   - Origen (bienvenida, milestone, etc.)

**Criterios de Éxito:**
- [ ] Lista de cupones se carga
- [ ] Filtro "Disponibles" muestra solo activos
- [ ] QR se genera correctamente del código
- [ ] Código es legible (grande)
- [ ] Badge "¡Nuevo!" en cupones no vistos
- [ ] Auto-marca como visto al cargar
- [ ] Responsive en móvil

---

### C-007: Invitar Amigos (Programa de Referidos)

**URL:** `https://{dominio-tienda}.qronnect.es/mis-referidos`

**Descripción Técnica:**
Código personal único, URL de referido, QR descargable. Compartir por WhatsApp, Facebook, Twitter, Email. Stats: total referidos.

**Descripción Comercial:**
Invita a tus amigos y gana puntos y recompensas. ¡Todos ganan!

**Instrucciones de Uso:**
1. Login como cliente
2. Click en "Invita Amigos"
3. **Ver código personal:**
   - QR grande (280x280px)
   - Código alfanumérico debajo
4. **Compartir:**
   - **Opción 1: Copiar código**
     * Click en "Copiar Código"
     * Enviar por mensaje manual
   - **Opción 2: Copiar link**
     * Click en "Copiar Link"
     * Link incluye ?ref={codigo}
   - **Opción 3: Descargar QR**
     * Click en "Descargar"
     * QR en PNG (1080x1080px) optimizado para redes
   - **Opción 4: Compartir directo**
     * Botón WhatsApp (abre WhatsApp con mensaje)
     * Botón Facebook (abre compartir de Facebook)
     * Botón Twitter (abre tweet con mensaje)
     * Botón Email (abre cliente email)
5. **Ver stats:**
   - Total de amigos referidos
   - Lista de referidos (nombre, fecha)
   - Recompensas obtenidas

**Criterios de Éxito:**
- [ ] Código personal se genera al registro
- [ ] QR se renderiza correctamente
- [ ] Copiar código funciona
- [ ] Copiar link funciona
- [ ] Descarga de QR genera PNG correcto
- [ ] Compartir WhatsApp abre app
- [ ] Compartir Facebook abre compartir
- [ ] Stats de referidos correctos
- [ ] Lista de referidos se actualiza

---

### C-008: Ver Progreso de Milestones

**URL:** `https://{dominio-tienda}.qronnect.es/mis-referidos` (sección)

**Descripción Técnica:**
Cards de milestones con progress bar. Colores dinámicos: verde (completado), amarillo (alcanzado), blanco (pendiente). Contador de amigos.

**Descripción Comercial:**
Alcanza objetivos de invitaciones y desbloquea regalos exclusivos.

**Instrucciones de Uso:**
1. Login como cliente
2. Ir a "Invita Amigos"
3. **Scroll a sección "Objetivos de Referidos"**
4. **Ver milestones:**
   - Cards ordenados (3, 6, 10 amigos)
   - Nombre del milestone
   - Descripción
   - Regalo asociado (icono + nombre)
   - Progress bar visual
   - Contador: "X / Y amigos"
   - "Faltan N amigos" (si no alcanzado)
5. **Completar milestone:**
   - Cuando alcanzas el objetivo (ej: 6 amigos)
   - Card se pone verde
   - Badge "¡Completado!"
   - Recibes email de celebración
   - Cupón se genera automáticamente
6. **Ver cupón:**
   - Ir a "Mis Cupones"
   - Ver cupón del milestone

**Criterios de Éxito:**
- [ ] Milestones se cargan correctamente
- [ ] Progress bar calcula % correctamente
- [ ] Colores cambian según estado
- [ ] Badge "¡Completado!" aparece
- [ ] Milestone se marca como alcanzado en BD
- [ ] Cupón se genera automáticamente
- [ ] Email de celebración se envía
- [ ] Frontend muestra "ambos" (regalo + puntos)

---

### C-009: Historial de Compras

**URL:** `https://{dominio-tienda}.qronnect.es/historial`

**Descripción Técnica:**
Lista completa de compras registradas. Filtros por fecha. Detalles: fecha, importe, puntos otorgados, notas del staff.

**Descripción Comercial:**
Revisa todas tus compras y los puntos que has ganado.

**Instrucciones de Uso:**
1. Login como cliente
2. Click en "Historial"
3. **Ver lista de compras:**
   - Ordenadas por fecha (más reciente primero)
   - Fecha y hora
   - Importe (€)
   - Puntos ganados
   - Notas (si las hay)
4. **Filtrar por fecha:**
   - Último mes (default)
   - Último trimestre
   - Último año
   - Personalizado (seleccionar rango)
5. **Ver totales:**
   - Total gastado en período
   - Total puntos ganados en período

**Criterios de Éxito:**
- [ ] Lista de compras se carga
- [ ] Ordenamiento por fecha correcto
- [ ] Filtros funcionan
- [ ] Totales se calculan correctamente
- [ ] Paginación si >20 compras
- [ ] Responsive

---

### C-010: Editar Perfil

**URL:** `https://{dominio-tienda}.qronnect.es/mi-perfil/editar`

**Descripción Técnica:**
Formulario de edición: nombre, email, teléfono, fecha nacimiento, género. Preferencias de marketing (email, SMS).

**Descripción Comercial:**
Actualiza tu información personal y preferencias de comunicación.

**Instrucciones de Uso:**
1. Login como cliente
2. Ir a "Mi Perfil"
3. Click en "Editar Perfil"
4. **Modificar datos:**
   - Nombre
   - Email (requiere re-validación si cambia)
   - Teléfono
   - Fecha de nacimiento
   - Género
5. **Preferencias de marketing:**
   - Checkbox "Recibir emails de promociones"
   - Checkbox "Recibir SMS de promociones"
6. **Click en "Guardar Cambios"**

**Criterios de Éxito:**
- [ ] Formulario se carga con datos actuales
- [ ] Validación de campos funciona
- [ ] Cambios se persisten en BD
- [ ] Si cambia email, requiere re-validación
- [ ] Preferencias de marketing se respetan
- [ ] Mensaje de confirmación se muestra

---

### C-011: Cerrar Sesión

**URL:** N/A (acción)

**Descripción Técnica:**
Elimina token JWT del localStorage. Redirige a landing page o login.

**Descripción Comercial:**
Cierra tu sesión de forma segura.

**Instrucciones de Uso:**
1. Login como cliente
2. Click en menú de usuario (avatar o nombre)
3. Click en "Cerrar Sesión"
4. Confirmación (opcional)
5. Token se elimina
6. Redirige a `/login`

**Criterios de Éxito:**
- [ ] Token se elimina de localStorage
- [ ] Redirección funciona
- [ ] No puede acceder a rutas protegidas después
- [ ] Mensaje de confirmación (opcional)

---

### C-012: Darse de Baja de Marketing (Email)

**URL:** `https://{dominio-tienda}.qronnect.es/unsubscribe?token={token}`

**Descripción Técnica:**
Click en link de email. Valida token único, marca acepta_marketing_email = false, confirma baja.

**Descripción Comercial:**
Deja de recibir emails promocionales con un solo click.

**Instrucciones de Uso:**
1. **Abrir cualquier email de marketing**
2. **Scroll al final del email**
3. **Click en link "darte de baja aquí"**
4. **Se abre página de confirmación:**
   - Mensaje: "¿Seguro que quieres dejar de recibir emails?"
   - Botón "Confirmar baja"
   - Botón "Cancelar"
5. **Click en "Confirmar baja"**
6. **Ver mensaje de éxito:**
   - "Te has dado de baja exitosamente"
   - "Ya no recibirás emails de marketing"
   - "Seguirás recibiendo emails transaccionales"

**Criterios de Éxito:**
- [ ] Link del email funciona
- [ ] Token válido se acepta
- [ ] acepta_marketing_email se marca como false
- [ ] No recibe más emails de campañas
- [ ] Sigue recibiendo emails transaccionales (OTP, validación)
- [ ] Puede reactivar desde perfil

---

### C-013: Darse de Baja de Marketing (SMS - STOP)

**URL:** N/A (responder SMS)

**Descripción Técnica:**
Cliente responde "STOP" a SMS. Twilio webhook recibe mensaje, detecta palabra clave, marca acepta_marketing_sms = false, envía confirmación.

**Descripción Comercial:**
Deja de recibir SMS promocionales respondiendo STOP.

**Instrucciones de Uso:**
1. **Recibir SMS de marketing**
2. **Ver texto al final:**
   - "Responde STOP para darte de baja"
3. **Responder al SMS con:**
   - "STOP" (mayúsculas)
   - O "stop" (minúsculas)
   - O "Baja", "Cancelar", "Unsubscribe"
4. **Recibir SMS de confirmación:**
   - "Te has dado de baja de SMS marketing"
5. **Dejar de recibir SMS promocionales**

**Criterios de Éxito:**
- [ ] Todos los SMS incluyen texto "Responde STOP"
- [ ] Webhook de Twilio configurado
- [ ] Detecta palabras clave (STOP, BAJA, etc.)
- [ ] acepta_marketing_sms se marca como false
- [ ] SMS de confirmación se envía
- [ ] No recibe más SMS de campañas
- [ ] Log en tabla sms_opt_out_log
- [ ] Puede reactivar desde perfil

---

### C-014: Ver Aviso Legal y Privacidad

**URL:** `https://{dominio-tienda}.qronnect.es/aviso-legal`
**URL:** `https://{dominio-tienda}.qronnect.es/privacidad`

**Descripción Técnica:**
Páginas estáticas con contenido legal. Multi-tenant (datos dinámicos por tienda: NIF, razón social, dominio).

**Descripción Comercial:**
Información legal y política de privacidad de tu tienda.

**Instrucciones de Uso:**
1. Navegar a URL (sin login requerido)
2. **Aviso Legal:**
   - Datos identificativos de la tienda
   - NIF/CIF
   - Razón social
   - Domicilio
   - Datos registrales
   - Términos de servicio
3. **Privacidad:**
   - Datos que se recopilan
   - Finalidad del tratamiento
   - Base legal (RGPD)
   - Transferencias internacionales
   - Derechos ARCO
   - Contacto DPO

**Criterios de Éxito:**
- [ ] Páginas accesibles sin login
- [ ] Contenido se carga
- [ ] Datos dinámicos correctos (NIF, razón social)
- [ ] Sección transferencias internacionales visible
- [ ] Link en footer de toda la app

---

## 📊 RESUMEN DE CASOS DE USO

### Por Tipo de Usuario

| Tipo | Total Casos | Implementados | Pendientes |
|------|-------------|---------------|------------|
| **Superadmin** | 5 | 0 | 5 |
| **Admin** | 14 | 10 | 4 |
| **Cliente** | 14 | 14 | 0 |
| **TOTAL** | **33** | **24** | **9** |

### Casos Implementados ✅

**Admin:**
- A-001: Login
- A-002: Dashboard
- A-003: Gestión de Clientes
- A-004: Registrar Compra (QR)
- A-006: Validar Cupón
- A-007: Configurar Referidos
- A-008: Catálogo de Regalos
- A-009: Milestones
- A-010: Regalo de Bienvenida
- A-011: Campañas Email

**Cliente:**
- Todos los 14 casos ✅

### Casos Pendientes ⏳

**Superadmin:**
- SA-001 a SA-005 (módulo completo)

**Admin:**
- A-005: Canjear Puntos
- A-012: Campañas SMS
- A-013: Reportes
- A-014: Gestión de Usuarios Staff

---

## 🧪 HOJA DE TESTING

### Cómo usar esta hoja:

Para cada caso de uso, marcar:
- ✅ **Funciona**: Todos los criterios de éxito se cumplen
- ⚠️ **Funciona parcialmente**: Algunos criterios fallan
- ❌ **No funciona**: La mayoría de criterios fallan o no está implementado
- ⏳ **No probado**: Aún no se ha testeado

### Testing Template:

```markdown
## [ID]: [Nombre del Caso]

**Estado:** [ ] ✅ Funciona | [ ] ⚠️ Parcial | [ ] ❌ No funciona | [ ] ⏳ No probado

**Fecha de prueba:** __/__/____
**Probado por:** ___________
**Navegador:** ___________
**Dispositivo:** ___________

**Criterios de Éxito:**
- [ ] Criterio 1
- [ ] Criterio 2
- [ ] Criterio 3
...

**Bugs encontrados:**
1. _____________________
2. _____________________

**Notas adicionales:**
_____________________
```

---

🤖 *Generado con Claude Code - 22 de noviembre de 2025*
