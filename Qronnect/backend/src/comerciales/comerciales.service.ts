import {
    Injectable,
    UnauthorizedException,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { LoginComercialDto, CreateComercialDto } from './dto/comerciales.dto';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../email/email.service';
import { QrCodesService } from '../qr-codes/qr-codes.service';

@Injectable()
export class ComercialesService {
    constructor(
        private supabaseService: SupabaseService,
        private emailService: EmailService,
        private qrCodesService: QrCodesService,
    ) { }

    /**
     * Login comercial
     */
    async login(loginDto: LoginComercialDto) {
        const supabase = this.supabaseService.getAdminClient();

        const { data: comercial, error } = await supabase
            .from('comerciales')
            .select('*')
            .eq('email', loginDto.email)
            .eq('activo', true)
            .single();

        if (error || !comercial) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const isMatch = await bcrypt.compare(loginDto.password, comercial.password_hash);
        if (!isMatch) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        // Actualizar último acceso
        await supabase
            .from('comerciales')
            .update({ ultimo_acceso: new Date().toISOString() })
            .eq('id', comercial.id);

        // Generar JWT (Simulado para coincidir con Auth Guard)
        const payload = {
            sub: comercial.id,
            email: comercial.email,
            role: 'comercial',
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 24 horas
        };

        const access_token = Buffer.from(JSON.stringify(payload)).toString('base64');
        const token = `header.${access_token}.signature`;

        return {
            access_token: token,
            comercial: {
                id: comercial.id,
                nombre: comercial.nombre,
                email: comercial.email,
            }
        };
    }

    /**
     * Crear comercial (Solo Superadmin)
     */
    async create(createDto: CreateComercialDto) {
        const supabase = this.supabaseService.getAdminClient();

        // Verificar email duplicado
        const { data: exists } = await supabase
            .from('comerciales')
            .select('id')
            .eq('email', createDto.email)
            .single();

        if (exists) {
            throw new BadRequestException('El email ya está registrado');
        }

        const passwordHash = await bcrypt.hash(createDto.password, 10);

        const { data: newComercial, error } = await supabase
            .from('comerciales')
            .insert({
                nombre: createDto.nombre,
                email: createDto.email,
                password_hash: passwordHash,
                telefono: createDto.telefono,
            })
            .select()
            .single();

        if (error) {
            throw new BadRequestException('Error al crear comercial');
        }

        return newComercial;
    }

    /**
     * Listar comerciales (Solo Superadmin)
     */
    async findAll() {
        const supabase = this.supabaseService.getAdminClient();

        // Obtener comerciales y contar tiendas creadas
        // (Requiere join manual o vista si Supabase no resuelve count relation)
        const { data: comerciales, error } = await supabase
            .from('comerciales')
            .select(`
        id, nombre, email, telefono, activo, ultimo_acceso, creado_en,
        tiendas:tiendas(count)
      `)
            .order('creado_en', { ascending: false });

        if (error) throw new BadRequestException('Error al listar comerciales');

        return comerciales.map(c => ({
            ...c,
            tiendas_creadas: c.tiendas ? c.tiendas[0].count : 0
        }));
    }

    /**
     * Crear tienda vinculada al comercial
     */
    async createTienda(comercialId: string, tiendaData: any) {
        const supabase = this.supabaseService.getAdminClient();

        // 1. Validar dominio
        const { data: existente } = await supabase
            .from('tiendas')
            .select('id')
            .eq('dominio', tiendaData.dominio)
            .single();

        if (existente) {
            throw new BadRequestException(`El dominio "${tiendaData.dominio}" ya existe`);
        }

        // 1.5 Validar Plan
        let planId = tiendaData.plan_id;
        let estadoPago = 'pendiente';

        // Si no envía plan, asignar Demo por defecto
        if (!planId) {
            const { data: demo } = await supabase.from('planes').select('id').eq('nombre', 'Plan Demo').single();
            if (demo) planId = demo.id;
        }

        if (!planId) throw new BadRequestException('Plan inválido o no seleccionado');

        // Obtener detalles del plan para validaciones extra si fuera necesario
        const { data: plan } = await supabase.from('planes').select('*').eq('id', planId).single();
        if (!plan) throw new BadRequestException('El plan seleccionado no existe');

        // Demo es gratis/pagado
        if (plan.precio === 0) estadoPago = 'gratis';

        // 2. Crear Tienda
        const { data: tienda, error } = await supabase
            .from('tiendas')
            .insert({
                nombre: tiendaData.nombre,
                dominio: tiendaData.dominio,
                dominio_personalizado: tiendaData.dominio_personalizado,
                direccion: tiendaData.direccion,
                telefono: tiendaData.telefono,
                email: tiendaData.email,
                plan_id: planId, // Nuevo campo FK
                plan: plan.nombre, // Mantener compatibilidad string por ahora
                estado_pago: estadoPago,
                configuracion: { puntos_por_euro: 1 },
                activo: true,
                comercial_id: comercialId,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating tienda:', error);
            throw new BadRequestException(`Error al crear tienda: ${error.message}`);
        }

        // 3. Crear Usuario Admin
        const pinGenerado = Math.floor(100000 + Math.random() * 900000).toString();
        const pin_hash = await bcrypt.hash(pinGenerado, 10);

        const { error: userError } = await supabase
            .from('usuarios_tienda')
            .insert({
                id_tienda: tienda.id,
                nombre: tiendaData.admin_nombre,
                email: tiendaData.admin_email,
                telefono: tiendaData.telefono,
                pin_hash: pin_hash,
                rol: 'owner',
                activo: true,
            });

        if (userError) console.error('Error creando usuario admin:', userError);

        // 4. Enviar Email
        if (this.emailService) {
            try {
                await this.emailService.sendEmail({
                    to: tiendaData.admin_email,
                    subject: 'Bienvenido a Qronnect - Tus Credenciales',
                    html: `<p>Hola ${tiendaData.admin_nombre},</p>
                     <p>Tu tienda <strong>${tienda.nombre}</strong> ha sido creada con el plan <strong>${plan.nombre}</strong>.</p>
                     <p><strong>URL:</strong> https://${tienda.dominio}.qronnect.es/admin</p>
                     <p><strong>PIN:</strong> ${pinGenerado}</p>`
                });
            } catch (e) {
                console.error('Error enviando email:', e);
            }
        }

        return { success: true, tienda, credenciales: { pin: pinGenerado } };
    }

    /**
     * Obtener estadísticas del dashboard
     */
    async getDashboardStats(comercialId: string) {
        const supabase = this.supabaseService.getAdminClient();

        // Obtener tiendas del comercial
        const { data: tiendas, error } = await supabase
            .from('tiendas')
            .select('id, creado_en')
            .eq('comercial_id', comercialId);

        if (error) throw new BadRequestException('Error al obtener estadísticas');

        // Calcular stats
        const storedCount = tiendas.length;

        // Calcular altas del mes actual
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const newThisMonth = tiendas.filter(t => t.creado_en >= startOfMonth).length;

        // Mock de comisiones (se implementará real cuando haya sistema de pagos)
        const totalCommissions = storedCount * 50; // Ejemplo: 50€ por tienda
        const conversionRate = 24; // Mock

        return {
            stores: {
                total: storedCount,
                newThisMonth
            },
            commissions: {
                total: totalCommissions,
                pending: totalCommissions // Asumimos todo pendiente por ahora
            },
            conversion: {
                rate: conversionRate,
                growth: 4
            }
        };
    }

    /**
     * Listar tiendas del comercial
     */
    async getTiendas(comercialId: string) {
        const supabase = this.supabaseService.getAdminClient();

        const { data: tiendas, error } = await supabase
            .from('tiendas')
            .select('*')
            .eq('comercial_id', comercialId)
            .order('creado_en', { ascending: false });

        if (error) throw new BadRequestException('Error al listar tiendas');

        return tiendas;
    }

    /**
     * Asignar QR a tienda
     */
    async asignarQr(comercialId: string, tiendaId: string, qrHash: string) {
        const supabase = this.supabaseService.getAdminClient();

        // Verificar propiedad
        const { data: tienda } = await supabase
            .from('tiendas')
            .select('id')
            .eq('id', tiendaId)
            .eq('comercial_id', comercialId)
            .single();

        if (!tienda) throw new UnauthorizedException('No tienes permiso sobre esta tienda');

        // Asignar usando QrCodesService
        // Nota: Asumimos que QrCodesService está exportado y disponible
        return this.qrCodesService.asignarQrATienda(qrHash, tiendaId);
    }

    /**
     * Impersonar tienda (Entrar como Admin)
     */
    async impersonateTienda(comercialId: string, tiendaId: string) {
        const supabase = this.supabaseService.getAdminClient();

        // 1. Verificar propiedad
        const { data: tienda } = await supabase
            .from('tiendas')
            .select('id, dominio, nombre, activo')
            .eq('id', tiendaId)
            .eq('comercial_id', comercialId)
            .single();

        if (!tienda) throw new UnauthorizedException('No tienes permiso sobre esta tienda');
        if (!tienda.activo) throw new BadRequestException('La tienda está inactiva');

        // 2. Buscar usuario owner
        const { data: owner } = await supabase
            .from('usuarios_tienda')
            .select('*')
            .eq('id_tienda', tiendaId)
            .eq('rol', 'owner')
            .eq('activo', true)
            .single();

        if (!owner) throw new NotFoundException('No se encontró un usuario administrador activo para esta tienda');

        // 3. Generar Token (Simulado como en AdminService development)
        // En producción idealmente usaríamos un sistema de tokens temporales firmados
        const tokenPayload = {
            sub: owner.id,
            tienda_id: owner.id_tienda,
            email: owner.email,
            role: 'admin',
            impersonated_by: comercialId, // Traza de auditoría
            exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hora de acceso
        };

        const access_token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

        // 4. Construir URL de redirección
        // Redirigir a una ruta especial del frontend de la tienda que procese el token
        // O si usamos el mismo dominio, redirigir al login con token

        // Asumimos subdominio: https://{dominio}.qronnect.es/admin/login?auto_token={token}
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        const baseDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'qronnect.es'; // Ajustar según env
        // Si es localhost, el dominio es diferente.
        // Simplificación: Devolvemos el token y el frontend construye la URL o la URL completa

        // Hack para localhost vs producción
        let url;
        if (tienda.dominio.includes('localhost') || process.env.NODE_ENV !== 'production') {
            // En dev a veces no usamos subdominios reales
            url = `http://${tienda.dominio}.${baseDomain}/admin/login?auto_token=${access_token}`;
        } else {
            url = `https://${tienda.dominio}.qronnect.es/admin/login?auto_token=${access_token}`;
        }

        return { url, access_token };
    }
}
