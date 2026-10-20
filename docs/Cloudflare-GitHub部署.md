# GitHub → Cloudflare 部署

本地仓库：`https://github.com/water7zxy-cloud/dengdengdengdeng`

使用 Cloudflare Pages 的 Git 集成，由 Cloudflare 拉取 GitHub 源码、安装依赖并构建。不要再通过浏览器上传 ZIP，也不要将它与 Worker 静态资产上传混用。

- 构建命令：`npm run build:cloudflare`
- 输出目录：`dist`
- 根目录：仓库根目录
- Node.js：22
- 环境变量不需要秘密；地图分片开关在构建命令中设置。
- 不修改 `dengdengdengdeng.cc` 的域名绑定或 DNS。

封面位于 `src/modules/welcome/assets/cover.png`，由 Vite 导入、按内容生成文件名。地图仅在构建产物中按字节分片，原图不变，网页重组后展示同一张 PNG。构建脚本核对封面与地图校验和，并检查每个发布文件不超过 25 MiB。

现有直接上传型 Pages 项目需要先检查是否支持改为 Git 集成。如果控制台不支持转换，应创建单独的 Git 集成项目并保留原项目，不删除原站点。Cloudflare 的 GitHub 应用如需安装或扩大仓库权限，交给用户确认。

部署前保留构建日志；部署失败后保存该次构建/发布的完整日志，不自动重复触发部署。HTTP `responseStatus: 0` 表示浏览器没有获得可用的 HTTP 状态码，不是 Cloudflare 返回的 HTTP 0，也不能据此直接判定 VPN 或服务器故障。
