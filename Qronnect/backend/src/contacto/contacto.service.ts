import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { EmailService } from '../email/email.service';
import { ActualizarSolicitudDto, AsignarSolicitudDto, CrearSolicitudContactoDto } from './dto/crear-solicitud.dto';

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
      .select('*, comercial:comerciales(id, nombre, email)')
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

  /**
   * Pasa la solicitud a un comercial: crea el prospecto en su CRM, marca la solicitud
   * como contactada y le avisa por email. Una solicitud solo se puede asignar una vez.
   */
  async asignar(id: string, dto: AsignarSolicitudDto) {
    const db = this.supabase.getAdminClient();

    const { data: solicitud, error: errSolicitud } = await db
      .from('solicitudes_contacto')
      .select('*')
      .eq('id', id)
      .single();
    if (errSolicitud || !solicitud) throw new NotFoundException('Solicitud no encontrada');
    if (solicitud.prospecto_id) throw new ConflictException('Esta solicitud ya se pasó a un comercial');

    const { data: comercial, error: errComercial } = await db
      .from('comerciales')
      .select('id, nombre, email, activo')
      .eq('id', dto.comercial_id)
      .single();
    if (errComercial || !comercial) throw new NotFoundException('Comercial no encontrado');
    if (comercial.activo === false) throw new BadRequestException('Ese comercial está desactivado');

    const notas = [
      'Llegó desde el formulario de contacto de la web.',
      solicitud.sector && `Sector: ${solicitud.sector}`,
      solicitud.plan_interes && `Plan que le interesa: ${solicitud.plan_interes}`,
      solicitud.origen && `Página: ${solicitud.origen}`,
      solicitud.mensaje && `Mensaje: ${solicitud.mensaje}`,
    ]
      .filter(Boolean)
      .join('\n');

    const { data: prospecto, error: errProspecto } = await db
      .from('prospectos')
      .insert({
        comercial_id: comercial.id,
        nombre_negocio: solicitud.nombre_negocio,
        nombre_contacto: solicitud.nombre_contacto,
        email: solicitud.email,
        telefono: solicitud.telefono,
        estado: 'nuevo',
        notas,
      })
      .select('id')
      .single();
    if (errProspecto || !prospecto) {
      this.logger.error('Error creando el prospecto', errProspecto);
      throw new InternalServerErrorException('No se pudo crear el prospecto');
    }

    // Solo se asigna si nadie la ha asignado mientras tanto
    const { data: actualizada, error: errUpdate } = await db
      .from('solicitudes_contacto')
      .update({
        comercial_id: comercial.id,
        prospecto_id: prospecto.id,
        asignada_en: new Date().toISOString(),
        estado: solicitud.estado === 'nueva' ? 'contactada' : solicitud.estado,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .is('prospecto_id', null)
      .select('*, comercial:comerciales(id, nombre, email)')
      .maybeSingle();

    if (errUpdate || !actualizada) {
      await db.from('prospectos').delete().eq('id', prospecto.id);
      throw new ConflictException('Esta solicitud ya se pasó a un comercial');
    }

    this.avisarComercial(comercial, solicitud).catch((err) => this.logger.error('Error avisando al comercial', err));
    return actualizada;
  }

  private async avisarComercial(
    comercial: { nombre: string; email: string },
    solicitud: { nombre_negocio: string; nombre_contacto: string; email: string; telefono?: string | null; mensaje?: string | null },
  ) {
    if (!comercial.email) return;
    const filas: [string, string | null | undefined][] = [
      ['Negocio', solicitud.nombre_negocio],
      ['Contacto', solicitud.nombre_contacto],
      ['Email', solicitud.email],
      ['Teléfono', solicitud.telefono],
      ['Mensaje', solicitud.mensaje],
    ];
    await this.email.sendEmail({
      to: comercial.email,
      replyTo: solicitud.email,
      subject: `Nuevo prospecto para ti: ${solicitud.nombre_negocio}`,
      html: `
        <p style="font-family:Arial,sans-serif">Hola ${escapar(comercial.nombre)}, te hemos pasado una solicitud que llegó desde la web. Ya la tienes en tu CRM.</p>
        <table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">
          ${filas
            .filter(([, v]) => v)
            .map(
              ([k, v]) =>
                `<tr><td style="padding:6px 12px 6px 0;color:#666;vertical-align:top">${k}</td><td style="padding:6px 0;white-space:pre-wrap">${escapar(v!)}</td></tr>`,
            )
            .join('')}
        </table>`,
    });
  }
}
