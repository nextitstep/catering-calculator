// Client-side only gate: this PIN is bundled into the shipped JS and is not a real secret.
// It keeps casual visitors out, not a determined one - the Firebase rules are the actual
// boundary for the data itself.
export const APP_PIN = '110799';

export const APP_LOCK_STORAGE_KEY = 'catering-calc/unlocked';
