import { Type } from "class-transformer";
import {
	IsBoolean,
	IsNumber,
	IsOptional,
	IsString,
	ValidateNested,
} from "class-validator";

class Coordinates {
	@IsNumber()
	lat: number;

	@IsNumber()
	long: number;
}

export class CreateRentDto {
	@IsString()
	street: string;

	@IsNumber()
	sreetNumber: number;

	@ValidateNested()
	@Type(() => Coordinates)
	coordinates: Coordinates;

	@IsString()
	name: string;

	@IsString()
	description: string;

	@IsNumber()
	price: number;

	@IsNumber()
	number_of_bedrooms: number;

	@IsNumber()
	number_of_bathroms: number;

	@IsBoolean()
	parking: boolean;

	@IsBoolean()
	@IsOptional()
	available?: boolean;
}
