/** biome-ignore-all lint/suspicious/useAwait: <explanation> */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IAMService } from '@/modules/iam/iam.service';
import type { UserService } from '@/modules/users/service/user.service';
import type { User } from '@/modules/users/user.types';
import { CityService } from './city.service';
import { InMemoryCityRepository } from './repository/city.inmemory.repository';

function makeUser(overrides: Partial<User> & Pick<User, 'id' | 'role' | 'keycloakId'>): User {
  const now = new Date();
  return {
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('CityService', () => {
  let repository: InMemoryCityRepository;
  let userServiceMocks: {
    syncFromHeaders: ReturnType<typeof vi.fn>;
    getByKeycloakId: ReturnType<typeof vi.fn>;
    getById: ReturnType<typeof vi.fn>;
  };
  let iamMocks: {
    createUser: ReturnType<typeof vi.fn>;
    deleteUser: ReturnType<typeof vi.fn>;
    getUserProfileById: ReturnType<typeof vi.fn>;
    getUserByUsername: ReturnType<typeof vi.fn>;
  };
  let service: CityService;

  beforeEach(() => {
    repository = new InMemoryCityRepository();

    iamMocks = {
      getUserProfileById: vi.fn(),
      getUserByUsername: vi.fn(),
      createUser: vi.fn(async () => ({
        id: 'kc-new-employee',
        username: 'employee-new',
        email: 'employee-new@example.com',
        firstName: 'New',
        lastName: 'Employee',
      })),
      deleteUser: vi.fn(async () => {}),
    };

    const dbEmployee: User = makeUser({
      id: 99,
      keycloakId: 'kc-new-employee',
      role: 'EMPLOYEE',
      username: 'employee-new',
    });

    userServiceMocks = {
      syncFromHeaders: vi.fn(async () => {}),
      getByKeycloakId: vi.fn(async (keycloakId: string) => {
        if (keycloakId === 'kc-new-employee') {
          return dbEmployee;
        }
        return undefined;
      }),
      getById: vi.fn(async (id: number) => {
        if (id === 99) {
          return dbEmployee;
        }
        return undefined;
      }),
    };

    const iamService = iamMocks as unknown as IAMService;
    const userService = userServiceMocks as unknown as UserService;

    service = new CityService(repository, userService, iamService);
  });

  it('listPublicCities maps id and name', async () => {
    await repository.createCity({ id: 'NIC_00001', name: 'Nice', description: 'Desc', adminUserId: 1 });
    const list = await service.listPublicCities();
    expect(list).toEqual([{ id: 'NIC_00001', name: 'Nice', description: 'Desc' }]);
  });

  it('joinCity adds citizen membership', async () => {
    await repository.createCity({ id: 'NIC_00001', name: 'Nice', description: 'Desc', adminUserId: 1 });
    const citizen = makeUser({ id: 10, keycloakId: 'kc-cit', role: 'CITIZEN' });
    await service.joinCity('NIC_00001', citizen);
    await expect(repository.isCitizenMember('NIC_00001', 10)).resolves.toBe(true);
  });

  it('joinCity rejects non-citizens', async () => {
    await repository.createCity({ id: 'NIC_00001', name: 'Nice', description: 'Desc', adminUserId: 1 });
    const admin = makeUser({ id: 11, keycloakId: 'kc-admin', role: 'ADMIN' });
    await expect(service.joinCity('NIC_00001', admin)).rejects.toThrow('Only citizens can join a city');
  });

  it('leaveCity removes citizen membership', async () => {
    await repository.createCity({ id: 'NIC_00001', name: 'Nice', description: 'Desc', adminUserId: 1 });
    const citizen = makeUser({ id: 10, keycloakId: 'kc-cit', role: 'CITIZEN' });
    await repository.addCitizen('NIC_00001', 10);
    await service.leaveCity('NIC_00001', citizen);
    await expect(repository.isCitizenMember('NIC_00001', 10)).resolves.toBe(false);
  });

  it('assignEmployee rejects user already employed in another city', async () => {
    await repository.createCity({ id: 'NIC_00001', name: 'Nice', description: 'Desc', adminUserId: 1 });
    await repository.createCity({ id: 'BIO_00002', name: 'Biot', description: 'Desc', adminUserId: 2 });
    await repository.addEmployee('NIC_00001', 50);
    await expect(service.assignEmployee('BIO_00002', 50)).rejects.toThrow('Employee already assigned to a city');
  });

  it('assignEmployee assigns when employee has no assignment', async () => {
    await repository.createCity({ id: 'NIC_00001', name: 'Nice', description: 'Desc', adminUserId: 1 });
    await service.assignEmployee('NIC_00001', 50);
    await expect(repository.isEmployeeOfCity('NIC_00001', 50)).resolves.toBe(true);
  });

  it('createAndAssignEmployee creates Keycloak user, syncs DB, and assigns employee', async () => {
    await repository.createCity({ id: 'NIC_00001', name: 'Nice', description: 'Desc', adminUserId: 1 });
    await service.createAndAssignEmployee('NIC_00001', {
      username: 'employee-new',
      email: 'employee-new@example.com',
      firstName: 'New',
      lastName: 'Employee',
    });
    expect(iamMocks.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'employee-new',
        realmRoles: ['EMPLOYEE'],
      }),
    );
    expect(userServiceMocks.syncFromHeaders).toHaveBeenCalled();
    await expect(repository.isEmployeeOfCity('NIC_00001', 99)).resolves.toBe(true);
  });

  it('unassignEmployeeAndDeleteIam removes link and deletes user in IAM', async () => {
    await repository.createCity({ id: 'NIC_00001', name: 'Nice', description: 'Desc', adminUserId: 1 });
    await repository.addEmployee('NIC_00001', 99);
    await service.unassignEmployeeAndDeleteIam('NIC_00001', 99);
    await expect(repository.isEmployeeOfCity('NIC_00001', 99)).resolves.toBe(false);
    expect(iamMocks.deleteUser).toHaveBeenCalledWith('kc-new-employee');
  });

  it('isStaffOfCity returns true for city admin', async () => {
    await repository.createCity({ id: 'NIC_00001', name: 'Nice', description: 'Desc', adminUserId: 5 });
    await expect(service.isStaffOfCity('NIC_00001', 5)).resolves.toBe(true);
  });

  it('getScopedCityForAdminOrEmployee returns managed city id for admin', async () => {
    await repository.createCity({ id: 'NIC_00001', name: 'Nice', description: 'Desc', adminUserId: 5 });
    await expect(service.getScopedCityForAdminOrEmployee(5)).resolves.toBe('NIC_00001');
  });
});
