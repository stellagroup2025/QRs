# 🗺️ ROADMAP - DÍA 2
**Fecha**: 12 de Noviembre de 2025
**Proyecto**: Qronnect - Sistema de Fidelización Multitienda

---

## 📋 OBJETIVOS DEL DÍA

### ✅ 1. Verificación de Sugerencias de Segmentos
**Prioridad**: Alta
**Tiempo estimado**: 30 minutos

- [ ] Probar funcionalidad de sugerencias de segmentos en frontend
- [ ] Verificar que las sugerencias se cargan correctamente al abrir el Generador de Campañas de Email
- [ ] Confirmar que al hacer clic en un segmento se auto-rellena el campo de descripción
- [ ] Validar que los porcentajes y cantidades de clientes son correctos
- [ ] Testing con diferentes cantidades de clientes (0, 5, 20, 50+)

**Archivos involucrados**:
- `QRs/components/admin/ia/GeneradorEmailsCampana.tsx`
- `backend/src/campanas/campanas.service.ts` (método `getAnalisisSegmentos`)

---

### 🎨 2. Mejorar UX de Añadir Venta
**Prioridad**: Alta
**Tiempo estimado**: 2-3 horas

**Problemas actuales a resolver**:
- [ ] Simplificar el flujo de registro de compra
- [ ] Reducir clicks necesarios para completar una venta
- [ ] Mejorar feedback visual al usuario
- [ ] Añadir validaciones en tiempo real
- [ ] Implementar auto-cálculo de puntos ganados
- [ ] Mostrar preview del ticket antes de confirmar

**Mejoras propuestas**:
- [ ] Modal más intuitivo con pasos claros
- [ ] Botón de "Venta rápida" con valores predeterminados
- [ ] Autocompletar cliente por nombre/teléfono/email
- [ ] Mostrar historial de compras del cliente al seleccionarlo
- [ ] Animación de confirmación al guardar

**Archivos a modificar**:
- `QRs/components/admin/ventas/` (crear nuevo componente mejorado)
- `backend/src/compras/compras.controller.ts`
- `backend/src/compras/compras.service.ts`

---

### 👤 3. Añadir Campo Género en Clientes
**Prioridad**: Media-Alta
**Tiempo estimado**: 1.5 horas

**Implementación**:

#### Backend
- [ ] Migración SQL para añadir columna `genero` a tabla `clientes`
  - Tipo: `VARCHAR(20)` o `ENUM('masculino', 'femenino', 'otro', 'prefiero_no_decir')`
  - Nullable: `true` (opcional)
- [ ] Actualizar DTOs:
  - `RegisterClienteDto`
  - `UpdateClienteDto`
  - `ClienteResponseDto`
- [ ] Modificar servicio para incluir género en queries

#### Frontend
- [ ] Añadir campo Select en formulario de registro de cliente
- [ ] Añadir campo en formulario de edición de cliente
- [ ] Mostrar género en tabla de clientes
- [ ] Filtro por género en listado de clientes

#### Análisis Demográfico
- [ ] Actualizar `getAnalisisSegmentos()` para incluir segmentos por género
  - "Mujeres (X clientes - Y%)"
  - "Hombres (X clientes - Y%)"
- [ ] Cruce de género con otros datos (edad, ticket medio, etc.)

**Archivos involucrados**:
- `backend/supabase/migrations/YYYYMMDD_add_genero_to_clientes.sql` (nuevo)
- `backend/src/clientes/dto/*.dto.ts`
- `backend/src/clientes/clientes.service.ts`
- `backend/src/campanas/campanas.service.ts`
- `QRs/components/admin/clientes/` (formularios)

---

### 📅 4. Campañas Programadas y Envío Fraccionado
**Prioridad**: Alta
**Tiempo estimado**: 3-4 horas

**Funcionalidades a implementar**:

#### 4.1. Programación de Envío
- [ ] Campo `fecha_envio_programada` en tabla `campanas`
- [ ] Campo `hora_envio` para especificar hora exacta
- [ ] Job/Cron que ejecute cada X minutos y envíe campañas programadas
- [ ] Estado `programada` vs `enviando` vs `enviada` vs `error`

#### 4.2. Envío Fraccionado (Rate Limiting)
- [ ] Configuración de límite de emails por minuto/hora
- [ ] División automática de destinatarios en lotes
- [ ] Tabla `envios_campanas` para tracking individual:
  ```sql
  - id
  - campana_id
  - cliente_id
  - estado (pendiente|enviando|enviado|error)
  - fecha_envio
  - error_mensaje
  ```
- [ ] Queue system para procesar lotes
- [ ] Progress tracking en tiempo real

#### 4.3. UI de Programación
- [ ] DateTimePicker para seleccionar fecha y hora de envío
- [ ] Toggle "Enviar ahora" vs "Programar para más tarde"
- [ ] Configuración de rate limit (emails por minuto)
- [ ] Vista de "Campañas programadas" con countdown
- [ ] Posibilidad de cancelar/editar campaña programada

#### 4.4. Monitoring y Logs
- [ ] Dashboard de estado de envíos
- [ ] Métricas: enviados/pendientes/errores
- [ ] Logs de errores de envío
- [ ] Retry automático en caso de error

**Archivos involucrados**:
- `backend/supabase/migrations/YYYYMMDD_add_campaign_scheduling.sql` (nuevo)
- `backend/src/campanas/campanas.service.ts`
- `backend/src/campanas/jobs/campaign-scheduler.service.ts` (nuevo)
- `backend/src/email/email.service.ts`
- `QRs/components/admin/campanas/` (UI de programación)

---

### 💡 5. Acciones Directas desde Sugerencias de IA
**Prioridad**: Media
**Tiempo estimado**: 2-3 horas

**Objetivo**: Permitir crear campañas y promociones directamente desde las sugerencias de análisis de KPIs con IA

#### Implementación
- [ ] Añadir botones de acción en cada sugerencia del análisis de KPIs:
  - "Crear Campaña"
  - "Crear Promoción"
  - "Programar Tarea"
  - "Ver Más Detalles"

- [ ] Modal de creación rápida pre-rellenado con datos de la sugerencia:
  - Campaña: Segmento objetivo, asunto sugerido, contenido base
  - Promoción: Tipo, descuento sugerido, duración

- [ ] Expandir tipos de sugerencias más allá de campañas/promos:
  - "Contactar a clientes VIP personalmente"
  - "Revisar inventario de productos con baja rotación"
  - "Aumentar stock de productos populares"
  - "Ajustar precios de productos con bajo margen"
  - "Capacitar al equipo en X servicio"
  - "Mejorar atención en horario Y"

#### Estructura de Sugerencias Mejorada
```typescript
interface SugerenciaIA {
  tipo: 'campana' | 'promocion' | 'tarea' | 'alerta' | 'insight';
  titulo: string;
  descripcion: string;
  prioridad: 'alta' | 'media' | 'baja';
  impacto_estimado: string;
  accion_rapida?: {
    tipo: 'crear_campana' | 'crear_promo' | 'programar_tarea';
    datos_prellenados: any;
  };
  metricas_relacionadas?: string[];
}
```

**Archivos involucrados**:
- `backend/src/ai/ai.service.ts` (expandir prompt y respuesta)
- `backend/src/ai/gemini.service.ts`
- `QRs/components/admin/ia/AnalisisKPIs.tsx`
- `QRs/components/admin/ia/SugerenciaActionModal.tsx` (nuevo)

---

### 🎨 6. Generación de Imágenes con IA para Redes Sociales
**Prioridad**: Media-Baja
**Tiempo estimado**: 4-5 horas

**Objetivo**: Generar imágenes promocionales para Instagram, Facebook, etc.

#### Tecnologías
- [ ] Integrar API de generación de imágenes:
  - DALL-E 3 (OpenAI)
  - Stable Diffusion
  - Midjourney API
  - O alternativa open-source

#### Funcionalidades
- [ ] Generar imagen para campaña de email
  - Input: Título, descripción, colores de marca
  - Output: Imagen 1080x1080 (Instagram) y 1200x628 (Facebook)

- [ ] Generar imagen para promoción
  - Templates prediseñados: "2x1", "50% OFF", "Oferta por tiempo limitado"
  - Personalización con logo y colores de la tienda

- [ ] Formatos disponibles:
  - Instagram Post (1080x1080)
  - Instagram Story (1080x1920)
  - Facebook Post (1200x630)
  - Twitter/X (1200x675)

- [ ] Editor básico post-generación:
  - Añadir texto
  - Ajustar colores
  - Aplicar filtros
  - Añadir logo

#### UI
- [ ] Botón "Generar imagen con IA" en formulario de campaña
- [ ] Modal con preview y opciones de edición
- [ ] Galería de imágenes generadas
- [ ] Descarga en diferentes formatos

#### Backend
- [ ] Endpoint `POST /api/admin/ai/generate-image`
- [ ] Almacenamiento de imágenes (Supabase Storage)
- [ ] Límite de generaciones por plan/tienda

**Archivos involucrados**:
- `backend/src/ai/image-generation.service.ts` (nuevo)
- `backend/src/ai/ai.controller.ts`
- `QRs/components/admin/ia/GeneradorImagenes.tsx` (nuevo)
- `QRs/components/admin/campanas/ImagenCampanaSelector.tsx` (nuevo)

---

### 📊 7. Análisis Demográfico con IA
**Prioridad**: Media
**Tiempo estimado**: 3-4 horas

**Objetivo**: Análisis profundo de clientes cruzando datos demográficos con comportamiento de compra

#### Datos a Analizar
- [ ] **Demográficos**:
  - Edad (rangos: 18-25, 26-35, 36-45, 46-55, 56+)
  - Género
  - Ubicación (si se añade en futuro)

- [ ] **Comportamiento de Compra**:
  - Ticket medio por segmento demográfico
  - Frecuencia de visitas
  - Productos/servicios preferidos
  - Horarios de visita
  - Días de la semana preferidos
  - Temporalidad (estaciones, meses)

#### Insights Generados
- [ ] "Las mujeres de 30-45 años son tu segmento más valioso (ticket medio 45€ vs 28€ general)"
- [ ] "Los hombres jóvenes (18-30) visitan más frecuentemente pero gastan menos"
- [ ] "Clientes mayores de 55 años tienen mayor tasa de retención (80% vs 60%)"
- [ ] "El ticket medio aumenta un 25% los fines de semana"

#### Visualizaciones
- [ ] Gráficos de pastel por segmento demográfico
- [ ] Gráfico de barras: Ticket medio por edad/género
- [ ] Heatmap: Visitas por día de semana y franja horaria
- [ ] Timeline: Evolución de comportamiento por segmento

#### Endpoint
```typescript
POST /api/admin/ai/analisis-demografico
Body: {
  fromDate: "2025-01-01",
  toDate: "2025-12-31",
  segmentos: ["edad", "genero"],
  metricas: ["ticket_medio", "frecuencia", "retencion"]
}

Response: {
  resumen: "Análisis de 500 clientes...",
  segmentos: [
    {
      nombre: "Mujeres 30-45 años",
      total_clientes: 125,
      porcentaje: 25,
      ticket_medio: 45.50,
      frecuencia_promedio: 3.2,
      productos_favoritos: ["Corte + Tinte", "Manicura"],
      insight_ia: "Segmento de alto valor con potencial de upsell en tratamientos premium"
    }
  ],
  recomendaciones: [
    "Crear campaña específica para mujeres 30-45 ofreciendo pack de tratamientos",
    "Aumentar stock de productos preferidos por este segmento",
    "Enviar promociones personalizadas los jueves (día de mayor conversión)"
  ]
}
```

**Archivos involucrados**:
- `backend/src/ai/ai.controller.ts`
- `backend/src/ai/ai.service.ts`
- `backend/src/ai/gemini.service.ts`
- `QRs/components/admin/ia/AnalisisDemografico.tsx` (nuevo)
- `QRs/components/admin/dashboard/page.tsx` (añadir nueva tab)

---

## 🎯 PRIORIZACIÓN SUGERIDA

### Sesión Mañana (4 horas)
1. ✅ Verificación de sugerencias de segmentos (30 min)
2. 🎨 Mejorar UX de añadir venta (2.5 horas)
3. 👤 Añadir campo género en clientes (1 hora)

### Sesión Tarde (4 horas)
4. 📅 Campañas programadas y envío fraccionado (3 horas)
5. 💡 Acciones directas desde sugerencias de IA (1 hora - inicio)

### Sesión Extra / Día 3 (si es necesario)
6. 💡 Completar acciones directas desde sugerencias (2 horas)
7. 📊 Análisis demográfico con IA (3 horas)
8. 🎨 Generación de imágenes con IA (4 horas) - **Opcional/Bonus**

---

## 📝 NOTAS IMPORTANTES

### Dependencias
- **Género en clientes** debe completarse antes de **Análisis demográfico**
- **Campañas programadas** es independiente y puede hacerse en paralelo
- **Generación de imágenes** requiere API key de servicio de imágenes (OpenAI, etc.)

### Consideraciones Técnicas
- **Rate limiting de emails**: Investigar límites de Resend/SendGrid
- **Jobs/Cron**: Considerar usar `@nestjs/schedule` o servicio externo
- **Storage de imágenes**: Configurar bucket en Supabase Storage
- **Costos de IA**: Estimar costos de generación de imágenes (puede ser significativo)

### Testing
- Probar envío fraccionado con cantidades pequeñas primero
- Validar que campañas programadas no se envían múltiples veces
- Verificar que género se incluye correctamente en análisis

---

## ✨ MEJORAS ADICIONALES (Si hay tiempo)

- [ ] Exportar análisis demográfico a PDF/Excel
- [ ] Comparativa de segmentos en el tiempo
- [ ] Predicciones con IA sobre tendencias futuras
- [ ] A/B testing automático de campañas
- [ ] Recomendaciones de horarios óptimos de envío
- [ ] Integración con Google Analytics / Facebook Pixel

---

**¡Manos a la obra! 🚀**
