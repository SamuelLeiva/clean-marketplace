import { User } from '@/core/entities'
import { UserRepository } from '@/core/ports'

export class GetAllUsers {
  constructor(private repo: UserRepository) {}

  async execute(): Promise<User[]> {
    return await this.repo.findAll()
  }
}
