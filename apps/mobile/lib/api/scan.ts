import type { ScanResult } from '@unsung/contracts';
import scanCarbonara from '@/lib/mock/scan_carbonara.json';
import { fakeLatency } from './_latency';

export async function submitScan(_imageUri: string, _restaurantId?: string): Promise<ScanResult> {
  await fakeLatency(1400); // simulate vision-model thinking
  return scanCarbonara as ScanResult;
}
