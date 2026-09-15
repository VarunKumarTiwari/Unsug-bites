import { Platform } from 'react-native';
import type { ScanResult } from '@unsung/contracts';
import scanCarbonara from '@/lib/mock/scan_carbonara.json';
import { apiFetch, withMock } from './_client';

export async function submitScan(imageUri: string, restaurantId?: string): Promise<ScanResult> {
  return withMock(
    'scan.submitScan',
    async () => {
      const form = new FormData();
      // Web: the RN { uri, name, type } shape stringifies to "[object Object]" and no file
      // part is sent — fetch the uri into a real Blob. Native: use the RN file-part shape.
      if (Platform.OS === 'web') {
        const blob = await (await fetch(imageUri)).blob();
        form.append('image', blob, 'scan.jpg');
      } else {
        form.append('image', { uri: imageUri, name: 'scan.jpg', type: 'image/jpeg' } as any);
      }
      if (restaurantId) form.append('restaurantId', restaurantId);
      // Vision inference is slow — give it a longer timeout than the default.
      return apiFetch<ScanResult>('/scan', { method: 'POST', body: form, timeoutMs: 20000 });
    },
    () => scanCarbonara as ScanResult,
  );
}
