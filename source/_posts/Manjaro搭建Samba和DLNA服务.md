---
title: Manjaro搭建Samba和DLNA服务
tags:
  - Manjaro安装和配置
  - Samba
  - DLNA
categories:
  - 技术
  - Manjaro
keywords:
  - Manjaro
  - Samba
  - DLNA
abbrlink: 8baffc66
date: 2020-02-03 18:23:35
---
需求:想着装好的Manjaro跟同一网络下我的windows系统的笔记本之间能共享借助网络互传些数据,顺便可以的话就让家里的小米电视播放我放在电脑上的一些媒体资源。
在这过程中，了解了些东西，顺便总结一下。
<!--more-->

# 几种媒体共享方式区别

目前常见的媒体共享方式主要有以下几种：Samba、FTP、Upnp（DLNA）、NFS
## Samba

Windows用户都知道的共享方式，局域网访问方便，一般不用于外网访问。
特点是设置方便，缺点是传输效率低，速度不稳定，会有波动。**(我一开始就是搭了这个，后面电视访问电脑看视频的时候，经常不太稳定，才开始找别的方案的。)**
所以，Samba已经不是最佳的家庭媒体共享方式。

## FTP

FTP其实还分为SFTP,FTPS，FTP还支持TLS，这些都是在安全方面的增强。因为FTP是明文密码。
FTP的优势是只要通讯端口开启，IP没错，都能方便连接上，而且特别适合外网共享。
FTP主要用于客户端和服务器之间的文件上传和下载。不适用于修改服务器上的文件。因为它要存取一个文件，就必须先获得一个本地文件的副本，如果修改文件，也只能对文件的副本进行修改，然后再将修改后的文件副本传回到原节点。所以如果你要修改服务器上的一个超大文件，但是只修改几个字节的内容。你依然需要下载整个文件过来，修改完毕后，再回传回去。
FTP的速度非常一般，不推荐用来作为家庭媒体服务器的局域网播放方式。

## Upnp（DLNA）

要求设备必须是处于同一网段内，共享服务的设置也比较简单。由于是专门用于局域网媒体播放的协议，所以网络传输效率也很高，超大文件的快进，后退，都很流畅。**唯一的缺点是不支持外挂字幕。**
另外Upnp（DLNA）的解码是服务器端实现的。所以大幅消耗的是路由器或NAS的硬件资源，而不是播放设备的硬件资源。如果路由器硬件不够强悍，可能会导致其他用户上网受影响。

## NFS

允许应用进程打开一个远地文件，并能够在该文件中某一个特定位置上开始读写数据。本地NFS的客户端应用可以透明地读写位于远端NFS服务器上的文件，就像访问本地文件一样。所以NFS修改服务器上的文件时，可使用户只复制一个大文件中的一个很小的片段，在网络上传送的只是少量的修改数据。
NFS的网络利用率也非常高，速度很快。相比Upnp（DLNA），NFS还支持视频外挂字幕。只要将同名的字幕文件放在同一个目录下即可。

我开启的是Samba和DLNA服务(NFS试过，没成功，客户端能扫描到我的目录一直扫描不到里面的资源，各种方法试过了，加上暂时没有需要外挂字幕的资源，就先不搞了。)

# Samba和DLNA安装

## Samba服务器安装

```
sudo pacman -S samba nautilus-share manjaro-settings-samba
```
配置/etc/samba/smb.conf参数
安装上面软件之后，开始配置参数，先备份smb.conf
mv /etc/samba/smb.conf /etc/samba/smb.conf.bak
然后新建一个，写入如下参数 vim /etc/samba/smb.conf

```bash
[global]
#所要加入的工作组或者域
workgroup = WORKGROUP       
#用于在 Windows 网上邻居上显示的主机名
netbios name = Manjaro      
#定义安全级别
security = user             
#将所有samba系统主机所不能正确识别的用户都映射成guest用户
map to guest = bad user     
#是否开启dns代理服务
dns proxy = no              

#[]内是共享显示的目录名
[media]                    
#实际共享路径
path = /home/johnnychan/code    
#共享的目录是否让所有人可见
browsable = yes             
#是否可写
writable = yes              
#是否允许匿名(guest)访问,等同于public
guest ok = yes              
#客户端上传文件的默认权限
create mask = 0777          
#客户端创建目录的默认权限
directory mask = 0777       
#注意共享文件在系统本地的权限不能低于以上设置的共享权限。
```
修改好了输入
```bash
testparm /etc/samba/smb.conf
```
检查是否有语法错误,接着配置权限和密码工作

```bash
#将系统用户加入到samba用户，并设置密码，这里我们按两次回车，设置成无密码
smbpasswd -a johnnychan  #这里johnnychan是自己系统用户名
pdbedit -L   #查看所有Samba用户
smbclient -L 127.0.0.1 #查看对应IP上的samba服务器,例如这里查看本机
chmod 777 /home/johnnychan/code -R #将 path 中目录的权限设置为777
chmod 777 /home/johnnychan/ #这个不给权限会拒绝访问
```
然后启动服务
```bash
systemctl start smb    #启动服务
systemctl enable smb   #开机自启
#其他命令
systemctl status smb   #查询状态
systemctl restart smb  #重新启动
```
Manjaro防火墙默认关闭的，并且没有安装selinux，安装了的需要关闭
```bash
systemctl stop iptables #关闭防火墙
setenforce 0 #关闭selinux
sudo vim /etc/selinux/config #关闭selinux开机启动
将SELINUX=enforcing改为SELINUX=disabled
```
## DLNA分享服务安装
首先是安裝 DLNA server，使用的是 minidlna 这个软件。
```bash
sudo pacman -S minidlna
```
接着编辑/etc/minidlna.conf 来设定分享目录:
```bash
media_dir=/srv/media
```
第一行会把 /srv/media 底下所有的媒体文件(照片，影片，音乐)分享出去. 如果想要限制媒体的种类, 可以在目录前加上 V(影片), A(声音)或 P(照片)来指定种类:
```bash
media_dir=V,/home/johnnychan/dlna/dlna_videos
media_dir=P,/home/johnnychan/dlna/dlna_pictures 
```
还有修改如下的配置:
```bash
#web端口，可以通过ip:port查看索引状态
port=8200
#服务器命名
friendly_name=Raspi_DLNA
#miniDLNA启动的时候，默认用户是minidlna，修改为root，避免后续文件访问的权限问题。
user=root 
#开启自动更新媒体库
inotify=yes  
```
```bash
systemctl start minidlna #启动服务
systemctl force-reload minidlna # 强制刷新DLNA cache
ps -aux|grep minidlna #查看服务是否已经运行
systemctl status minidlna # 查看服务状态
systemctl enable minidlna # MiniDLNA随机启动
```
访问界面http://127.0.0.1:8200/ 可以查看索引状态
这么一来, 支持 DLNA 的播放程序如VLC 就可以直接浏览 server 上的媒体, 并且串流播放. 当然, 平板或手机也能轻易播放分享出来的媒体，DLNA支持的媒体格式挺丰富的。
如果想进一步对某些内容进行设置授权才能够查看的话，可以使用一个利用 MAC address 来过滤封包的程序(ebtables)。

# 参考链接

- [Manjaro搭建无密访问samba服务器](https://www.cnblogs.com/misfit/p/10603277.html)
- [MiniDLNA 1.2.1 中文配置](https://ramble.3vshej.cn/minidlna-1-2-1-cn-config/)
- [在 Linux 上設定 DLNA 分享服務](https://electronic.blue/blog/2013/01/12-sharing-digital-media-by-dlna-on-linux/)
- [MiniDLNA文件共享](https://jiangxiaoqiang.github.io/2017/03/01/minidlna-file-share/)
- [DLNA分享服务设置(Linux minidlna版)](http://www.mikewootc.com/wiki/sw_develop/multimedia/dlna_server_linux_minidlna.html)
- [MiniDLNA的视频文件夹权限问题](https://answer-id.com/71211354)