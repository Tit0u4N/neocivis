import type { Article, ArticleTranslation } from '@repo/contracts/article';

export function collectArticleImageUrls(article: Pick<Article, 'coverImageUrl' | 'translations'>): Set<string> {
  const urls = new Set<string>();
  if (article.coverImageUrl?.trim()) {
    urls.add(article.coverImageUrl.trim());
  }
  for (const translation of article.translations) {
    collectContentImageUrls(translation.content, urls);
  }
  return urls;
}

function collectContentImageUrls(content: unknown, urls: Set<string>): void {
  if (!Array.isArray(content)) {
    return;
  }
  for (const node of content) {
    if (!node || typeof node !== 'object') {
      continue;
    }
    const record = node as Record<string, unknown>;
    if (record.type === 'img' && typeof record.url === 'string' && record.url.trim()) {
      urls.add(record.url.trim());
    }
    if (Array.isArray(record.children)) {
      collectContentImageUrls(record.children, urls);
    }
  }
}

export function getArticleLinkTitle(translations: ArticleTranslation[]): string {
  return translations.find((t) => t.locale === 'fr')?.title ?? translations[0]?.title ?? 'Article';
}
