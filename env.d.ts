/// <reference types="vitepress/client" />

declare module 'posthub-vitepress-theme/config' {
  import { UserConfig } from 'vitepress';

  const config: () => Promise<UserConfig>;

  export default config;
}
