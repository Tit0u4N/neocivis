import { isInMemoryMode } from '@/core/runtime-config';
import { DrizzleAccessRepository } from '@/modules/access/repository/access.drizzle.repository';
import { InMemoryAccessRepository } from '@/modules/access/repository/access.inmemory.repository';
import type { IAccessRepository } from '@/modules/access/repository/access.repository.interface';
import { CosmosArticleRepository } from '@/modules/article/repository/article.cosmos.repository';
import { InMemoryArticleRepository } from '@/modules/article/repository/article.inmemory.repository';
import type { IArticleRepository } from '@/modules/article/repository/article.repository.interface';
import { DrizzleCityRepository } from '@/modules/city/repository/city.drizzle.repository';
import { InMemoryCityRepository } from '@/modules/city/repository/city.inmemory.repository';
import type { ICityRepository } from '@/modules/city/repository/city.repository.interface';
import { CosmosConfigRepository } from '@/modules/config/repository/config.cosmos.repository';
import { InMemoryConfigRepository } from '@/modules/config/repository/config.inmemory.repository';
import type { IConfigRepository } from '@/modules/config/repository/config.repository.interface';
import { DrizzleEstablishmentRepository } from '@/modules/establishment/repository/establishment.drizzle.repository';
import { InMemoryEstablishmentRepository } from '@/modules/establishment/repository/establishment.inmemory.repository';
import type { IEstablishmentRepository } from '@/modules/establishment/repository/establishment.repository.interface';
import { CosmosMediaRepository } from '@/modules/media/repository/media.cosmos.repository';
import { InMemoryMediaRepository } from '@/modules/media/repository/media.inmemory.repository';
import type { IMediaRepository } from '@/modules/media/repository/media.repository.interface';
import { InMemoryReportRepository } from '@/modules/report/repository/report.inmemory.repository';
import type { IReportRepository } from '@/modules/report/repository/report.repository.interface';
import { DrizzleUserRepository } from '@/modules/users/repository/user.drizzle.repository';
import { InMemoryUserRepository } from '@/modules/users/repository/user.inmemory.repository';
import type { IUserRepository } from '@/modules/users/repository/user.repository.interface';

/**
 * Singleton in-memory stores shared across seed-bootstrap and all gateways
 * within the same Azure Functions worker process.
 */
let userRepository: InMemoryUserRepository | undefined;
let articleRepository: InMemoryArticleRepository | undefined;
let cityRepository: InMemoryCityRepository | undefined;
let accessRepository: InMemoryAccessRepository | undefined;
let mediaRepository: InMemoryMediaRepository | undefined;
let configRepository: InMemoryConfigRepository | undefined;
let reportRepository: InMemoryReportRepository | undefined;
let establishmentRepository: InMemoryEstablishmentRepository | undefined;

function sharedUserRepository(): InMemoryUserRepository {
  userRepository ??= new InMemoryUserRepository();
  return userRepository;
}

function sharedArticleRepository(): InMemoryArticleRepository {
  articleRepository ??= new InMemoryArticleRepository();
  return articleRepository;
}

function sharedCityRepository(): InMemoryCityRepository {
  cityRepository ??= new InMemoryCityRepository();
  return cityRepository;
}

function sharedAccessRepository(): InMemoryAccessRepository {
  accessRepository ??= new InMemoryAccessRepository();
  return accessRepository;
}

function sharedMediaRepository(): InMemoryMediaRepository {
  mediaRepository ??= new InMemoryMediaRepository();
  return mediaRepository;
}

function sharedConfigRepository(): InMemoryConfigRepository {
  configRepository ??= new InMemoryConfigRepository();
  return configRepository;
}

function sharedReportRepository(): InMemoryReportRepository {
  reportRepository ??= new InMemoryReportRepository();
  return reportRepository;
}

function sharedEstablishmentRepository(): InMemoryEstablishmentRepository {
  establishmentRepository ??= new InMemoryEstablishmentRepository();
  return establishmentRepository;
}

export function createUserRepository(): IUserRepository {
  return isInMemoryMode() ? sharedUserRepository() : new DrizzleUserRepository();
}

export function createArticleRepository(): IArticleRepository {
  return isInMemoryMode() ? sharedArticleRepository() : new CosmosArticleRepository();
}

export function createCityRepository(): ICityRepository {
  return isInMemoryMode() ? sharedCityRepository() : new DrizzleCityRepository();
}

export function createAccessRepository(): IAccessRepository {
  return isInMemoryMode() ? sharedAccessRepository() : new DrizzleAccessRepository();
}

export function createMediaRepository(): IMediaRepository {
  return isInMemoryMode() ? sharedMediaRepository() : new CosmosMediaRepository();
}

export function createConfigRepository(): IConfigRepository {
  return isInMemoryMode() ? sharedConfigRepository() : new CosmosConfigRepository();
}

export function createReportRepository(): IReportRepository {
  return isInMemoryMode() ? sharedReportRepository() : new InMemoryReportRepository();
}

export function createEstablishmentRepository(): IEstablishmentRepository {
  return isInMemoryMode() ? sharedEstablishmentRepository() : new DrizzleEstablishmentRepository();
}
