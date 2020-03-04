---
title: Manjaro利用AUR装降级软件包
tags:
  - AUR
categories:
  - 技术
  - Manjaro
keywords:
  - Manjaro
  - AUR
abbrlink: 3bcc58b5
date: 2020-03-01 18:04:22
description:
---
系统软件全局升级，导致Jetbrain的idea也升级到了2019.3.3版本，之前的3.2版本的破解失效了，新的版本暂时找不到方法破解，在[AUR](https://aur.archlinux.org/)上也找不到旧的软件包安装。后面发现可以利用AUR上的脚本文件构建旧版本的软件包进行安装。<!--more-->

# 降级安装包获取与安装
1. 进入[AUR](https://aur.archlinux.org/),搜索相应的程序，然后点击`查看PKGBUILD`,如下图:
![](https://oss.chenjunxin.com/picture/blogPicture/3bcc58b5_AUR_00.webp)
2. 然后在界面里点击`summary`，然后选择相应的版本，点击提交信息里的链接，如下图:
![](https://oss.chenjunxin.com/picture/blogPicture/3bcc58b5_AUR_01.webp)
3. 选择下载.tar.gz结尾的文件,如下图：
![](https://oss.chenjunxin.com/picture/blogPicture/3bcc58b5_AUR_02.webp)
4. 解压tar.gz文件，例如:
```bash
$ tar -zxvf aur-91541a618f991dde764187fab6ccf3f20805d1f0.tar.gz
```

5. 进入到解压后的文件夹中,执行安装,需要注意,这里执行makepkg的时候不允许用root用户了,必须用普通用户
```bash
$ makepkg -s #-s参数可以自动解决依赖
```

6. 编译完成后会生成一个.pkg.tar.xz的文件,再用`pacman -U`执行本地安装
```bash
$ pacman -U intellij-idea-ultimate-edition-jre-2019.3.2-1-x86_64.pkg.tar.xz
```

# pacman包管理器的设置
pacman 的配置文件位于/etc/pacman.conf。 man pacman.conf 可以查看配置文件的进一步信息。
为了避免上述的事故，可以在pacman中配置不升级的软件包。

## 不升级软件包
如果由于某种原因，用户不希望升级某个软件包，可以加入内容如下：
```
IgnorePkg = 软件包名
```
多软件包可以用空格隔开，也可是用 glob 模式。如果只打算忽略一次升级，可以使用` --ignore` 选项。忽略了的软件包可通过` pacman -S` 升级。

## 不升级软件包组
和软件包一样，也可以不升级某个软件包组：
```
IgnoreGroup = gnome
```
例如这里我就配置了idea不更新：
```
IgnorePkg = intellij-idea-ultimate-edition 
```

## 升级前对比版本
要查看旧版和新版的有效安装包，请取消`/etc/pacman.conf`中"VerbosePkgLists"的注释。修改后的pacman -Syu输出如下：
```
Package (6)             Old Version  New Version  Net Change  Download Size

extra/libmariadbclient  10.1.9-4     10.1.10-1      0.03 MiB       4.35 MiB
extra/libpng            1.6.19-1     1.6.20-1       0.00 MiB       0.23 MiB
extra/mariadb           10.1.9-4     10.1.10-1      0.26 MiB      13.80 MiB
```

## 彩色输出
Pacman 具有颜色选项，取消 "Color" 行的注释即可。

# 参考链接
- [pacman](https://wiki.archlinux.org/index.php/Pacman_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))
- [AUR 入门](https://firmianay.github.io/2017/10/11/aur_tutorial.html)
- [manjaro在Arch Linux中安装一个软件包](https://willtian.cn/?p=228)
- [manjaro pacman软件包管理器常用命令](https://blog.csdn.net/Tangcuyuha/article/details/80331219)