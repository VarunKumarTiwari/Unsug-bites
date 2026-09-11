import { useState, useCallback } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import * as Location from 'expo-location';

export type Coords = { lat: number; lng: number };
type Status = 'idle' | 'requesting' | 'granted' | 'denied';

// GPS is an opt-in upgrade, not a requirement. With no coords the server
// resolves the user's city from their IP,so the feed is already location-aware.
// This hook backs the "Use my location" button, which requests precise
// GPS for exact nearby results.
export function useLocation() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [status, setStatus] = useState<Status>('idle');

  const requestLocation = useCallback(async () => {
    setStatus('requesting');
    try {
      // The OS/browser dialog only appears the FIRST time. If already denied,
      // requesting again resolves silently (canAskAgain=false) — so we route
      // the user to Settings, otherwise the button tap would do nothing.
      const { status: perm, canAskAgain } =
        await Location.requestForegroundPermissionsAsync();

      if (perm !== 'granted') {
        setStatus('denied');
        if (!canAskAgain && Platform.OS !== 'web') {
          Alert.alert(
            'Location is off',
            'Enable location for Unsung Bites in Settings to see exact spots near you.',
            [
              { text: 'Not now', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: () =>
                  Platform.OS === 'ios'
                    ? Linking.openURL('app-settings:')
                    : Linking.openSettings(),
              },
            ],
          );
        }
        return null;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setCoords(next);
      setStatus('granted');
      return next;
    } catch {
      // Location unavailable/timed out → fall back to the IP-based city feed.
      setStatus('denied');
      return null;
    }
  }, []);

  return { coords, status, requestLocation };
}
