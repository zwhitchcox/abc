// vite.config.ts
import { vitePlugin as remix } from "file:///Users/zwhitchcox/dev/zwhitchcox/abc/node_modules/.pnpm/@remix-run+dev@2.13.1_@remix-run+react@2.13.1_react-dom@18.3.1_react@18.3.1__react@18.3.1_typ_yohgwgu5esjqrbxjgzrkfmkbsq/node_modules/@remix-run/dev/dist/index.js";
import { sentryVitePlugin } from "file:///Users/zwhitchcox/dev/zwhitchcox/abc/node_modules/.pnpm/@sentry+vite-plugin@2.22.6/node_modules/@sentry/vite-plugin/dist/esm/index.mjs";
import { glob } from "file:///Users/zwhitchcox/dev/zwhitchcox/abc/node_modules/.pnpm/glob@11.0.0/node_modules/glob/dist/esm/index.js";
import { flatRoutes } from "file:///Users/zwhitchcox/dev/zwhitchcox/abc/node_modules/.pnpm/remix-flat-routes@0.6.5_@remix-run+dev@2.13.1_@remix-run+react@2.13.1_react-dom@18.3.1_react@_v2tw3fmuy35v7crhaywxch5l3q/node_modules/remix-flat-routes/dist/index.js";
import { defineConfig } from "file:///Users/zwhitchcox/dev/zwhitchcox/abc/node_modules/.pnpm/vite@5.4.10_@types+node@20.17.6/node_modules/vite/dist/node/index.js";
import { envOnlyMacros } from "file:///Users/zwhitchcox/dev/zwhitchcox/abc/node_modules/.pnpm/vite-env-only@3.0.3_vite@5.4.10_@types+node@20.17.6_/node_modules/vite-env-only/dist/index.js";
var MODE = process.env.NODE_ENV;
var vite_config_default = defineConfig({
  build: {
    cssMinify: MODE === "production",
    rollupOptions: {
      external: [/node:.*/, "fsevents"]
    },
    assetsInlineLimit: (source) => {
      if (source.endsWith("sprite.svg") || source.endsWith("favicon.svg") || source.endsWith("apple-touch-icon.png")) {
        return false;
      }
    },
    sourcemap: true
  },
  server: {
    watch: {
      ignored: ["**/playwright-report/**"]
    }
  },
  plugins: [
    envOnlyMacros(),
    // it would be really nice to have this enabled in tests, but we'll have to
    // wait until https://github.com/remix-run/remix/issues/9871 is fixed
    process.env.NODE_ENV === "test" ? null : remix({
      ignoredRouteFiles: ["**/*"],
      serverModuleFormat: "esm",
      future: {
        unstable_optimizeDeps: true,
        v3_fetcherPersist: true,
        v3_lazyRouteDiscovery: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true
      },
      routes: async (defineRoutes) => {
        return flatRoutes("routes", defineRoutes, {
          ignoredRouteFiles: [
            ".*",
            "**/*.css",
            "**/*.test.{js,jsx,ts,tsx}",
            "**/__*.*",
            // This is for server-side utilities you want to colocate
            // next to your routes without making an additional
            // directory. If you need a route that includes "server" or
            // "client" in the filename, use the escape brackets like:
            // my-route.[server].tsx
            "**/*.server.*",
            "**/*.client.*"
          ]
        });
      }
    }),
    process.env.SENTRY_AUTH_TOKEN ? sentryVitePlugin({
      disable: MODE !== "production",
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      release: {
        name: process.env.COMMIT_SHA,
        setCommits: {
          auto: true
        }
      },
      sourcemaps: {
        filesToDeleteAfterUpload: await glob([
          "./build/**/*.map",
          ".server-build/**/*.map"
        ])
      }
    }) : null
  ],
  test: {
    include: ["./app/**/*.test.{ts,tsx}"],
    setupFiles: ["./tests/setup/setup-test-env.ts"],
    globalSetup: ["./tests/setup/global-setup.ts"],
    restoreMocks: true,
    coverage: {
      include: ["app/**/*.{ts,tsx}"],
      all: true
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvendoaXRjaGNveC9kZXYvendoaXRjaGNveC9hYmNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy96d2hpdGNoY294L2Rldi96d2hpdGNoY294L2FiYy92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvendoaXRjaGNveC9kZXYvendoaXRjaGNveC9hYmMvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyB2aXRlUGx1Z2luIGFzIHJlbWl4IH0gZnJvbSAnQHJlbWl4LXJ1bi9kZXYnXG5pbXBvcnQgeyBzZW50cnlWaXRlUGx1Z2luIH0gZnJvbSAnQHNlbnRyeS92aXRlLXBsdWdpbidcbmltcG9ydCB7IGdsb2IgfSBmcm9tICdnbG9iJ1xuaW1wb3J0IHsgZmxhdFJvdXRlcyB9IGZyb20gJ3JlbWl4LWZsYXQtcm91dGVzJ1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB7IGVudk9ubHlNYWNyb3MgfSBmcm9tICd2aXRlLWVudi1vbmx5J1xuXG5jb25zdCBNT0RFID0gcHJvY2Vzcy5lbnYuTk9ERV9FTlZcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcblx0YnVpbGQ6IHtcblx0XHRjc3NNaW5pZnk6IE1PREUgPT09ICdwcm9kdWN0aW9uJyxcblxuXHRcdHJvbGx1cE9wdGlvbnM6IHtcblx0XHRcdGV4dGVybmFsOiBbL25vZGU6LiovLCAnZnNldmVudHMnXSxcblx0XHR9LFxuXG5cdFx0YXNzZXRzSW5saW5lTGltaXQ6IChzb3VyY2U6IHN0cmluZykgPT4ge1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRzb3VyY2UuZW5kc1dpdGgoJ3Nwcml0ZS5zdmcnKSB8fFxuXHRcdFx0XHRzb3VyY2UuZW5kc1dpdGgoJ2Zhdmljb24uc3ZnJykgfHxcblx0XHRcdFx0c291cmNlLmVuZHNXaXRoKCdhcHBsZS10b3VjaC1pY29uLnBuZycpXG5cdFx0XHQpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdHNvdXJjZW1hcDogdHJ1ZSxcblx0fSxcblx0c2VydmVyOiB7XG5cdFx0d2F0Y2g6IHtcblx0XHRcdGlnbm9yZWQ6IFsnKiovcGxheXdyaWdodC1yZXBvcnQvKionXSxcblx0XHR9LFxuXHR9LFxuXHRwbHVnaW5zOiBbXG5cdFx0ZW52T25seU1hY3JvcygpLFxuXHRcdC8vIGl0IHdvdWxkIGJlIHJlYWxseSBuaWNlIHRvIGhhdmUgdGhpcyBlbmFibGVkIGluIHRlc3RzLCBidXQgd2UnbGwgaGF2ZSB0b1xuXHRcdC8vIHdhaXQgdW50aWwgaHR0cHM6Ly9naXRodWIuY29tL3JlbWl4LXJ1bi9yZW1peC9pc3N1ZXMvOTg3MSBpcyBmaXhlZFxuXHRcdHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAndGVzdCdcblx0XHRcdD8gbnVsbFxuXHRcdFx0OiByZW1peCh7XG5cdFx0XHRcdFx0aWdub3JlZFJvdXRlRmlsZXM6IFsnKiovKiddLFxuXHRcdFx0XHRcdHNlcnZlck1vZHVsZUZvcm1hdDogJ2VzbScsXG5cdFx0XHRcdFx0ZnV0dXJlOiB7XG5cdFx0XHRcdFx0XHR1bnN0YWJsZV9vcHRpbWl6ZURlcHM6IHRydWUsXG5cdFx0XHRcdFx0XHR2M19mZXRjaGVyUGVyc2lzdDogdHJ1ZSxcblx0XHRcdFx0XHRcdHYzX2xhenlSb3V0ZURpc2NvdmVyeTogdHJ1ZSxcblx0XHRcdFx0XHRcdHYzX3JlbGF0aXZlU3BsYXRQYXRoOiB0cnVlLFxuXHRcdFx0XHRcdFx0djNfdGhyb3dBYm9ydFJlYXNvbjogdHJ1ZSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHJvdXRlczogYXN5bmMgKGRlZmluZVJvdXRlcykgPT4ge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGZsYXRSb3V0ZXMoJ3JvdXRlcycsIGRlZmluZVJvdXRlcywge1xuXHRcdFx0XHRcdFx0XHRpZ25vcmVkUm91dGVGaWxlczogW1xuXHRcdFx0XHRcdFx0XHRcdCcuKicsXG5cdFx0XHRcdFx0XHRcdFx0JyoqLyouY3NzJyxcblx0XHRcdFx0XHRcdFx0XHQnKiovKi50ZXN0Lntqcyxqc3gsdHMsdHN4fScsXG5cdFx0XHRcdFx0XHRcdFx0JyoqL19fKi4qJyxcblx0XHRcdFx0XHRcdFx0XHQvLyBUaGlzIGlzIGZvciBzZXJ2ZXItc2lkZSB1dGlsaXRpZXMgeW91IHdhbnQgdG8gY29sb2NhdGVcblx0XHRcdFx0XHRcdFx0XHQvLyBuZXh0IHRvIHlvdXIgcm91dGVzIHdpdGhvdXQgbWFraW5nIGFuIGFkZGl0aW9uYWxcblx0XHRcdFx0XHRcdFx0XHQvLyBkaXJlY3RvcnkuIElmIHlvdSBuZWVkIGEgcm91dGUgdGhhdCBpbmNsdWRlcyBcInNlcnZlclwiIG9yXG5cdFx0XHRcdFx0XHRcdFx0Ly8gXCJjbGllbnRcIiBpbiB0aGUgZmlsZW5hbWUsIHVzZSB0aGUgZXNjYXBlIGJyYWNrZXRzIGxpa2U6XG5cdFx0XHRcdFx0XHRcdFx0Ly8gbXktcm91dGUuW3NlcnZlcl0udHN4XG5cdFx0XHRcdFx0XHRcdFx0JyoqLyouc2VydmVyLionLFxuXHRcdFx0XHRcdFx0XHRcdCcqKi8qLmNsaWVudC4qJyxcblx0XHRcdFx0XHRcdFx0XSxcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0fSksXG5cdFx0cHJvY2Vzcy5lbnYuU0VOVFJZX0FVVEhfVE9LRU5cblx0XHRcdD8gc2VudHJ5Vml0ZVBsdWdpbih7XG5cdFx0XHRcdFx0ZGlzYWJsZTogTU9ERSAhPT0gJ3Byb2R1Y3Rpb24nLFxuXHRcdFx0XHRcdGF1dGhUb2tlbjogcHJvY2Vzcy5lbnYuU0VOVFJZX0FVVEhfVE9LRU4sXG5cdFx0XHRcdFx0b3JnOiBwcm9jZXNzLmVudi5TRU5UUllfT1JHLFxuXHRcdFx0XHRcdHByb2plY3Q6IHByb2Nlc3MuZW52LlNFTlRSWV9QUk9KRUNULFxuXHRcdFx0XHRcdHJlbGVhc2U6IHtcblx0XHRcdFx0XHRcdG5hbWU6IHByb2Nlc3MuZW52LkNPTU1JVF9TSEEsXG5cdFx0XHRcdFx0XHRzZXRDb21taXRzOiB7XG5cdFx0XHRcdFx0XHRcdGF1dG86IHRydWUsXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0c291cmNlbWFwczoge1xuXHRcdFx0XHRcdFx0ZmlsZXNUb0RlbGV0ZUFmdGVyVXBsb2FkOiBhd2FpdCBnbG9iKFtcblx0XHRcdFx0XHRcdFx0Jy4vYnVpbGQvKiovKi5tYXAnLFxuXHRcdFx0XHRcdFx0XHQnLnNlcnZlci1idWlsZC8qKi8qLm1hcCcsXG5cdFx0XHRcdFx0XHRdKSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9KVxuXHRcdFx0OiBudWxsLFxuXHRdLFxuXHR0ZXN0OiB7XG5cdFx0aW5jbHVkZTogWycuL2FwcC8qKi8qLnRlc3Que3RzLHRzeH0nXSxcblx0XHRzZXR1cEZpbGVzOiBbJy4vdGVzdHMvc2V0dXAvc2V0dXAtdGVzdC1lbnYudHMnXSxcblx0XHRnbG9iYWxTZXR1cDogWycuL3Rlc3RzL3NldHVwL2dsb2JhbC1zZXR1cC50cyddLFxuXHRcdHJlc3RvcmVNb2NrczogdHJ1ZSxcblx0XHRjb3ZlcmFnZToge1xuXHRcdFx0aW5jbHVkZTogWydhcHAvKiovKi57dHMsdHN4fSddLFxuXHRcdFx0YWxsOiB0cnVlLFxuXHRcdH0sXG5cdH0sXG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE4UixTQUFTLGNBQWMsYUFBYTtBQUNsVSxTQUFTLHdCQUF3QjtBQUNqQyxTQUFTLFlBQVk7QUFDckIsU0FBUyxrQkFBa0I7QUFDM0IsU0FBUyxvQkFBb0I7QUFDN0IsU0FBUyxxQkFBcUI7QUFFOUIsSUFBTSxPQUFPLFFBQVEsSUFBSTtBQUV6QixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMzQixPQUFPO0FBQUEsSUFDTixXQUFXLFNBQVM7QUFBQSxJQUVwQixlQUFlO0FBQUEsTUFDZCxVQUFVLENBQUMsV0FBVyxVQUFVO0FBQUEsSUFDakM7QUFBQSxJQUVBLG1CQUFtQixDQUFDLFdBQW1CO0FBQ3RDLFVBQ0MsT0FBTyxTQUFTLFlBQVksS0FDNUIsT0FBTyxTQUFTLGFBQWEsS0FDN0IsT0FBTyxTQUFTLHNCQUFzQixHQUNyQztBQUNELGVBQU87QUFBQSxNQUNSO0FBQUEsSUFDRDtBQUFBLElBRUEsV0FBVztBQUFBLEVBQ1o7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNOLFNBQVMsQ0FBQyx5QkFBeUI7QUFBQSxJQUNwQztBQUFBLEVBQ0Q7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNSLGNBQWM7QUFBQTtBQUFBO0FBQUEsSUFHZCxRQUFRLElBQUksYUFBYSxTQUN0QixPQUNBLE1BQU07QUFBQSxNQUNOLG1CQUFtQixDQUFDLE1BQU07QUFBQSxNQUMxQixvQkFBb0I7QUFBQSxNQUNwQixRQUFRO0FBQUEsUUFDUCx1QkFBdUI7QUFBQSxRQUN2QixtQkFBbUI7QUFBQSxRQUNuQix1QkFBdUI7QUFBQSxRQUN2QixzQkFBc0I7QUFBQSxRQUN0QixxQkFBcUI7QUFBQSxNQUN0QjtBQUFBLE1BQ0EsUUFBUSxPQUFPLGlCQUFpQjtBQUMvQixlQUFPLFdBQVcsVUFBVSxjQUFjO0FBQUEsVUFDekMsbUJBQW1CO0FBQUEsWUFDbEI7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsWUFNQTtBQUFBLFlBQ0E7QUFBQSxVQUNEO0FBQUEsUUFDRCxDQUFDO0FBQUEsTUFDRjtBQUFBLElBQ0QsQ0FBQztBQUFBLElBQ0gsUUFBUSxJQUFJLG9CQUNULGlCQUFpQjtBQUFBLE1BQ2pCLFNBQVMsU0FBUztBQUFBLE1BQ2xCLFdBQVcsUUFBUSxJQUFJO0FBQUEsTUFDdkIsS0FBSyxRQUFRLElBQUk7QUFBQSxNQUNqQixTQUFTLFFBQVEsSUFBSTtBQUFBLE1BQ3JCLFNBQVM7QUFBQSxRQUNSLE1BQU0sUUFBUSxJQUFJO0FBQUEsUUFDbEIsWUFBWTtBQUFBLFVBQ1gsTUFBTTtBQUFBLFFBQ1A7QUFBQSxNQUNEO0FBQUEsTUFDQSxZQUFZO0FBQUEsUUFDWCwwQkFBMEIsTUFBTSxLQUFLO0FBQUEsVUFDcEM7QUFBQSxVQUNBO0FBQUEsUUFDRCxDQUFDO0FBQUEsTUFDRjtBQUFBLElBQ0QsQ0FBQyxJQUNBO0FBQUEsRUFDSjtBQUFBLEVBQ0EsTUFBTTtBQUFBLElBQ0wsU0FBUyxDQUFDLDBCQUEwQjtBQUFBLElBQ3BDLFlBQVksQ0FBQyxpQ0FBaUM7QUFBQSxJQUM5QyxhQUFhLENBQUMsK0JBQStCO0FBQUEsSUFDN0MsY0FBYztBQUFBLElBQ2QsVUFBVTtBQUFBLE1BQ1QsU0FBUyxDQUFDLG1CQUFtQjtBQUFBLE1BQzdCLEtBQUs7QUFBQSxJQUNOO0FBQUEsRUFDRDtBQUNELENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
