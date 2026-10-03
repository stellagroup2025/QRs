import { HttpException } from '@nestjs/common';
import { LoginAttemptsService } from './login-attempts.service';

describe('LoginAttemptsService', () => {
  let service: LoginAttemptsService;

  beforeEach(() => {
    jest.useFakeTimers();
    service = new LoginAttemptsService();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const fail = (key: string, times: number) => {
    for (let i = 0; i < times; i++) service.registerFailure(key);
  };

  it('permite intentos por debajo del máximo', () => {
    fail('k', LoginAttemptsService.MAX_FAILURES - 1);
    expect(() => service.assertNotLocked('k')).not.toThrow();
  });

  it('bloquea con 429 al alcanzar el máximo de fallos', () => {
    fail('k', LoginAttemptsService.MAX_FAILURES);
    expect(() => service.assertNotLocked('k')).toThrow(HttpException);
    try {
      service.assertNotLocked('k');
    } catch (e) {
      expect((e as HttpException).getStatus()).toBe(429);
    }
  });

  it('no afecta a otras claves', () => {
    fail('a', LoginAttemptsService.MAX_FAILURES);
    expect(() => service.assertNotLocked('b')).not.toThrow();
  });

  it('desbloquea cuando pasa el tiempo de bloqueo', () => {
    fail('k', LoginAttemptsService.MAX_FAILURES);
    jest.advanceTimersByTime(LoginAttemptsService.LOCK_MS + 1);
    expect(() => service.assertNotLocked('k')).not.toThrow();
  });

  it('reinicia el contador tras un login correcto', () => {
    fail('k', LoginAttemptsService.MAX_FAILURES - 1);
    service.reset('k');
    fail('k', LoginAttemptsService.MAX_FAILURES - 1);
    expect(() => service.assertNotLocked('k')).not.toThrow();
  });

  it('olvida los fallos antiguos fuera de la ventana', () => {
    fail('k', LoginAttemptsService.MAX_FAILURES - 1);
    jest.advanceTimersByTime(LoginAttemptsService.WINDOW_MS + 1);
    fail('k', 1);
    expect(() => service.assertNotLocked('k')).not.toThrow();
  });
});
