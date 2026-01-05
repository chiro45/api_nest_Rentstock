import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { type Model, Types } from "mongoose";
import type { AssetResponseDto } from "./dto/asset-response.dto";
import type { CreateAssetDto } from "./dto/create-asset.dto";
import { Asset, AssetType } from "./entities/asset.entity";
import { CloudinaryService } from "./services/cloudinary.service";

@Injectable()
export class AssetsService {
	private readonly logger = new Logger(AssetsService.name);

	constructor(
		@InjectModel(Asset.name) private assetModel: Model<Asset>,
		private cloudinaryService: CloudinaryService,
	) {}

	async uploadFile(
		file: Express.Multer.File,
		rentId: string,
	): Promise<AssetResponseDto> {
		this.validateFileType(file);

		try {
			const uploadResult = await this.cloudinaryService.uploadFile(
				file,
				`rents/${rentId}`,
			);

			const createDto: CreateAssetDto = {
				type: AssetType.IMAGE,
				url: uploadResult.url,
				fileId: uploadResult.fileId,
				fileName: uploadResult.name,
				rentId: new Types.ObjectId(rentId),
			};

			const asset = await this.assetModel.create(createDto);
			this.logger.log(`Asset created: ${asset._id} for rent ${rentId}`);

			return this.toResponseDto(asset);
		} catch (error) {
			this.logger.error(`Upload failed: ${error.message}`, error.stack);
			throw new BadRequestException(`Failed to upload file: ${error.message}`);
		}
	}

	async uploadMultiple(
		files: Express.Multer.File[],
		rentId: string,
	): Promise<AssetResponseDto[]> {
		const uploadPromises = files.map((file) => this.uploadFile(file, rentId));
		return Promise.all(uploadPromises);
	}

	async findByRentId(rentId: string): Promise<AssetResponseDto[]> {
		const assets = await this.assetModel
			.find({ rentId: new Types.ObjectId(rentId), isDeleted: false })
			.sort({ createdAt: -1 })
			.exec();

		return assets.map((asset) => this.toResponseDto(asset));
	}

	/**
	 * Marca un asset como eliminado (soft delete)
	 * - Elimina el archivo de Cloudinary
	 * - Marca el asset como isDeleted: true en MongoDB
	 */
	async deleteAsset(assetId: string): Promise<void> {
		const asset = await this.assetModel.findById(assetId);

		if (!asset) {
			throw new NotFoundException(`Asset with ID ${assetId} not found`);
		}

		try {
			await this.cloudinaryService.deleteFile(asset.fileId);

			asset.isDeleted = true;
			await asset.save();

			this.logger.log(`Asset soft deleted: ${assetId}`);
		} catch (error) {
			this.logger.error(`Delete failed: ${error.message}`, error.stack);
			throw new BadRequestException(`Failed to delete asset: ${error.message}`);
		}
	}

	/**
	 * Elimina un asset físicamente (hard delete)
	 * - Elimina el archivo de Cloudinary
	 * - Elimina el documento de MongoDB
	 */
	async hardDeleteAsset(assetId: string): Promise<void> {
		const asset = await this.assetModel.findById(assetId);

		if (!asset) {
			throw new NotFoundException(`Asset with ID ${assetId} not found`);
		}

		try {
			// Eliminar de Cloudinary
			await this.cloudinaryService.deleteFile(asset.fileId);

			// Eliminar de MongoDB físicamente
			await this.assetModel.deleteOne({ _id: assetId }).exec();

			this.logger.log(`Asset hard deleted: ${assetId}`);
		} catch (error) {
			this.logger.error(`Hard delete failed: ${error.message}`, error.stack);
			throw new BadRequestException(
				`Failed to hard delete asset: ${error.message}`,
			);
		}
	}

	async deleteByRentId(rentId: string): Promise<void> {
		const assets = await this.assetModel.find({
			rentId: new Types.ObjectId(rentId),
			isDeleted: false,
		});

		if (assets.length === 0) {
			return;
		}

		const fileIds = assets.map((asset) => asset.fileId);
		const deleteResult = await this.cloudinaryService.bulkDelete(fileIds);

		await this.assetModel.updateMany(
			{ rentId: new Types.ObjectId(rentId) },
			{ $set: { isDeleted: true } },
		);

		this.logger.log(
			`Deleted ${deleteResult.success.length} assets for rent ${rentId}`,
		);

		if (deleteResult.failed.length > 0) {
			this.logger.warn(
				`Failed to delete ${deleteResult.failed.length} files from Cloudinary`,
			);
		}
	}

	private validateFileType(file: Express.Multer.File): void {
		const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

		if (!imageTypes.includes(file.mimetype)) {
			throw new BadRequestException(
				`Invalid image type: ${file.mimetype}. Allowed: ${imageTypes.join(", ")}`,
			);
		}
	}

	private toResponseDto(asset: Asset): AssetResponseDto {
		return {
			id: asset._id.toString(),
			type: asset.type,
			url: asset.url,
			fileName: asset.fileName,
			rentId: asset.rentId.toString(),
			createdAt: asset.createdAt,
			updatedAt: asset.updatedAt,
		};
	}
}
