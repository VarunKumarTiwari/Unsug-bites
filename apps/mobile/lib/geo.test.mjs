// Self-check for lib/geo.ts — runnable with `node geo.test.mjs`. Mirrors the
// logic (geo.ts is TS/RN; this is a plain-JS port of the pure functions) so a
// broken box guard or distance calc fails loudly. No framework.
import assert from 'node:assert';

function boundsValid(b) {
  if (!b) return false;
  const { north, south, east, west } = b;
  if (![north, south, east, west].every((v) => typeof v === 'number' && Number.isFinite(v))) return false;
  if (north <= south) return false;
  if (west > east) return false;
  return true;
}
function haversineKm(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat));
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Valid box
assert.equal(boundsValid({ north: 53.37, south: 53.33, east: -6.24, west: -6.28 }), true);
// Missing edge
assert.equal(boundsValid({ north: 1, south: 0, east: 1 }), false);
// north <= south
assert.equal(boundsValid({ north: 10, south: 10, east: 1, west: 0 }), false);
assert.equal(boundsValid({ north: 5, south: 10, east: 1, west: 0 }), false);
// Antimeridian: west > east
assert.equal(boundsValid({ north: 1, south: 0, east: -179, west: 179 }), false);
// NaN edge
assert.equal(boundsValid({ north: NaN, south: 0, east: 1, west: 0 }), false);

// Distance: ~0 for same point, and a known-ish NYC hop under a few km.
assert.ok(haversineKm({ lat: 40.6782, lng: -74.0095 }, { lat: 40.6782, lng: -74.0095 }) < 0.001);
const d = haversineKm({ lat: 40.6782, lng: -74.0095 }, { lat: 40.6541, lng: -74.0098 });
assert.ok(d > 2 && d < 3, `expected ~2.7km, got ${d}`);

console.log('geo.test.mjs: all assertions passed');
