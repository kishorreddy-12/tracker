/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Supabase
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_SUPABASE_PROJECT_ID: string
  
  // App Configuration
  readonly VITE_MAX_IMAGE_SIZE_MB: string
  readonly VITE_IMAGE_COMPRESSION_QUALITY: string
  readonly VITE_IMAGE_MAX_WIDTH: string
  readonly VITE_OFFLINE_SYNC_RETRY_LIMIT: string
  readonly VITE_OFFLINE_CACHE_DURATION_DAYS: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_SHORT_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
