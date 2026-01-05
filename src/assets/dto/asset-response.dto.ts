import type { AssetType } from "../entities/asset.entity";

export class AssetResponseDto {
	id: string;
	type: AssetType;
	url: string;
	fileName: string;
	rentId: string;
	createdAt: Date;
	updatedAt: Date;
}
