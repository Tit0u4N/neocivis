import { startAutoSeedOnStartup } from '@/core/auto-seed';
import {
  createAccessRepository,
  createArticleRepository,
  createCityRepository,
  createConfigRepository,
  createMediaRepository,
  createUserRepository,
} from '@/core/in-memory-repositories';
import { isInMemoryMode } from '@/core/runtime-config';
import { AccessService } from '@/modules/access/access.service';
import { CityService } from '@/modules/city/city.service';
import { KeycloakIAMService } from '@/modules/iam/keycloak-iam.service';
import { AzureMediaBlobService, PicsumMediaBlobService } from '@/modules/media/media-blob.service';
import { UserService } from '@/modules/users/service/user.service';

/**
 * Runs auto-seed once at process startup (before any gateway module loads).
 * Must include media + config so article/carousel seeders can resolve blob URLs and links[].
 */
async function bootstrapAutoSeed(): Promise<void> {
  const userRepository = createUserRepository();
  const articleRepository = createArticleRepository();
  const cityRepository = createCityRepository();
  const accessRepository = createAccessRepository();
  const configRepository = createConfigRepository();
  const mediaBlobService = isInMemoryMode() ? new PicsumMediaBlobService() : new AzureMediaBlobService();
  const mediaRepository = createMediaRepository();

  const iamService = new KeycloakIAMService();
  const userService = new UserService(userRepository, iamService);
  const cityService = new CityService(cityRepository, userService, iamService);
  const accessService = new AccessService(accessRepository, cityService, userService);

  await startAutoSeedOnStartup({
    userService,
    articleRepository,
    cityRepository,
    iamService,
    accessService,
    mediaRepository,
    mediaBlobService,
    configRepository,
  });
}

await bootstrapAutoSeed();
