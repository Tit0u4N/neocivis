export class PermissionService {
  // TODO: wire to real API when permissions endpoint is ready
  fetchPermissions(): Promise<{ permissions: string[]; role: string }> {
    return Promise.resolve({ permissions: [], role: 'admin' });
  }
}
