import { defineConfig, type Options } from 'tsup';

export default defineConfig((options: Options) => ({
  entry: {
    index: 'src/index.ts',
    article: 'src/article/article.schema.ts',
    city: 'src/city/city.schema.ts',
    config: 'src/config/config.schema.ts',
    dto: 'src/dto/index.ts',
    'error-messages': 'src/error-messages/index.ts',
    establishment: 'src/establishment/establishment.schema.ts',
    permission: 'src/permission/permission.schema.ts',
    report: 'src/report/report.schema.ts',
    role: 'src/role/role.schema.ts',
    thread: 'src/thread/thread.schema.ts',
    upload: 'src/upload/upload.dto.ts',
    user: 'src/user/user.dto.ts',
  },
  clean: true,
  format: ['cjs', 'esm'],
  dts: true,
  ...options,
}));
