import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

/**
 * Servicio centralizado de tokens JWT
 * Reemplaza los tokens base64 sin firma por tokens JWT firmados con secret
 *
 * Uso:
 *   const token = this.jwtTokenService.signToken({ sub: userId, role: 'admin' }, 8 * 3600);
 *   const payload = this.jwtTokenService.verifyToken(token);
 */
@Injectable()
export class JwtTokenService {
    constructor(private readonly jwtService: JwtService) { }

    /**
     * Firma un payload y devuelve un JWT string
     * @param payload - Datos a firmar (sub, role, tienda_id, etc.)
     * @param expiresInSeconds - Duración del token en segundos. Omitir para sin expiración.
     */
    signToken(payload: Record<string, any>, expiresInSeconds?: number): string {
        // Remove 'exp' and 'iat' from payload if present — let JwtService handle them
        const { exp, iat, ...cleanPayload } = payload;

        const options: JwtSignOptions = {};
        if (expiresInSeconds) {
            options.expiresIn = expiresInSeconds;
        }

        return this.jwtService.sign(cleanPayload, options);
    }

    /**
     * Verifica un JWT y devuelve el payload decodificado
     * @throws Error si el token es inválido o ha expirado
     */
    verifyToken(token: string): Record<string, any> {
        return this.jwtService.verify(token);
    }
}
