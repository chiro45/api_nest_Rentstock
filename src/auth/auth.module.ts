import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UserModule } from "../user/user.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
	imports: [
		// Importar ConfigModule para que ConfigService esté disponible en JwtStrategy
		ConfigModule,

		// Importar UserModule para acceder a UserService
		UserModule,

		// Configurar PassportModule
		PassportModule,

		// Configurar JwtModule de forma asíncrona para usar variables de entorno
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				// Secreto para firmar los tokens JWT
				secret: configService.get<string>("jwt_secret") ?? "",
				signOptions: {
					// Tiempo de expiración del token (formato: "7d", "24h", "60s", etc.)
					expiresIn: configService.get("jwt_expiration") || "7d",
				},
			}),
		}),
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		JwtStrategy, // Registrar la estrategia JWT
	],
	exports: [AuthService], // Exportar por si otros módulos lo necesitan
})
export class AuthModule {}
