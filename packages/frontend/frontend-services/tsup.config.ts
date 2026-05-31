import { defineConfig, type Options } from 'tsup';

export default defineConfig((options: Options) => ({
  entry: {
    index: 'src/index.ts',
    article: 'src/article/article.service.ts',
    auth: 'src/auth/auth.service.ts',
    city: 'src/city/city.service.ts',
    config: 'src/config/config.service.ts',
    establishment: 'src/establishment/establishment.service.ts',
    permission: 'src/permission/permission.service.ts',
    report: 'src/report/report.service.ts',
    upload: 'src/upload/upload.service.ts',
    media: 'src/media/media.service.ts',
    testing: 'src/testing.ts',
  },
  clean: true,
  format: ['cjs', 'esm'],
  dts: true,
  ...options,
}));
