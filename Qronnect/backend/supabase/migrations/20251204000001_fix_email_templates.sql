-- =====================================================
-- FIX: Asegurar que existan templates de email del sistema
-- =====================================================
-- Problema: Los templates pueden haberse borrado o RLS está bloqueando
-- Solución: Deshabilitar RLS para templates y reinsertar si no existen
-- =====================================================

-- 1. Deshabilitar RLS para email_templates (usamos admin client)
ALTER TABLE email_templates DISABLE ROW LEVEL SECURITY;

-- 2. Verificar e insertar templates del sistema si no existen
-- Template: Bienvenida Simple
INSERT INTO email_templates (nombre, descripcion, categoria, asunto_predeterminado, contenido_html, variables_disponibles, es_sistema, activo)
SELECT
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
        <li>Acumular puntos con cada compra</li>
        <li>Canjear recompensas exclusivas</li>
        <li>Acceder a promociones especiales</li>
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
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE nombre = 'Bienvenida Simple' AND es_sistema = true);

-- Template: Promoción Especial
INSERT INTO email_templates (nombre, descripcion, categoria, asunto_predeterminado, contenido_html, variables_disponibles, es_sistema, activo)
SELECT
  'Promoción Especial',
  'Template para promociones y descuentos',
  'promocion',
  '¡Oferta especial solo para ti!',
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
        <strong>Oferta limitada:</strong> Válida hasta el {{fecha_fin}}
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
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE nombre = 'Promoción Especial' AND es_sistema = true);

-- Template: Recordatorio de Puntos
INSERT INTO email_templates (nombre, descripcion, categoria, asunto_predeterminado, contenido_html, variables_disponibles, es_sistema, activo)
SELECT
  'Recordatorio de Puntos',
  'Recordar a clientes que tienen puntos por usar',
  'recordatorio',
  '¡Tienes {{puntos}} puntos esperándote!',
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
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE nombre = 'Recordatorio de Puntos' AND es_sistema = true);

-- Template: Campaña Simple (nuevo template básico)
INSERT INTO email_templates (nombre, descripcion, categoria, asunto_predeterminado, contenido_html, variables_disponibles, es_sistema, activo)
SELECT
  'Campaña Simple',
  'Template básico para campañas generales',
  'general',
  'Novedades de {{tienda_nombre}}',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: {{color_primario}}; color: white; padding: 25px; text-align: center; }
    .content { background: #ffffff; padding: 30px; }
    .button { display: inline-block; padding: 12px 30px; background: {{color_acento}}; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{tienda_nombre}}</h1>
    </div>
    <div class="content">
      <p>Hola {{nombre}},</p>
      <p>{{contenido_mensaje}}</p>
      <center>
        <a href="{{enlace_cta}}" class="button">{{texto_boton}}</a>
      </center>
    </div>
    <div class="footer">
      <p>{{tienda_nombre}}</p>
      <p><a href="{{enlace_baja}}">Darme de baja</a></p>
    </div>
  </div>
</body>
</html>',
  '["{{nombre}}", "{{tienda_nombre}}", "{{contenido_mensaje}}", "{{enlace_cta}}", "{{texto_boton}}", "{{color_primario}}", "{{color_acento}}", "{{enlace_baja}}"]',
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE nombre = 'Campaña Simple' AND es_sistema = true);

-- Verificar resultado
DO $$
DECLARE
  template_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO template_count FROM email_templates WHERE es_sistema = true AND activo = true;
  RAISE NOTICE 'Templates del sistema activos: %', template_count;
END $$;
