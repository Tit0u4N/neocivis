import { describe, expect, it, vi } from 'vitest';
import { ReportService } from './report.service';

describe('ReportService', () => {
  it('should instantiate with a ky instance', () => {
    const fakeKy = { extend: vi.fn().mockReturnValue({}) } as any;
    const service = new ReportService(fakeKy);
    expect(service).toBeInstanceOf(ReportService);
  });
});
