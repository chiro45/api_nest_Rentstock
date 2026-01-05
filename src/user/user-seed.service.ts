import { Injectable, Logger, type OnModuleInit } from "@nestjs/common";
import { UserService } from "./user.service";

/**
 * Servicio que se ejecuta al iniciar la aplicación
 * Crea el usuario admin si no existe
 */
@Injectable()
export class UserSeedService implements OnModuleInit {
	private readonly logger = new Logger(UserSeedService.name);

	constructor(private userService: UserService) {}

	/**
	 * Se ejecuta automáticamente cuando el módulo se inicializa
	 * Crea el usuario admin por defecto
	 */
	async onModuleInit() {
		await this.seedAdminUser();
	}

	/**
	 * Crea el usuario admin si no existe
	 * Email: admin@admin.com
	 * Password: admin123
	 */
	private async seedAdminUser() {
		const adminEmail = "admin@admin.com";

		try {
			// Verificar si el usuario admin ya existe
			const existingAdmin = await this.userService.findByEmail(adminEmail);

			if (existingAdmin) {
				this.logger.log("Usuario admin ya existe");
				return;
			}

			// Crear usuario admin con password hasheado
			await this.userService.create(
				adminEmail,
				"admin123", // Este password se hasheará automáticamente en UserService
				"Administrador",
			);

			this.logger.log("✅ Usuario admin creado exitosamente");
			this.logger.log(`   Email: ${adminEmail}`);
			this.logger.log("   Password: admin123");
		} catch (error) {
			this.logger.error("Error al crear usuario admin:", error);
		}
	}
}
