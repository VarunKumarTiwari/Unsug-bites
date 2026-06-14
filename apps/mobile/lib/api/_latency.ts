// Simulates network latency so the UI can render real loading states.
export const fakeLatency = (ms = 350) => new Promise((r) => setTimeout(r, ms));
