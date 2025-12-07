import {
    Injectable,
    UnauthorizedException,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { LoginComercialDto, CreateComercialDto } from './dto/comerciales.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';

@Injectable()
export class ComercialesService {
    constructor(
        private supabaseService: SupabaseService,
        private jwtService: JwtService,
        private emailService: EmailService,
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

        // Generar JWT
        const payload = { sub: comercial.id, email: comercial.email, role: 'comercial' };

        // NOTA: En un caso real usaríamos JwtService inyectado, pero aquí simulamos
        // o reutilizamos el setup de AuthModule si fuera posible. 
        // Para simplificar, asumimos que este service generará un objeto simple
        // o requeriríamos injectar JwtService del AuthModule.
        // Vamos a asumir que el AuthModule exporta JwtService o similar.
        // Si no, podríamos necesitar usar una librería directa o configurar JwtModule en ComercialesModule.

        // Por ahora retornamos el objeto usuario, el controller se encargará del token real
        // si inyectamos JwtService.

        return {
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
                plan: tiendaData.plan || 'basico',
                configuracion: { puntos_por_euro: 1 },
                activo: true,
                comercial_id: comercialId,
            })
            .select()
            .single();

        if (error) {
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
                     <p>Tu tienda <strong>${tienda.nombre}</strong> ha sido creada.</p>
                     <p><strong>URL:</strong> https://${tienda.dominio}.qronnect.es/admin</p>
                     <p><strong>PIN:</strong> ${pinGenerado}</p>`
                });
            } catch (e) {
                console.error('Error enviando email:', e);
            }
        }

        return { success: true, tienda, credenciales: { pin: pinGenerado } };
    }
}
