import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { UserDocument } from "../../user/entities/user.entity";

/**
 * Decorador personalizado para extraer el usuario autenticado del request
 *
 * Uso:
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * getProfile(@CurrentUser() user: UserDocument) {
 *   return user;
 * }
 *
 * El usuario es inyectado automáticamente por el JwtStrategy después de validar el token
 */
export const CurrentUser = createParamDecorator(
	(_data: unknown, ctx: ExecutionContext): UserDocument => {
		const request = ctx.switchToHttp().getRequest();
		return request.user;
	},
);
