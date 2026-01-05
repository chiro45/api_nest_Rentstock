import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import * as bcrypt from "bcrypt";
import type { Model } from "mongoose";
import { User, type UserDocument } from "./entities/user.entity";

@Injectable()
export class UserService {
	constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

	async findByEmail(email: string): Promise<UserDocument | null> {
		return this.userModel.findOne({ email }).exec();
	}

	async findById(id: string): Promise<UserDocument | null> {
		return this.userModel.findById(id).exec();
	}

	async create(
		email: string,
		password: string,
		name: string,
	): Promise<UserDocument> {
		// Hashear la contraseña con bcrypt (10 rounds de salt)
		const hashedPassword = await bcrypt.hash(password, 10);

		const user = new this.userModel({
			email,
			password: hashedPassword,
			name,
		});

		return user.save();
	}

	async validatePassword(
		plainPassword: string,
		hashedPassword: string,
	): Promise<boolean> {
		return bcrypt.compare(plainPassword, hashedPassword);
	}
}
