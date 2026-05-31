import { getAutoSeedMode, isInMemoryMode } from '@/core/runtime-config';
import type { AccessService } from '@/modules/access/access.service';
import { AccessSeeder } from '@/modules/access/seed/access.seeder';
import type { IArticleRepository } from '@/modules/article/repository/article.repository.interface';
import { ArticleSeeder } from '@/modules/article/seed/article.seeder';
import { CityService } from '@/modules/city/city.service';
import type { ICityRepository } from '@/modules/city/repository/city.repository.interface';
import { CitySeeder } from '@/modules/city/seed/city.seeder';
import type { IConfigRepository } from '@/modules/config/repository/config.repository.interface';
import { ConfigSeeder } from '@/modules/config/seed/config.seeder';
import type { IEstablishmentRepository } from '@/modules/establishment/repository/establishment.repository.interface';
import { EstablishmentSeeder } from '@/modules/establishment/seed/establishment.seeder';
import type { IAMService } from '@/modules/iam/iam.service';
import type { IMediaBlobService } from '@/modules/media/media-blob.service';
import type { IMediaRepository } from '@/modules/media/repository/media.repository.interface';
import { MediaSeeder } from '@/modules/media/seed/media.seeder';
import { UserSeeder } from '@/modules/users/seed/user.seeder';
import type { UserService } from '@/modules/users/service/user.service';
import type { AutoSeedMode } from './runtime-config';
import type { ISeeder } from './seeder.interface';

export type AutoSeedDeps = {
  userService: UserService;
  articleRepository: IArticleRepository;
  cityRepository: ICityRepository;
  establishmentRepository: IEstablishmentRepository;
  iamService: IAMService;
  accessService: AccessService;
  mediaRepository?: IMediaRepository;
  mediaBlobService?: IMediaBlobService;
  configRepository?: IConfigRepository;
};

const AUTO_SEED_GLOBAL_KEY = '__neocivis_auto_seed_started__';

function hasStarted(): boolean {
  return (globalThis as Record<string, unknown>)[AUTO_SEED_GLOBAL_KEY] === true;
}

function markStarted(): void {
  (globalThis as Record<string, unknown>)[AUTO_SEED_GLOBAL_KEY] = true;
}

export async function startAutoSeedOnStartup(deps: AutoSeedDeps): Promise<void> {
  const mode = getAutoSeedMode();
  if (!mode) {
    return;
  }
  if (hasStarted() && !isInMemoryMode()) {
    return;
  }
  markStarted();

  await runSeeders(deps, mode).catch((err: unknown) => {
    // biome-ignore lint/suspicious/noConsole: startup seeding diagnostics
    console.error('[auto-seed] failed', err);
  });
}

export async function runSeeders(deps: AutoSeedDeps, mode: AutoSeedMode): Promise<void> {
  const cityService = new CityService(deps.cityRepository, deps.userService, deps.iamService);
  const seederList: ISeeder[] = [
    new UserSeeder(deps.userService),
    new CitySeeder(deps.cityRepository, cityService, deps.userService),
    new AccessSeeder(deps.accessService, cityService),
  ];

  if (deps.mediaRepository && deps.mediaBlobService) {
    seederList.push(new MediaSeeder(deps.mediaRepository, cityService, deps.mediaBlobService));
  }

  // Establishment seeder runs after media so it can resolve media URLs and sync links.
  seederList.push(new EstablishmentSeeder(deps.establishmentRepository, cityService, deps.mediaRepository));

  if (deps.configRepository && deps.mediaRepository) {
    seederList.push(new ConfigSeeder(deps.configRepository, deps.mediaRepository, cityService));
  }

  seederList.push(new ArticleSeeder(deps.articleRepository, cityService, deps.mediaRepository));

  if (mode === 'RESET_DATA') {
    const deleteOrder = [...seederList].reverse();
    for (const seeder of deleteOrder) {
      await seeder.deleteAll();
    }
  }

  for (const seeder of seederList) {
    await seeder.seed();
  }
}
