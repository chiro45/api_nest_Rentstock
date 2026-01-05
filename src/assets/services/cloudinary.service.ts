import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

export interface CloudinaryUploadResponse {
	fileId: string;
	name: string;
	url: string;
}

@Injectable()
export class CloudinaryService {
	private readonly logger = new Logger(CloudinaryService.name);

	constructor(private configService: ConfigService) {
		cloudinary.config({
			cloud_name: this.configService.get<string>("cloudinary_cloud_name") ?? "",
			api_key: this.configService.get<string>("cloudinary_api_key") ?? "",
			api_secret: this.configService.get<string>("cloudinary_api_secret") ?? "",
		});
	}

	async uploadFile(
		file: Express.Multer.File,
		folder = "rents",
	): Promise<CloudinaryUploadResponse> {
		try {
			const result = await new Promise<UploadApiResponse>((resolve, reject) => {
				const uploadStream = cloudinary.uploader.upload_stream(
					{
						folder,
						resource_type: "image",
						public_id: `${Date.now()}_${file.originalname.split(".")[0]}`,
						use_filename: true,
						unique_filename: true,
					},
					(error, result) => {
						if (error || !result) return reject(error);
						resolve(result);
					},
				);

				uploadStream.end(file.buffer);
			});

			this.logger.log(`File uploaded to Cloudinary: ${result.public_id}`);

			const url = cloudinary.url(result.public_id, {
				resource_type: "image",
				secure: true,
			});

			return {
				fileId: result.public_id,
				name: result.original_filename || file.originalname,
				url,
			};
		} catch (error) {
			this.logger.error(
				`Cloudinary upload failed: ${(error as Error).message}`,
				(error as Error).stack,
			);
			throw new Error(
				`Failed to upload file to Cloudinary: ${(error as Error).message}`,
			);
		}
	}

	async deleteFile(fileId: string): Promise<void> {
		try {
			const result = await cloudinary.uploader.destroy(fileId, {
				resource_type: "image",
				invalidate: true,
			});

			if (result.result !== "ok") {
				throw new Error(`Cloudinary returned: ${result.result}`);
			}

			this.logger.log(`File deleted from Cloudinary: ${fileId}`);
		} catch (error) {
			this.logger.error(
				`Cloudinary deletion failed: ${(error as Error).message}`,
				(error as Error).stack,
			);
			throw new Error(
				`Failed to delete file from Cloudinary: ${(error as Error).message}`,
			);
		}
	}

	async bulkDelete(
		fileIds: string[],
	): Promise<{ success: string[]; failed: string[] }> {
		const success: string[] = [];
		const failed: string[] = [];

		for (const fileId of fileIds) {
			try {
				await this.deleteFile(fileId);
				success.push(fileId);
			} catch (error) {
				failed.push(fileId);
				this.logger.warn(
					`Failed to delete ${fileId}: ${(error as Error).message}`,
				);
			}
		}

		return { success, failed };
	}
}
