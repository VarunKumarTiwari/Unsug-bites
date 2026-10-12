import React, { useRef, useCallback } from 'react';
import { View } from 'react-native';
import {
  MapView,
  Camera,
  ShapeSource,
  CircleLayer,
  SymbolLayer,
  type MapViewRef,
  type CameraRef,
  type ShapeSourceRef,
  type OnPressEvent,
} from '@maplibre/maplibre-react-native';
import { color } from '@unsung/ui';
import type { RestaurantSummary } from '@unsung/contracts';
import { MapPlaceholder } from './MapPlaceholder';
import { MAP_STYLE_URL, type MapCanvasProps } from './types';

// Restaurants → GeoJSON points. The whole summary rides in `properties` so the
// sheet needs no extra lookup; `id` lets MapLibre dedupe features.
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

export function MapCanvas({ restaurants, initialCenter, onBoundsChange, onPinPress }: MapCanvasProps) {
  const mapRef = useRef<MapViewRef>(null);
  const cameraRef = useRef<CameraRef>(null);
  const sourceRef = useRef<ShapeSourceRef>(null);

  // After a pan/zoom settles, read the viewport edges. getVisibleBounds()
  // returns [[neLng, neLat], [swLng, swLat]].
  const handleRegionDidChange = useCallback(async () => {
    const b = await mapRef.current?.getVisibleBounds();
    if (!b) return;
    const [[east, north], [west, south]] = b;
    onBoundsChange({ north, south, east, west });
  }, [onBoundsChange]);

  // Tap on the source: a cluster expands (zoom to its break level); a leaf pin
  // opens the sheet. Clusters never bubble up to the caller.
  const handlePress = useCallback(
    async (e: OnPressEvent) => {
      const feature = e.features?.[0];
      if (!feature) return;
      const props = feature.properties ?? {};
      if (props.cluster) {
        const zoom = await sourceRef.current?.getClusterExpansionZoom(feature);
        const [lng, lat] = (feature.geometry as GeoJSON.Point).coordinates;
        if (zoom != null) cameraRef.current?.setCamera({ centerCoordinate: [lng, lat], zoomLevel: zoom, animationDuration: 300 });
        return;
      }
      if (props.restaurantId) onPinPress(String(props.restaurantId));
    },
    [onPinPress],
  );

  // No MapTiler key → graceful placeholder, never a crash.
  if (!MAP_STYLE_URL) return <MapPlaceholder />;

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        mapStyle={MAP_STYLE_URL}
        onRegionDidChange={handleRegionDidChange}
        onDidFinishLoadingMap={handleRegionDidChange}
      >
        <Camera
          ref={cameraRef}
          defaultSettings={{ centerCoordinate: [initialCenter.lng, initialCenter.lat], zoomLevel: 13 }}
        />
        <ShapeSource
          ref={sourceRef}
          id="restaurants"
          shape={toFeatureCollection(restaurants)}
          cluster
          clusterRadius={50}
          onPress={handlePress}
        >
          {/* Cluster bubble */}
          <CircleLayer
            id="clusters"
            filter={['has', 'point_count']}
            style={{
              circleColor: color.primary.base,
              circleRadius: ['step', ['get', 'point_count'], 16, 10, 22, 25, 28],
              circleStrokeWidth: 2,
              circleStrokeColor: color.surface,
            }}
          />
          {/* Cluster count */}
          <SymbolLayer
            id="cluster-count"
            filter={['has', 'point_count']}
            style={{
              textField: ['get', 'point_count_abbreviated'],
              textSize: 12,
              textColor: color.surface,
            }}
          />
          {/* Single pin */}
          <CircleLayer
            id="pin"
            filter={['!', ['has', 'point_count']]}
            style={{
              circleColor: color.surface,
              circleRadius: 7,
              circleStrokeWidth: 3,
              circleStrokeColor: color.primary.base,
            }}
          />
        </ShapeSource>
      </MapView>
    </View>
  );
}
