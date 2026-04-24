export type BaseUserRole = 'ADMIN' | 'EMPLOYEE' | 'CITIZEN';

export type User = {
  id: number;
  seedId: number | null;
  keycloakId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
  role: BaseUserRole;
};
