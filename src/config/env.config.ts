export const EnvConfiguration = () => ({
	environment: process.env.NODE_ENV || "dev",
	mongodb_uri: process.env.MONGODB_URI,
	port: Number.parseInt(process.env.PORT || "3005", 10),
	// Cloudinary
	cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
	cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
	// JWT
	jwt_secret: process.env.JWT_SECRET,
	jwt_expiration: process.env.JWT_EXPIRATION || "7d",
});
