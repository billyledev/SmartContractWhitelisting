declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined
    HOST: string
    PORT: string
    USE_REDIS: string
    REDIS_HOST: string
    REDIS_PORT: string
  }
}
