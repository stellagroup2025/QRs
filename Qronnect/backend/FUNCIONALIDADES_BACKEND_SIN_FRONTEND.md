# 🚨 Funcionalidades del Backend SIN Interfaz en Frontend

## 📋 Resumen

Estas son **todas las funcionalidades completamente implementadas en el backend** que están listas para usar pero **NO tienen interfaz en el frontend** (ni para admin ni para clientes).

---

## 1. 🎁 Sistema de Regalos de Bienvenida

### Estado: ✅ Backend Completo | ❌ Frontend Faltante

### ¿Qué hace?
Permite configurar un regalo automático para nuevos clientes cuando se registran por primera vez en la tienda.

### Endpoints Disponibles (Admin)

#### **PUT /api/admin/tiendas/config/regalo-bienvenida**
Configurar el sistema de regalos de bienvenida.

**Body:**
```json
{
  "activo": true,
  "tipo": "puntos",
  "valor": {
    "puntos": 100,
    "mensaje_personalizado": "¡Bienvenido! Te regalamos 100 puntos",
    "enviar_email": true,
    "enviar_sms": false
  }
}
```

**Tipos de regalo disponibles:**
- `puntos`: Otorgar puntos directamente
- `cupon`: Crear cupón de descuento (ej: 10% descuento)
- `promocion`: Asociar a una promoción existente

#### **GET /api/admin/tiendas/config/regalo-bienvenida**
Obtener configuración actual.

#### **GET /api/admin/tiendas/regalos-bienvenida/estadisticas**
Estadísticas de regalos otorgados.

**Respuesta:**
```json
{
  "total_otorgados": 150,
  "ultimos_30_dias": 45,
  "por_tipo": {
    "puntos": 120,
    "cupon": 25,
    "promocion": 5
  }
}
```

#### **GET /api/admin/tiendas/regalos-bienvenida/historial**
Historial de regalos otorgados a clientes.

### Funcionalidad Automática
Cuando un cliente se registra:
1. Se verifica si el sistema está activo
2. Se otorga el regalo automáticamente
3. Se notifica por email/SMS (según configuración)
4. Se registra en el historial

### ¿Qué falta en el Frontend?
- [ ] Página de configuración en panel admin (`/admin/configuracion/regalos`)
- [ ] Formulario para activar/desactivar
- [ ] Selector de tipo de regalo
- [ ] Inputs para configurar valor según tipo
- [ ] Toggle para envío de email/SMS
- [ ] Dashboard con estadísticas de regalos otorgados
- [ ] Tabla con historial de regalos

---

## 2. 👥 Sistema de Referidos

### Estado: ✅ Backend Completo | ❌ Frontend Faltante (Admin y Cliente)

### ¿Qué hace?
Sistema completo de referidos donde los clientes pueden invitar amigos y ganar recompensas.

### Endpoints para Admin

#### **POST /api/admin/referidos/programa**
Crear programa de referidos.

**Body:**
```json
{
  "nombre": "Trae un amigo",
  "descripcion": "Invita amigos y gana puntos",
  "activo": true,
  "recompensas": {
    "por_registro": {
      "referidor": { "tipo": "puntos", "valor": 50 },
      "referido": { "tipo": "puntos", "valor": 30 }
    },
    "por_primera_compra": {
      "referidor": { "tipo": "puntos", "valor": 100 },
      "referido": { "tipo": "cupon", "valor": 10 }
    }
  },
  "milestones": [
    {
      "objetivo": 5,
      "tipo": "puntos",
      "valor": 500,
      "descripcion": "500 puntos por 5 referidos"
    },
    {
      "objetivo": 10,
      "tipo": "cupon",
      "valor": 20,
      "descripcion": "Cupón 20% por 10 referidos"
    }
  ]
}
```

#### **GET /api/admin/referidos/programa**
Obtener programa activo.

#### **PUT /api/admin/referidos/programa/:id**
Actualizar programa.

#### **GET /api/admin/referidos/estadisticas**
Estadísticas del programa.

**Respuesta:**
```json
{
  "total_referidos": 234,
  "este_mes": 45,
  "top_referidores": [
    {
      "cliente": "Juan Pérez",
      "codigo": "JUAN-A3F2",
      "total_referidos": 15,
      "puntos_ganados": 2000
    }
  ],
  "conversion_rate": 0.65,
  "recompensas_otorgadas": 450
}
```

#### **GET /api/admin/referidos/lista**
Lista completa de todos los referidos.

### Endpoints para Clientes

#### **GET /api/cliente/referidos/mi-codigo**
Obtener código personal de referido.

**Respuesta:**
```json
{
  "codigo": "JUAN-A3F2",
  "url": "https://app.qronnect.com/registro?ref=JUAN-A3F2",
  "qr_url": "https://...",
  "nombre": "Juan Pérez",
  "total_referidos": 3
}
```

#### **GET /api/cliente/referidos/mis-referidos**
Lista de personas que he referido.

**Respuesta:**
```json
{
  "referidos": [
    {
      "nombre": "María García",
      "fecha_registro": "2025-11-01",
      "estado": "activo",
      "primera_compra": true,
      "recompensa_obtenida": "100 puntos"
    }
  ],
  "total": 3
}
```

#### **GET /api/cliente/referidos/mi-progreso**
Progreso hacia milestones.

**Respuesta:**
```json
{
  "codigo_personal": "JUAN-A3F2",
  "total_referidos": 3,
  "programa_nombre": "Trae un amigo",
  "proxima_recompensa": {
    "objetivo": 5,
    "tipo": "puntos",
    "valor": 500,
    "descripcion": "500 puntos bonus",
    "progreso": 3,
    "restantes": 2
  },
  "recompensas_obtenidas": [
    {
      "fecha": "2025-11-01",
      "tipo": "puntos",
      "valor": 150,
      "descripcion": "Por 3 registros"
    }
  ]
}
```

### Funcionalidad Automática
1. Cada cliente obtiene un código único al registrarse
2. Puede compartir código/link/QR
3. Cuando alguien se registra con su código:
   - Ambos obtienen recompensa por registro
   - Al hacer primera compra, recompensa adicional
4. Al alcanzar milestones, recompensas especiales

### ¿Qué falta en el Frontend?

#### Panel Admin:
- [ ] Página de configuración (`/admin/referidos`)
- [ ] Formulario para crear/editar programa
- [ ] Dashboard con estadísticas
- [ ] Tabla de top referidores
- [ ] Lista de todos los referidos
- [ ] Configuración de recompensas y milestones

#### App Cliente:
- [ ] Página "Invita amigos" (`/mis-referidos`)
- [ ] Mostrar código personal prominente
- [ ] Botón copiar código
- [ ] Mostrar QR para compartir
- [ ] Botones para compartir en WhatsApp, Email, etc.
- [ ] Lista de amigos referidos
- [ ] Barra de progreso hacia recompensas
- [ ] Historial de recompensas ganadas

---

## 3. 🤖 Configuración de IA (Contexto de Negocio)

### Estado: ✅ Backend Completo | ❌ Frontend Faltante

### ¿Qué hace?
Permite configurar el contexto del negocio para que la IA genere contenido más personalizado y relevante.

### Endpoints Disponibles (Admin)

#### **PUT /api/admin/tiendas/config/ia**
Configurar contexto de IA.

**Body:**
```json
{
  "tipo_negocio": "gimnasio",
  "publico_objetivo": {
    "edad_min": 25,
    "edad_max": 45,
    "generos": ["masculino", "femenino"],
    "intereses": ["fitness", "salud", "bienestar"]
  },
  "valores_marca": ["motivacion", "comunidad", "resultados"],
  "tono_comunicacion": "motivador",
  "productos_principales": [
    "Clases de CrossFit",
    "Entrenamiento personal",
    "Yoga"
  ],
  "rango_precios": "medio",
  "ubicacion": {
    "barrio": "Chamberí",
    "ciudad": "Madrid",
    "referencias_locales": true
  },
  "promociones_recurrentes": [
    "Black Friday - Noviembre",
    "Operación bikini - Mayo"
  ],
  "slogan": "Tu mejor versión comienza aquí",
  "hashtags": ["#GymFitMadrid", "#TuMejorVersion"]
}
```

#### **GET /api/admin/tiendas/config/ia**
Obtener configuración actual.

### ¿Cómo se usa?
Cuando el admin genera contenido con IA (emails, SMS, promociones), el sistema usa esta configuración para crear textos más personalizados y acordes a la marca.

### ¿Qué falta en el Frontend?
- [ ] Página de configuración (`/admin/configuracion/ia`)
- [ ] Formulario con todos los campos del contexto
- [ ] Selector de tipo de negocio (gimnasio, restaurante, salón, etc.)
- [ ] Inputs para público objetivo (edad, género, intereses)
- [ ] Multi-select para valores de marca
- [ ] Selector de tono de comunicación
- [ ] Lista editable de productos principales
- [ ] Selector de rango de precios
- [ ] Campos de ubicación
- [ ] Lista editable de promociones recurrentes
- [ ] Input para slogan
- [ ] Tags input para hashtags
- [ ] Preview de cómo afecta a las generaciones de IA

---

## 4. 📊 Estadísticas de Uso de IA (para Superadmin)

### Estado: ✅ Backend Completo | ❌ Frontend Faltante (SuperAdmin)

### Endpoints Disponibles (SuperAdmin)

#### **GET /api/superadmin/tiendas/:id/ia/estadisticas**
Ver uso de IA por tienda.

**Respuesta:**
```json
{
  "tienda": {
    "id": "uuid",
    "nombre": "Cafetería Aroma"
  },
  "modo": "global",
  "limites": {
    "limite_mensual": 100,
    "consumo_actual": 25,
    "restantes": 75,
    "ultimo_reset": "2025-11-01"
  },
  "estadisticas": {
    "total_este_mes": 25,
    "total_historico": 150,
    "por_tipo": {
      "email_campana": 10,
      "sms_campana": 8,
      "promo": 5,
      "kpi_analisis": 2
    },
    "tokens_este_mes": 45000,
    "costo_estimado_mes": 0.0034
  }
}
```

### ¿Qué falta en el Frontend?
- [ ] Dashboard en panel superadmin
- [ ] Gráficos de uso por tienda
- [ ] Tabla con consumo mensual
- [ ] Alertas de tiendas cerca del límite
- [ ] Desglose por tipo de uso

---

## 5. 🔧 Configuración Avanzada de Tienda (Superadmin)

### Estado: ✅ Backend Completo | ⚠️ Frontend Parcial

### Campos Editables que NO están en el frontend:

En `PUT /api/superadmin/tiendas/:id`:

#### Branding (falta en UI):
- `color_primario` - Color primario en hex
- `color_secundario` - Color secundario en hex
- `color_acento` - Color de acento en hex
- `nombre_comercial` - Nombre visible del negocio

#### Configuración IA (falta en UI):
- Configuración de API keys propias de Gemini
- Límites mensuales de uso
- Ver estadísticas de consumo

### ¿Qué falta en el Frontend?
- [ ] Sección de branding con color pickers
- [ ] Sección completa de configuración IA
- [ ] Preview de colores aplicados
- [ ] Validación de formato hex

---

## 📊 Resumen de Prioridades

### 🔴 Alta Prioridad (features con alto impacto):
1. **Sistema de Referidos** - Puede generar mucho crecimiento orgánico
2. **Regalos de Bienvenida** - Mejora la experiencia del primer contacto
3. **Configuración de IA (Contexto)** - Mejora significativamente la calidad del contenido generado

### 🟡 Media Prioridad:
4. **Estadísticas de IA (Superadmin)** - Útil para monitoreo pero no crítico
5. **Branding avanzado (Superadmin)** - Nice to have

---

## 🎯 Checklist de Implementación Frontend

### Para Panel Admin:

#### Regalos de Bienvenida:
- [ ] Crear página `/admin/configuracion/regalos`
- [ ] Switch ON/OFF del sistema
- [ ] Radio buttons para tipo de regalo (puntos/cupón/promoción)
- [ ] Inputs condicionales según tipo
- [ ] Toggle para envío de email/SMS
- [ ] Dashboard con estadísticas
- [ ] Tabla con historial paginado

#### Sistema de Referidos:
- [ ] Crear página `/admin/referidos`
- [ ] Formulario para crear/editar programa
- [ ] Configuración de recompensas (por registro, por compra)
- [ ] Configuración de milestones (objetivos)
- [ ] Dashboard con métricas clave
- [ ] Top 10 referidores
- [ ] Lista completa de referidos paginada
- [ ] Filtros por estado, fecha

#### Configuración IA (Contexto):
- [ ] Crear página `/admin/configuracion/ia`
- [ ] Selector de tipo de negocio
- [ ] Formulario de público objetivo
- [ ] Multi-selects para valores de marca
- [ ] Selector de tono de comunicación
- [ ] Lista editable de productos
- [ ] Configuración de ubicación
- [ ] Preview de contenido generado

### Para App de Cliente:

#### Referidos:
- [ ] Crear página `/mis-referidos` o `/invita-amigos`
- [ ] Mostrar código personal destacado
- [ ] Botón "Copiar código" con feedback
- [ ] Generar y mostrar QR
- [ ] Botones de compartir en:
  - WhatsApp (con mensaje pre-cargado)
  - Email (con asunto y cuerpo)
  - Facebook
  - Twitter
  - Copiar link
- [ ] Lista de amigos referidos con estado
- [ ] Barra de progreso hacia próxima recompensa
- [ ] Mostrar milestones alcanzados
- [ ] Historial de recompensas ganadas

### Para Panel Superadmin:

#### Estadísticas IA:
- [ ] Agregar sección en página de tienda
- [ ] Gráfico de uso mensual
- [ ] Tabla de consumo por tipo
- [ ] Alertas de límites
- [ ] Comparativa entre tiendas

#### Branding:
- [ ] Agregar color pickers en edición de tienda
- [ ] Preview en tiempo real
- [ ] Validación de formatos hex

---

## 🔗 Archivos Clave del Backend

### Regalos de Bienvenida:
- Controller: `src/tiendas/tiendas.controller.ts:16-54`
- Service: `src/tiendas/tiendas.service.ts:29-141`
- DTO: `src/tiendas/dto/configurar-regalo-bienvenida.dto.ts`
- Migration: `supabase/migrations/20251114000002_sistema_regalos_bienvenida.sql`

### Sistema de Referidos:
- Controller: `src/referidos/referidos.controller.ts`
- Service: `src/referidos/referidos.service.ts`
- DTOs: `src/referidos/dto/`
- Migration: `supabase/migrations/20251114000003_sistema_referidos.sql`

### Configuración IA (Contexto):
- Controller: `src/tiendas/tiendas.controller.ts:56-71`
- Service: `src/tiendas/tiendas.service.ts:143-189`
- DTO: `src/tiendas/dto/configurar-ia.dto.ts`
- Migration: `supabase/migrations/20251114000004_config_ia_extensa.sql`

### Configuración IA (API Keys - Superadmin):
- Controller: `src/superadmin/superadmin.controller.ts:307-363`
- Service: `src/superadmin/superadmin.service.ts:795-1008`
- DTO: `src/superadmin/dto/configure-ia.dto.ts`
- Migration: `supabase/migrations/20251114000005_limites_api_keys_ia.sql`

---

## 💡 Consejos para la Implementación

1. **Empieza por el backend de cada feature**:
   - Ya está todo listo, solo necesitas llamar a los endpoints

2. **Usa React Query o SWR**:
   - Para cache y sincronización automática
   - Ejemplo: `useQuery(['regalo-config'], () => fetch('/api/admin/tiendas/config/regalo-bienvenida'))`

3. **Componentes reutilizables**:
   - Crea un `<StatCard>` para mostrar métricas
   - Un `<ConfigSection>` para secciones de configuración
   - Un `<ShareButtons>` para botones de compartir referidos

4. **Feedback visual**:
   - Toast notifications para éxitos/errores
   - Loading states en todas las acciones
   - Confirmaciones antes de cambios importantes

5. **Responsive design**:
   - Todas estas páginas deben funcionar bien en móvil
   - Especialmente la página de referidos para clientes

---

**Última actualización**: 2025-11-15

**Próximo paso recomendado**: Implementar Sistema de Referidos (mayor impacto en crecimiento)
