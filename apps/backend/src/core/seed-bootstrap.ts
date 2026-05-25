import { startAutoSeedOnStartup } from '@/core/auto-seed';
import { isInMemoryMode } from '@/core/runtime-config';
import { AccessService } from '@/modules/access/access.service';
import { DrizzleAccessRepository } from '@/modules/access/repository/access.drizzle.repository';
import { InMemoryAccessRepository } from '@/modules/access/repository/access.inmemory.repository';
import { CosmosArticleRepository } from '@/modules/article/repository/article.cosmos.repository';
import { InMemoryArticleRepository } from '@/modules/article/repository/article.inmemory.repository';
import { CityService } from '@/modules/city/city.service';
import { DrizzleCityRepository } from '@/modules/city/repository/city.drizzle.repository';
import { InMemoryCityRepository } from '@/modules/city/repository/city.inmemory.repository';
import { InMemoryConfigRepository } from '@/modules/config/repository/config.inmemory.repository';
import { KeycloakIAMService } from '@/modules/iam/keycloak-iam.service';
import { AzureMediaBlobService, PicsumMediaBlobService } from '@/modules/media/media-blob.service';
import { CosmosMediaRepository } from '@/modules/media/repository/media.cosmos.repository';
import { InMemoryMediaRepository } from '@/modules/media/repository/media.inmemory.repository';
import { DrizzleUserRepository } from '@/modules/users/repository/user.drizzle.repository';
import { InMemoryUserRepository } from '@/modules/users/repository/user.inmemory.repository';
import { UserService } from '@/modules/users/service/user.service';

/**
 * Runs auto-seed once at process startup (before any gateway module loads).
 * Must include media + config so article/carousel seeders can resolve blob URLs and links[].
 */
async function bootstrapAutoSeed(): Promise<void> {
  const userRepository = isInMemoryMode() ? new InMemoryUserRepository() : new DrizzleUserRepository();
  const articleRepository = isInMemoryMode() ? new InMemoryArticleRepository() : new CosmosArticleRepository();
  const cityRepository = isInMemoryMode() ? new InMemoryCityRepository() : new DrizzleCityRepository();
  const accessRepository = isInMemoryMode() ? new InMemoryAccessRepository() : new DrizzleAccessRepository();
  const configRepository = new InMemoryConfigRepository();
  const mediaBlobService = isInMemoryMode() ? new PicsumMediaBlobService() : new AzureMediaBlobService();
  const mediaRepository = isInMemoryMode() ? new InMemoryMediaRepository() : new CosmosMediaRepository();

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
