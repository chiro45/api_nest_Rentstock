import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);

	// Configurar cookie-parser para leer cookies en los requests
	// Necesario para que JwtStrategy pueda extraer el token desde la cookie
	app.use(cookieParser());

	app.setGlobalPrefix("api/v1");
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			//transforma todos los datos a la apriencia del dto => consume un poco mas
			transform: true,
			transformOptions: { enableImplicitConversion: true },
		}),
	);

	const port = configService.get<number>("port") ?? 3005;
	await app.listen(port);
}
bootstrap();
