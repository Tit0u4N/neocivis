import { db } from '../../shared/database';
import type { User } from './user.types';

export class UserService {
  getAll(): User[] {
    return db.users;
  }

  getById(id: string): User | undefined {
    return db.users.find((u) => u.id === id);
  }
}
