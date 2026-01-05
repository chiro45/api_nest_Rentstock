import {
	BadRequestException,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Query,
	UploadedFiles,
	UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { AssetsService } from "./assets.service";
import type { AssetResponseDto } from "./dto/asset-response.dto";

@Controller("assets")
export class AssetsController {
	constructor(private readonly assetsService: AssetsService) {}

	@Post("upload-multiple")
	@UseInterceptors(FilesInterceptor("files", 10))
	async uploadMultiple(
		@UploadedFiles() files: Express.Multer.File[],
		@Query("rentId") rentId: string,
	): Promise<AssetResponseDto[]> {
		if (!files || files.length === 0) {
			throw new BadRequestException("No files provided");
		}

		return this.assetsService.uploadMultiple(files, rentId);
	}

	@Get("rent/:rentId")
	async getAssetsByRent(
		@Param("rentId") rentId: string,
	): Promise<AssetResponseDto[]> {
		return this.assetsService.findByRentId(rentId);
	}

	@Delete(":assetId")
	async deleteFile(@Param("assetId") id: string): Promise<void> {
		await this.assetsService.deleteAsset(id);
	}
}
