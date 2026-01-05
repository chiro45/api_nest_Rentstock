import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AssetsController } from "./assets.controller";
import { AssetsService } from "./assets.service";
import { Asset, AssetSchema } from "./entities/asset.entity";
import { CloudinaryService } from "./services/cloudinary.service";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Asset.name, schema: AssetSchema }]),
		ConfigModule,
	],
	controllers: [AssetsController],
	providers: [AssetsService, CloudinaryService],
	exports: [AssetsService],
})
export class AssetsModule {}
