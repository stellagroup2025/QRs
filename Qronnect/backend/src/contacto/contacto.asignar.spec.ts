import { BadRequestException, ConflictException } from '@nestjs/common';
import { ContactoService } from './contacto.service';

/** Supabase falso: cada tabla responde con lo que diga `respuestas`, y se guardan las operaciones */
function fakeSupabase(respuestas: Record<string, (op: any) => any>) {
  const ops: any[] = [];
  const builder = (tabla: string) => {
    const op: any = { tabla, filtros: {} };
    const fin = async () => {
      ops.push(op);
      return respuestas[tabla](op);
    };
    const b: any = {
      select: () => b,
      insert: (row: any) => ((op.accion = 'insert'), (op.row = row), b),
      update: (row: any) => ((op.accion = 'update'), (op.row = row), b),
      delete: () => ((op.accion = 'delete'), b),
      eq: (k: string, v: any) => ((op.filtros[k] = v), b),
      is: (k: string, v: any) => ((op.filtros[`${k} is`] = v), b),
      single: fin,
      maybeSingle: fin,
      then: (res: any, rej: any) => fin().then(res, rej),
    };
    return b;
  };
  return { ops, client: { getAdminClient: () => ({ from: builder }) } as any };
}

const solicitud = {
  id: 's1',
  nombre_negocio: 'Café Aurora',
  nombre_contacto: 'Elena',
  email: 'elena@cafeaurora.es',
  telefono: '600',
  sector: 'cafeterias',
  plan_interes: 'Starter',
  mensaje: 'Dos locales',
  origen: '/para/cafeterias',
  estado: 'nueva',
  prospecto_id: null,
};
const comercial = { id: 'c1', nombre: 'Marta', email: 'marta@qronnect.com', activo: true };

describe('ContactoService.asignar', () => {
  const sendEmail = jest.fn().mockResolvedValue({ success: true });
  beforeEach(() => jest.clearAllMocks());

  it('crea el prospecto en el CRM del comercial, marca la solicitud y avisa al comercial', async () => {
    const { ops, client } = fakeSupabase({
      solicitudes_contacto: (op) =>
        op.accion === 'update'
          ? { data: { ...solicitud, ...op.row }, error: null }
          : { data: solicitud, error: null },
      comerciales: () => ({ data: comercial, error: null }),
      prospectos: () => ({ data: { id: 'p1' }, error: null }),
    });
    const service = new ContactoService(client, { sendEmail } as any);

    const res = await service.asignar('s1', { comercial_id: 'c1' });

    const insert = ops.find((o) => o.tabla === 'prospectos' && o.accion === 'insert');
    expect(insert.row).toMatchObject({ comercial_id: 'c1', nombre_negocio: 'Café Aurora', estado: 'nuevo' });
    expect(insert.row.notas).toContain('Plan que le interesa: Starter');
    expect(res).toMatchObject({ prospecto_id: 'p1', comercial_id: 'c1', estado: 'contactada' });
    // Solo actualiza si nadie la ha asignado antes
    const update = ops.find((o) => o.tabla === 'solicitudes_contacto' && o.accion === 'update');
    expect(update.filtros['prospecto_id is']).toBeNull();
    await new Promise((r) => setImmediate(r));
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: 'marta@qronnect.com' }));
  });

  it('no deja asignar dos veces la misma solicitud', async () => {
    const { client } = fakeSupabase({
      solicitudes_contacto: () => ({ data: { ...solicitud, prospecto_id: 'p0' }, error: null }),
    });
    const service = new ContactoService(client, { sendEmail } as any);
    await expect(service.asignar('s1', { comercial_id: 'c1' })).rejects.toBeInstanceOf(ConflictException);
  });

  it('no asigna a un comercial desactivado', async () => {
    const { client } = fakeSupabase({
      solicitudes_contacto: () => ({ data: solicitud, error: null }),
      comerciales: () => ({ data: { ...comercial, activo: false }, error: null }),
    });
    const service = new ContactoService(client, { sendEmail } as any);
    await expect(service.asignar('s1', { comercial_id: 'c1' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('si otro la asignó a la vez, borra el prospecto creado', async () => {
    const { ops, client } = fakeSupabase({
      solicitudes_contacto: (op) => (op.accion === 'update' ? { data: null, error: null } : { data: solicitud, error: null }),
      comerciales: () => ({ data: comercial, error: null }),
      prospectos: () => ({ data: { id: 'p1' }, error: null }),
    });
    const service = new ContactoService(client, { sendEmail } as any);
    await expect(service.asignar('s1', { comercial_id: 'c1' })).rejects.toBeInstanceOf(ConflictException);
    expect(ops.find((o) => o.tabla === 'prospectos' && o.accion === 'delete')?.filtros.id).toBe('p1');
  });
});
