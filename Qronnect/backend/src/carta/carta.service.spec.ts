import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NotFoundException } from '@nestjs/common';
import { CartaService, montarCarta } from './carta.service';
import { ConfigPaginaDto, CrearPlatoDto } from './dto/carta.dto';

/**
 * Doble mínimo del cliente de Supabase: cada llamada a from() devuelve una consulta encadenable
 * que registra los filtros y resuelve con la respuesta que toque para esa tabla.
 */
function crearDb(respuestas: Record<string, any[]>) {
  const consultas: { tabla: string; ops: [string, ...any[]][] }[] = [];
  const db = {
    from(tabla: string) {
      const registro = { tabla, ops: [] as [string, ...any[]][] };
      consultas.push(registro);
      const cola = respuestas[tabla] ?? [];
      const q: any = new Proxy(
        {},
        {
          get(_, prop: string) {
            if (prop === 'then') {
              const res = cola.length ? cola.shift() : { data: null, error: null };
              return (ok: any, ko: any) => Promise.resolve(res).then(ok, ko);
            }
            return (...args: any[]) => {
              registro.ops.push([prop, ...args]);
              return q;
            };
          },
        },
      );
      return q;
    },
  };
  return { supabase: { getAdminClient: () => db } as any, consultas };
}

const TIENDA = '11111111-1111-4111-8111-111111111111';
const OTRA_CAT = '22222222-2222-4222-8222-222222222222';

describe('montarCarta', () => {
  it('mete cada plato en su categoría y convierte el precio a número', () => {
    const carta = montarCarta(
      [{ id: 'a', nombre: 'Entrantes' }, { id: 'b', nombre: 'Postres' }],
      [
        { id: 'p1', id_categoria: 'a', precio: '9.50' },
        { id: 'p2', id_categoria: 'b', precio: null },
      ],
    );
    expect(carta[0].platos).toEqual([{ id: 'p1', id_categoria: 'a', precio: 9.5 }]);
    expect(carta[1].platos).toEqual([{ id: 'p2', id_categoria: 'b', precio: null }]);
  });
});

describe('CartaService', () => {
  it('la carta pública oculta las categorías que se quedan sin platos', async () => {
    const { supabase } = crearDb({
      carta_categorias: [{ data: [{ id: 'a', nombre: 'Entrantes' }, { id: 'b', nombre: 'Vacía' }], error: null }],
      carta_platos: [{ data: [{ id: 'p1', id_categoria: 'a', precio: '4' }], error: null }],
    });
    const { categorias } = await new CartaService(supabase).cartaPublica(TIENDA);
    expect(categorias.map((c) => c.nombre)).toEqual(['Entrantes']);
  });

  it('la carta pública filtra por tienda, categorías activas y platos disponibles', async () => {
    const { supabase, consultas } = crearDb({});
    await new CartaService(supabase).cartaPublica(TIENDA);
    const [cats, platos] = consultas;
    expect(cats.ops).toEqual(expect.arrayContaining([['eq', 'id_tienda', TIENDA], ['eq', 'activa', true]]));
    expect(platos.ops).toEqual(expect.arrayContaining([['eq', 'id_tienda', TIENDA], ['eq', 'disponible', true]]));
  });

  it('la página QR indica si hay carta y devuelve el enlace de reseñas', async () => {
    const { supabase } = crearDb({
      tiendas: [{ data: { pagina_inicio: 'tres_vias', google_reviews_url: 'https://g.page/r/x/review' }, error: null }],
      carta_platos: [{ count: 3, error: null }],
    });
    await expect(new CartaService(supabase).paginaPublica(TIENDA)).resolves.toEqual({
      pagina_inicio: 'tres_vias',
      google_reviews_url: 'https://g.page/r/x/review',
      hay_carta: true,
    });
  });

  it('no deja crear un plato en una categoría de otra tienda', async () => {
    const { supabase, consultas } = crearDb({ carta_categorias: [{ data: null, error: null }] });
    await expect(
      new CartaService(supabase).crearPlato(TIENDA, { id_categoria: OTRA_CAT, nombre: 'Croquetas' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(consultas[0].ops).toEqual(expect.arrayContaining([['eq', 'id', OTRA_CAT], ['eq', 'id_tienda', TIENDA]]));
    expect(consultas.some((c) => c.tabla === 'carta_platos')).toBe(false);
  });

  it('editar o borrar siempre filtra por la tienda de la sesión', async () => {
    const { supabase, consultas } = crearDb({ carta_platos: [{ data: [{ id: 'p1' }], error: null }] });
    await new CartaService(supabase).borrarPlato(TIENDA, 'p1');
    expect(consultas[0].ops).toEqual(expect.arrayContaining([['delete'], ['eq', 'id', 'p1'], ['eq', 'id_tienda', TIENDA]]));
  });

  it('borrar un plato que no es de la tienda da 404', async () => {
    const { supabase } = crearDb({ carta_platos: [{ data: [], error: null }] });
    await expect(new CartaService(supabase).borrarPlato(TIENDA, 'p1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rechaza fotos que no son imágenes', async () => {
    const { supabase } = crearDb({});
    await expect(
      new CartaService(supabase).subirImagen(TIENDA, { mimetype: 'application/pdf', size: 10 } as any),
    ).rejects.toThrow('JPG, PNG o WebP');
  });
});

describe('DTOs de la carta', () => {
  const errores = async (cls: any, datos: object) =>
    (await validate(plainToInstance(cls, datos))).map((e) => e.property);

  it('un plato necesita nombre y categoría; el precio admite céntimos', async () => {
    expect(await errores(CrearPlatoDto, { id_categoria: OTRA_CAT, nombre: 'Croquetas', precio: 9.5 })).toEqual([]);
    expect(await errores(CrearPlatoDto, { precio: 9.5 })).toEqual(expect.arrayContaining(['nombre', 'id_categoria']));
  });

  it('solo acepta los 14 alérgenos oficiales', async () => {
    expect(
      await errores(CrearPlatoDto, { id_categoria: OTRA_CAT, nombre: 'X', alergenos: ['gluten', 'chocolate'] }),
    ).toEqual(['alergenos']);
  });

  it('el enlace de Google debe ser https y un texto vacío lo borra', async () => {
    expect(await errores(ConfigPaginaDto, { google_reviews_url: 'http://g.page/r/x' })).toEqual(['google_reviews_url']);
    expect(await errores(ConfigPaginaDto, { google_reviews_url: '' })).toEqual([]);
    expect(plainToInstance(ConfigPaginaDto, { google_reviews_url: ' ' }).google_reviews_url).toBeNull();
    expect(await errores(ConfigPaginaDto, { pagina_inicio: 'otra' })).toEqual(['pagina_inicio']);
  });
});
