import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
const { publicVars, rawPublicVars } = loadEnv({ prefixes: ['REACT_APP_'] });

export default defineConfig({
  source: {
    define: {
      // Expose publicVars (e.g., REACT_APP_API_URL) directly
      // Rsbuild typically handles this automatically if @rsbuild/plugin-react is used
      ...publicVars
    },
  },
  plugins: [pluginReact()],
  html: {
    title: "Tracking Budget"
  }
});
