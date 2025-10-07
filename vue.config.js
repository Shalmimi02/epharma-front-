const { defineConfig } = require('@vue/cli-service')
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '/', // Ajoutez cette ligne
  
  configureWebpack: {
    plugins: [
      new NodePolyfillPlugin()
    ],
    resolve: {
      fallback: {
        path: require.resolve("path-browserify"),
        zlib: require.resolve("browserify-zlib"),
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        util: require.resolve("util/"),
        fs: false,
        tls: false,
        net: false
      }
    }
  },

  pwa: {
    name: 'Epharma-epg',
    themeColor: '#ffffff', // Ajuste selon ta charte graphique
    msTileColor: '#ffffff',
    manifestOptions: {
      "icons": [
        {
          "src": "img/icones/72.png",
          "sizes": "72x72",
          "type": "image/png"
        },
        {
          "src": "img/icones/96.png",
          "sizes": "96x96",
          "type": "image/png"
        },
        {
          "src": "img/icones/128.png",
          "sizes": "128x128",
          "type": "image/png"
        },
        {
          "src": "img/icones/144.png",
          "sizes": "144x144",
          "type": "image/png"
        },
        {
          "src": "img/icones/152.png",
          "sizes": "152x152",
          "type": "image/png"
        },
        {
          "src": "img/icones/192.png",
          "sizes": "192x192",
          "type": "image/png"
        },
        {
          "src": "img/icones/384.png",
          "sizes": "384x384",
          "type": "image/png"
        },
        {
          "src": "img/icones/512.png",
          "sizes": "512x512",
          "type": "image/png"
        }
      ],
      display: 'standalone', // Permet d’ouvrir en mode "app"
      background_color: '#ffffff',
      start_url: '.',
      scope: '.'
    },
    // Ici tu redéfinis tous les chemins d’icônes que le plugin injecte
    iconPaths: {
      // Laisse ces lignes si tu veux forcer l’utilisation de favicon.ico
      favicon32: 'favicon.ico',
      favicon16: 'favicon.ico',
      appleTouchIcon: 'favicon.ico',
      maskIcon: null,
      msTileImage: null,
    }
  }
})
