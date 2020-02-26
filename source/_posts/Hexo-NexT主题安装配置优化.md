---
title: Hexo-NexT (v7.0+) 主题安装配置优化
tags:
  - Hexo安装配置
  - Hexo优化
  - NexT主题配置
categories:
  - 技术
  - Hexo
abbrlink: 9ec4151c
date: 2020-02-25 19:19:52
---

# 准备环境与安装

1. [Node.js](http://nodejs.org/) 下载，并安装。
2. 安装Hexo，在命令行运行以下命令：
```bash
npm install -g hexo-cli
```
3. 初始化Hexo，在命令行依次运行以下命令即可：
<folder>即存放Hexo初始化文件的路径， 即站点目录。
```bash
hexo init <folder>
cd <folder>
npm install
```
新建完成后，在路径下，会产生这些文件和文件夹：
```bash
.
├── _config.yml
├── package.json
├── scaffolds
├── source
|   ├── _drafts
|   └── _posts
└── themes
```
<!--more-->

**注**：

- 站点配置文件：站点目录下的`_config.yml`
- 主题配置文件：站点目录下的`themes`文件夹下的，主题文件夹下的`_config.yml`，路径为`\themes\<主题文件夹>\_config.yml`>。
- package.json：应用程序信息
- scaffold：模板文件夹，新建文章时，Hexo会根据scaffold来建立文件。
- source：资源文件夹是存放用户资源的地方。除 `_posts` 文件夹之外，开头命名为 `_` (下划线)的文件 / 文件夹和隐藏的文件将会被忽略。Markdown 和 HTML 文件会被解析并放到 `public` 文件夹，而其他文件会被拷贝过去。
4. 启动服务器。在路径下，命令行（即Git Bash）输入以下命令，运行即可：
```bash
hexo server
```
5. 浏览器访问网址： `http://localhost:4000/`
至此Hexo博客已经搭建在本地。

# 配置Hexo
## 配置 hexo 网站相关信息
我们在站点的配置文件`_config.yml` 中，修改：
```yaml
# Site
title:          # 网站标题
subtitle:       # 网站副标题
description:    # 描述，介绍网站的
keywords:       # 网站的关键字
author:         # 博主姓名
language: zh-CN # 语言：zh-CN 是简体中文
timezone:       # 时区
```
注意：博客框架默认的语言是英文，我们需要到 `/themes/<主题>/languages` 目录下，查看当前 主题 版本简体中文对照文件的名称是 `zh-Hans` 还是 `zh-CN`。这里NexT是 `zh-CN`。

## 安装配置主题(以Next7为例)

### 获取 NexT
进入hexo主目录
```bash
$ cd hexo
$ git clone https://github.com/theme-next/hexo-theme-next themes/next
```
**更新：推荐使用独立的配置文件（数据文件）而不在主题源代码进行更改，便于后续的更新（下载最新版本，替换掉旧版本）**

### 修改默认主题设置
```bash
$ vim _config.yml
    theme: next
```
主题目录结构
```bash
.
├── _config.yml
├── languages
├── layout
├── scripts
└── source
```
- `_config.yml`:  主体的配置文件, 修改时会自动更新, 无需重启服务器
- `languages`:  语言文件夹, 参见国际化
- `layout`:  布局文件夹, 用于存放主题的模板文件, 决定网站内容的呈现方式,Hexo 内建 Swig 模板引擎, 可以另外安装插件来获得 EJS, Haml, Jade 支持, Hexo 根据模板文件的扩展名来决定所使用的模板引擎
- `scripts`:  脚本文件夹, 在启动时, Hexo 会自定载入此文件夹内的 JavaScript 文件
- `source`:  资源文件夹, 除了模板以外的 Asset, 如 CSS , JavaScript 文件等, 都应该放在这个文件夹中. 文件或文件夹前缀为 _ (下划线) 或 隐藏的文件会被忽略.
如果文件可以被渲染的话, 会经过解析然后存储到 public 文件夹, 否则会直接拷贝到 public 文件夹.

### 配置主题
配置 hexo 中的 about、tag、categories、sitemap 菜单
默认的主题配置文件_config.yml 中，菜单只开启了首页和归档，我们根据需要，可以添加 about、tag、categories 等菜单，所以把它们也取消注释。
```yaml
# 菜单设置为 菜单名: /菜单目录 || 菜单图标名字
menu:
  home: / || home
  about: /about/ || user
  tags: /tags/ || tags
  categories: /categories/ || th
  archives: /archives/ || archive
```
注：hexo 所有图标均来自 [fontawesome](https://fontawesome.com/)，其中 || 后面是你想要设置的图标的名字。

####  Hexo增加 `about`页面
1. 进入Hexo目录，执行`hexo new page "about"`，会发现在`source`目录下多了个`about`目录，在里面的`index.md`写入内容
2. 在`theme//_config.yml`里面的`menu`一项，添加一行：`about: /about/ || user`。

#### Hexo增加`tags/categories` 页面
```bash
# tags
$ hexo new page "tags"
$ vim source/tags/index.md
    ---
    title: 文章标签
    date: 2020-02-01 17:37:35  # 时间随意
    type: "tags"                            # 类型一定要为tags
    comments: false                   # 提示这个页面不需要加载评论
    ---
$ vim themes/next/_config.yml
    menu:
      # ...
      tags: /tags/ || tags
      # ...

# categories
$ hexo new page "categories"
$ vim source/categories/index.md
    ---
    title: 文章分类
    date: 2020-02-01 17:32:39
    type: "categories"                  # 类型一定要为categories
    comments: false
    ---
$ vim themes/next/_config.yml
    menu:
      # ...
      categories: /categories/ || th
      # ...
```

#### 配置 hexo 中 next 主题样式选择
NexT 一共提供了 4 种首页样式，按照自己喜好选择一个，选择一个其他主题样式后其他的主题前一定要加上注释#：
```yaml
# Schemes
scheme: Muse
#scheme: Mist
#scheme: Pisces
#scheme: Gemini
```

#### 新建一个 404 页面
首先在 hexo/source 目录下创建自己的 404.html,
注意：Hexo 博客的基本内容是一些 Markdown 文件，放在 source/_post 文件夹下，每个文件对应一篇文章。除此之外，放在 source 文件夹下的所有开头不是下划线的文件，在 hexo generate 的时候，都会被拷贝到 public 文件夹下。但是，Hexo 默认会渲染所有的 HTML 和 Markdown 文件。
因此我们可以简单地在文件开头加上 layout: false 一行来避免渲染：
```html
+layout: false
+---

<!DOCTYPE html>
```

#### 配置 hexo 站点的 footer 信息
底部 footer 可以开关显示 hexo 信息、theme 信息、建站时间以及网站备案号等个性化配置：
```yaml themes/next/_config.yml
footer:
  since: 2018   # 建站开始时间
  icon:
    name: heart      # 设置 建站初始时间和至今时间中间的图标，默认是一个'小人像'，更改user为heart可以变成一个心
    animated: true
    color: "#ff0000"  # 更改图标的颜色为红色  
  #显示版权作者
  copyright: JohnnyChan
  powered:
    enable: true        # 开启hexo驱动显示
    version: true       # 开启hexo版本号
  theme:
    enable: true       # 开启主题驱动
    version: true       # 开启主题版本号
  beian:
    enable: true                # 开启备案号显示
    icp: 粤ICP备...              # 备案号
```

#### 设置侧栏
默认情况下，侧栏仅在文章页面（拥有目录列表）时才显示，并放置于右侧位置。可以通过修改主题配置文件中的 sidebar 字段来控制侧栏的行为。侧栏的设置包括两个部分，其一是侧栏的位置， 其二是侧栏显示的时机。
```yaml
sidebar:
  position: right
  display: post
  onmobile: true # 移动端显示侧栏,只有设计模板为Muse或Mist才能使用
```
设置侧栏的位置，修改 sidebar.position 的值，支持的选项有：
- left - 靠左放置
- right - 靠右放置
设置侧栏显示的时机，修改 sidebar.display 的值，支持的选项有：
- post - 默认行为，在文章页面（拥有目录列表）时显示
- always - 在所有页面中都显示
- hide - 在所有页面中都隐藏（可以手动展开）
- remove - 完全移除

#### 头像信息设置
```yaml
avatar:
  url: /images/avatar.jpg  # 设置头像资源的位置
  rounded: true            # 开启圆形头像
  rotated: true           # 开启旋转
```

#### 社交信息和友链配置
这里和菜单设置格式一样，社交名字: 社交url || 社交图标，图标信息来自 fontawesome：
```yaml
social: 
  GitHub: https://github.com/yourname || github
  E-Mail: mailto:yourname@gmail.com || envelope
social_icons:
  enable: true         # 显示社交图标
  # 仅显示图标 
  icons_only: true  # 只显示图标，不显示文字
  transition: true   # 动画效果
```

#### 首页文章属性
post_meta:
  item_text: true    #  可以一行显示，文章的所有属性
  created_at: true    # 显示创建时间
  updated_at:
    enabled: true     # 显示修改的时间
    another_day: true  # 设true时，如果创建时间和修改时间一样则显示一个时间
  categories: true    # 显示分类信息

#### 开启文章目录
编辑主题配置文件，配置如下：
```yaml theme/next/_config.yml
toc: #侧栏中的目录
  enable: true #是否自动生成目录
  number: true #目录是否自动产生编号
  wrap: false  #标题过长是否换行
  expand_all: false
  max_depth: 6 #最大标题深度
```

#### Follow me on GitHub
编辑主题配置文件，配置如下：
```yaml theme/next/_config.yml
# #添加右上角github绑定
github_banner:
  enable: true
  permalink: https://github.com/johnnyww?tab=repositories
  title: Follow me on GitHub
```

#### 阅读书签
Bookmark是一个插件，允许用户保存他们的阅读进度。用户只需单击页面左上角的书签图标即可保存滚动位置。当他们下次访问您的博客时，他们可以自动恢复每个页面的最后滚动位置。 编辑主题配置文件，配置如下：
```yaml theme/next/_config.yml
bookmark:	
  enable: true	
  color: "#222"
  save: auto
```

#### 字数统计、阅读时长
首先安装插件：
```bash
$ npm install hexo-symbols-count-time --save
```
主题配置文件修改如下：
```yaml theme/next/_config.yml
symbols_count_time:
  separated_meta: true # 统计信息不换行显示
  item_text_post: true # 文章统计信息中是否显示“本文字数/阅读时长”等描述文字
  item_text_total: false # 底部footer站点统计信息中是否显示“本文字数/阅读时长”等描述文字
  awl: 4 # 平均字符长度
  wpm: 275 # 阅读速度, 一分钟阅读的字数
```
站点配置文件 新增如下：
```yaml hexo/_config.yml
# 新增文章字数统计
symbols_count_time:
  #文章内是否显示
  symbols: true # 文章字数
  time: true # 阅读时长
  # 网页底部是否显示
  total_symbols: false # 所有文章总字数
  total_time: false # 所有文章阅读中时长
```

#### 显示当前浏览进度
右下角显示文章当前浏览进度，提供意见置顶功能，编辑主题配置文件，配置如下：
```yaml theme/next/_config.yml
back2top:
  enable: true #是否提供一键置顶 
  sidebar: false
  scrollpercent: true # 是否显示当前阅读进度
```

#### 阅读进度
Next支持页面滚动阅读进度指示器。
编辑主题配置文件，配置如下：
```yaml theme/next/_config.yml
reading_progress:
  enable: true
  position: top
  color: "#37c6c0"
  height: 3px
```

#### 图片懒加载
对于图片进行延迟加载，访问到图片位置时才去请求图片资源，这样可以提高博客的访问速度，节省流量。 命令如下：
```bash
$ git clone https://github.com/theme-next/theme-next-jquery-lazyload source/lib/jquery_lazyload
```
编辑主题配置文件，配置如下：
```yaml theme/next/_config.yml
lazyload: true
```

#### 添加图片灯箱
添加灯箱功能，实现点击图片后放大聚焦图片，并支持幻灯片播放、全屏播放、缩略图、快速分享到社交媒体等，该功能由 [fancyBox](https://github.com/fancyapps/fancybox) 提供，效果如下：
![fancyBox 灯箱](https://oss.chenjunxin.com/picture/blogPicture/9ec4151c_fancybox_demo.webp)
在根目录下执行以下命令安装相关依赖：
```bash
$ git clone https://github.com/theme-next/theme-next-fancybox3 themes/next/source/lib/fancybox
```
在主题配置文件中设置 `fancybox: true`：
```yaml theme/next/_config.yml
fancybox: true
```
刷新浏览器即可生效。

#### 设置代码高亮主题
NexT 使用 Tomorrow Theme 作为代码高亮，共有5款主题供你选择。 NexT 默认使用的是 白色的 normal 主题，可选的值有 normal，night， night blue， night bright， night eighties
```yaml
codeblock:
   highlight_theme: night eighties
```

#### 代码块新增复制按钮
```yaml
codeblock:
  copy_button:
    enable: true      # 增加复制按钮的开关
    show_result: true  # 点击复制完后是否显示 复制成功 结果提示
```

#### 文章原创申明
```yaml
creative_commons:
  license: by-nc-sa
  sidebar: true  # 侧边栏显示版权协议图标
  post: true       # 默认显示版权信息
  language: zh-CN
```

#### 加载动画
```yaml
motion:
  enable: true   # 启用
  async: false    # 异步加载
  transition:
	# 文章摘要动画
    post_block: bounceIn
    # 加载各种页面动画（分类，关于，标签等等）
    post_header: slideDownIn
    # 文章详情动画
    post_body: slideDownIn
    coll_header: slideLeftIn
    # Only for Pisces | Gemini.
    # 侧边栏（人物头像的那部分）
    sidebar: slideUpIn
```

####  Hexo 本地搜索功能
##### 本地搜索的原理
NexT 主题已经实现这个功能，它用了 Hexo 的拓展包 `hexo-generator-searchdb`，预先生成了一个文本库 `search.xml`，然后传到了网站里面。在本地搜索的时候，NexT 直接用 javascript 调用了这个文件，从而实现了静态网站的本地搜索。
##### 插件地址
- [hexo-generator-searchdb](https://github.com/theme-next/hexo-generator-searchdb)
##### 安装配置
安装插件：
```bash
$ npm install hexo-generator-searchdb --save
```
然后我们修改站点配置文件，添加如下内容：
```yaml hexo/_config.yml
# 本地搜索
search:
  path: search.xml
  field: post
  format: html
  limit: 10000
```
- path：索引文件的路径，相对于站点根目录
- field：搜索范围，默认是 post，还可以选择 page、all，设置成 all 表示搜索所有页面
- limit：限制搜索的条目数
然后修改主题配置文件：
```yaml themes/next/_config.yml
# Local Search
# Dependencies: https://github.com/theme-next/hexo-generator-searchdb
local_search:
  enable: true
  trigger: auto
  top_n_per_article: 1 #每篇文章中显示的搜索数量
  unescape: false
  preload: false
```

#### 数据分析与统计
#####  访问次数统计
NexT内置了leancloud、firebase、busuanzi三种访客统计插件，前两种需要到官网注册获取网站颁发的appKey，相对麻烦，有兴趣的请访问[leancloud](https://www.leancloud.cn/)、[firebase](https://console.firebase.google.com/u/0/)。而不蒜子配置只需要将false改为true即可:
```yaml
# busuanzi统计
busuanzi_count:
  enable: true
  # 总访客数
  total_visitors: true
  total_visitors_icon: user
  # 总浏览量
  total_views: true
  total_views_icon: eye
  # 文章浏览量
  post_views: true
  post_views_icon: eye
```
更多用法请参考官网说明[不蒜子官网](http://ibruce.info/2015/04/04/busuanzi/)。

##### 百度统计
起初以为阅读统计是通过百度统计进行计数的，后来发现百度统计、Google Analytics等只是分析工具，并不会把统计信息显示在博客页面上，所以是否需要百度统计看个人需求。打开[百度统计](http://tongji.baidu.com/)，登录并进入网站列表，点击新增网站。填写新增网站表单，添加必要字段网站域名：www.chenjunxin.com, 网站首页：https://chenjunxin.com, 网站名称 、行业类别(空间周边)选填。点击“确定”后，定位到站点的代码获取页面,会出现包含如下信息的提示：
```js
<script>
var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?c694f10d0cd3c87d69a8be39bb4e7a46";
  var s = document.getElementsByTagName("script")[0]; 
  s.parentNode.insertBefore(hm, s);
})();
</script>
```
复制”https://hm.baidu.com/hm.js?" 后面的Id字符串，粘贴到主题配置文件中
```yaml themes/next/_config.yml
# Baidu Analytics ID
baidu_analytics: c694f10d0cd3c87d69a8be39bb4e7a46
```
重新打包静态文件并发布：
```bash
$ hexo g
$ hexo s
```
点击百度统计控制台，代码管理->代码安装检查进行安装校验。

#####  添加 Google 统计
访问 [Google Analytics](https://analytics.google.com/)
注册登录后，新增一个统计网站，填写网站信息，点击下面的获取统计 ID，如图：
![](https://oss.chenjunxin.com/picture/blogPicture/9ec4151c_google_analytics_picture_00.webp)
进入页面后，你会看到统计 ID，复制它，如图：
![](https://oss.chenjunxin.com/picture/blogPicture/9ec4151c_google_analytics_picture_01.webp)
然后编辑主题配置文件，找到关键字 `google_analytics`，删除注释`#`并填写获取到的统计 ID：
```yaml themes/next/_config.yml
# Google Analytics
google_analytics:
  tracking_id: UA-*******
  localhost_ignored: true
```
PS：谷歌统计用的比较少，因为有墙，在加载代码的时候，很容易阻塞。所以在国内使用百度比较多。


#### Google Search Console
该版本已经集成了 HTML 标记的验证方式。
- 查看原标记，将其中 content 字段引号内的内容拷贝出来
- 修改主题配置文件。搜索 `google_site_verification`，将上述拷贝的内容复制在该值后面：
```yaml themes/next/_config.yml
# Google Webmaster tools verification setting
# See: https://www.google.com/webmasters/
google_site_verification: ********
```

#### Hexo博客提交百度和Google收录
SEO（Search Engine Optimization）：中文译为搜索引擎优化，即利用搜索引擎的规则提高网站搜索引擎内自然排名。主要通过站内优化比如网站结构调整、网站内容建设、网站代码优化等以及站外优化等方式实现。
主要是给各个搜索引擎提交你的 sitemap，让别人能搜到你博客的内容。
先确认博客是否被搜索引擎收录，在百度或者谷歌输入下面格式来判断，如果能搜索到就说明被收录，否则就没有。
```
site:写你要搜索的域名 # site:www.chenjunxin.com
```
开启 Next 主题的 SEO 优化项
Next 提供了 seo 优化选项，在主题配置文件_config.yml中有个选项是seo，设置成true即开启了 seo 优化。

##### 让Google和百度收录博客
由于两者方法相似，相似的部分一起讲。
###### 验证站点
打开[百度站长平台](https://ziyuan.baidu.com/)，注册登陆后在`用户中心 > 站点管理`下添加网站。根据提示输入站点地址等信息，建议输入的域名为`www`开头的。
登陆[google search console](https://search.google.com/search-console/welcome)（选右边），添加你的网站地址。
在选择完网站的类型之后需要验证网站的所有权，有3种验证方式：
- HTML文件验证：将验证文件放置于您所配置域名的根目录下，即放在博客的本地根目录的source文件夹下（要设置skip_render）。
- HTML标签验证：baidu_site_verification或者google_site_verification后添加HTML标签content后的内容（推荐)，如下：
 打开 Hexo 主题配置文件，按如下修改/添加：
 ```yaml themes/next/_config.yml
 google_site_verification: #索引擎提供给你的HTML标签的content后的内容
 baidu_site_verification: #索引擎提供给你的HTML标签content后的内容
 ```
- CNAME验证：按要求添加一条CNAME解析

##### 生成站点地图
站点地图即[sitemap](https://baike.baidu.com/item/sitemap/6241567?fr=aladdin)， 是一个页面，上面放置了网站上需要搜索引擎抓取的所有页面的链接。站点地图可以告诉搜索引擎网站上有哪些可供抓取的网页，以便搜索引擎可以更加智能地抓取网站。
安装百度和Google的站点地图生成插件：
```bash
$ npm install hexo-generator-baidu-sitemap --save
$ npm install hexo-generator-sitemap --save
```
在博客根目录的`_config.yml`中改`url`为你的站点地址：
```yaml hexo/_config.yml
# URL
url: https://www.chenjunxin.com/
root: /
# permalink: :year/:month/:day/:title/
permalink: :title/
```
在博客根目录的`_config.yml`中添加如下代码：
```yaml hexo/_config.yml
baidusitemap:
  path: baidusitemap.xml
sitemap:
  path: sitemap.xml
```
之后重新打包`hexo g -d`，若在你的博客根目录的`public`下面发现生成了`sitemap.xml`以及`baidusitemap.xml`就表示成功了，其中`sitemap.xml`文件是搜索引擎通用的文件，`baidusitemap.xml`是百度专用的 sitemap 文件。可以通过`https://<域名>/baidusitemap.xml`查看该文件。

##### 添加 robots.txt
`robots.txt`是搜索引擎蜘蛛协议，告诉引擎哪些要收录，哪些禁止收录。
`source`文件夹下新建 robots.txt，内容如下:
```
User-agent: *
Allow: /
Allow: /archives/
Allow: /categories/
Allow: /tags/

Disallow: /js/
Disallow: /css/
Disallow: /fonts/
Disallow: /vendors/
Disallow: /fancybox/

Sitemap: https://www.chenjunxin.com/sitemap.xml
Sitemap: https://www.chenjunxin.com/baidusitemap.xml
```

#####  提交sitemap
谷歌：在 google search console 站点地图，提交sitemap.xml
百度：在百度站长平台--链接提交--自动提交--sitemap，添加https://www.chenjunxin.com/baidusitemap.xml
对于百度，除了 sitemap 还有主动推动和自动推送这两种方式，主动推送的原理是每次 deploy 的时候都把所有链接推送给百度，自动推送则是每次网站被访问时都把该链接推送给百度。从效率上来说：主动推送>自动推送>sitemap。
##### 主动推送
1. 插件安装
```bash
$ npm install hexo-baidu-url-submit --save
```
2. 修改站点配置文件
在 hexo/_config.yml，添加以下内容
```yaml hexo/_config.yml
baidu_url_submit:
  count: 5
  host: your_site
  token: your_token
  path: baidu_urls.txt
```
其中 count 表示一次推送提交最新的N个链接；host 和 token 可以在百度站点页面->数据引入->链接提交可以找到；path 为生成的文件名，里面存有推送的，网站的链接地址。
确保your_site 项跟百度注册的站点一致。
同样修改站点配置文件的 deploy 项，增加对 baidu 的推送：
```yaml hexo/_config.yml
deploy:                                         
- type: baidu_url_submitter
```
重新生成，发布 hexo d，
```bash
{"remain":99998,"success":2}
```
可以看到推送给百度成功。

##### 自动推送

首先，在主题配置文件下设置，将baidu_push设置为true：
```yaml hexo/_config.yml
baidu_push: true
```
然后查看`themes/next/layout/_third-party/baidu-push.swig`文件中是否包含如下百度提供的自动推送代码，没有的话要添加：
```
{% if theme.baidu_push %}
<script>
(function(){
    var bp = document.createElement('script');
    var curProtocol = window.location.protocol.split(':')[0];
    if (curProtocol === 'https') {
        bp.src = 'https://zz.bdstatic.com/linksubmit/push.js';        
    }
    else {
        bp.src = 'http://push.zhanzhang.baidu.com/push.js';
    }
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(bp, s);
})();
</script>
{% endif %}
```

##### 为网站添加关键字,SEO优化
1.设置hexo博客的关键字:
在博客根目录下找到 _config.yml 文件，在所示地方添加keywords: 关键字1,关键字2,关键字3…，采用英文逗号隔开，注意keywords与关键词之间的空格:
```diff hexo/_config.yml
title: 
subtitle: ''
description: 
author: 
language: 
timezone: ''
+ keywords: JAVA,Linux,Manjaro,Hexo,Travis
```
2.设置文章的关键字:
在文章里面加入keywords，如下所示：
```
---
title: ###
date: ###
categories: ###
tags: ###
keywords: ###
description: ###
---
```

##### hexo-abbrlink 链接持久化
hexo 默认的链接是 `http://xxx.yy.com/2019/02/14/hello-world` 这种类型的，这源于站点目录下的配置 `_config.yml` 里的配置 `:permalink: :year/:month/:day/:title/`，这种默认配置的缺点就是一般文件名是中文，导致 url 链接里有中文出现，这会造成很多问题，不利于 SEO，另外年月日都会有分隔符。
`hexo-abbrlink`这个插件，猜测是根据时间点算出的最终链接，这样就确保了博文链接的唯一化，只要不修改 md 文件的`abbrlink`的值， url 就永久不会改变。如此 md 文件名和文件内容也可以随便改了。后面的层级更短，这样也有利于 SEO 优化。
- 安装：
```bah
$ npm install hexo-abbrlink --save
```
- 配置：
  站点配置文件里:
  ```yaml hexo/_config.yml
  permalink: post/:abbrlink.html
  abbrlink:
   alg: crc32  # 算法：crc16(default) and crc32
   rep: hex    # 进制：dec(default) and hex
  ```
百度蜘蛛抓取网页的规则: 对于蜘蛛说网页权重越高、信用度越高抓取越频繁，例如网站的首页和内页。蜘蛛先抓取网站的首页，因为首页权重更高，并且大部分的链接都是指向首页。然后通过首页抓取网站的内页，并不是所有内页蜘蛛都会去抓取。
搜索引擎认为对于一般的中小型站点，3层足够承受所有的内容了，所以蜘蛛经常抓取的内容是前三层，而超过三层的内容蜘蛛认为那些内容并不重要，所以不经常爬取。出于这个原因所以`permalink`后面跟着的最好不要超过2个斜杠。

##### hexo-autonofollow
nofollow 标签是由谷歌领头创新的一个反垃圾链接的标签，并被百度、yahoo 等各大搜索引擎广泛支持，引用 nofollow 标签的目的是：用于指示搜索引擎不要追踪（即抓取）网页上的带有 nofollow 属性的任何出站链接，以减少垃圾链接的分散网站权重。这里推荐 `hexo-autonofollow` 插件来解决。
- 安装：
 ```bash
 $ npm install hexo-autonofollow  --save
 ```
- 配置：
  在站点配置文件中添加以下代码：
  ```yml hexo/_config.yml
  nofollow:
    enable: true
    exclude: # 例外的链接，可将友情链接放置此处
    - exclude1.com
    - exclude2.com
  ```

#### 博文压缩
我们利用Hexo生成的博客文件中存在大量的空格和空行，从而使得博客资源中有很多不必要的内存消耗，使得网站加载变慢，使用gulp压缩资源，首先安装：
在站点的根目录下执行以下命令
```bash
$ npm install gulp -g
$ npm install gulp-minify-css gulp-uglify gulp-htmlmin gulp-htmlclean gulp-imagemin  --save
```
在博客根目录下新建 gulpfile.js ，并填入以下内容：
```js hexo/gulpfile.js
var gulp = require('gulp');
var minifycss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var htmlclean = require('gulp-htmlclean');
//var imagemin = require('gulp-imagemin');

// 压缩html
gulp.task('minify-html', function() {
    return gulp.src('./public/**/*.html')
        .pipe(htmlclean())
        .pipe(htmlmin({
            collapseWhitespace: true, //从字面意思应该可以看出来，清除空格，压缩html，这一条比较重要，作用比较大，引起的改变压缩量也特别大
            collapseBooleanAttributes: true, //省略布尔属性的值，比如：<input checked="checked"/>,那么设置这个属性后，就会变成 <input checked/>
            removeComments: true, //清除html中注释的部分
            removeEmptyAttributes: true, //清除所有的空属性
            removeScriptTypeAttributes: true, //清除所有script标签中的type="text/javascript"属性。
            removeStyleLinkTypeAttributes: true, //清楚所有Link标签上的type属性。
            minifyJS: true,
            minifyCSS: true,
            minifyURLs: true,
        }))
        .pipe(gulp.dest('./public'));
});
// 压缩css
gulp.task('minify-css', function() {
    return gulp.src('./public/**/*.css')
        .pipe(minifycss({
            compatibility: 'ie8'
        }))
        .pipe(gulp.dest('./public'));
});
// 压缩js !代表排除的js,例如['!./public/js/**/*min.js']
gulp.task('minify-js', function() {
    return gulp.src(['./public/js/**/.js'])
        .pipe(uglify()) //压缩混淆
        .pipe(gulp.dest('./public'));
});
// 压缩图片
gulp.task('minify-images', function() {
    return gulp.src('./public/images/**/*.*')
        .pipe(imagemin(
        [imagemin.gifsicle({'optimizationLevel': 3}),
        imagemin.mozjpeg({'progressive': true}),
        imagemin.optipng({'optimizationLevel': 7}),
        imagemin.svgo()],
        {'verbose': true}))
        .pipe(gulp.dest('./public/images'));
});
// 默认任务
gulp.task('default',gulp.series(gulp.parallel('minify-html','minify-css','minify-js','minify-images')));
```
生成博文时执行 hexo g && gulp 就会根据 gulpfile.js 中的配置，对 public 目录中的静态资源文件进行压缩

# 扩展
## 草稿 && 布局
### 草稿布局
为了避免写了一半的文章发布出去，可以在新建布局的时候选择草稿：`hexo new draft "blog title"`，但是我发现生成的页面没有日期。经搜索，找到其模板位置：`./hexo-folder/scaffolds/draft.md`，修改为如下：
```
---
title: {{ title }}
tags:
categories:
description:
date: {{ date }}
---
点击阅读前文前, 首页能看到的文章的简短描述
```
### 广义布局
更广义上来说，你可以在 scaffolds 中定制任意多个布局，draft 和 page 是最常用的两个：
- post：在这里的会当做文章被发布。
- draft：放在这里，避免写了一半的文章被发布。
- page：在首页增加标签页。
为了发不同类型的文章，比如说游记、技术等等，完全可以事先创造多个布局（通过嵌入一些默认变量和 HTML 代码来实现），然后通过 `hexo new layout "title"` 来新建具有该布局的文章，当然，该文章会默认被创建在 post 文件夹中。
比如：
```bash
$ cp scaffolds/page.md scaffolds/test.md
$ hexo new test 'test'
INFO  Created: hexo/source/_posts/2019-10-16-test.md
```
就会创建一个具有 test 模板的文章：`~/Code/blog/hexo/source/_posts/2019-10-16-test.md`
**如果不指定模板，会、默认使用 [_config.yml](https://hexo.io/zh-cn/docs/configuration) 中的 `default_layout` 参数代替，一般来说是 post。**

### 草稿（draft）
draft 布局用于创建草稿，生成的文档存在于 source\_drafts\ 目录中，默认配置下将不会把该目录下的文档渲染到网站中。
考虑到一些文章可能需要数天才能完成，建议将新建文档时的默认布局设置为 draft：
```diff _config.yml
- default_layout: post
+ default_layout: draft
```
测试草稿
hexo server创建的测试网站，默认是不渲染草稿的，如果需要渲染草稿需要加上后缀hexo server --draft
通过以下命令将草稿发布为正式文章：
```bash
$ hexo publish [layout] <filename>
```
该命令会将 source\_drafts\ 目录下以的文章从 draft 移动到 post （只需要用 shell 的 mv 命令也可以)。

## 标签与分类
标签和分类是什么，其区别是什么。
标签和分类都是用于对文章进行归档的一种方式，标签是一种列表结构，而分类是一种树结构。我们以人作为例子，从标签的角度考虑，我可以拥有程序员、高颜值、幽默等标签，这些标签之间没有层级关系；从分类的角度考虑，我是亚洲人、中国人、河南人，这些分类之间是有明确的包含关系的。
可以在 Front-Matter 中添加 catergories 和 tags 字段为文章添加标签和分类，如我为本文添加了 Hexo 和 Markdown 两个标签，并将其归类到了 技术 / 博客 类别，对应的 Front-Matter 结构如下：
```markdown
title: Hexo搭建个人博客系列：写作技巧篇
tags: Hexo Markdown
categories:
- 技术
- 博客
```

## 文章标题格式
在文章顶部必须采用以下格式(称为Front-matter，是文件最上方以 -– 分隔的区域，用于指定个别文件的变量)，将xxxx替换为文章标题，否则文章标题会显示为未命名
```markdown
---
title: xxxx
---
```
属性：
- title：定义了博文的标题
- date：定义了创作此博文的时间
- tags：定义了博文的标签
- update：定义了最后修改的时间
- comments：定义能否评论此博文（true/false，默认为true）
- categories：定义了博文的种类

## 首页文章不展示全文显示摘要
在文章中加以下标签，后面的内容就不会显示出来了。
```markdown
<!--more-->  
```

## 代码块进阶用法
可以通过为代码块附加参数的形式为其添加更丰富的信息提示，效果如下：
```js Hellow World https://www.chenjunxin.com 链接地址
console.log("Hello world!");
```
代码块进阶语法规则：
\``` [language] [title] [url] [link text]
code snippet
\```
其中，各参数意义如下：
- langugae：语言名称，引导渲染引擎正确解析并高亮显示关键字
- title：代码块标题，将会显示在左上角
- url：链接地址，如果没有指定 link text 则会在右上角显示 link
- link text：链接名称，指定 url 后有效，将会显示在右上角
url 必须为有效链接地址才会以链接的形式显示在右上角，否则将作为标题显示在左上角。以 url 为分界，左侧除了第一个单词会被解析为 language，其他所有单词都会被解析为 title，而右侧的所有单词都会被解析为 link text。
如果不想填写 title，可以在 language 和 url 之间添加至少三个空格。


# 参考链接
- [Hexo 博客](http://secrettc.coding.me/insightLabs/2017/05/25/Hexo%E5%8D%9A%E5%AE%A2/)
- [Hexo+nexT 博客建设指南](https://www.pyfdtic.com/2018/03/14/tools-Hexo-nexT-%E5%8D%9A%E5%AE%A2%E5%BB%BA%E8%AE%BE%E6%8C%87%E5%8D%97/)
- [Hexo-NexT (v7.0+) 主题配置](https://tding.top/archives/42c38b10)
- [本博客当前使用的插件总结](https://tding.top/archives/567debe0.html)
- [Hexo+NexT 搭建博客笔记](https://blog.janking.cn/post/hexonote.html)
- [Hexo4.0+Next7.2.4主题优化配置](https://www.codeleading.com/article/41352532227/)
- [hexo配置NexT主题](https://www.ouyanting.com/archives/75d332db.html)
- [Hexo-Next 主题下对博客进行优化](https://chujunwen.xyz/posts/34b6c95f/)
- [Hexo博客+Next主题深度优化与定制](https://bestzuo.cn/posts/blog-establish.html)
- [Hexo 搭建个人博客系列：进阶设置篇](http://yearito.cn/posts/hexo-advanced-settings.html)
- [Hexo Next 主题进阶设置](https://www.qtmuniao.com/2019/10/16/hexo-theme-landscaping/)
- [Hexo进阶高级教程（二）](https://tigerliu.site/2017/06/hexo-2/#%E7%99%BE%E5%BA%A6%E3%80%81%E8%B0%B7%E6%AD%8C%E7%BB%9F%E8%AE%A1)
- [Hexo + Next 主题博客提交百度谷歌收录](https://luanzhuxian.github.io/post/82d92ad4.html)
- [hexo优化之——使用gulp压缩资源](https://todebug.com/use-gulp-with-hexo/)
- [Hexo博客静态资源压缩](https://hasaik.com/posts/495d0b23.html)
