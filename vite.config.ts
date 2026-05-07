import { defineConfig, type UserConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// In dev mode, public/ files are served statically — Vite's transformIndexHtml
// never runs on them, so @vitejs/plugin-react never injects its Fast Refresh
// preamble. This plugin intercepts /test.html requests and injects it manually.
function injectReactPreambleForTestHtml(): Plugin {
  const preamble = `<script type="module">
  import RefreshRuntime from '/@react-refresh'
  RefreshRuntime.injectIntoGlobalHook(window)
  window.$RefreshReg$ = () => {}
  window.$RefreshSig$ = () => (type) => type
  window.__vite_plugin_react_preamble_installed__ = true
</script>`;

  return {
    name: 'inject-react-preamble',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url !== '/test.html') return next();
        const file = path.resolve(__dirname, 'public/test.html');
        const html = fs.readFileSync(file, 'utf-8').replace('</head>', `${preamble}\n  </head>`);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(html);
      });
    }
  };
}

function handleTestHtmlForBuild(): Plugin {
  return {
    name: 'handle-test-html',
    apply: 'build',
    writeBundle() {
      const file = path.resolve(__dirname, 'dist/test.html');
      if (!fs.existsSync(file)) return;
      if (!this.meta.watchMode) {
        fs.unlinkSync(file);
        return;
      }
      const fixed = fs.readFileSync(file, 'utf-8').replace(
        '<script type="module" src="/src/web-component.ts"></script>',
        '<link rel="stylesheet" href="/image-component.css">\n    <script type="module" src="/image-component.mjs"></script>'
      );
      fs.writeFileSync(file, fixed);
    }
  };
}

export default defineConfig(({ command }) => {
  const config: UserConfig = {
    plugins: [react(), injectReactPreambleForTestHtml(), handleTestHtmlForBuild()],
    server: {
      port: 5173,
      proxy: {
        '/api': 'http://localhost:3001'
      }
    }
  };

  if (command === 'build') {
    config.build = {
      lib: {
        entry: 'src/web-component.ts',
        name: 'ImageComponent',
        fileName: () => 'image-component.mjs',
        formats: ['es']
      },
      rollupOptions: {
        output: {
          assetFileNames: (asset) => {
            return asset.names?.includes('style.css') ? 'image-component.css' : (asset.names?.[0] ?? 'asset')
          }
        }
      }
    };
    config.define = {
      'process.env.NODE_ENV': JSON.stringify('production'),
    };
  }

  return config;
});
