import {
	IsEnum,
	IsMongoId,
	IsNotEmpty,
	IsString,
	IsUrl,
} from "class-validator";
import type { Types } from "mongoose";
import { AssetType } from "../entities/asset.entity";

export class CreateAssetDto {
	@IsEnum(AssetType)
	@IsNotEmpty()
	type: AssetType;

	@IsUrl()
	@IsNotEmpty()
	url: string;

	@IsString()
	@IsNotEmpty()
	fileId: string;

	@IsString()
	@IsNotEmpty()
	fileName: string;

	@IsMongoId()
	@IsNotEmpty()
	rentId: Types.ObjectId;
}
