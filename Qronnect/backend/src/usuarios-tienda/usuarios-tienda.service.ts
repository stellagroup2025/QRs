import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateUsuarioTiendaDto } from './dto/create-usuario-tienda.dto';
import { UpdateUsuarioTiendaDto } from './dto/update-usuario-tienda.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosTiendaService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(tiendaId: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('usuarios_tienda')
      .select('*')
      .eq('id_tienda', tiendaId)
      .order('creado_en', { ascending: false });

    if (error) {
      throw new HttpException(
        `Error al obtener usuarios: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // No devolver el PIN hash
    return data.map((usuario) => {
      const { pin_hash, ...usuarioSinPin } = usuario;
      return usuarioSinPin;
    });
  }

  async findOne(tiendaId: string, id: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('usuarios_tienda')
      .select('*')
      .eq('id', id)
      .eq('id_tienda', tiendaId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        `Error al obtener usuario: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // No devolver el PIN hash
    const { pin_hash, ...usuarioSinPin } = data;
    return usuarioSinPin;
  }

  async create(tiendaId: string, createDto: CreateUsuarioTiendaDto) {
    const supabase = this.supabaseService.getClient();

    // Validar que si 2FA está activo, debe haber un teléfono
    if (createDto.sms_2fa_activo && !createDto.sms_2fa_telefono) {
      throw new HttpException(
        'Debe proporcionar un teléfono para activar 2FA',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Verificar que el email no exista en esta tienda
    const { data: existingUser } = await supabase
      .from('usuarios_tienda')
      .select('id')
      .eq('id_tienda', tiendaId)
      .eq('email', createDto.email)
      .single();

    if (existingUser) {
      throw new HttpException(
        'Ya existe un usuario con este email en esta tienda',
        HttpStatus.CONFLICT,
      );
    }

    // Hashear el PIN
    const pin_hash = await bcrypt.hash(createDto.pin, 10);

    // Crear usuario
    const { data, error } = await supabase
      .from('usuarios_tienda')
      .insert({
        id_tienda: tiendaId,
        nombre: createDto.nombre,
        email: createDto.email,
        telefono: createDto.telefono || null,
        pin_hash: pin_hash,
        rol: createDto.rol,
        sms_2fa_activo: createDto.sms_2fa_activo || false,
        sms_2fa_telefono: createDto.sms_2fa_telefono || null,
        activo: createDto.activo ?? true,
      })
      .select()
      .single();

    if (error) {
      throw new HttpException(
        `Error al crear usuario: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // No devolver el PIN hash
    const { pin_hash: _, ...usuarioSinPin } = data;
    return usuarioSinPin;
  }

  async update(tiendaId: string, id: string, updateDto: UpdateUsuarioTiendaDto) {
    const supabase = this.supabaseService.getClient();

    // Verificar que el usuario existe y pertenece a la tienda
    const { data: existingUser, error: findError } = await supabase
      .from('usuarios_tienda')
      .select('id')
      .eq('id', id)
      .eq('id_tienda', tiendaId)
      .single();

    if (findError || !existingUser) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }

    // Validar que si 2FA está activo, debe haber un teléfono
    if (updateDto.sms_2fa_activo && !updateDto.sms_2fa_telefono) {
      throw new HttpException(
        'Debe proporcionar un teléfono para activar 2FA',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Si se actualiza el email, verificar que no exista
    if (updateDto.email) {
      const { data: emailExists } = await supabase
        .from('usuarios_tienda')
        .select('id')
        .eq('id_tienda', tiendaId)
        .eq('email', updateDto.email)
        .neq('id', id)
        .single();

      if (emailExists) {
        throw new HttpException(
          'Ya existe un usuario con este email en esta tienda',
          HttpStatus.CONFLICT,
        );
      }
    }

    // Preparar datos de actualización
    const updateData: any = {};

    if (updateDto.nombre !== undefined) updateData.nombre = updateDto.nombre;
    if (updateDto.email !== undefined) updateData.email = updateDto.email;
    if (updateDto.telefono !== undefined) updateData.telefono = updateDto.telefono || null;
    if (updateDto.rol !== undefined) updateData.rol = updateDto.rol;
    if (updateDto.sms_2fa_activo !== undefined) updateData.sms_2fa_activo = updateDto.sms_2fa_activo;
    if (updateDto.sms_2fa_telefono !== undefined) updateData.sms_2fa_telefono = updateDto.sms_2fa_telefono || null;
    if (updateDto.activo !== undefined) updateData.activo = updateDto.activo;

    // Si se actualiza el PIN, hashearlo
    if (updateDto.pin) {
      updateData.pin_hash = await bcrypt.hash(updateDto.pin, 10);
    }

    // Actualizar
    const { data, error } = await supabase
      .from('usuarios_tienda')
      .update(updateData)
      .eq('id', id)
      .eq('id_tienda', tiendaId)
      .select()
      .single();

    if (error) {
      throw new HttpException(
        `Error al actualizar usuario: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // No devolver el PIN hash
    const { pin_hash, ...usuarioSinPin } = data;
    return usuarioSinPin;
  }

  async remove(tiendaId: string, id: string) {
    const supabase = this.supabaseService.getClient();

    // Verificar que el usuario existe y pertenece a la tienda
    const { data: existingUser, error: findError } = await supabase
      .from('usuarios_tienda')
      .select('id')
      .eq('id', id)
      .eq('id_tienda', tiendaId)
      .single();

    if (findError || !existingUser) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }

    // Eliminar
    const { error } = await supabase
      .from('usuarios_tienda')
      .delete()
      .eq('id', id)
      .eq('id_tienda', tiendaId);

    if (error) {
      throw new HttpException(
        `Error al eliminar usuario: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return { success: true };
  }
}
