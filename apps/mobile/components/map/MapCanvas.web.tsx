import React, { useRef, useEffect } from 'react';
import { View } from 'react-native';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// maplibre-gl v6 loads its parser as a module Worker from a URL it computes
// relative to the page. In a Metro single-file bundle that file doesn't exist,
// so the worker fails to load. We ship the worker as a static asset in public/
// (copied to the web root on export) and point maplibre at it explicitly.
maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');
import { color } from '@unsung/ui';
import type { RestaurantSummary } from '@unsung/contracts';
import { MapPlaceholder } from './MapPlaceholder';
import { MAP_STYLE_URL, type MapCanvasProps } from './types';

function toFeatureCollection(restaurants: RestaurantSummary[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: restaurants.map((r) => ({
      type: 'Feature',
      id: r.id,
      properties: { restaurantId: r.id },
      geometry: { type: 'Point', coordinates: [r.lng, r.lat] },
    })),
  };
}

// Web canvas — maplibre-gl (GL JS). Same contract as the native MapCanvas:
// moveend → onBoundsChange, cluster tap → zoom, leaf pin tap → onPinPress.
export function MapCanvas({ restaurants, initialCenter, onBoundsChange, onPinPress }: MapCanvasProps) {
  const containerRef = useRef<any>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  // Latest handlers/data in refs so the map-init effect runs once, not on every
  // prop change (which would tear down and rebuild the whole map).
  const onBoundsChangeRef = useRef(onBoundsChange);
  const onPinPressRef = useRef(onPinPress);
  onBoundsChangeRef.current = onBoundsChange;
  onPinPressRef.current = onPinPress;

  // Init once.
  useEffect(() => {
    if (!MAP_STYLE_URL || !containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current as HTMLElement,
      style: MAP_STYLE_URL,
      center: [initialCenter.lng, initialCenter.lat],
      zoom: 13,
    });
    mapRef.current = map;

    const emitBounds = () => {
      const b = map.getBounds();
      onBoundsChangeRef.current({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      });
    };

    map.on('load', () => {
      map.addSource('restaurants', {
        type: 'geojson',
        data: toFeatureCollection(restaurants),
        cluster: true,
        clusterRadius: 50,
      });
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'restaurants',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': color.primary.base,
          'circle-radius': ['step', ['get', 'point_count'], 16, 10, 22, 25, 28],
          'circle-stroke-width': 2,
          'circle-stroke-color': color.surface,
        },
      });
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'restaurants',
        filter: ['has', 'point_count'],
        layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-size': 12 },
        paint: { 'text-color': color.surface },
      });
      map.addLayer({
        id: 'pin',
        type: 'circle',
        source: 'restaurants',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': color.surface,
          'circle-radius': 7,
          'circle-stroke-width': 3,
          'circle-stroke-color': color.primary.base,
        },
      });
      emitBounds(); // first viewport
    });

    map.on('moveend', emitBounds);

    // Cluster tap → zoom to break level.
    map.on('click', 'clusters', async (e) => {
      const feature = e.features?.[0];
      if (!feature) return;
      const clusterId = feature.properties?.cluster_id;
      const src = map.getSource('restaurants') as maplibregl.GeoJSONSource;
      const zoom = await src.getClusterExpansionZoom(clusterId);
      const [lng, lat] = (feature.geometry as GeoJSON.Point).coordinates;
      map.easeTo({ center: [lng, lat], zoom });
    });

    // Leaf pin tap → open sheet.
    map.on('click', 'pin', (e) => {
      const id = e.features?.[0]?.properties?.restaurantId;
      if (id) onPinPressRef.current(String(id));
    });

    const pointer = () => (map.getCanvas().style.cursor = 'pointer');
    const grab = () => (map.getCanvas().style.cursor = '');
    for (const layer of ['clusters', 'pin']) {
      map.on('mouseenter', layer, pointer);
      map.on('mouseleave', layer, grab);
    }

    return () => map.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push new pins/filter into the live source without rebuilding the map.
  useEffect(() => {
    const map = mapRef.current;
    const src = map?.getSource('restaurants') as maplibregl.GeoJSONSource | undefined;
    if (src) src.setData(toFeatureCollection(restaurants));
  }, [restaurants]);

  if (!MAP_STYLE_URL) return <MapPlaceholder />;

  return <View ref={containerRef} style={{ flex: 1 }} />;
}
