import { User } from '../../entities/User'
import { UserRepository } from '../../ports/UserRepository'

export class GetAllUsers {
  constructor(private repo: UserRepository) {}

  async execute(): Promise<User[]> {
    return await this.repo.findAll()
  }
}
