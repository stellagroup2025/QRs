# MCP de Qronnect

Servidor MCP para gestionar Qronnect desde Claude Code: tiendas, carta online, página QR y, a través de la documentación de la API, cualquier otra cosa que se haga desde el panel (sellos, puntos, regalos, campañas, clientes, branding, QR…).

Trabaja contra **producción** (`https://api.qronnect.es`).

## Puesta en marcha

Se carga solo al abrir el repo en Claude Code (está registrado en `.mcp.json`). La primera vez Claude Code pregunta si aprobar el servidor `qronnect` y se instalan las dependencias automáticamente (requiere Node 20 o superior).

Para comprobarlo: `/mcp` en Claude Code debe mostrar `qronnect` conectado.

## Iniciar sesión

Dile a Claude, por ejemplo: *"entra en Qronnect como superadmin con mi@email.com"*.

- **Superadmin** (`qronnect_login_superadmin` + `qronnect_verificar_codigo`): llega un código de 6 dígitos al email; se lo pasas a Claude. Da acceso a todas las tiendas durante 1 hora. El acceso a cada tienda se genera solo.
- **Una tienda** (`qronnect_login_tienda`): email y PIN del administrador de esa tienda. Dura 8 horas.

Los tokens se guardan en `~/.qronnect-mcp/sesion.json` (solo legible por tu usuario). `qronnect_cerrar_sesion` los borra.

## Herramientas

| Herramienta | Para qué |
| --- | --- |
| `qronnect_estado` | Ver la sesión actual |
| `qronnect_listar_tiendas`, `qronnect_ver_tienda` | Buscar tiendas y ver sus datos (superadmin) |
| `qronnect_ver_pagina_qr`, `qronnect_configurar_pagina_qr` | Activar la página de 3 botones y el enlace de reseñas de Google |
| `qronnect_ver_carta` | Ver la carta completa |
| `qronnect_importar_carta` | Crear de golpe secciones y platos (p. ej. a partir de una foto de la carta) |
| `qronnect_crear_seccion`, `qronnect_editar_seccion`, `qronnect_ordenar_secciones`, `qronnect_borrar_seccion` | Secciones |
| `qronnect_crear_plato`, `qronnect_editar_plato`, `qronnect_borrar_plato`, `qronnect_subir_foto_plato` | Platos (se buscan por nombre) |
| `qronnect_buscar_endpoints` | Encontrar cualquier función de la API con su cuerpo |
| `qronnect_llamar_api` | Llamar a cualquier endpoint con la autenticación resuelta |

## Ejemplos de peticiones

- "Activa la página de 3 botones en lalonja y pon este enlace de reseñas: https://g.page/r/…/review"
- "Pasa esta carta a la tienda cafeaurora" (con una foto o el texto de la carta)
- "Marca el pulpo como agotado en lalonja"
- "Crea en lalonja un programa de sellos: 10 cafés = 1 gratis"
- "¿Qué tiendas tienen la página de 3 botones activada?"

## Configuración

| Variable | Por defecto |
| --- | --- |
| `QRONNECT_API_URL` | `https://api.qronnect.es` (para probar en local: `http://localhost:3001`) |
| `QRONNECT_MCP_SESION` | `~/.qronnect-mcp/sesion.json` |

## Desarrollo

```bash
cd Qronnect/mcp && npm install && npm test
```
