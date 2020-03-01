---
title: CentOS7.x重装配置NodeJS和npm
tags:
  - NodeJS
  - npm
categories:
  - 技术
  - NodeJS
keywords:
  - NodeJS
  - npm
abbrlink: c399c22b
date: 2020-03-01 20:20:21
description:
---
# NodeJS npm卸载
1. 先删除一次
```bash
$ sudo npm uninstall npm -g
或
$ yum remove nodejs npm -y
```
<!--more-->
2. 手动删除残留
- 进入 /usr/local/lib 删除所有 node 和 node_modules文件夹
- 进入 /usr/local/include 删除所有 node 和 node_modules 文件夹
- 检查 ~ 文件夹里面的"local" "lib" "include" 文件夹，然后删除里面的所有 "node" 和 "node_modules" 文件夹
- 可以使用以下命令查找 $ find ~/ -name node $ find ~/ -name node_modules

3. 进入 /usr/local/bin 删除 node 的可执行文件
- 删除: /usr/local/bin/npm
- 删除: /usr/local/share/man/man1/node.1
- 删除: /usr/local/lib/dtrace/node.d
- 删除: rm -rf /home/[homedir]/.npm
- 删除: rm -rf /home/root/.npm

4. 验证是否成功
如果上述你已经按照顺序去执行一遍了，那我们就需要来验证一下我们有没有删除成功。如果出现以下结果说明我们就是删除成功了。
```bash
$ node -v  //not found
$ npm -v //not found
```

# 安装NodeJS步骤

1. wget命令下载Node.js安装包。
选择自己需要安装的版本https://nodejs.org/dist/
选择带`linux-x64.tar.xz`的安装包，该安装包是编译好的文件，解压之后，在bin文件夹中就已存在node和npm，无需重复编译。
```bash
$ wget https://nodejs.org/dist/v12.16.1/node-v12.16.1-linux-x64.tar.xz
```
如果提示找不到`wget`命令,可以先安装`weget`,执行`yum -y install wget`后再安装。
2. 解压文件。
```bash
$ tar xvf node-v12.16.1-linux-x64.tar.xz 
```
3. 创建软链接，使node和npm命令全局有效
通过创建软链接的方法，使得在任意目录下都可以直接使用node和npm命令。
**软件默认安装在`/`目录或者`~`目录下，也就是根目录或当前用户目录，如果不清楚当前的目录可以执行`pwd`命令。如果需要将该软件安装到其他目录（如：`/opt/node/`）下，请进行如下操作：**
```bash
# 创建目录
$ mkdir -p /opt/node/
# 移动到目录中
$ sudo mv /home/chenjunxin/node-v12.16.1-linux-x64/* /opt/node/
# 创建新的软链
sudo ln -s /opt/node/bin/node /usr/local/bin/node
sudo ln -s /opt/node/bin/npm /usr/local/bin/npm
```
4. 查看node、npm版本。
```bash
$ node -v
$ npm -v
```

# npm安装慢或者被墙问题解决办法
因为npm存储包文件的服务器在国外，有时候会被墙，或者下载速度较慢，所以我们需要解决这个问题。
淘宝的开发团队把npm在国内做了一个npm镜像备份，每10分钟会把国外npm的第三方包同步到淘宝自己服务器：
可以安装淘宝的cnpm：
```bash
# --global 表示安装到全局，而非当前目录
$ npm install --global cnpm
# 设置全局软链
$ sudo ln -s /opt/node/bin/cnpm /usr/local/bin/cnpm
# 查看版本信息
$ cnpm -v
```
接下来你安装包的时候把之前的npm替换成cnpm既可。

# 查看和设置npm镜像地址
## 查看配置
```bash
$ npm config list
```
## 设置镜像
常用的 npm 镜像地址有：
- [npm](https://registry.npmjs.org)  (默认)
- [cnpm](https://r.cnpmjs.org)
- [taobao](https://registry.npm.taobao.org)
- [nj](https://registry.nodejitsu.com)
- [rednpm](https://registry.mirror.cqupt.edu.cn)
- [npmMirror](https://skimdb.npmjs.com/registry)
- [edunpm](http://registry.enpmjs.org)
1. 临时使用
```bash
$ npm --registry https://registry.npm.taobao.org install xxx
```
2. 持久使用
```bash
$ npm config set registry https://registry.npm.taobao.org
$ npm config set disturl https://npm.taobao.org/dist
```
或者直接编辑 `~/.npmrc` 文件，加入如下内容：
```
registry = https://registry.npm.taobao.org
disturl https://npm.taobao.org/dist
```
检测镜像是否配置成功
```bash
$ npm config get registry
$ npm config get disturl
```

## 删除镜像
```bash
$ npm config delete registry
$ npm config delete disturl
```

## 查看npm安装目录
```
$ npm root -g
```

## 查看 npm 的 prefix 和 cache 路径配置信息
```
$ npm config get prefix
$ npm config get cache
```

# 参考链接
- [利用npm安装/删除/发布/更新/撤销发布包](https://www.cnblogs.com/penghuwan/p/6973702.html)
- [nodejs npm 卸载 + 重新安装](https://blog.csdn.net/Candy_home/article/details/89314217)
- [在centos7安装nodejs并升级nodejs到最新版本](https://segmentfault.com/a/1190000015302680)
- [阿里云CentOS7.x安装nodejs及pm2](https://juejin.im/post/5dcbf7725188250d2f310569)
- [设置Nodejs NPM全局路径](https://blog.csdn.net/CareChere/article/details/51279789)
