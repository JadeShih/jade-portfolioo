#!/bin/sh
# 打包 26 案例的 3D 模組（three.js r160 + tools/mt3d.src.js）成一般 <script>，
# 讓本機直接開檔（file://）也不會被 ES module 的跨來源限制擋住。
# 需求：npm i three@0.160.0 esbuild@0.20.2
cd "$(dirname "$0")/.."
printf "import { init } from './tools/mt3d.src.js';\nwindow.MT3D = { init };\n" > /tmp/mt3d-entry.js
npx esbuild /tmp/mt3d-entry.js --bundle --format=iife --minify --target=es2018 --legal-comments=inline --outfile=public/js/mt3d.bundle.js
