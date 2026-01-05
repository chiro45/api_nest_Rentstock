import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Res,
	UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import type { UserDocument } from "../user/entities/user.entity";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./decorators/current-user.decorator";
import type { AuthLoginDTO } from "./dto/auth-login";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post("login")
	@HttpCode(HttpStatus.OK)
	async login(
		@Body() loginDto: AuthLoginDTO,
		@Res({ passthrough: true }) response: Response,
	) {
		// Validar credenciales y generar token JWT
		const result = await this.authService.login(loginDto);

		// Configurar cookie httpOnly con el access token
		response.cookie("access_token", result.access_token, {
			httpOnly: true, // No accesible desde JavaScript (protección XSS)
			secure: process.env.NODE_ENV === "production", // Solo HTTPS en producción
			sameSite: "strict", // Protección CSRF - cookie solo en mismo sitio
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en milisegundos
		});

		// Retornar solo datos del usuario (el token está en la cookie)
		return { user: result.user };
	}

	@Post("logout")
	@HttpCode(HttpStatus.OK)
	logout(@Res({ passthrough: true }) response: Response) {
		// Eliminar la cookie access_token
		response.clearCookie("access_token");
		return { message: "Logout exitoso" };
	}

	@Get("profile")
	@UseGuards(JwtAuthGuard)
	getProfile(@CurrentUser() user: UserDocument) {
		return {
			id: user._id.toString(),
			email: user.email,
			name: user.name,
			role: user.role,
		};
	}
}
