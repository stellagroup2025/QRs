import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreatePartnerDto, UpdatePartnerDto } from './dto/partners.dto';

@Injectable()
export class PartnersService {
    constructor(private readonly supabaseService: SupabaseService) { }

    /**
     * Crear un nuevo partner
     */
    async create(createDto: CreatePartnerDto) {
        const supabase = this.supabaseService.getAdminClient();

        const { data: partner, error } = await supabase
            .from('partners')
            .insert([{
                nombre: createDto.nombre,
                cif: createDto.cif,
                email_contacto: createDto.email_contacto,
                telefono: createDto.telefono,
                direccion: createDto.direccion,
                tier: createDto.tier || 'bronze',
                max_licencias: createDto.max_licencias || 5,
                notas: createDto.notas,
            }])
            .select('*')
            .single();

        if (error) {
            throw new BadRequestException(`Error al crear partner: ${error.message}`);
        }

        return partner;
    }

    /**
     * Listar todos los partners con conteo de licencias activas
     */
    async findAll() {
        const supabase = this.supabaseService.getAdminClient();

        const { data: partners, error } = await supabase
            .from('partners')
            .select('*')
            .order('creado_en', { ascending: false });

        if (error) {
            throw new BadRequestException(`Error al listar partners: ${error.message}`);
        }

        // Enriquecer con conteo de tiendas activas por partner
        const enriched = await Promise.all(
            (partners || []).map(async (partner) => {
                const { count } = await supabase
                    .from('tiendas')
                    .select('id', { count: 'exact', head: true })
                    .eq('partner_id', partner.id)
                    .eq('activo', true);

                return {
                    ...partner,
                    licencias_activas: count || 0,
                    licencias_disponibles: partner.max_licencias - (count || 0),
                };
            }),
        );

        return enriched;
    }

    /**
     * Obtener detalle de un partner con sus tiendas
     */
    async findOne(partnerId: string) {
        const supabase = this.supabaseService.getAdminClient();

        const { data: partner, error } = await supabase
            .from('partners')
            .select('*')
            .eq('id', partnerId)
            .single();

        if (error || !partner) {
            throw new NotFoundException('Partner no encontrado');
        }

        // Obtener tiendas del partner
        const { data: tiendas } = await supabase
            .from('tiendas')
            .select('id, nombre, dominio, activo, creado_en')
            .eq('partner_id', partnerId)
            .order('creado_en', { ascending: false });

        // Obtener comerciales del partner
        const { data: comerciales } = await supabase
            .from('comerciales')
            .select('id, nombre, email, activo')
            .eq('partner_id', partnerId);

        return {
            ...partner,
            tiendas: tiendas || [],
            comerciales: comerciales || [],
            licencias_activas: (tiendas || []).filter((t) => t.activo).length,
            licencias_disponibles: partner.max_licencias - (tiendas || []).filter((t) => t.activo).length,
        };
    }

    /**
     * Actualizar un partner
     */
    async update(partnerId: string, updateDto: UpdatePartnerDto) {
        const supabase = this.supabaseService.getAdminClient();

        // Build update object with only provided fields
        const updateData: Record<string, any> = {};
        if (updateDto.nombre !== undefined) updateData.nombre = updateDto.nombre;
        if (updateDto.cif !== undefined) updateData.cif = updateDto.cif;
        if (updateDto.email_contacto !== undefined) updateData.email_contacto = updateDto.email_contacto;
        if (updateDto.telefono !== undefined) updateData.telefono = updateDto.telefono;
        if (updateDto.direccion !== undefined) updateData.direccion = updateDto.direccion;
        if (updateDto.tier !== undefined) updateData.tier = updateDto.tier;
        if (updateDto.max_licencias !== undefined) updateData.max_licencias = updateDto.max_licencias;
        if (updateDto.estado !== undefined) updateData.estado = updateDto.estado;
        if (updateDto.notas !== undefined) updateData.notas = updateDto.notas;

        const { data: partner, error } = await supabase
            .from('partners')
            .update(updateData)
            .eq('id', partnerId)
            .select('*')
            .single();

        if (error || !partner) {
            throw new NotFoundException('Partner no encontrado o error al actualizar');
        }

        return partner;
    }

    /**
     * Suspender partner y desactivar todas sus tiendas en cascada
     */
    async suspend(partnerId: string) {
        const supabase = this.supabaseService.getAdminClient();

        // 1. Suspender el partner
        const { data: partner, error: partnerError } = await supabase
            .from('partners')
            .update({ estado: 'suspendido' })
            .eq('id', partnerId)
            .select('*')
            .single();

        if (partnerError || !partner) {
            throw new NotFoundException('Partner no encontrado');
        }

        // 2. Desactivar todas las tiendas del partner
        const { error: tiendasError } = await supabase
            .from('tiendas')
            .update({ activo: false })
            .eq('partner_id', partnerId);

        if (tiendasError) {
            console.error('Error desactivando tiendas del partner:', tiendasError);
        }

        // 3. Suspender suscripciones activas
        const { error: subsError } = await supabase
            .from('suscripciones')
            .update({ estado: 'suspendida' })
            .eq('partner_id', partnerId)
            .eq('estado', 'activa');

        if (subsError) {
            console.error('Error suspendiendo suscripciones:', subsError);
        }

        return {
            message: `Partner "${partner.nombre}" suspendido. Tiendas y suscripciones desactivadas.`,
            partner,
        };
    }

    /**
     * Validar que un partner tiene licencias disponibles
     * Usado por ComercialesService.createTienda()
     */
    async validateLicenseLimit(partnerId: string): Promise<void> {
        const supabase = this.supabaseService.getAdminClient();

        const { data: partner, error: partnerError } = await supabase
            .from('partners')
            .select('id, nombre, max_licencias, estado')
            .eq('id', partnerId)
            .single();

        if (partnerError || !partner) {
            throw new NotFoundException('Partner no encontrado');
        }

        if (partner.estado !== 'activo') {
            throw new ForbiddenException('El partner está suspendido o inactivo. No se pueden crear nuevas tiendas.');
        }

        const { count } = await supabase
            .from('tiendas')
            .select('id', { count: 'exact', head: true })
            .eq('partner_id', partnerId)
            .eq('activo', true);

        const licenciasActivas = count || 0;

        if (licenciasActivas >= partner.max_licencias) {
            throw new ForbiddenException(
                `Límite de licencias alcanzado (${licenciasActivas}/${partner.max_licencias}). ` +
                `Contacte con Qronnect para ampliar su plan.`
            );
        }
    }
}
