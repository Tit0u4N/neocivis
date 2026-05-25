import type { MediaImage } from '@repo/contracts/media';
import type { KyInstance } from 'ky';
import AbstractService from '../AbstractService';

export class MediaService extends AbstractService {
  constructor(kyInstance: KyInstance, cityId: string) {
    super(kyInstance, `/cities/${cityId}`);
  }

  async getAll(): Promise<MediaImage[]> {
    return await this.http.get('media').json<MediaImage[]>();
  }

  async upload(file: File, title?: string): Promise<MediaImage> {
    const formData = new FormData();
    formData.append('file', file);
    if (title) {
      formData.append('title', title);
    }
    return await this.http
      .extend({ headers: { 'Content-Type': undefined } })
      .post('media/upload', { body: formData })
      .json<MediaImage>();
  }

  async delete(id: string): Promise<void> {
    await this.http.delete(`media/${id}`);
  }
}
