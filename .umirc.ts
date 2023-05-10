import { defineConfig } from "umi";
// openssl genrsa -out server.key 2048
// openssl req -new -sha256 -x509 -days 365 -key server.key -out server.crt


export default defineConfig({
  routes: [
    { path: "/", component: "index" },
    { path: "/docs", component: "docs" },
    {path: "/move", component: "@/pages/move/index"},
    {path: "/game", component: "@/pages/game/index"},
    {path: "/draw", component: "@/pages/draw/index"},
    {path: "/geo", component: "@/pages/geo/index"},
    {path:"/circle",component:"@/pages/circle/index"},
    {path:"/movegv",component:"@/pages/movegv/index"},
    {path:"bluetooth",component:"@/pages/bluetooth/index"},
  ],
  npmClient: 'pnpm',
  https:{
    cert:'./https/server.crt',
    key:'./https/server.key'
  }
});
