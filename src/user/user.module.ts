import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./entities/user.entity";
import { UserService } from "./user.service";
import { UserSeedService } from "./user-seed.service";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
	],
	controllers: [],
	providers: [
		UserService,
		UserSeedService, // Servicio que crea el usuario admin al iniciar la app
	],
	exports: [UserService], // Exportar para que AuthModule pueda usarlo
})
export class UserModule {}
