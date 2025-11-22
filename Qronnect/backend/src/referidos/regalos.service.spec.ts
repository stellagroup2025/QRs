import { Test, TestingModule } from '@nestjs/testing';
import { RegalosService } from './regalos.service';
import { SupabaseService } from '../supabase/supabase.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';

describe('RegalosService - Tests de Integración', () => {
  let service: RegalosService;
  let supabaseService: SupabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegalosService,
        {
          provide: SupabaseService,
          useValue: {
            getAdminClient: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendEmail: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RegalosService>(RegalosService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCatalogo', () => {
    it('debería retornar un array de regalos', async () => {
      const mockRegalos = [
        {
          id: '123',
          nombre: 'Café Gratis',
          tipo: 'producto',
          activo: true,
        },
      ];

      jest.spyOn(supabaseService, 'getAdminClient').mockReturnValue({
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockRegalos, error: null }),
      } as any);

      const result = await service.getCatalogo('tienda-123', true);

      expect(result).toEqual(mockRegalos);
    });
  });

  // Añade más tests aquí...
});
