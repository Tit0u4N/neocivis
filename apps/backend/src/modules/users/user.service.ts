import type { UserRepository } from './user.repository';
import type { User } from './user.types';

export class UserService {
  constructor(private repository: UserRepository) {}

  getAll(): User[] {
    return this.repository.getAll();
  }

  getById(id: string): User | undefined {
    return this.repository.getById(id);
  }
  
}
