import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import type { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "../auth.service";

/**
 * Estrategia JWT personalizada para Passport
 *
 * Esta estrategia:
 * 1. Extrae el JWT token desde la cookie 'access_token'
 * 2. Valida el token usando el secreto JWT
 * 3. Valida que el usuario aún existe en la base de datos
 * 4. Inyecta el usuario en el request (request.user)
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		configService: ConfigService,
		private authService: AuthService,
	) {
		super({
			// Extraer JWT desde la cookie 'access_token'
			// En lugar de desde el header Authorization (más común con apps móviles)
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request: Request) => {
					// Extraer token desde cookie httpOnly
					return request?.cookies?.access_token;
				},
			]),
			// No ignorar tokens expirados
			ignoreExpiration: false,
			// Secreto para verificar la firma del JWT
			secretOrKey: configService.get<string>("jwt_secret") ?? "",
		});
	}

	/**
	 * Valida el payload del JWT y busca el usuario en la DB
	 * Este método se ejecuta automáticamente después de verificar el token
	 */
	async validate(payload: { sub: string; email: string }) {
		// Buscar usuario por ID (sub = subject = userId)
		const user = await this.authService.validateUser(payload.sub);

		// Si el usuario no existe, rechazar la petición
		if (!user) {
			throw new UnauthorizedException("Usuario no encontrado");
		}

		// El usuario retornado se inyecta automáticamente en request.user
		// Disponible en controllers con @CurrentUser() decorator
		return user;
	}
}
