# 等灯 dengdeng

网页版同屏桌游，React + TypeScript + Vite。对外访问域名固定为 **https://dengdengdengdeng.cc/**。

## 本地开发

使用 Node.js 22：

```sh
npm ci
npm run dev
```

## GitHub Pages 构建

```sh
npm run build:pages
```

构建输出 `dist`。此命令对原始高清地图进行无损字节分片，运行时自动拼接并校验。`.github/workflows/pages.yml` 会在 main 更新时自动构建并发布到 GitHub Pages，不运行游戏测试。托管仅使用 GitHub Pages；DNS 保留在阿里云，域名固定为 `dengdengdengdeng.cc`，不再使用 Cloudflare。

源代码、运行素材均随 GitHub 仓库保存，不依赖桌面绝对路径。原始 PSD 母版不参与网页运行。

版本说明见 [RELEASE_NOTES.md](RELEASE_NOTES.md)。游戏测试由用户自行进行。
