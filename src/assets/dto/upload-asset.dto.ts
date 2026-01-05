import { IsEnum, IsMongoId, IsNotEmpty } from "class-validator";
import { AssetType } from "../entities/asset.entity";

export class UploadAssetDto {
	@IsMongoId()
	@IsNotEmpty()
	rentId: string;

	@IsEnum(AssetType)
	@IsNotEmpty()
	type: AssetType;
}
