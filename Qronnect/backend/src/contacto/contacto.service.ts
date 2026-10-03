import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { EmailService } from '../email/email.service';
import { ActualizarSolicitudDto, CrearSolicitudContactoDto } from './dto/crear-solicitud.dto';

const escapar = (texto: string) =>
  texto.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

@Injectable()
export class ContactoService {
  private readonly logger = new Logger(ContactoService.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly email: EmailService,
  ) {}

  /**
   * Guarda la solicitud y avisa por email a ventas. Si el email falla, la solicitud queda guardada igual.
   */
  async crear(dto: CrearSolicitudContactoDto) {
    // Bot: respondemos como si todo fuera bien, pero no guardamos nada
    if (dto.web) return { ok: true };

    const { web: _web, acepta_privacidad: _acepta, ...datos } = dto;
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('solicitudes_contacto')
      .insert({ ...datos, email: datos.email.toLowerCase() })
      .select('id, created_at')
      .single();

    if (error || !data) {
      this.logger.error('Error guardando solicitud de contacto', error);
      throw new InternalServerErrorException('No se pudo enviar la solicitud. Inténtalo de nuevo.');
    }

    this.avisarVentas(dto).catch((err) => this.logger.error('Error avisando a ventas', err));
    return { ok: true };
  }

  private async avisarVentas(dto: CrearSolicitudContactoDto) {
    const destino = process.env.CONTACT_EMAIL || 'sales@qronnect.com';
    const filas: [string, string | undefined][] = [
      ['Negocio', dto.nombre_negocio],
      ['Contacto', dto.nombre_contacto],
      ['Email', dto.email],
      ['Teléfono', dto.telefono],
      ['Sector', dto.sector],
      ['Plan', dto.plan_interes],
      ['Página', dto.origen],
      ['Mensaje', dto.mensaje],
    ];
    const html = `
      <h2 style="font-family:Arial,sans-serif">Nueva solicitud desde la web</h2>
      <table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">
        ${filas
          .filter(([, v]) => v)
          .map(
            ([k, v]) =>
              `<tr><td style="padding:6px 12px 6px 0;color:#666;vertical-align:top">${k}</td><td style="padding:6px 0;white-space:pre-wrap">${escapar(v!)}</td></tr>`,
          )
          .join('')}
      </table>
      <p style="font-family:Arial,sans-serif;font-size:13px;color:#666">Responde a este email para contestar directamente.</p>`;

    await this.email.sendEmail({
      to: destino,
      replyTo: dto.email,
      subject: `Nueva solicitud: ${dto.nombre_negocio}${dto.sector ? ` (${dto.sector})` : ''}`,
      html,
    });
  }

  async listar() {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('solicitudes_contacto')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) throw new InternalServerErrorException(error.message);
    return data ?? [];
  }

  async actualizar(id: string, dto: ActualizarSolicitudDto) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('solicitudes_contacto')
      .update({ estado: dto.estado, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }
}
