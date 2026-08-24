import type { ScanResult } from '@unsung/contracts';
import scanCarbonara from '@/lib/mock/scan_carbonara.json';
import { apiFetch, withMock } from './_client';

export async function submitScan(imageUri: string, restaurantId?: string): Promise<ScanResult> {
  return withMock(
    'scan.submitScan',
    () => {
      const form = new FormData();
      // RN multipart file part shape: { uri, name, type }.
      form.append('image', { uri: imageUri, name: 'scan.jpg', type: 'image/jpeg' } as any);
      if (restaurantId) form.append('restaurantId', restaurantId);
      // Vision inference is slow — give it a longer timeout than the default.
      return apiFetch<ScanResult>('/scan', { method: 'POST', body: form, timeoutMs: 20000 });
    },
    () => scanCarbonara as ScanResult,
  );
}
