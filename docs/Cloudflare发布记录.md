# Cloudflare Git 集成发布记录

> 下文记录的是上一轮发布。2026-10-21 按用户要求已删除两个旧 Pages 项目及遗留空 Worker，控制台显示 `No projects found`。旧平台地址不再作为有效入口。新的 GitHub release 仍以 `dengdengdengdeng.cc` 为目标域名，DNS 迁移与重新部署尚待完成。

- 发布日期：2026-10-21（Asia/Shanghai）
- 状态：成功，完整日志 `deployment-logs/cloudflare-success-2026-10-21.log`
- 公开地址：https://dengdeng-game.pages.dev/
- 项目：`dengdeng-game`（Pages Git 集成）
- GitHub：https://github.com/water7zxy-cloud/dengdengdengdeng
- 生产分支：`main`
- 发布提交：`3493cdd1394a890b002284e2da35a5a566031c24`
- 构建：`npm run build:cloudflare`
- 输出：`dist`；Node：`22`
- 包含已确认的淡黄色萤火虫、翅膀动画、封面版本化引用；未重绘或压缩原设计。
- 封面校验和：`df4a90a8bde68e942f92c2e9d860552a87626e3fc7393dc0fed99bc680fbd4ea`
- 地图 9 个无损分片；117 个文件全部上传成功，Cloudflare 日志显示 `Success: Your site was deployed!`。
- 未运行游戏测试。未改动 `dengdengdengdeng.cc` 及其解析，未删除 OpenAI 托管站点或旧 Cloudflare 项目。

今后推送此仓库 main 会触发 Cloudflare 自动构建。此次保留远端 README 历史的推送工作副本为 `/tmp/dengdeng-github-release.PkBldh`；原本地工作目录的 Git 历史不同且有未提交修改，没有对其强制重置。后续推送前需先整理本地与远端历史，不应强制覆盖 main。
