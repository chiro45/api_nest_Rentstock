import * as Joi from "joi";

export const JoiValidationSchema = Joi.object({
	MONGODB_URI: Joi.string().required(),
	PORT: Joi.number().required().default(3005),
	// Cloudinary
	CLOUDINARY_CLOUD_NAME: Joi.string().required(),
	CLOUDINARY_API_KEY: Joi.string().required(),
	CLOUDINARY_API_SECRET: Joi.string().required(),
	// JWT
	JWT_SECRET: Joi.string().required(),
	JWT_EXPIRATION: Joi.string().default("7d"),
});
