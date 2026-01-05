import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { MongooseModule } from "@nestjs/mongoose";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AssetsModule } from "./assets/assets.module";
import { AuthModule } from "./auth/auth.module";
import { EnvConfiguration } from "./config/env.config";
import { JoiValidationSchema } from "./config/joi.validation";
import { RentModule } from "./rent/rent.module";
import { UserModule } from "./user/user.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			load: [EnvConfiguration],
			validationSchema: JoiValidationSchema,
		}),
		MongooseModule.forRootAsync({
			imports: [
				ConfigModule,

				ThrottlerModule.forRoot({
					throttlers: [
						{
							ttl: 10 * 1000,
							limit: 4,
						},
					],
				}),
			],
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				uri: configService.get<string>("mongodb_uri"),
			}),
		}),
		RentModule,
		AssetsModule,
		AuthModule,
		UserModule,
	],
	controllers: [],
	providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
	exports: [],
})
export class AppModule {}
