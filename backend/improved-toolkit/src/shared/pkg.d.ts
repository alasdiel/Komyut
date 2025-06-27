declare namespace NodeJS {
  interface Process {
    /**
     * This property is injected by the 'pkg' tool when the application is bundled into an executable.
     * It allows checking if the application is running within a 'pkg' executable.
     */
    readonly pkg?: {
      entrypoint: string;
      defaultEntrypoint: string;
    };
  }
}