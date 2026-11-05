export {};

declare global {
  interface Window {
    /** What `main/preload.cjs` hands the page. Missing in a plain browser. */
    desktop?: {
      platform: string;
      setTheme: (source: 'system' | 'light' | 'dark') => Promise<void>;
      pathForFile: (file: File) => string;
    };
  }
}
