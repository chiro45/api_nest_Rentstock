import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export enum AssetType {
	IMAGE = "image",
}

@Schema({ timestamps: true })
export class Asset extends Document {
	@Prop({ required: true, enum: AssetType })
	type: AssetType;

	@Prop({ required: true })
	url: string;

	@Prop({ required: true })
	fileId: string;

	@Prop({ required: true })
	fileName: string;

	@Prop({ type: Types.ObjectId, ref: "Rent", required: true })
	rentId: Types.ObjectId;

	@Prop({ default: false })
	isDeleted: boolean;

	createdAt: Date;
	updatedAt: Date;
}

export const AssetSchema = SchemaFactory.createForClass(Asset);

AssetSchema.index({ rentId: 1, isDeleted: 1 });
AssetSchema.index({ fileId: 1 });
