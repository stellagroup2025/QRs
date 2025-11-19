# 🎯 Propuesta de Monetización - Qronnect

**Fecha:** 17 de Noviembre de 2025
**Versión:** 1.0
**Autor:** Análisis basado en funcionalidades implementadas

---

## 📊 Resumen Ejecutivo

Qronnect es una plataforma SaaS multi-tenant de fidelización, CRM y marketing automation para comercios locales. El modelo de monetización propuesto es **suscripción mensual por niveles** con 4 tiers claramente diferenciados, diseñados para maximizar la conversión desde freemium hasta enterprise.

**Objetivo de conversión:**
- Freemium → Professional: 15-20%
- Professional → Business: 10-15%
- Business → Enterprise: 5%

**ARR Proyectado (100 clientes):** 30,876€

---

## 🏢 Modelo de Suscripción por Niveles

### **Plan STARTER** 💚
**Precio:** GRATUITO
**Target:** Negocios que quieren probar el sistema
**Objetivo estratégico:** Adquisición masiva y demostración de valor

#### Funcionalidades incluidas:
- ✅ Hasta **50 clientes** registrados
- ✅ Sistema básico de puntos y fidelización
- ✅ QR de clientes (generación y escaneo)
- ✅ Registro manual de compras
- ✅ 1 promoción activa simultáneamente
- ✅ Dashboard básico (KPIs simples)
- ✅ Branding básico (logo, colores)
- ✅ 1 usuario admin

#### Limitaciones estratégicas:
- ❌ Sin campañas de email/SMS
- ❌ Sin IA
- ❌ Sin segmentación avanzada
- ❌ Sin sistema de referidos
- ❌ Sin analytics avanzados
- ❌ Marca "Powered by Qronnect" visible

#### Métricas técnicas:
```
Clientes: 50 max
Promociones: 1
Usuarios: 1
Compras/mes: Sin límite
Storage: 50MB
```

---

### **Plan PROFESSIONAL** 💙
**Precio:** 29€/mes (25€/mes facturación anual - 15% descuento)
**Target:** Pequeños negocios locales establecidos
**Objetivo estratégico:** Primera conversión de pago, captar PYMES

#### Todo lo de STARTER +

#### Funcionalidades desbloqueadas:
- ✅ Hasta **500 clientes** registrados (10x más)
- ✅ **3 promociones** activas simultáneamente
- ✅ **Campañas de Email ilimitadas** (powered by Resend)
- ✅ Segmentación avanzada de clientes:
  - Por edad (rangos personalizables)
  - Por género
  - Por puntos acumulados
  - Por inactividad (días sin comprar)
  - Selección manual múltiple
- ✅ Sistema de **referidos** completo con códigos personales
- ✅ **Analytics avanzado:**
  - Gráficos de evolución de ventas
  - Tendencias de clientes nuevos
  - Distribución de puntos
  - Top 10 clientes
  - Productos más vendidos
  - Análisis por periodos (7d, 30d, 90d)
- ✅ Landing page personalizable con:
  - Hero section custom
  - Características destacadas
  - Testimonios de clientes
  - Call-to-actions personalizados
- ✅ Hasta **3 usuarios** (admin + 2 staff)
- ✅ Exportación de datos (CSV)
- ✅ Regalo de bienvenida automático
- ✅ Sin marca Qronnect (white-label parcial)
- ✅ Soporte por email (respuesta 48h)

#### Limitaciones:
- ⚠️ Sin SMS (o 50 SMS/mes incluidos opcionalmente)
- ❌ Sin IA
- ❌ Sin API access
- ❌ Sin webhooks

#### Métricas técnicas:
```
Clientes: 500 max
Promociones: 3
Usuarios: 3
Emails/mes: Ilimitados
SMS/mes: 0 (o 50 opcional)
Storage: 500MB
```

---

### **Plan BUSINESS** 🟣
**Precio:** 79€/mes (69€/mes facturación anual - 15% descuento)
**Target:** Negocios en crecimiento, múltiples puntos de venta
**Objetivo estratégico:** Monetizar IA y SMS, captar medianas empresas

#### Todo lo de PROFESSIONAL +

#### Funcionalidades desbloqueadas:
- ✅ **Clientes ilimitados**
- ✅ **Promociones ilimitadas**
- ✅ **Campañas SMS:** 300 SMS/mes incluidos
  - SMS adicionales: 0.06€/SMS
  - Personalización con variables {{nombre}}, etc.
  - Segmentación igual que email
  - Estadísticas detalladas:
    - Tasa de entrega
    - Desglose por operador
    - Tiempo promedio de entrega
    - Costes reales vs estimados
- ✅ **IA completa con Google Gemini 2.0 Flash:**
  - ✨ **Análisis de KPIs con insights:** Resumen ejecutivo automático con recomendaciones
  - ✨ **Generación de ideas de promociones:** Basadas en sector y datos del negocio
  - ✨ **Generación de campañas de email:** Asuntos, cuerpos, CTAs, variantes A/B
  - ✨ **Generación de mensajes SMS:** Optimizados para 160 caracteres
  - ✨ **Planes de acción personalizados:** Pasos concretos para ejecutar recomendaciones
  - ✨ **Análisis de segmentos de clientes:** Identificación de patrones y oportunidades
- ✅ Hasta **10 usuarios** con roles diferenciados
- ✅ Soporte prioritario (email respuesta 24h)
- ✅ Múltiples configuraciones de landing page
- ✅ Webhooks básicos para integraciones
- ✅ Historial de datos 12 meses

#### Límites específicos:
- **IA:** 100 consultas/mes incluidas
  - Consultas adicionales: 0.15€/consulta
- **SMS:** 300/mes incluidos
  - Adicionales: 0.06€/SMS

#### Métricas técnicas:
```
Clientes: Ilimitados
Promociones: Ilimitadas
Usuarios: 10
Emails/mes: Ilimitados
SMS/mes: 300 incluidos
IA queries/mes: 100 incluidas
Storage: 2GB
Webhooks: 5 endpoints
```

---

### **Plan ENTERPRISE** 🌟
**Precio:** Desde 199€/mes (personalizado según volumen)
**Target:** Cadenas, franquicias, grandes comercios
**Objetivo estratégico:** Máximo ARPU, contratos anuales, servicios premium

#### Todo lo de BUSINESS +

#### Funcionalidades exclusivas:
- ✅ **Multi-tienda ilimitada:**
  - Gestión centralizada desde SuperAdmin
  - Dashboard consolidado de todas las tiendas
  - Reportes comparativos entre tiendas
  - Configuración independiente por tienda
- ✅ **SMS ilimitados**
  - Integración con cuenta Twilio propia del cliente
  - Sender ID personalizado alfanumérico (ej: "TUTIENDA")
  - Sin límites de envío
  - Estadísticas avanzadas por campaña
- ✅ **IA ilimitada**
  - Sin restricción de consultas
  - Modelos personalizados (fine-tuning opcional)
  - Prioridad en respuestas
- ✅ **Usuarios ilimitados** con roles personalizados:
  - SuperAdmin
  - Admin de tienda
  - Manager
  - Staff
  - Staff limitado (solo registro de compras)
  - Roles custom según necesidad
- ✅ **API REST completa:**
  - Documentación OpenAPI/Swagger
  - Rate limiting personalizado
  - Webhooks avanzados
  - SDK disponibles (JavaScript, Python)
- ✅ **White-label completo:**
  - Dominio propio del cliente
  - Sin ninguna mención a Qronnect
  - Logo y branding 100% personalizado
  - Emails desde dominio del cliente
- ✅ **Servicios profesionales:**
  - Migración de datos asistida (desde otros sistemas)
  - Onboarding personalizado (4h de consultoría)
  - Configuración inicial completa
  - Capacitación del equipo (online o presencial)
- ✅ **Soporte dedicado:**
  - Account Manager asignado
  - Soporte por teléfono + email + chat
  - Respuesta en <4h laborables
  - Acceso prioritario al equipo técnico
- ✅ **SLA garantizado:**
  - 99.9% uptime garantizado
  - Compensación por downtime
  - Maintenance windows programadas
- ✅ **Backups y seguridad:**
  - Backup diario automático
  - Retención 30 días
  - Restore on-demand
  - Audit logs completos
- ✅ **Integraciones avanzadas:**
  - TPV/POS (Terminal Punto de Venta)
  - ERP (SAP, Odoo, etc.)
  - CRM externo (HubSpot, Salesforce)
  - Plataformas de ecommerce
  - Sistemas de reservas
- ✅ **Reportes personalizados:**
  - Informes mensuales ejecutivos
  - KPIs custom según negocio
  - Exportación programada automática
  - Dashboards personalizados

#### Opciones de personalización:
- Desarrollo de features custom (bajo presupuesto)
- Integraciones específicas a medida
- Infraestructura dedicada (si volumen lo requiere)
- Contrato de servicio SLA personalizado

#### Métricas técnicas:
```
Clientes: Ilimitados
Promociones: Ilimitadas
Usuarios: Ilimitados
Emails/mes: Ilimitados
SMS/mes: Ilimitados
IA queries/mes: Ilimitadas
Storage: 50GB (ampliable)
Webhooks: Ilimitados
API calls/día: 100,000
Tiendas: Ilimitadas
```

---

## 💰 Tabla Comparativa Completa

| Funcionalidad | STARTER<br>**GRATIS** | PROFESSIONAL<br>**29€/mes** | BUSINESS<br>**79€/mes** | ENTERPRISE<br>**Custom** |
|---------------|---------|--------------|----------|------------|
| **Límites** |
| Clientes registrados | 50 | 500 | ∞ | ∞ |
| Promociones activas | 1 | 3 | ∞ | ∞ |
| Usuarios/staff | 1 | 3 | 10 | ∞ |
| Tiendas | 1 | 1 | 1 | ∞ |
| **Fidelización** |
| Sistema de puntos | ✅ | ✅ | ✅ | ✅ |
| QR personal clientes | ✅ | ✅ | ✅ | ✅ |
| Registro de compras | ✅ | ✅ | ✅ | ✅ |
| Promociones y canjes | ✅ (1) | ✅ (3) | ✅ (∞) | ✅ (∞) |
| Regalo bienvenida | ❌ | ✅ | ✅ | ✅ |
| Sistema de referidos | ❌ | ✅ | ✅ | ✅ |
| **Marketing** |
| Campañas de Email | ❌ | ✅ Ilim | ✅ Ilim | ✅ Ilim |
| Campañas de SMS | ❌ | 50/mes | 300/mes | ∞ |
| Sender ID SMS custom | ❌ | ❌ | Add-on | ✅ |
| Segmentación clientes | ❌ | ✅ | ✅ | ✅ |
| Personalización (vars) | ❌ | ✅ | ✅ | ✅ |
| **Inteligencia Artificial** |
| Análisis de KPIs | ❌ | ❌ | ✅ 100/mes | ✅ ∞ |
| Ideas de promociones | ❌ | ❌ | ✅ 100/mes | ✅ ∞ |
| Generación emails | ❌ | ❌ | ✅ 100/mes | ✅ ∞ |
| Generación SMS | ❌ | ❌ | ✅ 100/mes | ✅ ∞ |
| Planes de acción | ❌ | ❌ | ✅ 100/mes | ✅ ∞ |
| Análisis segmentos | ❌ | ❌ | ✅ 100/mes | ✅ ∞ |
| **Analytics y Reportes** |
| Dashboard básico | ✅ | ✅ | ✅ | ✅ |
| Analytics avanzado | ❌ | ✅ | ✅ | ✅ |
| Gráficos y tendencias | ❌ | ✅ | ✅ | ✅ |
| Exportación CSV | ❌ | ✅ | ✅ | ✅ |
| Reportes custom | ❌ | ❌ | ❌ | ✅ |
| Estadísticas SMS | ❌ | ❌ | ✅ | ✅ |
| **Personalización** |
| Logo y colores | ✅ | ✅ | ✅ | ✅ |
| Landing page | ❌ | ✅ | ✅ | ✅ |
| Sin marca Qronnect | ❌ | ✅ | ✅ | ✅ |
| Dominio propio | ❌ | ❌ | ❌ | ✅ |
| White-label completo | ❌ | ❌ | ❌ | ✅ |
| **Integraciones** |
| API REST | ❌ | ❌ | Básico | Completo |
| Webhooks | ❌ | ❌ | 5 | ∞ |
| Integraciones TPV/POS | ❌ | ❌ | ❌ | ✅ |
| SDK disponibles | ❌ | ❌ | ❌ | ✅ |
| **Soporte** |
| Documentación | ✅ | ✅ | ✅ | ✅ |
| Email support | Community | 48h | 24h | 4h |
| Teléfono | ❌ | ❌ | ❌ | ✅ |
| Account Manager | ❌ | ❌ | ❌ | ✅ |
| Onboarding | Self-service | ❌ | ❌ | ✅ |
| **SLA y Seguridad** |
| Uptime | 99% | 99.5% | 99.5% | 99.9% |
| Backup | No | Semanal | Diario | Diario |
| Retención datos | 3 meses | 6 meses | 12 meses | 24 meses |
| Audit logs | ❌ | ❌ | Básico | Completo |

---

## 🎁 Add-ons y Extras

Disponibles para planes **Professional** y **Business** (Enterprise los tiene incluidos):

### **1. Pack SMS Extra**
Para clientes que necesitan más SMS que su plan:

| Pack | SMS Incluidos | Precio/mes | Precio/SMS |
|------|---------------|------------|------------|
| Pack S | +500 SMS | 25€ | 0.050€ |
| Pack M | +1000 SMS | 45€ | 0.045€ |
| Pack L | +3000 SMS | 120€ | 0.040€ |

### **2. Pack IA Extra** (solo Business)
Para aumentar el límite de consultas de IA:

| Pack | Consultas IA | Precio/mes | Precio/consulta |
|------|--------------|------------|-----------------|
| Pack S | +100 | 10€ | 0.10€ |
| Pack M | +500 | 40€ | 0.08€ |
| Pack L | +1000 | 70€ | 0.07€ |

### **3. Usuarios Adicionales**
Amplía tu equipo más allá del límite del plan:

- **+5 usuarios:** 15€/mes (3€/usuario)
- **+10 usuarios:** 25€/mes (2.50€/usuario)
- **+20 usuarios:** 40€/mes (2€/usuario)

### **4. Sender ID Personalizado SMS**
Envía SMS con el nombre de tu tienda en vez de número:
- **20€/mes**
- Requiere: Cuenta Twilio en modo producción
- Incluye: Gestión y verificación del Sender ID
- Ejemplo: En vez de "+34600123456" → "TUTIENDA"

### **5. Onboarding Premium** (One-time)
Servicio de configuración e importación inicial:
- **Precio:** 299€ (pago único)
- **Incluye:**
  - Configuración completa de la tienda
  - Importación de base de datos de clientes (hasta 1000)
  - Diseño de 3 promociones iniciales
  - Creación de 2 campañas de ejemplo
  - Capacitación en vivo: 2 horas
  - Soporte prioritario primer mes

### **6. Tiendas Adicionales** (solo Business)
Para negocios con múltiples puntos de venta:
- **+1 tienda:** 29€/mes
- **+3 tiendas:** 69€/mes (23€/tienda)
- **+5 tiendas:** 99€/mes (20€/tienda)
- Incluye: Gestión independiente pero con dashboard consolidado

---

## 📈 Estrategia de Conversión y Upselling

### **1. Freemium → Professional**
**Target:** 15-20% conversión en los primeros 60 días

#### Triggers automáticos en la app:
1. **Al llegar a 40 clientes (80% del límite):**
   - Banner superior: "Te quedan 10 clientes. Upgrade y llega a 500"
   - CTA: "Ver planes" → Modal de pricing

2. **Al intentar crear 2da promoción:**
   - Modal de bloqueo suave con preview
   - "Con Professional puedes tener 3 promos activas + Email campaigns"
   - CTA: "Prueba 14 días gratis"

3. **Al intentar acceder a Campañas de Email:**
   - Tour guiado del feature (bloqueado)
   - Mostrar ejemplo de campaña
   - "Recupera clientes inactivos con emails automáticos"
   - CTA: "Activar por 29€/mes"

4. **Al día 30 de uso:**
   - Email automático con caso de éxito
   - "Negocios como el tuyo aumentan ventas 25% con email marketing"
   - Oferta especial: 50% primer mes (14.50€)

5. **Al crear 10+ compras en una semana:**
   - Popup: "Tu negocio está creciendo 🚀"
   - "Desbloquea analytics para ver tendencias"
   - Mostrar preview de gráficos

#### Incentivos especiales:
- ✨ **Primer mes 50% OFF** (14.50€ en vez de 29€)
- ✨ **Migración gratuita** de todos los datos
- ✨ **30 días garantía** de devolución
- ✨ **Setup call** gratuito de 30min

---

### **2. Professional → Business**
**Target:** 10-15% conversión en 90 días

#### Triggers automáticos:
1. **Al enviar 3+ campañas email en un mes:**
   - Badge en dashboard: "Email champion 📧"
   - Popup: "¿Has pensado en añadir SMS? 2x de respuesta vs email"
   - Preview de una campaña SMS
   - CTA: "Prueba Business 30 días"

2. **Mostrar preview de IA en Analytics:**
   - Al entrar en dashboard, mostrar sección "IA Insights" (bloqueada)
   - Ejemplo difuminado: "Tus ventas han subido 15%..."
   - "Descubre qué hacer para crecer con análisis IA"
   - CTA: "Desbloquear IA"

3. **Al llegar a 400 clientes (80% del límite):**
   - Email: "Próximamente alcanzarás el límite"
   - "Business incluye clientes ilimitados + IA + SMS"
   - Calculadora de ROI: mostrar ahorro vs contratar servicios separados

4. **Al usar segmentación avanzada 5+ veces:**
   - "Te encanta segmentar 🎯"
   - "Con IA puedes auto-generar campañas para cada segmento"
   - Video demo de IA generando email
   - CTA: "Upgrade a Business"

5. **Al cumplir 90 días en Professional:**
   - Email personalizado del founder
   - "Gracias por confiar en Qronnect"
   - Caso de éxito de cliente similar
   - Oferta especial: 1 mes Business por 39€ + 100 SMS gratis

#### Incentivos especiales:
- ✨ **Primer mes a 39€** (en vez de 79€)
- ✨ **100 SMS de regalo** al upgrade
- ✨ **50 consultas IA extra** el primer mes
- ✨ **Soporte prioritario** desde día 1

---

### **3. Business → Enterprise**
**Target:** 5% conversión (contacto comercial)

#### Triggers de contacto comercial:
1. **Al crear 2da tienda manualmente:**
   - "Gestiona todas tus tiendas desde un panel"
   - Formulario: "Hablar con ventas"
   - Auto-asigna sales rep

2. **Al usar >80% de cuota SMS (240+ SMS):**
   - Email automático: "Necesitas más SMS?"
   - "Enterprise incluye SMS ilimitados con Sender ID propio"
   - CTA: "Solicitar presupuesto"

3. **Al tener 8+ usuarios:**
   - Banner: "Tu equipo está creciendo"
   - "Enterprise permite usuarios ilimitados con roles custom"
   - CTA: "Contactar con ventas"

4. **Al usar 80+ consultas IA en un mes:**
   - "Sacas el máximo partido a la IA"
   - "Desbloquea IA ilimitada + features exclusivas"
   - Mostrar tabla comparativa Business vs Enterprise

5. **Al llegar a 6 meses en Business:**
   - Llamada proactiva del Account Manager
   - Propuesta personalizada
   - Demo de features Enterprise

#### Incentivos especiales:
- ✨ **Onboarding gratuito** (valor 1,500€)
- ✨ **Primer mes gratis** (si contrato anual)
- ✨ **Migración asistida** incluida
- ✨ **Desarrollo custom** de 1 integración

---

## 💡 Implementación Técnica

### **Fase 1: Sistema de Límites (Semana 1-2)**

#### Tabla en base de datos:
```sql
-- Tabla de suscripciones
CREATE TABLE suscripciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tienda_id UUID REFERENCES tiendas(id) ON DELETE CASCADE,
  plan VARCHAR(20) NOT NULL CHECK (plan IN ('starter', 'professional', 'business', 'enterprise')),
  estado VARCHAR(20) NOT NULL CHECK (estado IN ('active', 'canceled', 'past_due', 'trialing')),
  fecha_inicio TIMESTAMP NOT NULL DEFAULT NOW(),
  fecha_fin TIMESTAMP,
  proximo_pago TIMESTAMP,
  precio_mensual DECIMAL(10,2),
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),

  -- Límites específicos (override de defaults)
  limite_clientes INTEGER,
  limite_promociones INTEGER,
  limite_usuarios INTEGER,
  limite_sms_mes INTEGER,
  limite_ia_mes INTEGER,
  limite_tiendas INTEGER DEFAULT 1,

  -- Uso actual del mes
  uso_sms_mes INTEGER DEFAULT 0,
  uso_ia_mes INTEGER DEFAULT 0,
  ultimo_reset_uso TIMESTAMP DEFAULT NOW(),

  -- Add-ons
  addons JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_suscripciones_tienda ON suscripciones(tienda_id);
CREATE INDEX idx_suscripciones_plan ON suscripciones(plan);
CREATE INDEX idx_suscripciones_estado ON suscripciones(estado);

-- Función para obtener límites por plan
CREATE OR REPLACE FUNCTION get_limites_plan(plan_name VARCHAR)
RETURNS JSONB AS $$
BEGIN
  RETURN CASE plan_name
    WHEN 'starter' THEN '{"clientes": 50, "promociones": 1, "usuarios": 1, "sms": 0, "ia": 0, "emails": 0, "tiendas": 1}'::jsonb
    WHEN 'professional' THEN '{"clientes": 500, "promociones": 3, "usuarios": 3, "sms": 50, "ia": 0, "emails": -1, "tiendas": 1}'::jsonb
    WHEN 'business' THEN '{"clientes": -1, "promociones": -1, "usuarios": 10, "sms": 300, "ia": 100, "emails": -1, "tiendas": 1}'::jsonb
    WHEN 'enterprise' THEN '{"clientes": -1, "promociones": -1, "usuarios": -1, "sms": -1, "ia": -1, "emails": -1, "tiendas": -1}'::jsonb
    ELSE '{}'::jsonb
  END;
END;
$$ LANGUAGE plpgsql;
```

#### Service de límites (NestJS):
```typescript
// backend/src/suscripciones/suscripciones.service.ts
@Injectable()
export class SuscripcionesService {

  async checkLimite(tiendaId: string, recurso: 'clientes' | 'promociones' | 'usuarios' | 'sms' | 'ia'): Promise<{
    permitido: boolean;
    usado: number;
    limite: number;
    porcentaje: number;
  }> {
    const suscripcion = await this.getSuscripcionActiva(tiendaId);
    const limites = this.getLimitesPlan(suscripcion.plan);
    const limite = limites[recurso];

    // -1 significa ilimitado
    if (limite === -1) {
      return { permitido: true, usado: 0, limite: -1, porcentaje: 0 };
    }

    const usado = await this.getUsoActual(tiendaId, recurso);
    const permitido = usado < limite;
    const porcentaje = (usado / limite) * 100;

    return { permitido, usado, limite, porcentaje };
  }

  async incrementarUso(tiendaId: string, recurso: 'sms' | 'ia', cantidad: number = 1) {
    // Incrementar contador de uso mensual
    await this.supabase
      .from('suscripciones')
      .update({
        [`uso_${recurso}_mes`]: this.supabase.raw(`uso_${recurso}_mes + ${cantidad}`)
      })
      .eq('tienda_id', tiendaId);
  }

  // Cron job que resetea contadores cada mes
  @Cron('0 0 1 * *') // Día 1 de cada mes
  async resetearContadoresMensuales() {
    await this.supabase
      .from('suscripciones')
      .update({
        uso_sms_mes: 0,
        uso_ia_mes: 0,
        ultimo_reset_uso: new Date()
      })
      .eq('estado', 'active');
  }
}
```

#### Middleware de verificación:
```typescript
// backend/src/common/guards/limite.guard.ts
@Injectable()
export class LimiteGuard implements CanActivate {
  constructor(
    private suscripcionesService: SuscripcionesService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tiendaId = request.user?.tiendaId;
    const recurso = this.getRecursoFromRoute(request.route.path);

    if (!recurso) return true; // No aplica límite

    // Cache de 1 minuto para evitar consultas repetidas
    const cacheKey = `limite:${tiendaId}:${recurso}`;
    let limite = await this.cacheManager.get(cacheKey);

    if (!limite) {
      limite = await this.suscripcionesService.checkLimite(tiendaId, recurso);
      await this.cacheManager.set(cacheKey, limite, 60);
    }

    if (!limite.permitido) {
      throw new HttpException({
        statusCode: 403,
        message: `Límite alcanzado para ${recurso}`,
        error: 'LIMITE_ALCANZADO',
        usado: limite.usado,
        limite: limite.limite,
        plan_actual: request.user.plan,
        upgrade_url: `/pricing?from=${request.user.plan}`
      }, HttpStatus.FORBIDDEN);
    }

    return true;
  }

  private getRecursoFromRoute(path: string): string | null {
    if (path.includes('/clientes') && path.includes('POST')) return 'clientes';
    if (path.includes('/promociones') && path.includes('POST')) return 'promociones';
    if (path.includes('/sms')) return 'sms';
    if (path.includes('/ai')) return 'ia';
    return null;
  }
}
```

#### Uso en controllers:
```typescript
@Post('clientes')
@UseGuards(AdminAuthGuard, LimiteGuard)
async crearCliente(@Body() dto: CreateClienteDto) {
  // Si llega aquí, el límite está OK
  return this.clientesService.create(dto);
}
```

---

### **Fase 2: Página de Pricing (Semana 2-3)**

#### Componente React:
```typescript
// frontend/app/pricing/page.tsx
'use client';

import { Check, X, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const planes = [
  {
    nombre: 'STARTER',
    precio: 0,
    color: 'green',
    icon: '💚',
    descripcion: 'Ideal para probar el sistema',
    popular: false,
    cta: 'Empezar gratis',
    features: [
      { texto: 'Hasta 50 clientes', incluido: true },
      { texto: '1 promoción activa', incluido: true },
      { texto: 'Sistema de puntos', incluido: true },
      { texto: 'QR de clientes', incluido: true },
      { texto: 'Dashboard básico', incluido: true },
      { texto: 'Campañas de email', incluido: false },
      { texto: 'Campañas SMS', incluido: false },
      { texto: 'Inteligencia Artificial', incluido: false },
      { texto: 'Sistema de referidos', incluido: false },
    ]
  },
  {
    nombre: 'PROFESSIONAL',
    precio: 29,
    precioAnual: 25,
    color: 'blue',
    icon: '💙',
    descripcion: 'Para pequeños negocios',
    popular: true,
    cta: 'Prueba 14 días gratis',
    features: [
      { texto: 'Hasta 500 clientes', incluido: true },
      { texto: '3 promociones activas', incluido: true },
      { texto: 'Emails ilimitados', incluido: true, badge: 'NUEVO' },
      { texto: 'Sistema de referidos', incluido: true },
      { texto: 'Analytics avanzado', incluido: true },
      { texto: 'Landing personalizable', incluido: true },
      { texto: '3 usuarios', incluido: true },
      { texto: 'Campañas SMS', incluido: false },
      { texto: 'Inteligencia Artificial', incluido: false },
    ]
  },
  {
    nombre: 'BUSINESS',
    precio: 79,
    precioAnual: 69,
    color: 'purple',
    icon: '🟣',
    descripcion: 'Para negocios en crecimiento',
    popular: false,
    badge: 'MÁS ELEGIDO',
    cta: 'Prueba 14 días gratis',
    features: [
      { texto: 'Clientes ilimitados', incluido: true },
      { texto: 'Promociones ilimitadas', incluido: true },
      { texto: '300 SMS/mes incluidos', incluido: true, badge: 'NUEVO' },
      { texto: 'IA completa (100 queries/mes)', incluido: true, badge: 'IA' },
      { texto: '10 usuarios', incluido: true },
      { texto: 'Soporte prioritario 24h', incluido: true },
      { texto: 'Webhooks', incluido: true },
      { texto: 'API básica', incluido: true },
    ]
  },
  {
    nombre: 'ENTERPRISE',
    precio: null,
    precioCTA: 'Desde 199€',
    color: 'gold',
    icon: '🌟',
    descripcion: 'Para cadenas y franquicias',
    popular: false,
    badge: 'PREMIUM',
    cta: 'Contactar ventas',
    features: [
      { texto: 'Todo ilimitado', incluido: true },
      { texto: 'Multi-tienda', incluido: true },
      { texto: 'SMS ilimitados + Sender ID', incluido: true },
      { texto: 'IA ilimitada', incluido: true },
      { texto: 'White-label completo', incluido: true },
      { texto: 'API REST completa', incluido: true },
      { texto: 'SLA 99.9%', incluido: true },
      { texto: 'Account Manager dedicado', incluido: true },
    ]
  }
];

export default function PricingPage() {
  const [facturacion, setFacturacion] = useState<'mensual' | 'anual'>('mensual');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">
            Elige el plan perfecto para tu negocio
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Sin permanencia. Cancela cuando quieras.
          </p>

          {/* Toggle Mensual/Anual */}
          <div className="inline-flex items-center gap-4 bg-white p-2 rounded-full shadow-sm">
            <button
              onClick={() => setFacturacion('mensual')}
              className={`px-6 py-2 rounded-full transition ${
                facturacion === 'mensual'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setFacturacion('anual')}
              className={`px-6 py-2 rounded-full transition flex items-center gap-2 ${
                facturacion === 'anual'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Anual
              <Badge variant="success">-15%</Badge>
            </button>
          </div>
        </div>

        {/* Grid de planes */}
        <div className="grid md:grid-cols-4 gap-8 mb-20">
          {planes.map((plan) => (
            <div
              key={plan.nombre}
              className={`relative bg-white rounded-2xl shadow-lg p-8 border-2 transition hover:shadow-xl ${
                plan.popular ? 'border-blue-500 scale-105' : 'border-gray-200'
              }`}
            >
              {plan.badge && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  {plan.badge}
                </Badge>
              )}

              <div className="text-center mb-6">
                <div className="text-4xl mb-2">{plan.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{plan.nombre}</h3>
                <p className="text-gray-600 text-sm">{plan.descripcion}</p>
              </div>

              <div className="text-center mb-8">
                {plan.precio !== null ? (
                  <>
                    <div className="text-5xl font-bold mb-1">
                      {facturacion === 'mensual' ? plan.precio : plan.precioAnual}€
                    </div>
                    <div className="text-gray-500">/mes</div>
                    {facturacion === 'anual' && plan.precioAnual && (
                      <div className="text-sm text-green-600 mt-1">
                        Ahorras {(plan.precio - plan.precioAnual) * 12}€/año
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-3xl font-bold">
                    {plan.precioCTA}
                  </div>
                )}
              </div>

              <Button
                className="w-full mb-6"
                variant={plan.popular ? 'default' : 'outline'}
                size="lg"
              >
                {plan.cta}
              </Button>

              <div className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    {feature.incluido ? (
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={feature.incluido ? 'text-gray-700' : 'text-gray-400'}>
                      {feature.texto}
                      {feature.badge && (
                        <Badge variant="secondary" className="ml-2">
                          {feature.badge}
                        </Badge>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Preguntas frecuentes
          </h2>
          {/* ... FAQs ... */}
        </div>

      </div>
    </div>
  );
}
```

---

### **Fase 3: Integración con Stripe (Semana 3-4)**

#### Setup de Stripe:
```typescript
// backend/src/stripe/stripe.service.ts
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  async crearCliente(tienda: any) {
    return await this.stripe.customers.create({
      email: tienda.email,
      name: tienda.nombre,
      metadata: {
        tienda_id: tienda.id,
      }
    });
  }

  async crearSuscripcion(customerId: string, plan: string) {
    const priceIds = {
      professional: 'price_xxx', // ID de Stripe
      business: 'price_yyy',
    };

    return await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceIds[plan] }],
      trial_period_days: 14,
      metadata: {
        plan,
      }
    });
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.configService.get('STRIPE_WEBHOOK_SECRET')
    );

    switch (event.type) {
      case 'customer.subscription.created':
        await this.activarSuscripcion(event.data.object);
        break;
      case 'customer.subscription.updated':
        await this.actualizarSuscripcion(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.cancelarSuscripcion(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.manejarPagoFallido(event.data.object);
        break;
    }
  }
}
```

---

## 🔢 Proyección Financiera

### **Escenario Conservador** (100 clientes activos en 12 meses)

| Plan | Clientes | % | Precio | MRR | ARR |
|------|----------|---|--------|-----|-----|
| Starter | 60 | 60% | 0€ | 0€ | 0€ |
| Professional | 25 | 25% | 29€ | 725€ | 8,700€ |
| Business | 12 | 12% | 79€ | 948€ | 11,376€ |
| Enterprise | 3 | 3% | 200€ | 600€ | 7,200€ |
| **Add-ons** | - | - | - | 300€ | 3,600€ |
| **TOTAL** | 100 | 100% | - | **2,573€** | **30,876€** |

**Costes estimados:**
- Supabase: 25€/mes
- Twilio SMS: ~150€/mes (coste variable)
- Resend Email: 20€/mes
- Google Gemini: 50€/mes (coste variable)
- Infraestructura (hosting): 100€/mes
- **Total costes:** ~345€/mes = 4,140€/año

**Margen bruto:** 30,876€ - 4,140€ = **26,736€/año (87% margen)**

---

### **Escenario Optimista** (300 clientes en 18 meses)

| Plan | Clientes | % | Precio | MRR | ARR |
|------|----------|---|--------|-----|-----|
| Starter | 150 | 50% | 0€ | 0€ | 0€ |
| Professional | 90 | 30% | 29€ | 2,610€ | 31,320€ |
| Business | 45 | 15% | 79€ | 3,555€ | 42,660€ |
| Enterprise | 15 | 5% | 250€ | 3,750€ | 45,000€ |
| **Add-ons** | - | - | - | 1,200€ | 14,400€ |
| **TOTAL** | 300 | 100% | - | **11,115€** | **133,380€** |

**Costes estimados:**
- Infraestructura escalada: 500€/mes
- APIs y servicios: 800€/mes
- **Total costes:** ~1,300€/mes = 15,600€/año

**Margen bruto:** 133,380€ - 15,600€ = **117,780€/año (88% margen)**

---

## 🎯 KPIs y Métricas Clave

### **Métricas de Adquisición:**
- CAC (Coste Adquisición Cliente): Target <30€
- Conversión freemium → paid: Target 15-20%
- Trial → Paid: Target 40-50%
- Tiempo hasta primera conversión: Target <60 días

### **Métricas de Retención:**
- Churn rate mensual: Target <5%
- MRR Churn: Target <3%
- NPS (Net Promoter Score): Target >50
- Retention 12 meses: Target >80%

### **Métricas de Crecimiento:**
- MRR Growth rate: Target 15-20%/mes (primeros 12m)
- Expansion MRR: Target 20% del nuevo MRR
- Upsell rate: Target 10-15%/trimestre
- LTV:CAC ratio: Target >3:1

### **Métricas de Producto:**
- Time to value: <24h (desde registro hasta primera compra registrada)
- DAU/MAU: Target >40% (clientes pagos)
- Feature adoption (IA): Target 60% usuarios Business+
- Support tickets/cliente: Target <0.5/mes

---

## 📋 Checklist de Implementación

### **✅ Fase 1: Core Billing (Mes 1-2)**
- [ ] Tabla `suscripciones` en base de datos
- [ ] Service de límites y validación
- [ ] Middleware `LimiteGuard`
- [ ] Aplicar guards en todos los endpoints críticos
- [ ] Dashboard de uso para usuarios
- [ ] Cron job de reset mensual

### **✅ Fase 2: Pricing y Frontend (Mes 2)**
- [ ] Página `/pricing` con comparativa
- [ ] Formulario de selección de plan
- [ ] Modals de upgrade en puntos estratégicos
- [ ] Banners de límites alcanzados
- [ ] Calculadora de ROI

### **✅ Fase 3: Stripe Integration (Mes 3)**
- [ ] Crear productos en Stripe Dashboard
- [ ] Integrar Stripe Checkout
- [ ] Webhook de Stripe configurado
- [ ] Portal de cliente (Stripe Customer Portal)
- [ ] Emails transaccionales (pago exitoso, fallido, etc.)

### **✅ Fase 4: Triggers y Upselling (Mes 3-4)**
- [ ] Sistema de triggers automáticos
- [ ] Emails de upselling (Resend)
- [ ] Ofertas especiales (cupones)
- [ ] A/B testing de mensajes

### **✅ Fase 5: Add-ons (Mes 4)**
- [ ] Sistema de add-ons en billing
- [ ] UI para comprar add-ons
- [ ] Facturación prorrateada
- [ ] Gestión de add-ons en admin

### **✅ Fase 6: Enterprise (Mes 5-6)**
- [ ] Multi-tenant avanzado
- [ ] White-label completo
- [ ] API pública documentada
- [ ] SLA monitoring
- [ ] Account management system

---

## 🚀 Conclusión y Next Steps

Este modelo de monetización está diseñado para:

1. **Maximizar adquisición** con freemium generoso
2. **Monetizar valor real** (IA, SMS, email automation)
3. **Escalar progresivamente** con el cliente
4. **Retener** mediante lock-in positivo (datos, campañas)
5. **Expandir** MRR con add-ons y upselling

### **Ventajas competitivas:**
- ✅ Único en combinar fidelización + CRM + campañas + IA
- ✅ Modelo freemium elimina fricción inicial
- ✅ IA como diferenciador clave vs competidores
- ✅ Multi-tenant permite escalar sin límites

### **Próximos pasos recomendados:**
1. **Validar pricing** con 10-15 clientes beta
2. **Implementar Fase 1** (límites) en 2 semanas
3. **Lanzar beta cerrada** con plan Professional
4. **Iterar** basándose en feedback
5. **Escalar marketing** cuando PMF validado

---

**¿Preguntas o necesitas ayuda implementando alguna fase?** 🚀
