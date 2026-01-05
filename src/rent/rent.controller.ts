import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	UploadedFiles,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { CreateRentDto } from "./dto/create-rent.dto";
import type { UpdateRentDto } from "./dto/update-rent.dto";
import { RentService } from "./rent.service";

@Controller("rent")
@UseGuards(JwtAuthGuard) // Proteger todos los endpoints con JWT
export class RentController {
	constructor(private readonly rentService: RentService) {}

	@Post()
	create(@Body() createRentDto: CreateRentDto) {
		return this.rentService.create(createRentDto);
	}

	@Get()
	findAll() {
		return this.rentService.findAll();
	}

	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.rentService.findOne(id);
	}

	@Patch(":id")
	update(@Param("id") id: string, @Body() updateRentDto: UpdateRentDto) {
		return this.rentService.update(id, updateRentDto);
	}

	@Post(":id/images")
	@UseInterceptors(FilesInterceptor("images", 10)) // Máximo 10 imágenes por request
	addImages(
		@Param("id") id: string,
		@UploadedFiles() files: Express.Multer.File[],
	) {
		return this.rentService.addImages(id, files);
	}

	@Delete(":rentId/images/:assetId")
	removeImage(
		@Param("rentId") rentId: string,
		@Param("assetId") assetId: string,
	) {
		return this.rentService.removeImage(rentId, assetId);
	}

	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.rentService.remove(id);
	}
}
