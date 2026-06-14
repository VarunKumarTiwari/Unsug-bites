// Single import point for all service clients.
// Screens should ONLY import from '@/lib/api' — never reach into a service's mock directly.

export * as discovery from './discovery';
export * as scan from './scan';
export * as nutrition from './nutrition';
export * as reviews from './reviews';
export * as gamification from './gamification';
export * as users from './users';
export * as recommendations from './recommendations';
