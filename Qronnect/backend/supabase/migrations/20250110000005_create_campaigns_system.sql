-- =====================================================
-- SPRINT 5: SISTEMA DE COMUNICACIÓN Y CAMPAÑAS
-- =====================================================
-- Creación de tablas para gestionar campañas de email
-- con segmentación avanzada de clientes
-- =====================================================

-- Tabla de campañas de email
CREATE TABLE IF NOT EXISTS campanas_email (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_tienda UUID NOT NULL REFERENCES tiendas(id) ON DELETE CASCADE,

  -- Información básica
  nombre VARCHAR(255) NOT NULL,
  asunto VARCHAR(500) NOT NULL,
  contenido_html TEXT NOT NULL,
  contenido_texto TEXT,

  -- Segmentación y filtros (JSON con los criterios)
  filtros_segmentacion JSONB DEFAULT '{}',

  -- Estado de la campaña
  estado VARCHAR(50) DEFAULT 'borrador' CHECK (estado IN ('borrador', 'programada', 'enviando', 'enviada', 'cancelada')),

  -- Programación
  fecha_programada TIMESTAMP WITH TIME ZONE,
  fecha_enviada TIMESTAMP WITH TIME ZONE,

  -- Estadísticas
  total_destinatarios INT DEFAULT 0,
  enviados INT DEFAULT 0,
  abiertos INT DEFAULT 0,
  clicks INT DEFAULT 0,

  -- Metadatos
  creado_por UUID REFERENCES admin_users(id),
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de destinatarios de campañas (registro de envíos)
CREATE TABLE IF NOT EXISTS campanas_destinatarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_campana UUID NOT NULL REFERENCES campanas_email(id) ON DELETE CASCADE,
  id_cliente UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,

  -- Estado del envío
  estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'enviado', 'fallido', 'rebotado')),

  -- Interacciones
  fecha_enviado TIMESTAMP WITH TIME ZONE,
  fecha_abierto TIMESTAMP WITH TIME ZONE,
  fecha_click TIMESTAMP WITH TIME ZONE,

  -- Información del error si falla
  error_mensaje TEXT,

  -- Timestamps
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Índices para consultas rápidas
  UNIQUE(id_campana, id_cliente)
);

-- Tabla de templates de email predefinidos
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_tienda UUID REFERENCES tiendas(id) ON DELETE CASCADE, -- NULL = template global

  -- Información del template
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  categoria VARCHAR(100), -- 'bienvenida', 'promocion', 'recordatorio', 'cumpleanos', etc.

  -- Contenido
  asunto_predeterminado VARCHAR(500),
  contenido_html TEXT NOT NULL,

  -- Variables disponibles (para mostrar en el editor)
  variables_disponibles JSONB DEFAULT '[]', -- ['{{nombre}}', '{{puntos}}', etc.]

  -- Preview
  imagen_preview TEXT,

  -- Estado
  activo BOOLEAN DEFAULT true,
  es_sistema BOOLEAN DEFAULT false, -- true para templates que vienen por defecto

  -- Timestamps
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_campanas_tienda ON campanas_email(id_tienda);
CREATE INDEX idx_campanas_estado ON campanas_email(estado);
CREATE INDEX idx_campanas_fecha_programada ON campanas_email(fecha_programada) WHERE estado = 'programada';

CREATE INDEX idx_destinatarios_campana ON campanas_destinatarios(id_campana);
CREATE INDEX idx_destinatarios_cliente ON campanas_destinatarios(id_cliente);
CREATE INDEX idx_destinatarios_estado ON campanas_destinatarios(estado);

CREATE INDEX idx_templates_tienda ON email_templates(id_tienda);
CREATE INDEX idx_templates_categoria ON email_templates(categoria);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_campanas_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar timestamps
CREATE TRIGGER update_campanas_email_timestamp
  BEFORE UPDATE ON campanas_email
  FOR EACH ROW
  EXECUTE FUNCTION update_campanas_timestamp();

CREATE TRIGGER update_email_templates_timestamp
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_campanas_timestamp();

-- Row Level Security (RLS)
ALTER TABLE campanas_email ENABLE ROW LEVEL SECURITY;
ALTER TABLE campanas_destinatarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
-- Las campañas solo son accesibles por admins de la tienda
CREATE POLICY campanas_tenant_isolation ON campanas_email
  USING (id_tienda = current_setting('app.current_tenant_id', TRUE)::UUID);

CREATE POLICY destinatarios_tenant_isolation ON campanas_destinatarios
  USING (
    id_campana IN (
      SELECT id FROM campanas_email
      WHERE id_tienda = current_setting('app.current_tenant_id', TRUE)::UUID
    )
  );

CREATE POLICY templates_access ON email_templates
  USING (
    id_tienda IS NULL OR
    id_tienda = current_setting('app.current_tenant_id', TRUE)::UUID
  );

-- Insertar templates de email predefinidos
INSERT INTO email_templates (nombre, descripcion, categoria, asunto_predeterminado, contenido_html, variables_disponibles, es_sistema, activo) VALUES
(
  'Bienvenida Simple',
  'Mensaje de bienvenida para nuevos clientes',
  'bienvenida',
  '¡Bienvenido a {{tienda_nombre}}!',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: {{color_primario}}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: {{color_acento}}; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>¡Bienvenido {{nombre}}!</h1>
    </div>
    <div class="content">
      <p>Nos alegra muchísimo tenerte con nosotros en <strong>{{tienda_nombre}}</strong>.</p>
      <p>Has sido registrado exitosamente en nuestro programa de fidelización. Ahora puedes:</p>
      <ul>
        <li>✨ Acumular puntos con cada compra</li>
        <li>🎁 Canjear recompensas exclusivas</li>
        <li>🌟 Acceder a promociones especiales</li>
      </ul>
      <p>Tu cuenta ya está activa con <strong>{{puntos}} puntos</strong>.</p>
      <center>
        <a href="{{enlace_perfil}}" class="button">Ver Mi Perfil</a>
      </center>
    </div>
    <div class="footer">
      <p>{{tienda_nombre}} | {{tienda_direccion}}</p>
      <p><a href="{{enlace_baja}}">Darme de baja</a></p>
    </div>
  </div>
</body>
</html>',
  '["{{nombre}}", "{{tienda_nombre}}", "{{puntos}}", "{{color_primario}}", "{{color_acento}}", "{{enlace_perfil}}", "{{tienda_direccion}}", "{{enlace_baja}}"]',
  true,
  true
),
(
  'Promoción Especial',
  'Template para promociones y descuentos',
  'promocion',
  '🎉 ¡Oferta especial solo para ti!',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .banner { background: linear-gradient(135deg, {{color_primario}} 0%, {{color_acento}} 100%); color: white; padding: 40px; text-align: center; border-radius: 10px; margin-bottom: 20px; }
    .promo-badge { font-size: 48px; font-weight: bold; }
    .content { background: white; padding: 30px; border: 2px solid {{color_primario}}; border-radius: 10px; }
    .button { display: inline-block; padding: 15px 40px; background: {{color_acento}}; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold; }
    .urgency { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="banner">
      <div class="promo-badge">{{descuento}}% OFF</div>
      <h1>¡Oferta Exclusiva!</h1>
      <p>Solo para nuestros clientes VIP</p>
    </div>
    <div class="content">
      <p>Hola {{nombre}},</p>
      <p>Tenemos una <strong>oferta especial</strong> solo para ti:</p>
      <h2 style="color: {{color_primario}};">{{titulo_promocion}}</h2>
      <p>{{descripcion_promocion}}</p>
      <div class="urgency">
        <strong>⏰ Oferta limitada:</strong> Válida hasta el {{fecha_fin}}
      </div>
      <center>
        <a href="{{enlace_canjear}}" class="button">Canjear Ahora</a>
      </center>
      <p style="margin-top: 30px; font-size: 14px; color: #666;">
        Tus puntos actuales: <strong>{{puntos}}</strong>
      </p>
    </div>
  </div>
</body>
</html>',
  '["{{nombre}}", "{{descuento}}", "{{titulo_promocion}}", "{{descripcion_promocion}}", "{{fecha_fin}}", "{{puntos}}", "{{color_primario}}", "{{color_acento}}", "{{enlace_canjear}}"]',
  true,
  true
),
(
  'Recordatorio de Puntos',
  'Recordar a clientes que tienen puntos por usar',
  'recordatorio',
  '¡Tienes {{puntos}} puntos esperándote! 🌟',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .points-box { background: linear-gradient(135deg, {{color_primario}} 0%, {{color_acento}} 100%); color: white; padding: 40px; text-align: center; border-radius: 15px; margin: 20px 0; }
    .points-number { font-size: 64px; font-weight: bold; }
    .content { padding: 20px; }
    .promo-list { background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 30px; background: {{color_acento}}; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <p>Hola {{nombre}},</p>
      <p>¡Qué bien verte de nuevo! Queríamos recordarte que tienes puntos acumulados:</p>
    </div>
    <div class="points-box">
      <div class="points-number">{{puntos}}</div>
      <p style="font-size: 20px; margin: 10px 0 0 0;">puntos disponibles</p>
    </div>
    <div class="content">
      <p>¿Sabías que puedes canjearlos por estas recompensas?</p>
      <div class="promo-list">
        {{lista_promociones}}
      </div>
      <p>No dejes que tus puntos se queden sin usar. ¡Ven a visitarnos y canjéalos hoy!</p>
      <center>
        <a href="{{enlace_promociones}}" class="button">Ver Promociones</a>
      </center>
    </div>
  </div>
</body>
</html>',
  '["{{nombre}}", "{{puntos}}", "{{lista_promociones}}", "{{color_primario}}", "{{color_acento}}", "{{enlace_promociones}}"]',
  true,
  true
);

-- Comentarios para documentación
COMMENT ON TABLE campanas_email IS 'Campañas de email marketing con segmentación avanzada';
COMMENT ON TABLE campanas_destinatarios IS 'Registro de envíos y tracking de interacciones';
COMMENT ON TABLE email_templates IS 'Templates reutilizables para campañas de email';

COMMENT ON COLUMN campanas_email.filtros_segmentacion IS 'JSON con criterios de filtrado: ticket_medio, num_visitas, edad, ultima_visita, etc.';
COMMENT ON COLUMN campanas_email.estado IS 'Estado actual de la campaña en el workflow';
COMMENT ON COLUMN email_templates.variables_disponibles IS 'Lista de variables que se pueden usar en el template';
