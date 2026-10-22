# GitHub Pages 发布进度

最终域名：`https://dengdengdengdeng.cc/`。GitHub 保存代码及 Release，GitHub Pages 托管，阿里云保留 DNS 托管。不使用 Cloudflare；不运行游戏测试。

- [x] 核对 GitHub main 与发布副本，保留已有提交历史。
- [x] 地图无损小分片、预加载、加载进度与失败提示已在上次提交实现，用户验收仍待完成。
- [x] 添加 GitHub Pages 构建、CNAME 和 Actions 工作流。
- [ ] 本地构建及资源校验通过后推送。
- [ ] GitHub Actions 部署成功并保存日志。
- [ ] 保存阿里云现有 A/TXT/TTL 记录；仅更换网站 A 记录，保留 TXT 与 nameserver。
- [ ] 原域名解析生效、HTTPS 证书可用，并从原域名读到对应 release.json。
- [ ] 生成对应提交的源码包、静态包、校验文件并正式发布 v0.1.0。

Ruling: 用户明确禁止游戏测试，因此只执行构建、资源校验、部署状态与域名检查，不调用任何测试套件，不自动游玩。
Ruling: 原工作目录含用户未提交的历史改动，本次继续使用 `/tmp/dengdeng-github-release.PkBldh` 的远端连续历史发布，不重置原工作目录。
Ruling: 旧 Cloudflare 发布文档仅作为历史保留，不作为当前配置或运行依赖。
