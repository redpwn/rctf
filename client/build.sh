preact build client/src --service-worker false --prerender false --template client/index.html
rm -r build/ssr-build build/manifest.json build/polyfills* build/push-manifest.json build/sw.js build/assets/icon.png
mv build/*.js* build/assets
mv build/assets build/static
cp -r public/* build
