# 素材说明

真实素材（2026-11-08 替换，文件名与任务包一致）：
- hall.jpg：1920×1080 淡彩工笔画大堂（真实主图）。
- stretch_1/2/4.png：线条示意图（真实，第 1、2、4 组）。
- music_anton.mp3（7:00）、music_shouwei.mp3（5:00）、music_bed.mp3（4:00 循环）、breath_loop.mp3（2:00 循环）、music_bridge.mp3（10 秒）：CC0 免版权音乐（FMA HoliznaCC0《Space Sleep Meditation》）。
- qing.mp3：10 秒单声磬（公有领域钵声）。
- breath_loop.mp3 为 2:00 无缝循环（原要求 60 秒；120 秒是 10 秒呼吸周期的整数倍，循环对位无影响）。

仍为占位：
- stretch_3.png：简单几何小人示意（第 3 组，图片工具未生成），v2 由 Codex 按几何占位处理。
- seg01–seg06.mp3：静音占位，引导语音未录，等配音定稿后替换。

替换方式：真实素材用任务包原文件名直接替换，路径不变；替换后递增 sw.js 的 VERSION，更新缓存。音频时长应与原场次段匹配；qing.mp3 仅含单声。收束语录音中的 [磬声] 请留空，由播放器在全场结束时单独播放 qing.mp3，避免重复敲磬。

按已确认的 60 分钟方案，前七段末尾 10 秒切到音乐桥，59:00–60:00 静候起身。因此录音末尾的过渡句需在音乐桥前完成，完整录音的最后 10 秒不会播放。

## 晨光木堂新版本素材（2026-11-13）

- morning-garden、morning-wood、morning-wood-v2、morning-linen、morning-plant、morning-plaster、morning-rattan：为本项目通过图像生成工具制作的场景素材。运行时使用 WebP，PNG 原稿保留；morning-shadow 为未采用的试验素材。
- narration/cue-00 至 cue-11：本项目原创《自然呼吸与安住》文本，经 OpenAI gpt-4o-mini-tts、marin 声线制作的 AI 配音，非真人录音。manifest.json 记录实际时长；script.json 记录文本及语气要求。连续课程含静默段，支持5/10/20/30分钟。未声称获得真人导师认证或完成真人逐句听审。
- vendor/three-addons：Three.js 官方 r160 examples/jsm 的运行依赖，MIT 许可证见该目录 LICENSE。脚本 scripts/vendor_ssao.py 可从固定官方标签重新获取并将核心模块路径改为本地引用。来源：https://github.com/mrdoob/three.js/tree/r160/examples/jsm 。目前使用 GTAOPass、EffectComposer、RenderPass、OutputPass 及 BufferGeometryUtils；SSAO 依赖为对照试验保留。项目侧正常深度遮蔽阶段会排除透明点击热区和植物贴片；单遍降噪取固定噪声通道以兼容现有显卡驱动。

原音乐与单磬沿用已有项目的来源记录。新界面不播放旧 seg01–seg06 静音占位，也不调用浏览器 SpeechSynthesis。

- morning-leaf.webp：为本项目新生成的蕉叶表面纹理；用于plants.mjs中的真实曲面叶片，非整株植物照片。PNG原稿仅保留本机，不进入手机发布包。近景花盆及植株使用自建三维几何，远景贴片继续保留。
