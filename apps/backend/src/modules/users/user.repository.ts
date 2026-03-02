import type { User } from './user.types';

export class UserRepository {
  private users: User[] = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Doe' },
  ];

  getAll(): User[] {
    return this.users;
  }

  getById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }
}
