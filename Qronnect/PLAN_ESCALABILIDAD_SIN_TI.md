# 🚀 PLAN DE ESCALABILIDAD SIN TI

**Objetivo**: Reducir la intervención manual a cero para poder escalar sin límites.

**Fecha**: 22 de noviembre de 2025
**Prioridad**: 🔴 CRÍTICA - Bloquea crecimiento

---

## 📊 PROBLEMA ACTUAL

### Lo que pasa HOY cuando llega un nuevo cliente:

```
Nuevo cliente se registra
  ↓
NO sabe cómo configurar → ❌ Abandona (50% bounce)
  ↓
O te contacta → ⏰ Tú dedicas 1-2 horas
  ↓
Configuras manualmente → 💸 No escalable
  ↓
Cliente usa el sistema → ✅ (pero NO es sostenible)
```

**Consecuencia**: Por cada 10 clientes nuevos, gastas 15-20 horas de tu tiempo.

### Lo que DEBERÍA pasar:

```
Nuevo cliente se registra
  ↓
Wizard onboarding guiado (5 min) → ✅ Auto-configurado
  ↓
Plantillas pre-hechas → ✅ Primera campaña lista
  ↓
Ayuda in-app + videos → ✅ Auto-servicio
  ↓
Emails de ciclo de vida → ✅ Retención automática
  ↓
Métricas claras de ROI → ✅ Renovación automática
```

**Resultado**: 0 horas de tu tiempo por cliente nuevo.

---

## 🎯 5 FEATURES CRÍTICAS PARA ESCALAR

### 1. 🧙‍♂️ WIZARD DE ONBOARDING (5 PASOS)

**Impacto**: 🔴 CRÍTICO - Reduce abandono del 50% al 10%

#### Paso 1: Branding de la Tienda
```
┌────────────────────────────────────┐
│  🎨 Personaliza tu Marca          │
├────────────────────────────────────┤
│                                    │
│  [Subir logo]    [Elegir colores] │
│                                    │
│  Color primario:  [#FF5733] 🎨    │
│  Color secundario: [#333333] 🎨   │
│                                    │
│  ✅ Logo detectado automáticamente│
│  ✅ Colores aplicados a tu app    │
│                                    │
│  [Omitir] [Siguiente →]           │
└────────────────────────────────────┘
```

**Duración**: 1-2 minutos
**Valor**: Branding inmediato, cliente ve "su app"

#### Paso 2: Configurar Sistema de Puntos
```
┌────────────────────────────────────┐
│  💰 Configura tus Recompensas     │
├────────────────────────────────────┤
│                                    │
│  ¿Qué tipo de negocio tienes?     │
│  🍔 Restaurante                    │
│  ☕ Cafetería                      │
│  💅 Spa/Belleza                    │
│  🏪 Retail                         │
│                                    │
│  Configuración recomendada:        │
│  • 1 punto por cada 10€ gastados  │
│  • Regalo al llegar a 10 puntos   │
│                                    │
│  [Personalizar] [Usar recomendado]│
└────────────────────────────────────┘
```

**Duración**: 1 minuto
**Valor**: Config automática según tipo de negocio

#### Paso 3: Primera Promoción
```
┌────────────────────────────────────┐
│  🎁 Crea tu Primera Promoción     │
├────────────────────────────────────┤
│                                    │
│  Plantillas recomendadas:          │
│                                    │
│  📢 "Bienvenida - 20% descuento"  │
│     → Para nuevos clientes         │
│                                    │
│  🎂 "Cumpleaños - Café gratis"    │
│     → Automatizada por fecha       │
│                                    │
│  ⭐ "Cliente VIP - 2x1"            │
│     → Para clientes frecuentes     │
│                                    │
│  [Crear desde cero] [Usar plantilla]│
└────────────────────────────────────┘
```

**Duración**: 30 segundos
**Valor**: Primera campaña activa AHORA

#### Paso 4: Regalo de Bienvenida
```
┌────────────────────────────────────┐
│  🎁 Regalo de Bienvenida          │
├────────────────────────────────────┤
│                                    │
│  ¿Qué reciben tus clientes al     │
│  registrarse?                      │
│                                    │
│  ○ Puntos (10 puntos)             │
│  ● Regalo concreto                 │
│                                    │
│  [Seleccionar regalo]              │
│  ☕ Café gratis                    │
│  🍰 Postre gratis                  │
│  💅 10% descuento                  │
│  + Crear regalo personalizado      │
│                                    │
│  [Configurar después] [Activar →] │
└────────────────────────────────────┘
```

**Duración**: 30 segundos
**Valor**: Incentivo inmediato para primeros clientes

#### Paso 5: QR Listo
```
┌────────────────────────────────────┐
│  ✅ ¡Todo Listo!                  │
├────────────────────────────────────┤
│                                    │
│  Tu sistema está configurado:      │
│  ✅ Branding personalizado         │
│  ✅ Sistema de puntos activo       │
│  ✅ Primera promoción creada       │
│  ✅ Regalo de bienvenida activo    │
│                                    │
│  📱 Descarga tu QR:                │
│  [████████████] ← QR Code         │
│                                    │
│  [Descargar QR] [Compartir]       │
│                                    │
│  [Ir a mi Dashboard →]            │
└────────────────────────────────────┘
```

**Duración**: 30 segundos
**Valor**: Cliente tiene QR listo para imprimir YA

**TOTAL**: 3-4 minutos para configuración completa

---

### 2. 📋 PLANTILLAS PRE-HECHAS

**Impacto**: 🟡 ALTO - Reduce fricción, aumenta uso del 30% al 70%

#### Categorías de Plantillas

##### A. Promociones de Bienvenida
```json
{
  "nombre": "Bienvenida - 20% Descuento",
  "descripcion": "Atrae nuevos clientes con un descuento irresistible",
  "tipo": "descuento",
  "configuracion": {
    "descuento_porcentaje": 20,
    "valido_para": "nuevo_cliente",
    "dias_validez": 30,
    "uso_unico": true
  },
  "canal": ["email", "push", "sms"],
  "copy_sugerido": {
    "asunto": "¡Bienvenido! 20% de descuento en tu primera compra",
    "mensaje": "Hola {nombre}, como agradecimiento por unirte, disfruta de 20% de descuento usando el código: BIENVENIDO20"
  }
}
```

##### B. Promociones de Cumpleaños
```json
{
  "nombre": "Cumpleaños - Regalo Gratis",
  "descripcion": "Automatiza regalos de cumpleaños",
  "tipo": "regalo",
  "configuracion": {
    "trigger": "cumpleaños",
    "dias_antes": 3,
    "regalo_id": "cafe_gratis",
    "automatico": true
  },
  "canal": ["email", "push"],
  "copy_sugerido": {
    "asunto": "🎂 ¡Feliz cumpleaños {nombre}!",
    "mensaje": "Celebra tu día con nosotros. Te regalamos un café gratis. ¡Ven a recogerlo!"
  }
}
```

##### C. Promociones de Recuperación
```json
{
  "nombre": "Te Extrañamos - Vuelve con 15% OFF",
  "descripcion": "Reactiva clientes inactivos >30 días",
  "tipo": "recuperacion",
  "configuracion": {
    "trigger": "inactividad",
    "dias_inactivo": 30,
    "descuento_porcentaje": 15,
    "urgencia": "7_dias"
  },
  "canal": ["email", "sms"],
  "copy_sugerido": {
    "asunto": "Te extrañamos {nombre} - 15% de descuento te espera",
    "mensaje": "Hace tiempo que no te vemos. Vuelve y disfruta de 15% de descuento. ¡Solo por 7 días!"
  }
}
```

##### D. Promociones VIP
```json
{
  "nombre": "Cliente VIP - Doble Puntos",
  "descripcion": "Recompensa a tus mejores clientes",
  "tipo": "puntos",
  "configuracion": {
    "trigger": "visitas",
    "visitas_minimas": 10,
    "puntos_multiplicador": 2,
    "duracion_dias": 30
  },
  "canal": ["email", "push", "in_app"],
  "copy_sugerido": {
    "asunto": "🌟 ¡Eres VIP! Doble puntos por 30 días",
    "mensaje": "Gracias por tu fidelidad {nombre}. Durante 30 días, ganas el doble de puntos en cada visita."
  }
}
```

##### E. Promociones Flash
```json
{
  "nombre": "Flash Sale - 24 horas",
  "descripcion": "Urgencia para incrementar ventas rápido",
  "tipo": "flash",
  "configuracion": {
    "duracion_horas": 24,
    "descuento_porcentaje": 25,
    "stock_limitado": true,
    "contador_regresivo": true
  },
  "canal": ["email", "sms", "push"],
  "copy_sugerido": {
    "asunto": "⏰ SOLO 24H - 25% de descuento",
    "mensaje": "¡Oferta relámpago! 25% de descuento en todo. Termina en 24 horas. ¡No te lo pierdas!"
  }
}
```

#### Sistema de Recomendación

```typescript
function recomendar_plantilla(tienda: Tienda, contexto: Contexto) {
  if (tienda.clientes_activos < 10) {
    return "Bienvenida - 20% Descuento" // Atraer primeros clientes
  }

  if (contexto.mes_actual === tienda.mes_aniversario) {
    return "Aniversario - 2x1" // Celebrar aniversario
  }

  if (tienda.clientes_inactivos_30d > tienda.clientes_activos * 0.3) {
    return "Te Extrañamos - 15% OFF" // Recuperar inactivos
  }

  if (tienda.dias_sin_campana > 14) {
    return "Flash Sale - 24 horas" // Generar urgencia
  }

  return "Cliente VIP - Doble Puntos" // Default: fidelizar
}
```

---

### 3. ❓ SISTEMA DE AYUDA IN-APP

**Impacto**: 🟡 ALTO - Reduce 80% de preguntas de soporte

#### A. Widget de Ayuda Flotante

```tsx
// Botón flotante en esquina inferior derecha
<HelpWidget position="bottom-right">
  <IconButton>
    <QuestionMarkIcon />
  </IconButton>

  <HelpMenu>
    <MenuItem icon="video">
      📹 Video tutoriales (3-5 min)
    </MenuItem>
    <MenuItem icon="faq">
      💬 Preguntas frecuentes
    </MenuItem>
    <MenuItem icon="whatsapp">
      📱 WhatsApp soporte
    </MenuItem>
    <MenuItem icon="docs">
      📚 Documentación
    </MenuItem>
  </HelpMenu>
</HelpWidget>
```

#### B. Videos Cortos (3-5 minutos cada uno)

1. **"Cómo crear tu primera promoción"** (3 min)
   - Paso a paso visual
   - Resultado al final: promoción activa
   - Tip: Usar plantillas para ir más rápido

2. **"Cómo funciona el sistema de puntos"** (4 min)
   - Qué ven tus clientes
   - Cómo configurar recompensas
   - Casos de éxito

3. **"Enviar tu primera campaña de email"** (5 min)
   - Seleccionar audiencia
   - Escribir mensaje efectivo
   - Analizar resultados

4. **"Configurar regalo de bienvenida"** (3 min)
   - Por qué es importante
   - Tipos de regalos
   - Activar en 3 clicks

5. **"Leer el dashboard de métricas"** (4 min)
   - Qué significa cada número
   - Qué es bueno vs malo
   - Cómo mejorar

#### C. FAQ Contextual

```typescript
// Muestra FAQ relevante según página actual
const FAQ_POR_PAGINA = {
  '/admin/campanas': [
    {
      pregunta: "¿Cómo segmento mi audiencia?",
      respuesta: "Click en 'Filtros avanzados' y elige criterios como...",
      video_url: "https://..."
    },
    {
      pregunta: "¿Cuál es el mejor momento para enviar?",
      respuesta: "Martes y jueves entre 10am-12pm tienen mejor apertura...",
      enlace: "/guia-mejores-practicas"
    }
  ],
  '/admin/promociones': [
    {
      pregunta: "¿Qué tipo de promoción funciona mejor?",
      respuesta: "Depende de tu objetivo. Para nuevos clientes, 20% descuento...",
      plantilla: "usar_plantilla_bienvenida"
    }
  ]
}
```

#### D. Botón de WhatsApp Directo

```tsx
<WhatsAppButton
  number="+34123456789"
  message="Hola, necesito ayuda con mi cuenta de Qronnect..."
  position="bottom-left"
>
  💬 Hablar con soporte
</WhatsAppButton>
```

**Flujo de escalado**:
1. Usuario busca en FAQ → 70% resuelto
2. Ve video → 20% resuelto
3. WhatsApp → 10% (solo casos complejos)

---

### 4. 📧 EMAILS AUTOMÁTICOS DE CICLO DE VIDA

**Impacto**: 🔴 CRÍTICO - Aumenta retención del 40% al 75%

#### Email 1: Bienvenida a Tienda (Día 0)

```
Asunto: ✅ Tu cuenta Qronnect está lista

Hola {nombre_admin},

¡Bienvenido a Qronnect! 🎉

Tu sistema de fidelización está activo y listo para empezar
a captar clientes.

📊 Tu panel de control:
https://www.qronnect.es/{dominio}/admin

🎯 Primeros pasos (completa estos 3 hoy):
□ Personalizar branding (1 min)
□ Crear primera promoción (2 min)
□ Descargar tu QR (30 seg)

[Ir a mi Panel →]

¿Necesitas ayuda? Responde a este email.

Omar & Equipo Qronnect

P.D: Tenemos plantillas listas para que lances tu primera
campaña en menos de 5 minutos 🚀
```

**Trigger**: Cuando se crea la tienda
**Objetivo**: Activación inmediata

#### Email 2: No has creado tu primera campaña (Día 3)

```
Asunto: {nombre}, ¿necesitas ayuda para empezar?

Hola {nombre_admin},

Veo que aún no has creado tu primera campaña.
¿Todo bien?

🎁 Te lo pongo fácil - Plantillas pre-hechas:

1. "Bienvenida - 20% descuento"
   → Para atraer primeros clientes
   [Usar esta →]

2. "Cumpleaños - Café gratis"
   → Se envía automáticamente
   [Activar ahora →]

3. "Flash Sale - 24 horas"
   → Urgencia para vender más
   [Lanzar ya →]

Solo 1 click y tu primera campaña está activa.

[Ver todas las plantillas →]

¿Tienes alguna duda? Solo responde este email.

Omar
```

**Trigger**: Día 3 sin campañas creadas
**Objetivo**: Reducir fricción con plantillas

#### Email 3: Tienes 30 clientes - Upgrade (Día 14)

```
Asunto: 🚀 {nombre}, estás creciendo - tiempo de escalar

Hola {nombre_admin},

¡Felicidades! Ya tienes 30 clientes en tu sistema 🎉

Esto significa que:
✅ Tu QR funciona
✅ Tus clientes lo usan
✅ Estás generando fidelización

📊 Con tu plan actual (Free):
• 30/50 clientes (60% usado)
• 1 campaña/mes
• Límite alcanzado pronto

🌟 Con Qronnect Professional:
• Hasta 500 clientes
• Campañas ilimitadas
• Segmentación avanzada
• Automatizaciones
• Soporte prioritario

💰 Solo 29€/mes (menos de 1€/día)

[Ver planes y mejorar →]

Si tienes dudas, responde este email.

Omar

P.D: Clientes con Professional ven un ROI de 8x
en los primeros 3 meses.
```

**Trigger**: Cuando cliente llega a 30 clientes (60% del límite)
**Objetivo**: Conversión a plan de pago

#### Email 4: Inactividad - 7 días sin login (Día 7)

```
Asunto: {nombre}, ¿todo bien con tu cuenta?

Hola {nombre_admin},

Hace 7 días que no entras a tu panel de Qronnect.

¿Te encuentras con algún problema?

🎯 Recursos que pueden ayudarte:
• Video: "Primeros pasos" (3 min)
• FAQ: Preguntas más comunes
• WhatsApp: Habla con nosotros

[Ver recursos →]

O si prefieres, responde este email y te ayudo
personalmente.

Omar

P.D: Tu QR sigue funcionando. Solo quiero asegurarme
de que aprovechas todas las funciones.
```

**Trigger**: 7 días sin login
**Objetivo**: Recuperar usuario antes de que abandone

#### Email 5: Cliente en riesgo de churn (Día 21)

```
Asunto: {nombre}, ¿Qronnect no cumplió tus expectativas?

Hola {nombre_admin},

Veo que llevas 3 semanas sin usar Qronnect y quiero
entender qué pasó.

¿Fue porque:
□ No sabías cómo configurarlo?
□ No viste resultados?
□ Faltaba alguna funcionalidad?
□ Otro motivo?

Solo responde este email con tu razón y te ayudo
personalmente.

Si decides darnos otra oportunidad:
[Agendar llamada de 15 min conmigo →]

Te muestro cómo otros negocios como el tuyo están
usando Qronnect para generar 20-30% más ventas.

Omar
Fundador, Qronnect

P.D: Tu feedback me ayuda a mejorar el producto
para todos. Gracias por tu tiempo.
```

**Trigger**: 21 días sin login + 0 campañas activas
**Objetivo**: Last chance antes de cancelar

---

### 5. 💰 MÉTRICA DE "DINERO GENERADO ESTIMADO"

**Impacto**: 🔴 CRÍTICO - Justifica renovación, reduce churn

#### Dashboard Principal

```
┌─────────────────────────────────────────────┐
│  💰 Impacto en tu Negocio                  │
├─────────────────────────────────────────────┤
│                                             │
│  Este mes has generado:                     │
│  ┌──────────────────┐                       │
│  │  +3,450€         │ ← Número grande       │
│  │  en ventas extra │                       │
│  └──────────────────┘                       │
│                                             │
│  Desglose:                                  │
│  ✓ 156 clientes recurrentes +2,340€       │
│  ✓ 45 nuevos clientes         +900€       │
│  ✓ 23 recuperados              +210€       │
│                                             │
│  📊 vs mes pasado: +23% ↗                  │
│                                             │
│  [Ver detalle completo →]                  │
└─────────────────────────────────────────────┘
```

#### Cálculo del Estimado

```typescript
function calcular_dinero_generado(tienda: Tienda, mes: number) {
  // 1. Clientes recurrentes (retención)
  const clientes_recurrentes = tienda.clientes.filter(c =>
    c.visitas_mes_actual > c.visitas_mes_anterior
  )
  const incremento_visitas = clientes_recurrentes
    .reduce((sum, c) => sum + (c.visitas_mes_actual - c.visitas_mes_anterior), 0)
  const ingresos_recurrencia = incremento_visitas * tienda.ticket_medio

  // 2. Nuevos clientes (adquisición)
  const nuevos_clientes = tienda.clientes.filter(c =>
    c.fecha_registro >= inicio_mes
  )
  const ingresos_nuevos = nuevos_clientes.length * tienda.ticket_medio * 0.8 // 80% conversion

  // 3. Clientes recuperados (win-back)
  const recuperados = tienda.clientes.filter(c =>
    c.dias_inactivo > 30 && c.visitas_mes_actual > 0
  )
  const ingresos_recuperados = recuperados.length * tienda.ticket_medio * 0.6

  return {
    total: ingresos_recurrencia + ingresos_nuevos + ingresos_recuperados,
    recurrencia: ingresos_recurrencia,
    nuevos: ingresos_nuevos,
    recuperados: ingresos_recuperados,
    vs_mes_anterior: calcular_crecimiento(mes - 1)
  }
}
```

#### Visualización en Gráfica

```
Últimos 6 meses:

€5000 │                              ╭───
      │                         ╭────╯
€4000 │                    ╭────╯
      │               ╭────╯
€3000 │          ╭────╯
      │     ╭────╯
€2000 │╭────╯
      │
€1000 │
      └─────────────────────────────────
        Jun  Jul  Ago  Sep  Oct  Nov

📈 Crecimiento: +45% en 6 meses
💡 Proyección Dic: 5,200€
```

#### Comparación con Plan

```
┌─────────────────────────────────────────┐
│  Tu ROI de Qronnect                    │
├─────────────────────────────────────────┤
│                                         │
│  Ingresos generados:     +3,450€       │
│  Costo del plan:            -29€       │
│  ─────────────────────────────────────  │
│  Beneficio neto:        +3,421€        │
│                                         │
│  ROI: 118x  🚀                         │
│                                         │
│  Por cada 1€ invertido,                │
│  ganas 118€                            │
│                                         │
└─────────────────────────────────────────┘
```

**Efecto psicológico**:
- Cliente ve número grande (€3,450)
- Compara con costo plan (€29)
- Conclusión obvia: "No puedo cancelar esto"

---

## 📋 PLAN DE IMPLEMENTACIÓN

### Fase 1: Onboarding (Semana 1-2) 🔴 CRÍTICO

**Prioridad**: MÁXIMA - Sin esto, no puedes escalar

**Backend**:
- [ ] Tabla `onboarding_progress` (paso actual, completado %)
- [ ] Endpoints para guardar progreso de wizard
- [ ] Lógica de plantillas de promos pre-configuradas
- [ ] Auto-generación de regalo de bienvenida

**Frontend**:
- [ ] Componente `OnboardingWizard` (5 pasos)
- [ ] Paso 1: Branding (upload logo, color picker)
- [ ] Paso 2: Puntos (selector tipo negocio → config automática)
- [ ] Paso 3: Primera promo (plantillas)
- [ ] Paso 4: Regalo bienvenida (catálogo)
- [ ] Paso 5: QR generado (descarga + share)
- [ ] Progress indicator (1/5, 2/5...)
- [ ] Skip option (pero penaliza en metrics)

**Métricas de éxito**:
- 90% de nuevos usuarios completan wizard
- Tiempo promedio: < 5 minutos
- Reducción de contactos de soporte: 60%

### Fase 2: Plantillas (Semana 2-3) 🟡 ALTA

**Backend**:
- [ ] Tabla `plantillas_promociones`
- [ ] 20 plantillas pre-creadas (5 por categoría)
- [ ] Sistema de recomendación inteligente
- [ ] Endpoint para clonar plantilla → campaña activa

**Frontend**:
- [ ] Galería de plantillas con preview
- [ ] Filtros por categoría
- [ ] Badge "Recomendado para ti"
- [ ] "Usar plantilla" → 1-click activación
- [ ] Personalización rápida (cambiar textos, fechas)

**Métricas de éxito**:
- 70% de usuarios usan plantillas (vs crear desde cero)
- Primera campaña activa en < 2 minutos
- Aumento en campañas activas: +50%

### Fase 3: Sistema de Ayuda (Semana 3-4) 🟡 ALTA

**Backend**:
- [ ] Tabla `faq` con categorías
- [ ] Tabla `videos_tutoriales`
- [ ] Endpoint para tracking de ayuda usada
- [ ] Analytics: qué buscan, qué ven

**Frontend**:
- [ ] Widget flotante "?" bottom-right
- [ ] Modal de ayuda con tabs (Videos, FAQ, WhatsApp)
- [ ] Búsqueda de FAQ con fuzzy matching
- [ ] Embed de videos (Vimeo/YouTube)
- [ ] Botón WhatsApp directo con mensaje pre-llenado
- [ ] Help hints contextuales por página

**Métricas de éxito**:
- Reducción de tickets de soporte: 80%
- 50% de usuarios ven al menos 1 video
- Tiempo de resolución autoservicio: < 3 min

### Fase 4: Emails Ciclo de Vida (Semana 4-5) 🔴 CRÍTICO

**Backend**:
- [ ] Sistema de cron jobs para emails automáticos
- [ ] Tabla `email_templates` con variables dinámicas
- [ ] 5 flujos automáticos implementados
- [ ] Tracking: opened, clicked, converted
- [ ] Unsubscribe handling

**Frontend**:
- [ ] Panel admin para ver emails enviados
- [ ] Preview de templates antes de activar
- [ ] Toggle on/off por tipo de email
- [ ] Personalización de copy (opcional)

**Métricas de éxito**:
- Open rate: >40%
- Click rate: >15%
- Conversión a plan de pago: +25%
- Reducción de churn: -50%

### Fase 5: Métrica Dinero Generado (Semana 5-6) 🔴 CRÍTICO

**Backend**:
- [ ] Función `calcular_dinero_generado()`
- [ ] Histórico mensual de métricas
- [ ] Cálculo de ROI del plan
- [ ] Proyecciones futuras (ML simple)
- [ ] Endpoint `/api/metrics/revenue-impact`

**Frontend**:
- [ ] Card grande en dashboard principal
- [ ] Gráfica de últimos 6 meses
- [ ] Desglose por categoría (recurrencia, nuevos, recuperados)
- [ ] Comparación con costo del plan
- [ ] ROI calculado automáticamente
- [ ] CTA: "Mejorar plan para ganar más"

**Métricas de éxito**:
- Renovación de plan: +40%
- Upgrade a Professional: +30%
- Churn rate: < 5%

---

## 💰 IMPACTO ECONÓMICO ESTIMADO

### Sin estas features (HOY):

```
100 clientes nuevos/mes
  ├─ 50% abandonan (no saben configurar)
  ├─ 30% usan poco (no entienden funciones)
  └─ 20% son activos

= 20 clientes activos de 100

Ingresos: 20 × 29€ = 580€/mes
Tiempo manual: 100 × 1.5h = 150 horas/mes
```

### Con estas features (FUTURO):

```
100 clientes nuevos/mes
  ├─ 10% abandonan (wizard perfecto)
  ├─ 20% usan poco (ayuda in-app)
  └─ 70% son activos

= 70 clientes activos de 100

Ingresos: 70 × 29€ = 2,030€/mes
Tiempo manual: 100 × 0.1h = 10 horas/mes
```

**Resultado**:
- Ingresos: **+250%** (580€ → 2,030€)
- Tiempo: **-93%** (150h → 10h)
- **Tu hora vale**: 145€ ahorrados × hora

---

## 🚀 ROADMAP FINAL

| Semana | Feature | Estado | Impacto |
|--------|---------|--------|---------|
| 1-2 | Wizard Onboarding | 🔴 En progreso | CRÍTICO |
| 2-3 | Plantillas Promos | ⏳ Pendiente | ALTO |
| 3-4 | Sistema Ayuda | ⏳ Pendiente | ALTO |
| 4-5 | Emails Ciclo Vida | ⏳ Pendiente | CRÍTICO |
| 5-6 | Métrica Dinero | ⏳ Pendiente | CRÍTICO |

**Fecha objetivo**: Completar en 6 semanas
**Prioridad absoluta**: Onboarding + Emails + Métrica

---

## ✅ PRÓXIMOS PASOS INMEDIATOS

1. **Ahora mismo**: Empezar con wizard de onboarding
2. **Esta semana**: Tener los 5 pasos básicos funcionando
3. **Próxima semana**: Plantillas + emails básicos
4. **En 2 semanas**: Sistema completo en beta con 5 clientes

**¿Empezamos con el wizard de onboarding?** 🚀
