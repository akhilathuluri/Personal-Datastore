/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_OPENWEATHER_API_KEY: string
  // ... other env variables
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
