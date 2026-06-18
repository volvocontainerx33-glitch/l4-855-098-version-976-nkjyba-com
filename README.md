# 欧美电影片库

这是一个纯静态电影网站，已生成 2000 个独立影片详情页。

## 使用方式

1. 解压 ZIP。
2. 如需显示封面和首页 Hero 图片，请把 `1.jpg` 到 `150.jpg` 放在网站根目录，也就是和 `index.html` 同级的位置。
3. 直接打开 `index.html` 或上传整站目录到任意静态空间即可访问。
4. 播放器使用详情页内的 HLS 播放源，点击播放器上的“点击播放”按钮后会初始化播放。

## 目录

- `index.html`：首页
- `categories.html`：分类总览
- `category/`：独立分类页
- `video/`：影片详情页
- `search.html`：搜索筛选页
- `rankings.html`：排行榜页
- `assets/css/style.css`：样式文件
- `assets/js/site.js`：导航、轮播、筛选交互
- `assets/js/player.js`：播放器初始化
- `sitemap.xml`：页面索引
