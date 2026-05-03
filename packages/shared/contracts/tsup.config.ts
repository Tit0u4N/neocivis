import { defineConfig, type Options } from 'tsup';

export default defineConfig((options: Options) => ({
  entry: {
    index: 'src/index.ts',
    article: 'src/article/article.schema.ts',
    config: 'src/config/config.schema.ts',
    dto: 'src/dto/index.ts',
    'error-messages': 'src/error-messages/index.ts',
    report: 'src/report/report.schema.ts',
    upload: 'src/upload/upload.dto.ts',
    user: 'src/user/user.dto.ts',
  },
  clean: true,
  format: ['cjs', 'esm'],
  dts: true,
  ...options,
}));
