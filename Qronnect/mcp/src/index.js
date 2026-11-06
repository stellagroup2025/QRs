#!/usr/bin/env node
// Servidor MCP de Qronnect: gestiona tiendas, carta, página QR y toda la API desde Claude Code.
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { API_URL, ClienteQronnect } from './api.js'
import { registrarHerramientas } from './herramientas.js'

const server = new McpServer(
  { name: 'qronnect', version: '1.0.0' },
  {
    instructions: [
      `Gestiona Qronnect (${API_URL}): restaurantes y comercios con QR de fidelización.`,
      'Primero inicia sesión: qronnect_login_superadmin + qronnect_verificar_codigo (acceso a todas las tiendas, 1 h) o qronnect_login_tienda (email + PIN de una tienda).',
      'Las tiendas se indican por su dominio (p. ej. "lokeyokiera" para lokeyokiera.qronnect.es).',
      'Para la carta y la página QR hay herramientas propias (importar_carta crea una carta entera de golpe).',
      'Para todo lo demás que hace el panel: qronnect_buscar_endpoints y luego qronnect_llamar_api.',
      'Todo se hace sobre producción: confirma con el usuario antes de borrar o de cambios masivos.',
    ].join('\n'),
  },
)

registrarHerramientas(server, new ClienteQronnect())

await server.connect(new StdioServerTransport())
