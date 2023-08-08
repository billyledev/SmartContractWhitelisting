declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined
    REPORT_GAS: string
    MERKLE_ROOT: string
  }
}
