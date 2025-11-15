# 🗓️ ROADMAP - 14 de Noviembre 2025

## 📋 Tareas Planificadas

---

## 1. 📱 Mejoras en Campañas SMS

### 🎯 Objetivo
Equiparar las funcionalidades de campañas SMS con las de email, añadiendo información completa y generación con IA.

### 📊 Estado Actual vs Deseado

| Funcionalidad | Email ✅ | SMS ❌ |
|---------------|---------|--------|
| Nombre de campaña | ✅ | ✅ |
| Mensaje/Contenido | ✅ | ✅ |
| Segmentación | ✅ | ✅ |
| Preview destinatarios | ✅ | ✅ |
| **Asunto** | ✅ | ❌ |
| **Remitente personalizado** | ✅ | ❌ |
| **Estadísticas detalladas** | ✅ | ⚠️ Básicas |
| **Generación con IA** | ✅ | ❌ |
| **Programación de envío** | ✅ | ⚠️ Parcial |
| **A/B Testing** | ❌ | ❌ |

### ✅ Tareas

#### Backend

- [ ] **Extender modelo CampanaSMS**
  - `asunto` (opcional, para tracking interno)
  - `remitente_nombre` (nombre legible, ej: "GymFit")
  - `fecha_programada` (ya existe, verificar funcionamiento)
  - `hora_programada` (separar hora de fecha)
  - `zona_horaria` (para envíos programados)
  - `costo_estimado` (basado en destinatarios)
  - `costo_real` (después de enviar)

- [ ] **Estadísticas Detalladas**
  - Tasa de entrega (%)
  - Tasa de fallo (%)
  - Tiempo promedio de entrega
  - Desglose por operador (Movistar, Vodafone, etc.)
  - Gráfico de envíos por hora

- [ ] **Endpoint de Programación**
  - `POST /api/campanas-sms/:id/programar`
  - Validar fecha futura
  - Crear job en cola (Bull/Agenda)

- [ ] **Servicio de IA para SMS**
  - `GeminiService.generarCampanaSMS()`
  - Prompt optimizado para mensajes cortos
  - Respetar límite de 160 caracteres
  - Incluir llamada a la acción
  - Personalización con variables

#### Frontend

- [ ] **Actualizar CrearCampanaSMSModal**
  - Campo "Remitente" (nombre de la tienda)
  - Selector de fecha/hora programada
  - Estimador de costo en tiempo real
  - Preview mejorado con mockup de teléfono

- [ ] **Componente IAGeneradorSMS**
  - Formulario similar a GeneradorEmailsCampana
  - Campos: objetivo, tono, CTA, urgencia
  - Generación automática con límite de caracteres
  - Sugerencias de personalización

- [ ] **Añadir al IADrawer de Campañas**
  - Nueva pestaña "Generador de SMS"
  - Integración con Gemini API
  - Preview en tiempo real

- [ ] **Pantalla de Detalles de Campaña SMS**
  - Ruta: `/admin/campanas-sms/:id`
  - Estadísticas visuales (gráficos)
  - Tabla de destinatarios con estado
  - Opción de reenviar fallidos

### 🎨 Diseño Propuesto

```
┌─────────────────────────────────────────────┐
│ Crear Campaña SMS con IA                    │
├─────────────────────────────────────────────┤
│ Contexto del negocio:                       │
│ ┌─────────────────────────────────────┐    │
│ │ Gimnasio enfocado en CrossFit...    │    │
│ └─────────────────────────────────────┘    │
│                                             │
│ Objetivo de la campaña:                     │
│ [Promoción ▼]                               │
│                                             │
│ Mensaje clave:                              │
│ ┌─────────────────────────────────────┐    │
│ │ 50% de descuento en matrícula       │    │
│ └─────────────────────────────────────┘    │
│                                             │
│ Tono:          Urgencia:                    │
│ [Amigable ▼]   [Media ▼]                   │
│                                             │
│         [✨ Generar SMS con IA]             │
│                                             │
│ ── Resultado generado ──                    │
│ 📱 Hola {{nombre}}! 🎉 Únete a GymFit      │
│    con 50% OFF. Válido hasta el 20/11.     │
│    ¡Te esperamos! 💪                        │
│                                             │
│ 152/160 caracteres [1 SMS]                  │
│         [Usar este mensaje]                 │
└─────────────────────────────────────────────┘
```

---

## 2. 🎁 Sistema de Regalo de Bienvenida

### 🎯 Objetivo
Permitir que cada tienda configure un regalo automático al registrarse nuevos clientes.

### 📋 Casos de Uso

- Cliente nuevo registra → Recibe 100 puntos de bienvenida
- Cliente nuevo registra → Recibe cupón de 10% descuento
- Cliente nuevo registra → Recibe promoción "Café gratis"
- Cliente nuevo registra → Recibe puntos + email de bienvenida

### ✅ Tareas

#### Backend

- [ ] **Migración de Base de Datos**
  ```sql
  -- Añadir a tabla tiendas
  ALTER TABLE tiendas ADD COLUMN regalo_bienvenida_activo BOOLEAN DEFAULT false;
  ALTER TABLE tiendas ADD COLUMN regalo_bienvenida_tipo VARCHAR(50); -- 'puntos', 'cupon', 'promocion'
  ALTER TABLE tiendas ADD COLUMN regalo_bienvenida_valor JSONB;
  ```

- [ ] **DTO RegalosBienvenida**
  ```typescript
  export class ConfigurarRegaloBienvenidaDto {
    activo: boolean
    tipo: 'puntos' | 'cupon' | 'promocion'
    valor: {
      puntos?: number
      cupon_descuento?: number // porcentaje
      promocion_id?: string
      mensaje_personalizado?: string
    }
    enviar_email?: boolean
    enviar_sms?: boolean
  }
  ```

- [ ] **Servicio RegalosBienvenidaService**
  - `otorgarRegalo(clienteId, tiendaId)`
  - `validarConfiguracion()`
  - Integración con SupabaseService
  - Registro de auditoría

- [ ] **Modificar ClientesService.register()**
  ```typescript
  // Después de crear cliente
  await this.regalosBienvenidaService.otorgarRegalo(nuevoCliente.id, tiendaId)
  ```

- [ ] **Endpoints de Configuración**
  - `PUT /api/admin/config/regalo-bienvenida`
  - `GET /api/admin/config/regalo-bienvenida`

#### Frontend (Admin)

- [ ] **Componente ConfigurarRegaloBienvenida**
  - Ubicación: Tab "Configuración" del dashboard
  - Switch ON/OFF
  - Selector de tipo (Puntos/Cupón/Promoción)
  - Campos dinámicos según tipo
  - Preview del regalo

- [ ] **Diseño del Formulario**
  ```
  ┌─────────────────────────────────────────┐
  │ 🎁 Regalo de Bienvenida                 │
  ├─────────────────────────────────────────┤
  │ Activo: [ON] ●                          │
  │                                         │
  │ Tipo de regalo:                         │
  │ ○ Puntos de bienvenida                  │
  │ ● Cupón de descuento                    │
  │ ○ Promoción específica                  │
  │                                         │
  │ Valor del descuento:                    │
  │ [10] %                                  │
  │                                         │
  │ Mensaje personalizado (opcional):       │
  │ ┌───────────────────────────────────┐  │
  │ │ ¡Bienvenido a GymFit! Disfruta... │  │
  │ └───────────────────────────────────┘  │
  │                                         │
  │ Notificaciones:                         │
  │ ☑ Enviar email de bienvenida            │
  │ ☑ Enviar SMS de confirmación            │
  │                                         │
  │ Preview:                                │
  │ ┌───────────────────────────────────┐  │
  │ │ 🎉 ¡Bienvenido!                   │  │
  │ │ Has recibido un cupón de 10% OFF │  │
  │ └───────────────────────────────────┘  │
  │                                         │
  │              [Guardar]                  │
  └─────────────────────────────────────────┘
  ```

#### Frontend (Cliente)

- [ ] **Notificación en App**
  - Modal al hacer login por primera vez
  - Animación de confeti
  - Botón "Ver mi regalo"

---

## 3. 🤝 Sistema de Referidos

### 🎯 Objetivo
Permitir que clientes inviten amigos y ganen recompensas por cada registro exitoso.

### 📊 Mecánica del Sistema

1. Cliente genera su QR/Link personal
2. Amigo escanea y se registra
3. Cliente acumula puntos de referido
4. Al llegar a X referidos → Recompensa automática

### ✅ Tareas

#### Backend

- [ ] **Migración de Base de Datos**
  ```sql
  -- Nueva tabla: programas_referidos
  CREATE TABLE programas_referidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tienda_id UUID NOT NULL REFERENCES tiendas(id),
    activo BOOLEAN DEFAULT true,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    puntos_por_referido INT DEFAULT 0,
    recompensas JSONB, -- [{ objetivo: 5, tipo: 'puntos', valor: 500 }]
    vigencia_desde TIMESTAMP,
    vigencia_hasta TIMESTAMP,
    creado_en TIMESTAMP DEFAULT NOW()
  );

  -- Nueva tabla: referidos
  CREATE TABLE referidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_referidor_id UUID NOT NULL REFERENCES clientes(id),
    cliente_referido_id UUID NOT NULL REFERENCES clientes(id),
    tienda_id UUID NOT NULL REFERENCES tiendas(id),
    codigo_referido VARCHAR(50) UNIQUE,
    fecha_registro TIMESTAMP DEFAULT NOW(),
    recompensa_otorgada BOOLEAN DEFAULT false,
    puntos_otorgados INT DEFAULT 0
  );

  -- Añadir a clientes
  ALTER TABLE clientes ADD COLUMN codigo_referido_personal VARCHAR(20) UNIQUE;
  ALTER TABLE clientes ADD COLUMN total_referidos INT DEFAULT 0;
  ALTER TABLE clientes ADD COLUMN referido_por UUID REFERENCES clientes(id);
  ```

- [ ] **Servicio ReferidosService**
  - `generarCodigoPersonal(clienteId)` → "JUAN-GYM-X7K2"
  - `generarQRReferido(clienteId)` → URL con código
  - `registrarReferido(codigoReferido, nuevoClienteData)`
  - `calcularProgreso(clienteId)` → { completados: 3, objetivo: 10, porcentaje: 30 }
  - `otorgarRecompensa(clienteId, recompensa)`

- [ ] **Endpoints API**
  - `GET /api/clientes/mi-codigo-referido` → { codigo, url, qr }
  - `GET /api/clientes/mis-referidos` → Lista de amigos referidos
  - `GET /api/clientes/programa-referidos` → Info del programa
  - `POST /api/clientes/registro-referido` → Registrar con código
  - `GET /api/admin/referidos/estadisticas` → Dashboard de admin

#### Frontend (Cliente)

- [ ] **Página de Referidos**
  - Ruta: `/mi-cuenta/referidos`
  - Mostrar código personal
  - QR para compartir
  - Botones de compartir (WhatsApp, Telegram, Email)
  - Lista de amigos referidos
  - Progreso visual hacia recompensas

- [ ] **Diseño Propuesto**
  ```
  ┌─────────────────────────────────────────┐
  │ 🤝 Invita a tus Amigos                  │
  ├─────────────────────────────────────────┤
  │ Comparte tu código y gana recompensas   │
  │                                         │
  │ Tu código personal:                     │
  │ ┌─────────────────┐                    │
  │ │ JUAN-GYM-X7K2   │ [Copiar]           │
  │ └─────────────────┘                    │
  │                                         │
  │ Tu QR de referido:                      │
  │ ┌─────────────┐                        │
  │ │   [QR Code] │                        │
  │ └─────────────┘                        │
  │ [Descargar] [Compartir]                │
  │                                         │
  │ ── Comparte por ──                      │
  │ [WhatsApp] [Telegram] [Email]          │
  │                                         │
  │ ── Tu Progreso ──                       │
  │ 7/10 amigos registrados                 │
  │ ████████▒▒ 70%                         │
  │                                         │
  │ 🎁 Próxima recompensa: Comida gratis   │
  │                                         │
  │ ── Tus Referidos (7) ──                │
  │ • María G. - Registrado hace 2 días    │
  │ • Carlos P. - Registrado hace 1 semana │
  │ • Ana M. - Registrado hace 2 semanas   │
  │ ...                                     │
  └─────────────────────────────────────────┘
  ```

#### Frontend (Admin)

- [ ] **Configurar Programa de Referidos**
  - Tab en Configuración
  - Activar/Desactivar programa
  - Definir puntos por referido
  - Crear escalas de recompensas
  - Establecer vigencia

- [ ] **Dashboard de Referidos**
  - Total de referidos en el mes
  - Top referidores
  - Gráfico de crecimiento
  - Recompensas otorgadas

---

## 4. ⚙️ Configuración Extensa para IA

### 🎯 Objetivo
Enriquecer el contexto que se envía a la IA para generar contenido más personalizado y relevante.

### 📋 Información Adicional a Capturar

#### Información del Negocio

- **Tipo de negocio** (gimnasio, restaurante, spa, etc.)
- **Público objetivo** (edad, género, intereses)
- **Valores de marca** (sostenible, lujo, accesible, etc.)
- **Tono de comunicación preferido** (formal, casual, juvenil)
- **Productos/servicios principales** (lista de 5-10 items)
- **Precios promedio** (económico, medio, premium)
- **Ubicación física** (barrio, ciudad, influye en referencias locales)
- **Horarios de atención**
- **Redes sociales** (Instagram, Facebook, etc.)
- **Competencia principal** (para diferenciación)

#### Información de Marketing

- **Promociones recurrentes** (Black Friday, Navidad, etc.)
- **Eventos especiales** (aniversario, inauguraciones)
- **Partnerships** (colaboraciones con otras marcas)
- **Hashtags de marca**
- **Slogan/Tagline**

### ✅ Tareas

#### Backend

- [ ] **Migración de Base de Datos**
  ```sql
  ALTER TABLE tiendas ADD COLUMN config_ia JSONB DEFAULT '{}'::jsonb;

  -- Estructura del JSONB:
  {
    "tipo_negocio": "gimnasio",
    "publico_objetivo": {
      "edad_min": 18,
      "edad_max": 45,
      "generos": ["masculino", "femenino"],
      "intereses": ["fitness", "crossfit", "salud"]
    },
    "valores_marca": ["motivacion", "comunidad", "resultados"],
    "tono_comunicacion": "motivador",
    "productos_principales": [
      "Clases de CrossFit",
      "Entrenamiento personal",
      "Nutrición deportiva"
    ],
    "rango_precios": "medio",
    "ubicacion": {
      "barrio": "Salamanca",
      "ciudad": "Madrid",
      "referencias_locales": true
    },
    "promociones_recurrentes": [
      "Black Friday - Noviembre",
      "Operación bikini - Mayo"
    ],
    "slogan": "Tu mejor versión comienza aquí",
    "hashtags": ["#GymFitMadrid", "#CrossFitSalamanca"]
  }
  ```

- [ ] **DTO ConfiguracionIA**
  ```typescript
  export class ConfiguracionIADto {
    tipo_negocio: string
    publico_objetivo: {
      edad_min?: number
      edad_max?: number
      generos?: string[]
      intereses?: string[]
    }
    valores_marca: string[]
    tono_comunicacion: 'formal' | 'casual' | 'juvenil' | 'motivador' | 'elegante'
    productos_principales: string[]
    rango_precios: 'economico' | 'medio' | 'premium' | 'lujo'
    ubicacion?: {
      barrio?: string
      ciudad?: string
      referencias_locales?: boolean
    }
    promociones_recurrentes?: string[]
    slogan?: string
    hashtags?: string[]
  }
  ```

- [ ] **Actualizar GeminiService**
  - Inyectar `TiendasService`
  - Método `getContextoIA(tiendaId)`
  - Enriquecer prompts con configuración
  - Sistema de fallback si no hay configuración

- [ ] **Endpoints**
  - `PUT /api/admin/config/ia`
  - `GET /api/admin/config/ia`

#### Frontend (Admin)

- [ ] **Wizard de Configuración IA**
  - Paso 1: Información básica del negocio
  - Paso 2: Público objetivo
  - Paso 3: Identidad de marca
  - Paso 4: Productos y precios
  - Paso 5: Marketing y comunicación
  - Progress bar visual

- [ ] **Diseño Multi-paso**
  ```
  ┌─────────────────────────────────────────┐
  │ Configuración IA - Paso 1/5             │
  │ ●●○○○                                   │
  ├─────────────────────────────────────────┤
  │ Información Básica                      │
  │                                         │
  │ Tipo de negocio:                        │
  │ [Gimnasio ▼]                            │
  │                                         │
  │ Describe brevemente tu negocio:         │
  │ ┌───────────────────────────────────┐  │
  │ │ Gimnasio boutique especializado   │  │
  │ │ en CrossFit y entrenamiento       │  │
  │ │ funcional...                      │  │
  │ └───────────────────────────────────┘  │
  │                                         │
  │ Ubicación:                              │
  │ Ciudad: [Madrid    ]                    │
  │ Barrio: [Salamanca ]                    │
  │                                         │
  │              [Cancelar] [Siguiente →]   │
  └─────────────────────────────────────────┘
  ```

- [ ] **Preview de Mejora**
  - Mostrar antes/después de configurar
  - Ejemplo de email sin configuración
  - Ejemplo de email con configuración
  - Destacar diferencias

---

## 5. 🤖 Límites y Gestión de API Keys IA

### 🎯 Objetivo
Controlar el uso de IA por tenant y permitir que usen su propia API key de Gemini si lo desean.

### 📊 Modelo de Uso

#### Opción 1: Cuenta Global (Default)
- Tenant usa API key compartida de Qronnect
- Límites mensuales predefinidos por plan
  - **Plan Básico**: 50 generaciones/mes
  - **Plan Pro**: 200 generaciones/mes
  - **Plan Enterprise**: Ilimitado

#### Opción 2: API Key Propia
- Tenant configura su propia API key de Gemini
- Sin límites de Qronnect
- Facturación directa a Google

### ✅ Tareas

#### Backend

- [ ] **Migración de Base de Datos**
  ```sql
  ALTER TABLE tiendas ADD COLUMN ia_modo VARCHAR(20) DEFAULT 'global'; -- 'global' | 'propio'
  ALTER TABLE tiendas ADD COLUMN ia_api_key_propia TEXT; -- Encriptada
  ALTER TABLE tiendas ADD COLUMN ia_limite_mensual INT; -- Según plan
  ALTER TABLE tiendas ADD COLUMN ia_consumo_actual INT DEFAULT 0;
  ALTER TABLE tiendas ADD COLUMN ia_ultimo_reset DATE;

  -- Tabla de auditoría de uso IA
  CREATE TABLE ia_uso (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tienda_id UUID NOT NULL REFERENCES tiendas(id),
    tipo VARCHAR(50), -- 'email_campana', 'promo', 'kpi_analisis'
    tokens_usados INT,
    costo_estimado DECIMAL(10, 4),
    fecha TIMESTAMP DEFAULT NOW(),
    exito BOOLEAN DEFAULT true,
    error_msg TEXT
  );
  ```

- [ ] **Servicio IALimitesService**
  - `verificarLimite(tiendaId)` → { disponible: true/false, restantes: X }
  - `incrementarConsumo(tiendaId, cantidad)`
  - `resetearConsumoMensual()` → Cron job mensual
  - `getEstadisticas(tiendaId)` → Gráfico de uso

- [ ] **Actualizar GeminiService**
  ```typescript
  async generate(tiendaId: string, prompt: string) {
    // 1. Verificar límite
    const limite = await this.iaLimitesService.verificarLimite(tiendaId)
    if (!limite.disponible && modo === 'global') {
      throw new ForbiddenException('Límite mensual de IA alcanzado')
    }

    // 2. Obtener API key correcta
    const tienda = await this.tiendasService.findOne(tiendaId)
    const apiKey = tienda.ia_modo === 'propio'
      ? await this.decrypt(tienda.ia_api_key_propia)
      : this.configService.get('GEMINI_API_KEY')

    // 3. Generar
    const result = await this.gemini.generate(prompt, apiKey)

    // 4. Registrar uso
    await this.iaLimitesService.incrementarConsumo(tiendaId, result.tokens)

    return result
  }
  ```

- [ ] **Endpoints**
  - `PUT /api/admin/config/ia-limites`
  - `GET /api/admin/config/ia-limites`
  - `GET /api/admin/ia/uso-mensual` → Estadísticas
  - `POST /api/admin/config/ia-apikey` → Guardar API key propia

- [ ] **Sistema de Encriptación**
  - Usar `crypto` de Node.js
  - Encriptar API keys antes de guardar
  - Desencriptar al usar

#### Frontend (Admin)

- [ ] **Panel de Configuración IA**
  - Tab "IA" en Configuración
  - Selector Modo Global / Modo Propio
  - Campo para API key (tipo password)
  - Botón "Validar API Key"
  - Indicador de uso mensual

- [ ] **Diseño**
  ```
  ┌─────────────────────────────────────────┐
  │ 🤖 Configuración de IA                  │
  ├─────────────────────────────────────────┤
  │ Modo de Operación:                      │
  │ ○ Cuenta Global (Qronnect)              │
  │ ● API Key Propia                        │
  │                                         │
  │ [Al usar tu propia API key de Gemini,  │
  │  no hay límites de uso de Qronnect]    │
  │                                         │
  │ Google Gemini API Key:                  │
  │ ┌───────────────────────────────────┐  │
  │ │ ••••••••••••••••••••••••••••••    │  │
  │ └───────────────────────────────────┘  │
  │              [Validar API Key]          │
  │                                         │
  │ ── Uso del Mes ──                       │
  │ 47/200 generaciones (23%)               │
  │ ███████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒       │
  │                                         │
  │ Resetea en: 17 días                     │
  │                                         │
  │ [Ver Historial de Uso]                  │
  │                                         │
  │              [Guardar Cambios]          │
  └─────────────────────────────────────────┘
  ```

- [ ] **Alertas de Límite**
  - Notificación al 80% de uso
  - Notificación al 100% de uso
  - Opción de upgrade de plan
  - Opción de configurar API key propia

---

## 📊 Prioridades de Implementación

### 🔴 Alta Prioridad (Día 14)
1. **Campañas SMS con IA** (Punto 1)
   - Es visible al usuario final
   - Completa funcionalidad crítica
   - Estimado: 4-5 horas

2. **Regalo de Bienvenida** (Punto 2)
   - Aumenta engagement inmediato
   - Fácil de implementar
   - Estimado: 3-4 horas

### 🟡 Prioridad Media (Día 14-15)
3. **Sistema de Referidos** (Punto 3)
   - Feature de crecimiento viral
   - Requiere más tiempo de desarrollo
   - Estimado: 6-8 horas

### 🟢 Prioridad Baja (Día 15-16)
4. **Configuración IA Extensa** (Punto 4)
   - Mejora gradual de calidad
   - No crítico para funcionamiento
   - Estimado: 4-5 horas

5. **Gestión API Keys IA** (Punto 5)
   - Optimización de costos
   - Puede ir después
   - Estimado: 3-4 horas

---

## 📅 Planificación Temporal

### Mañana (9:00 - 14:00)
- ✅ Campañas SMS con IA (Backend + Frontend)
- ✅ Regalo de Bienvenida (Backend)

### Tarde (15:00 - 20:00)
- ✅ Regalo de Bienvenida (Frontend)
- ✅ Sistema de Referidos (Backend)

### Día 15 (Opcional)
- Sistema de Referidos (Frontend)
- Configuración IA Extensa
- Gestión API Keys

---

## 🧪 Testing Checklist

- [ ] Crear campaña SMS con IA y enviarla
- [ ] Registrar cliente nuevo y verificar regalo
- [ ] Compartir QR de referido y registrar amigo
- [ ] Completar wizard de configuración IA
- [ ] Configurar API key propia y validarla
- [ ] Verificar límites de uso de IA
- [ ] Probar programación de campañas SMS
- [ ] Verificar estadísticas de referidos

---

## 📝 Notas Técnicas

### Dependencias Necesarias
```bash
# Backend
npm install bull  # Para jobs de campañas programadas
npm install qrcode  # Para generar QRs de referidos
npm install crypto  # Para encriptar API keys

# Frontend
npm install recharts  # Para gráficos de estadísticas
npm install react-qr-code  # Para mostrar QRs
npm install react-confetti  # Para animación de regalo
```

### Variables de Entorno
```env
# .env
GEMINI_API_KEY=tu_api_key_global
REDIS_URL=redis://localhost:6379  # Para Bull queue
ENCRYPTION_KEY=tu_clave_de_32_caracteres  # Para API keys
```

---

## 🎯 Objetivos de UX

1. **Simplicidad**: Cada feature debe ser intuitiva
2. **Feedback Visual**: Animaciones y confirmaciones claras
3. **Educación**: Tooltips explicando beneficios
4. **Gamificación**: Barras de progreso, badges, confeti
5. **Mobile-First**: Todo debe funcionar perfecto en móvil

---

## 🚀 Resultado Esperado

Al finalizar el día 14, el sistema debe tener:

- ✅ Campañas SMS tan completas como las de email
- ✅ IA generando SMS personalizados
- ✅ Nuevos clientes recibiendo regalos automáticos
- ✅ Sistema de referidos funcional y atractivo
- ✅ Configuración IA mejorada (bonus)
- ✅ Gestión de API keys (bonus)

**Meta**: Incrementar engagement de clientes en un 40% con referidos y regalos 🎉
