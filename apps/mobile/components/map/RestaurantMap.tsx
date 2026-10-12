import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { RestaurantSummary } from '@unsung/contracts';
import { discovery } from '@/lib/api';
import { boundsValid, roundBounds, type Bounds } from '@/lib/geo';
import type { Coords } from '@/hooks/useLocation';
import { MapCanvas } from './MapCanvas';
import { PinSheet } from './PinSheet';

const DEBOUNCE_MS = 300;
// Fallback center when the user hasn't granted GPS — the mock set sits in NYC.
const FALLBACK_CENTER = { lat: 40.6782, lng: -73.9995 };

interface Props {
  userCoords: Coords | null;
  // Selected vibe(s) applied server-side on the Map. Single-select today, but
  // the API takes an array (repeatable vibe= param, OR logic). (spec R10)
  activeVibes: string[];
}

// Map view container: owns the in-bounds query, moveend debounce, vibe filter,
// and the pin preview sheet. The platform canvas (MapCanvas / MapCanvas.web)
// only renders tiles + pins and reports events. (spec §2–5)
export function RestaurantMap({ userCoords, activeVibes }: Props) {
  const [bounds, setBounds] = useState<Bounds | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Round the box for the cache key so sub-tile jitter reuses the response.
  const roundedKey = bounds ? roundBounds(bounds) : null;
  const { data } = useQuery({
    queryKey: ['discovery', 'inBounds', roundedKey, activeVibes],
    // Only runs once we have a valid box (enabled guard). We refetch with the
    // raw bounds — the key is rounded, the request is exact.
    queryFn: () => discovery.getInBounds({ ...bounds!, vibes: activeVibes.length ? activeVibes : undefined }),
    enabled: boundsValid(bounds),
    placeholderData: (prev) => prev, // keep old pins while the next box loads
  });

  const restaurants: RestaurantSummary[] = data ?? [];

  // moveend → debounce → validate → setBounds (which drives the query key).
  const handleBoundsChange = useCallback((next: Bounds) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // Skip boxes the backend would 400 on (missing edge, inverted, antimeridian).
      if (boundsValid(next)) setBounds(next);
    }, DEBOUNCE_MS);
  }, []);

  const selected = useMemo(
    () => restaurants.find((r) => r.id === selectedId) ?? null,
    [restaurants, selectedId],
  );

  const initialCenter = userCoords ?? FALLBACK_CENTER;

  return (
    <>
      <MapCanvas
        restaurants={restaurants}
        initialCenter={initialCenter}
        onBoundsChange={handleBoundsChange}
        onPinPress={setSelectedId}
      />
      <PinSheet restaurant={selected} userCoords={userCoords} onClose={() => setSelectedId(null)} />
    </>
  );
}
