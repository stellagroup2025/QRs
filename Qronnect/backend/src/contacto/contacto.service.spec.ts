import { ContactoService } from './contacto.service';

describe('ContactoService', () => {
  const insert = jest.fn();
  const supabase = {
    getAdminClient: () => ({
      from: () => ({
        insert: (row: any) => {
          insert(row);
          return { select: () => ({ single: async () => ({ data: { id: '1' }, error: null }) }) };
        },
      }),
    }),
  } as any;
  const sendEmail = jest.fn().mockResolvedValue({ success: true });
  const service = new ContactoService(supabase, { sendEmail } as any);

  const base = {
    nombre_negocio: 'Café <b>Aurora</b>',
    nombre_contacto: 'Elena',
    email: 'Elena@CafeAurora.es',
    acepta_privacidad: true,
  };

  beforeEach(() => jest.clearAllMocks());

  it('guarda la solicitud sin los campos de control y avisa a ventas', async () => {
    await expect(service.crear({ ...base, sector: 'cafeterias' })).resolves.toEqual({ ok: true });
    expect(insert).toHaveBeenCalledWith({
      nombre_negocio: 'Café <b>Aurora</b>',
      nombre_contacto: 'Elena',
      email: 'elena@cafeaurora.es',
      sector: 'cafeterias',
    });
    await new Promise((r) => setImmediate(r));
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ replyTo: base.email }));
    // El HTML del email escapa lo que escribe el usuario
    expect(sendEmail.mock.calls[0][0].html).toContain('Café &lt;b&gt;Aurora&lt;/b&gt;');
  });

  it('ignora en silencio los envíos de bots (campo trampa relleno)', async () => {
    await expect(service.crear({ ...base, web: 'http://spam' })).resolves.toEqual({ ok: true });
    expect(insert).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });
});

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CrearSolicitudContactoDto } from './dto/crear-solicitud.dto';

describe('CrearSolicitudContactoDto', () => {
  const valida = { nombre_negocio: ' Café Aurora ', nombre_contacto: 'Elena', email: 'elena@cafeaurora.es', acepta_privacidad: true };
  const errores = async (datos: object) =>
    (await validate(plainToInstance(CrearSolicitudContactoDto, datos))).map((e) => e.property);

  it('acepta una solicitud válida y recorta espacios', async () => {
    expect(await errores(valida)).toEqual([]);
    expect(plainToInstance(CrearSolicitudContactoDto, valida).nombre_negocio).toBe('Café Aurora');
  });

  it('exige aceptar la privacidad y un email válido', async () => {
    expect(await errores({ ...valida, acepta_privacidad: false })).toEqual(['acepta_privacidad']);
    expect(await errores({ ...valida, email: 'no-es-un-email' })).toEqual(['email']);
  });
});
