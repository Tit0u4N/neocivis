import type { PermissionKey } from '@repo/contracts';
import type { AccessService } from '@/modules/access/access.service';
import type { CityService } from '@/modules/city/city.service';
import type { UserService } from '@/modules/users/service/user.service';
import { requireCityAdmin, requirePermission } from './permission.middleware';

export class PermissionGuard {
  constructor(
    private readonly accessService: AccessService,
    private readonly userService: UserService,
    private readonly cityService: CityService,
  ) {}

  require(key: PermissionKey) {
    return requirePermission(key, this.accessService, this.userService);
  }

  requireAdmin() {
    return requireCityAdmin(this.cityService, this.userService);
  }
}
