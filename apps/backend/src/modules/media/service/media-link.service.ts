import type { Article } from '@repo/contracts/article';
import type { MediaImageLink } from '@repo/contracts/media';
import { collectArticleImageUrls, getArticleLinkTitle } from '../article-image-urls';
import type { IMediaRepository } from '../repository/media.repository.interface';
import { appendMediaLink } from '../repository/media.repository.interface';

export class MediaLinkService {
  constructor(private readonly mediaRepository: IMediaRepository) {}

  async syncArticleMediaLinks(article: Article): Promise<void> {
    const imageUrls = collectArticleImageUrls(article);
    const cityMedia = await this.mediaRepository.findByCityId(article.cityId);
    const link: MediaImageLink = {
      idLink: article.id,
      type: 'articles',
      title: getArticleLinkTitle(article.translations),
    };

    for (const media of cityMedia) {
      const used = imageUrls.has(media.url);
      const hasLink = media.links.some((l) => l.idLink === article.id && l.type === 'articles');

      if (used) {
        const withoutArticle = media.links.filter((l) => !(l.idLink === article.id && l.type === 'articles'));
        await this.mediaRepository.update(media.id, { links: appendMediaLink(withoutArticle, link) });
      } else if (hasLink) {
        await this.mediaRepository.update(media.id, {
          links: media.links.filter((l) => !(l.idLink === article.id && l.type === 'articles')),
        });
      }
    }
  }

  async removeArticleMediaLinks(cityId: string, articleId: string): Promise<void> {
    const cityMedia = await this.mediaRepository.findByCityId(cityId);
    for (const media of cityMedia) {
      const filtered = media.links.filter((l) => !(l.idLink === articleId && l.type === 'articles'));
      if (filtered.length !== media.links.length) {
        await this.mediaRepository.update(media.id, { links: filtered });
      }
    }
  }
}
