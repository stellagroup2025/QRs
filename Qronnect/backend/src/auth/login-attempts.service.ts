import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

interface AttemptRecord {
  failures: number;
  firstFailureAt: number;
  lockedUntil?: number;
}

/**
 * Limita los intentos fallidos de login (códigos OTP, PIN, contraseña) por identidad.
 *
 * Complementa al ThrottlerGuard (que limita por IP): aquí se bloquea la cuenta/email
 * atacada aunque el atacante reparta las peticiones entre muchas IPs.
 *
 * El estado vive en memoria: es suficiente para una única instancia del backend.
 * Si se escala horizontalmente habrá que mover estos contadores a Redis o a la base de datos.
 */
@Injectable()
export class LoginAttemptsService {
  static readonly MAX_FAILURES = 5;
  static readonly WINDOW_MS = 15 * 60 * 1000;
  static readonly LOCK_MS = 15 * 60 * 1000;

  private readonly attempts = new Map<string, AttemptRecord>();

  /**
   * Lanza 429 si la identidad está bloqueada por demasiados intentos fallidos
   */
  assertNotLocked(key: string): void {
    const record = this.getRecord(key);
    if (record?.lockedUntil && record.lockedUntil > Date.now()) {
      const minutes = Math.ceil((record.lockedUntil - Date.now()) / 60000);
      throw new HttpException(
        `Demasiados intentos fallidos. Vuelve a intentarlo en ${minutes} minuto(s).`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  registerFailure(key: string): void {
    const now = Date.now();
    if (this.attempts.size > 10000) this.purgeExpired();

    const record = this.getRecord(key) ?? { failures: 0, firstFailureAt: now };

    record.failures += 1;
    if (record.failures >= LoginAttemptsService.MAX_FAILURES) {
      record.lockedUntil = now + LoginAttemptsService.LOCK_MS;
    }

    this.attempts.set(key, record);
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }

  private purgeExpired(): void {
    for (const key of [...this.attempts.keys()]) this.getRecord(key);
  }

  /**
   * Devuelve el registro vigente, descartando los que ya caducaron
   */
  private getRecord(key: string): AttemptRecord | undefined {
    const record = this.attempts.get(key);
    if (!record) return undefined;

    const now = Date.now();
    const windowExpired = now - record.firstFailureAt > LoginAttemptsService.WINDOW_MS;
    const lockExpired = !record.lockedUntil || record.lockedUntil <= now;

    if (windowExpired && lockExpired) {
      this.attempts.delete(key);
      return undefined;
    }

    return record;
  }
}
