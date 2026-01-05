import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AssetsModule } from "../assets/assets.module";
import { Rent, RentSchema } from "./entities/rent.entity";
import { RentController } from "./rent.controller";
import { RentService } from "./rent.service";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Rent.name, schema: RentSchema }]),
		AssetsModule,
	],
	controllers: [RentController],
	providers: [RentService],
})
export class RentModule {}
