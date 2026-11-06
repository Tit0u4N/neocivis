// Démo : pas de téléchargement d'images au seed (PicsumMediaBlobService ignore le contenu).
export function getCachedImageBuffer(_url: string, _key: string): Promise<Buffer> {
  return Promise.resolve(Buffer.from([0xff]));
}
