import { User } from "@/core/entities";
import { UserAlreadyExistsError } from "@/core/errors/auth";
import { UserRepository } from "@/core/ports";
import { SignUpInput } from "@/shared/contracts";
import bcrypt from 'bcryptjs'

export class SignUp {
  constructor(private userRepo: UserRepository) {}

  async execute(input: SignUpInput): Promise<User> {
    const { email, password, name } = input;

    // 1. Regla de Negocio: No permitir usuarios duplicados.
    const existingUser = await this.userRepo.findByEmail(email);
    if (existingUser) {
      throw new UserAlreadyExistsError(`User with email ${email} already exists.`);
    }

    // 2. Operación de Seguridad: Hashear la contraseña.
    // Nunca almacenes contraseñas en texto plano. bcryptjs es una biblioteca popular y segura para esto.
    const hashedPassword = await bcrypt.hash(password, 10); // '10' son las rondas de salado (salt rounds)

    // 3. Persistencia: Crear el usuario en la base de datos a través del repositorio.
    const newUser = await this.userRepo.create({
      name,
      email,
      hashedPassword, // Almacena el hash, no la contraseña plana
    });

    return newUser; // Retorna la entidad User (sin la contraseña hashed)
  }
}