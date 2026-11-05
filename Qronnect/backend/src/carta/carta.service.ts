import 'multer';
import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  ActualizarCategoriaDto,
  ActualizarPlatoDto,
  ConfigPaginaDto,
  CrearCategoriaDto,
  CrearPlatoDto,
} from './dto/carta.dto';

const CAMPOS_CATEGORIA = 'id, nombre, descripcion, orden, activa';
const CAMPOS_PLATO =
  'id, id_categoria, nombre, descripcion, precio, imagen_url, alergenos, etiquetas, destacado, disponible, orden';

const IMAGENES_PERMITIDAS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
const MAX_IMAGEN = 3 * 1024 * 1024;

type Fila = Record<string, any>;

/** Postgres devuelve NUMERIC como texto: lo pasamos a número para el frontend */
const conPrecio = (plato: Fila) => ({ ...plato, precio: plato.precio === null ? null : Number(plato.precio) });

/** Agrupa los platos dentro de su categoría, respetando el orden de ambos */
export function montarCarta(categorias: Fila[], platos: Fila[]): (Fila & { platos: Fila[] })[] {
  return categorias.map((categoria) => ({
    ...categoria,
    platos: platos.filter((p) => p.id_categoria === categoria.id).map(conPrecio),
  }));
}

@Injectable()
export class CartaService {
  private readonly logger = new Logger(CartaService.name);

  constructor(private readonly supabase: SupabaseService) {}

  private get db() {
    return this.supabase.getAdminClient();
  }

  private fallo(contexto: string, error: unknown): never {
    this.logger.error(contexto, error as any);
    throw new InternalServerErrorException('No se pudo guardar la carta. Inténtalo de nuevo.');
  }

  // ===================================
  // Público (lo que ve el comensal)
  // ===================================

  /** Carta visible: solo categorías activas con sus platos disponibles. Las categorías vacías no se muestran. */
  async cartaPublica(idTienda: string) {
    const [cats, platos] = await Promise.all([
      this.db
        .from('carta_categorias')
        .select(CAMPOS_CATEGORIA)
        .eq('id_tienda', idTienda)
        .eq('activa', true)
        .order('orden')
        .order('created_at'),
      this.db
        .from('carta_platos')
        .select(CAMPOS_PLATO)
        .eq('id_tienda', idTienda)
        .eq('disponible', true)
        .order('orden')
        .order('created_at'),
    ]);
    if (cats.error || platos.error) this.fallo('Error leyendo la carta pública', cats.error || platos.error);

    const categorias = montarCarta(cats.data ?? [], platos.data ?? []).filter((c) => c.platos.length > 0);
    return { categorias };
  }

  /** Datos de la página QR de 3 vías */
  async paginaPublica(idTienda: string) {
    const [tienda, platos] = await Promise.all([
      this.db.from('tiendas').select('pagina_inicio, google_reviews_url').eq('id', idTienda).single(),
      this.db
        .from('carta_platos')
        .select('id', { count: 'exact', head: true })
        .eq('id_tienda', idTienda)
        .eq('disponible', true),
    ]);
    if (tienda.error || !tienda.data) this.fallo('Error leyendo la página de la tienda', tienda.error);

    return {
      pagina_inicio: tienda.data.pagina_inicio ?? 'landing',
      google_reviews_url: tienda.data.google_reviews_url || null,
      hay_carta: (platos.count ?? 0) > 0,
    };
  }

  // ===================================
  // Panel del restaurante
  // ===================================

  /** Carta completa para editarla, incluidas las categorías ocultas y los platos agotados */
  async cartaCompleta(idTienda: string) {
    const [cats, platos] = await Promise.all([
      this.db.from('carta_categorias').select(CAMPOS_CATEGORIA).eq('id_tienda', idTienda).order('orden').order('created_at'),
      this.db.from('carta_platos').select(CAMPOS_PLATO).eq('id_tienda', idTienda).order('orden').order('created_at'),
    ]);
    if (cats.error || platos.error) this.fallo('Error leyendo la carta', cats.error || platos.error);
    return { categorias: montarCarta(cats.data ?? [], platos.data ?? []) };
  }

  private async siguienteOrden(tabla: 'carta_categorias' | 'carta_platos', filtro: Record<string, string>) {
    let query = this.db.from(tabla).select('orden').order('orden', { ascending: false }).limit(1);
    for (const [col, val] of Object.entries(filtro)) query = query.eq(col, val);
    const { data } = await query;
    return data && data.length ? (data[0].orden ?? 0) + 1 : 0;
  }

  private async comprobarCategoria(idTienda: string, idCategoria: string) {
    const { data, error } = await this.db
      .from('carta_categorias')
      .select('id')
      .eq('id', idCategoria)
      .eq('id_tienda', idTienda)
      .maybeSingle();
    if (error) this.fallo('Error comprobando la categoría', error);
    if (!data) throw new NotFoundException('La categoría no existe');
  }

  async crearCategoria(idTienda: string, dto: CrearCategoriaDto) {
    const orden = await this.siguienteOrden('carta_categorias', { id_tienda: idTienda });
    const { data, error } = await this.db
      .from('carta_categorias')
      .insert({ ...dto, id_tienda: idTienda, orden })
      .select(CAMPOS_CATEGORIA)
      .single();
    if (error || !data) this.fallo('Error creando categoría', error);
    return { ...data, platos: [] };
  }

  async actualizarCategoria(idTienda: string, id: string, dto: ActualizarCategoriaDto) {
    const { data, error } = await this.db
      .from('carta_categorias')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('id_tienda', idTienda)
      .select(CAMPOS_CATEGORIA)
      .maybeSingle();
    if (error) this.fallo('Error actualizando categoría', error);
    if (!data) throw new NotFoundException('La categoría no existe');
    return data;
  }

  /** Borra la categoría y, en cascada, sus platos */
  async borrarCategoria(idTienda: string, id: string) {
    const { data, error } = await this.db
      .from('carta_categorias')
      .delete()
      .eq('id', id)
      .eq('id_tienda', idTienda)
      .select('id');
    if (error) this.fallo('Error borrando categoría', error);
    if (!data?.length) throw new NotFoundException('La categoría no existe');
    return { ok: true };
  }

  async crearPlato(idTienda: string, dto: CrearPlatoDto) {
    await this.comprobarCategoria(idTienda, dto.id_categoria);
    const orden = await this.siguienteOrden('carta_platos', { id_categoria: dto.id_categoria });
    const { data, error } = await this.db
      .from('carta_platos')
      .insert({ ...dto, id_tienda: idTienda, orden })
      .select(CAMPOS_PLATO)
      .single();
    if (error || !data) this.fallo('Error creando plato', error);
    return conPrecio(data);
  }

  async actualizarPlato(idTienda: string, id: string, dto: ActualizarPlatoDto) {
    const cambios: Fila = { ...dto, updated_at: new Date().toISOString() };
    if (dto.id_categoria) {
      await this.comprobarCategoria(idTienda, dto.id_categoria);
      // Al cambiar de categoría, va al final de la nueva
      cambios.orden = await this.siguienteOrden('carta_platos', { id_categoria: dto.id_categoria });
    }
    const { data, error } = await this.db
      .from('carta_platos')
      .update(cambios)
      .eq('id', id)
      .eq('id_tienda', idTienda)
      .select(CAMPOS_PLATO)
      .maybeSingle();
    if (error) this.fallo('Error actualizando plato', error);
    if (!data) throw new NotFoundException('El plato no existe');
    return conPrecio(data);
  }

  async borrarPlato(idTienda: string, id: string) {
    const { data, error } = await this.db
      .from('carta_platos')
      .delete()
      .eq('id', id)
      .eq('id_tienda', idTienda)
      .select('id');
    if (error) this.fallo('Error borrando plato', error);
    if (!data?.length) throw new NotFoundException('El plato no existe');
    return { ok: true };
  }

  /**
   * Guarda el orden recibido. Solo toca filas de esta tienda (y de esta categoría, para los platos);
   * los IDs ajenos se ignoran.
   */
  async ordenar(idTienda: string, tabla: 'carta_categorias' | 'carta_platos', ids: string[], idCategoria?: string) {
    if (idCategoria) await this.comprobarCategoria(idTienda, idCategoria);
    const resultados = await Promise.all(
      ids.map((id, orden) => {
        let query = this.db.from(tabla).update({ orden }).eq('id', id).eq('id_tienda', idTienda);
        if (idCategoria) query = query.eq('id_categoria', idCategoria);
        return query;
      }),
    );
    const conError = resultados.find((r) => r.error);
    if (conError) this.fallo('Error ordenando la carta', conError.error);
    return { ok: true };
  }

  async subirImagen(idTienda: string, file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('No se ha enviado ninguna imagen');
    const extension = IMAGENES_PERMITIDAS[file.mimetype];
    if (!extension) throw new BadRequestException('La foto debe ser JPG, PNG o WebP');
    if (file.size > MAX_IMAGEN) throw new BadRequestException('La foto no puede pasar de 3 MB');

    const ruta = `tiendas/${idTienda}/carta/plato_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${extension}`;
    const { error } = await this.db.storage
      .from('branding')
      .upload(ruta, file.buffer, { contentType: file.mimetype, upsert: false });
    if (error) {
      this.logger.error('Error subiendo foto de plato', error);
      throw new BadRequestException('No se pudo subir la foto. Inténtalo de nuevo.');
    }
    const { data } = this.db.storage.from('branding').getPublicUrl(ruta);
    return { url: data.publicUrl };
  }

  async config(idTienda: string) {
    const { data, error } = await this.db
      .from('tiendas')
      .select('pagina_inicio, google_reviews_url')
      .eq('id', idTienda)
      .single();
    if (error || !data) this.fallo('Error leyendo la configuración de la página', error);
    return { pagina_inicio: data.pagina_inicio ?? 'landing', google_reviews_url: data.google_reviews_url || null };
  }

  async guardarConfig(idTienda: string, dto: ConfigPaginaDto) {
    const { data, error } = await this.db
      .from('tiendas')
      .update(dto)
      .eq('id', idTienda)
      .select('pagina_inicio, google_reviews_url')
      .single();
    if (error || !data) this.fallo('Error guardando la configuración de la página', error);
    return { pagina_inicio: data.pagina_inicio, google_reviews_url: data.google_reviews_url || null };
  }
}
