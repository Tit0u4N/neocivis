import type { KyInstance } from 'ky';
import AbstractService from '../AbstractService';

export class UploadService extends AbstractService {
  constructor(kyInstance: KyInstance) {
    super(kyInstance, '');
  }

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    // Remove the default Content-Type so fetch can set multipart/form-data + boundary automatically
    const res = await this.http
      .extend({ headers: { 'Content-Type': undefined } })
      .post('uploads/image', { body: formData })
      .json<{ url: string }>();
    return res.url;
  }
}
