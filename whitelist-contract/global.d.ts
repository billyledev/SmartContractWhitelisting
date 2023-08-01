declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined
    MERKLE_ROOT: string
  }
}
