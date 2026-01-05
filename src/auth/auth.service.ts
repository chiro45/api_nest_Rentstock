import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { UserDocument } from "../user/entities/user.entity";
import { UserService } from "../user/user.service";
import type { AuthLoginDTO } from "./dto/auth-login";

@Injectable()
export class AuthService {
	constructor(
		private userService: UserService,
		private jwtService: JwtService,
	) {}

	/**
	 * Procesa el login del usuario
	 * 1. Valida las credenciales (email y password)
	 * 2. Genera un JWT token
	 * 3. Retorna el token y los datos del usuario (sin la contraseña)
	 */
	async login(loginDto: AuthLoginDTO) {
		// Buscar usuario por email
		const user = await this.userService.findByEmail(loginDto.email);

		// Si no existe el usuario, lanzar excepción
		if (!user) {
			throw new UnauthorizedException("Credenciales inválidas");
		}

		// Validar contraseña usando bcrypt
		const isPasswordValid = await this.userService.validatePassword(
			loginDto.password,
			user.password,
		);

		if (!isPasswordValid) {
			throw new UnauthorizedException("Credenciales inválidas");
		}

		// Crear el payload del JWT
		// sub (subject): identificador único del usuario
		// email: para identificación adicional
		const payload = {
			sub: user._id.toString(),
			email: user.email,
		};

		// Generar el access token con JWT
		const access_token = this.jwtService.sign(payload);

		// Retornar token y usuario (sin contraseña)
		return {
			access_token,
			user: {
				id: user._id.toString(),
				email: user.email,
				name: user.name,
				role: user.role,
			},
		};
	}

	/**
	 * Valida un usuario por su ID (usado por JWT Strategy)
	 */
	async validateUser(userId: string): Promise<UserDocument | null> {
		return this.userService.findById(userId);
	}
}
