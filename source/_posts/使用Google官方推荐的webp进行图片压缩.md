---
title: 使用Google官方推荐的webp进行图片压缩
tags:
  - 图片压缩
categories:
  - 工具
  - 图片压缩
  - WebP
keywords:
  - WebP
  - Linux
  - 图片压缩
description: WebP是一种相对较新的开源图像格式，它为Google设计的网页上的图像提供了卓越的无损和有损压缩。
abbrlink: 93260b1f
date: 2020-03-21 17:11:16
---

# WebP介绍
&emsp;WebP是一种相对较新的开源图像格式，可为Web上的图像提供出色的无损和有损压缩。 使用WebP，网站管理员和Web开发人员可以创建更小，更丰富的图像，从而使Web更快。  
&emsp;与PNG相比，WebP无损图像的尺寸要小26％。 在同等的SSIM质量指数下，WebP有损图像比同类JPEG图像小25-34％。无损WebP支持透明性（也称为Alpha通道），而仅增加了22％的字节数。 对于可以接受有损RGB压缩的情况，有损WebP还支持透明性，与PNG相比，文件大小通常小3倍。  
&emsp;要使用它，需要下载适用于Linux，Windows和Mac OS X的预编译的实用程序。

# Linux中安装使用WebP工具

## 安装WebP
Manjaro/ArchLinux系统下,直接在终端运行命令安装就可以了:
```
$ sudo pacaman -S libwebp
```
在Linux发行版上，首先从Google Googles存储库下载webp包，如下所示。
```bash
$ wget -c https://storage.googleapis.com/downloads.webmproject.org/releases/webp/libwebp-1.1.0-linux-x86-64.tar.gz

或者

$ curl -c https://storage.googleapis.com/downloads.webmproject.org/releases/webp/libwebp-1.1.0-linux-x86-64.tar.gz
```

然后解压该文件并进入解压缩的包目录中:
```bash
$ tar -xvf libwebp-1.1.0-linux-x86-64.tar.gz 
$ cd libwebp-1.1.0-linux-x86-64/
$ cd bin/
$ ls
```
![](https://oss.chenjunxin.com/picture/blogPicture/93260b1f_webp_00.webp)

**Webp软件包**  
该软件包包含一个预编译库（ libwebp ），用于将webp编码或解码以及其他各种webp实用程序。

- anim_diff - 显示动画图像之间差异
- anim_dump - 转储动画图像之间差异
- cwebp - webp编码器
- dwebp - webp解码器
- gif2webp - 将GIF图像转换为webp
- img2webp - 用于将一系列图像转换为动画webp文件的工具。
- vwebp - webp文件查看器
- webpinfo - 用于查看有关webp图像文件的信息
- webpmux - 用于从静态的webp images创建动态的webp，或者从动态的webp提取静态的webp images

## WebP转换实例
将webp工具目录添加至PATH中，编辑~/.bashrc添加以下内容：
```
export PATH=$PATH:~/libwebp-1.1.0-linux-x86-64/bin
```
保存该文件并退出。 然后在终端执行`source ~/.bashrc`。

## cwebp使用
将一个图像文件压缩成一个webp文件，输入文件可以是PNG,JPEG,TIFF,WebP等等。
语法：  
```
cwebp [options] input_file -o output_file.webp
```
选项

- -o string
指定输出文件名
- -h，-help
简单的使用说明
- -H，-longhelp
详细的使用说明
- -version
版本号
- -lossless
对图像进行无损编码
- -q float
指定压缩因素，范围是0-100，默认为75
- -z int
在0-9之间切换无损耗压缩模式，0级最快，9级最慢。快速模式产生的文件大小比较慢的文件要大。默认是6。如果-q或者-m之后被使用，-z将无效。
- -mt
如果可能的话，使用多线程编码
- -low_memory
减少对有损编码的内存使用。
- -f int
指定过滤器的强度，范围在0(不过滤)-100(最大过滤)，值越高图像就越平滑，典型的值通常在20-50之间。
- -sns int
指定空间噪声形成的振幅，范围为0(弱)-100(强)，默认为50。
- -progress
报告编码进展百分比。
例子:
```bash
# 将picture.png以50的质量无损转换为webp
$ cwebp -q 50 -lossless picture.png -o picture_lossless.webp
cwebp -q 70 picture_with_alpha.png -o picture_with_alpha.webp
cwebp -sns 70 -f 50 picture.png -o picture.webp

# 使用vwebp工具查看转换后的webp图像
$ vwebp picture_lossless.webp
```

>编码器，标准和高级选项[文档](https://developers.google.com/speed/webp/docs/cwebp)

# dwebp使用
将WebP文件解压成一个图像文件，类型可以是JPG，PNG，PAM，PPM，PGM等等。
语法：  
```
dwebp [options] input_file.webp
```
选项

- -h
打印用法总结。
- -version
打印版本号。
- -o string
指定输出文件名
- -bmp
将输出格式更改为未压缩的BMP。
- -tiff
将输出格式更改为未压缩的TIFF。
- -pam
将输出格式更改为PAM(保留alpha)。
- -ppm
将输出格式更改为PPM(丢弃alpha)。
- -pgm
将输出格式更改为PGM。
```bash
$ dwebp image.webp -o image.png
```

>解码器，命令行选项[文档](https://developers.google.com/speed/webp/docs/dwebp)

# 更多WebP的使用
<https://developers.google.com/speed/webp/docs/using>

# 参考链接
- [WebP官方转换工具手把手安装教程](https://blog.csdn.net/aa464971/article/details/77963949)
- [WebP - Mac上使用cwebp,dwebp,webpmux工具](https://www.jianshu.com/p/61ab330a6de6)
- [如何在Linux中将图像转换为WebP格式](https://www.howtoing.com/convert-images-to-webp-format-in-linux)
