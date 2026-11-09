# 心安禅修堂 v1

免登录、零社交的中文静态禅修 PWA。无后端、数据库、外部字体或分析请求。

## 本地运行

```sh
cd /workspace/xinan-meditation-hall
python3 -m http.server 8000 --bind 0.0.0.0
```

浏览器打开本机 8000 端口。没有 npm 依赖或构建步骤。PWA 在 HTTPS 或 localhost 下生效。

```sh
node --test tests/engine.test.mjs
node --check app.js
node --check sw.js
```

## 文件与配置

- `index.html` / `style.css` / `app.js`：主页面、手机布局、交互与媒体。
- `engine.mjs`：本地整点场次、七处音乐桥、倒计时、光线与灯的衰减。
- `config.js`：`tonightCount` 是每日手动填写的历史参与数字；默认 null 隐藏，不伪造人数。每日一句与安静名字也在这里。
- `assets/`：任务包约定的全部同名图片、MP3 占位文件与 PWA 图标。替换方式见该目录 README。
- `manifest.webmanifest` / `sw.js`：安装及缓存。页面和图片安装时缓存；音频首次请求时完整缓存，支持 Safari 字节范围请求。未听过的音频仍需联网，浏览器可能回收缓存。
- `.github/workflows/pages.yml`：main 推送后运行引擎测试并部署静态文件。仓库 Settings → Pages → Source 需选择 GitHub Actions。

## 场次的已确认时间规则

严格 60 分钟，保持原表的整分边界。前七段末尾 10 秒为音乐桥，58:00–59:00 收束，59:00–60:00 静候起身，60:00 结束。跟当前场使用设备本地整点；从头开始独立计时；跳过压腿转为从七支座开始的独立场；静坐 20 分钟独立计时且只播放起止磬。无声档连磬也不播放，以文字提示。

默认首次无声。之后记住用户声音偏好与常坐蒲团；灯愿仅保存在 localStorage，以写入时间起算三日渐暗。页面不会因起身或整点自动开始新场。

## 手机验收与已知边界

当前音频全部静音，界面明确标注；不代表真实录音已接入。请替换素材后检查出声速度、语音内容、30 秒静默、桥接剪辑及单声磬。

音频使用 HTMLAudioElement 和 Media Session，并在回前台时按真实时间校正。手机系统可能在锁屏时冻结 JS，使跨段换轨延后；因此**不能保证所有 iPhone/Safari 后台跨段连续播放**，需要真实设备完整验收。计时不会因后台停留而累积延误。若需要严格锁屏跨段无缝，后续应准备整场单一媒体文件或采用经真机验证的媒体方案。

桌面自动化不能替代 iPhone/安卓的锁屏、微信切换、主屏幕安装和真实 4G 首屏性能测试。隐私模式或禁用存储时，可继续静坐但无法持久保存偏好和愿望。

## 部署

GitHub Pages 的预期项目地址为 `https://miranda10128.github.io/xinan-meditation-hall/`；只有 Pages 工作流成功后才是可用交付地址。页面所有资源使用相对路径，支持该子目录。不得将预期地址当作已验证部署。
