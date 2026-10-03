import { CampanasService } from './campanas.service';

describe('CampanasService.rangosTicketMedio', () => {
  it('usa los rangos genéricos si hay pocos clientes con compras', () => {
    const rangos = CampanasService.rangosTicketMedio([5, 8, 12]);
    expect(rangos.map((r) => r.label)).toEqual([
      'Compras pequeñas (<30€)',
      'Compras medianas (30-100€)',
      'Compras grandes (>100€)',
      'VIP (>200€)',
    ]);
  });

  it('adapta los cortes a una cafetería con tickets de 2 a 20 €', () => {
    const tickets = Array.from({ length: 30 }, (_, i) => 2 + (i * 18) / 29);
    const rangos = CampanasService.rangosTicketMedio(tickets);

    expect(rangos[0]).toMatchObject({ min: 0, max: 8 });
    expect(rangos[1]).toMatchObject({ min: 8, max: 14 });
    expect(rangos[2]).toMatchObject({ min: 14 });
    expect(rangos[3]).toMatchObject({ min: 19 });
    expect(rangos[0].label).toBe('Ticket bajo (<8€)');
  });

  it('redondea los cortes de una tienda con tickets altos a decenas', () => {
    const tickets = Array.from({ length: 40 }, (_, i) => 40 + i * 7);
    const [bajo, medio] = CampanasService.rangosTicketMedio(tickets);

    expect(bajo.max! % 5).toBe(0);
    expect(medio.max! % 10).toBe(0);
    expect(medio.max!).toBeGreaterThan(bajo.max!);
  });

  it('vuelve a los genéricos si casi todos gastan lo mismo', () => {
    const rangos = CampanasService.rangosTicketMedio(Array(20).fill(3.5));
    expect(rangos[0].label).toBe('Compras pequeñas (<30€)');
  });

  it('ignora clientes sin gasto', () => {
    const rangos = CampanasService.rangosTicketMedio([...Array(20).fill(0), 1, 2, 3]);
    expect(rangos[0].label).toBe('Compras pequeñas (<30€)');
  });
});
