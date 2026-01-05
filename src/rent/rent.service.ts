import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { type Model, Types } from "mongoose";
import { AssetsService } from "../assets/assets.service";
import type { CreateRentDto } from "./dto/create-rent.dto";
import type { UpdateRentDto } from "./dto/update-rent.dto";
import { Rent } from "./entities/rent.entity";

@Injectable()
export class RentService {
	constructor(
		@InjectModel(Rent.name) private rentModel: Model<Rent>,
		private assetsService: AssetsService,
	) {}

	async create(createRentDto: CreateRentDto): Promise<Rent> {
		const rent = await this.rentModel.create(createRentDto);
		return rent;
	}

	async findAll(): Promise<Rent[]> {
		return this.rentModel
			.find({ available: true }) // Solo rentas disponibles
			.populate({
				path: "assets",
				match: { isDeleted: false }, // Solo assets no eliminados
			})
			.exec();
	}

	async findOne(id: string): Promise<Rent> {
		const rent = await this.rentModel
			.findOne({ _id: id, available: true }) // Solo rentas disponibles
			.populate({
				path: "assets",
				match: { isDeleted: false }, // Solo assets no eliminados
			})
			.exec();

		if (!rent) {
			throw new NotFoundException(`Rent with ID ${id} not found`);
		}
		return rent;
	}

	async update(id: string, updateRentDto: UpdateRentDto): Promise<Rent> {
		const rent = await this.rentModel
			.findOneAndUpdate(
				{ _id: id, available: true }, // Solo actualizar si está disponible
				updateRentDto,
				{ new: true },
			)
			.populate({
				path: "assets",
				match: { isDeleted: false },
			})
			.exec();

		if (!rent) {
			throw new NotFoundException(`Rent with ID ${id} not found`);
		}
		return rent;
	}

	async addImages(rentId: string, files: Express.Multer.File[]): Promise<Rent> {
		// Verificar que la renta existe y está disponible
		const rent = await this.rentModel.findOne({
			_id: rentId,
			available: true,
		});

		if (!rent) {
			throw new NotFoundException(`Rent with ID ${rentId} not found`);
		}

		// Subir cada imagen y crear los assets
		const uploadPromises = files.map((file) =>
			this.assetsService.uploadFile(file, rentId),
		);
		const uploadedAssets = await Promise.all(uploadPromises);

		// Agregar los IDs de los nuevos assets al array de assets del rent
		const newAssetIds = uploadedAssets.map(
			(asset) => new Types.ObjectId(asset.id),
		);
		rent.assets.push(...newAssetIds);
		await rent.save();

		// Retornar la renta actualizada con los assets poblados
		return this.findOne(rentId);
	}

	async removeImage(rentId: string, assetId: string): Promise<Rent> {
		// Verificar que la renta existe y está disponible
		const rent = await this.rentModel.findOne({
			_id: rentId,
			available: true,
		});

		if (!rent) {
			throw new NotFoundException(`Rent with ID ${rentId} not found`);
		}

		// Eliminar el asset físicamente de Cloudinary y MongoDB
		await this.assetsService.hardDeleteAsset(assetId);

		// Remover el ID del asset del array de assets del rent
		rent.assets = rent.assets.filter((id) => id.toString() !== assetId);
		await rent.save();

		// Retornar la renta actualizada con los assets poblados
		return this.findOne(rentId);
	}

	async remove(id: string): Promise<void> {
		const rent = await this.rentModel.findOne({ _id: id, available: true });

		if (!rent) {
			throw new NotFoundException(`Rent with ID ${id} not found`);
		}

		// Eliminar assets de Cloudinary y marcarlos como eliminados
		await this.assetsService.deleteByRentId(id);

		// Marcar la renta como no disponible
		rent.available = false;
		await rent.save();
	}
}
