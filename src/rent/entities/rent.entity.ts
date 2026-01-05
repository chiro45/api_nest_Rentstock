import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class Rent extends Document {
	@Prop({ required: true })
	street: string;
	@Prop({ required: true })
	sreetNumber: number;
	@Prop({ type: { lat: Number, long: Number }, required: true })
	coordinates: {
		lat: number;
		long: number;
	};
	@Prop({ required: true, unique: true })
	name: string;
	@Prop({ required: true })
	description: string;
	@Prop({ required: true })
	price: number;
	@Prop({ required: true })
	number_of_bedrooms: number;
	@Prop({ required: true })
	number_of_bathroms: number;
	@Prop({ required: true })
	parking: boolean;
	@Prop({ type: [{ type: Types.ObjectId, ref: "Asset" }], default: [] })
	assets: Types.ObjectId[];

	@Prop({ default: true })
	available: boolean;

	createdAt: Date;
	updatedAt: Date;
}

export const RentSchema = SchemaFactory.createForClass(Rent);
