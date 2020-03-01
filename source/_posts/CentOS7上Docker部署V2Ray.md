---
title: CentOS7上Docker部署V2Ray
date: 2020-03-01 14:29:18
tags:
  - Docker
  - V2Ray
categories:
  - 科学上网
  - V2Ray
keywords:
  - Docker
  - V2Ray
  - CentOS7
description:
---
因为之前用的[Vultr](https://www.vultr.com/)的VPS网络经常不太稳定，昨天换了[HostWinds](https://www.hostwinds.com/)家的VPS,所以要从头配置起V2Ray,顺便记录一下，方便日后再换VPS用。
# 安装Dokcer
1. 使用root账户登录，把yum包更新到最新
```bash
$ yum update
```
（期间要选择确认，输入 y 即可）
2. 安装需要的软件包， yum-util 提供yum-config-manager功能，另外两个是devicemapper驱动依赖的
```bash
$ yum install -y yum-utils device-mapper-persistent-data lvm2
```
3. 设置yum源（选择其中一个）
```bash
$ yum-config-manager --add-repo http://download.docker.com/linux/centos/docker-ce.repo #(中央仓库）
$ yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo #(阿里仓库）
```
4. 可以查看所有仓库中所有docker版本，并选择特定版本安装
```bash
$ yum list docker-ce --showduplicates | sort -r
```
5. 安装Docker，命令：yum install docker-ce-版本号，我选的是docker-ce-18.06.3.ce，如下:
```bash
$ yum install docker-ce-18.06.3.ce
```
（期间要选择确认，输入 y 即可）
6. 启动Docker，命令：systemctl start docker，然后加入开机启动，如下:
```bash
$ systemctl start docker
$ systemctl enable  docker
Created symlink from /etc/systemd/system/multi-user.target.wants/docker.service to /usr/lib/systemd/system/docker.service.
```

# Docker安装V2Ray
1. 拉取V2Ray镜像
```bash
$ docker pull v2ray/official
```
2. 新建空白配置文件
```bash
$ mkdir -p /etc/v2ray
$ touch /etc/v2ray/config.json 
$ chmod -R 777 /etc/v2ray/ 
```
3. 修改配置文件，参考下面代码进行修改
```json
{
  "inbounds": [
    {
      "port": 10023, // 服务器监听端口
      "protocol": "vmess",    // 主传入协议
      "settings": {
        "clients": [
          {
            "id": "22ed157d-ad58-4789-adf3-c0d097c98635",  // 用户 ID，客户端与服务器必须相同
            "alterId": 64
          }
        ]
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom",  // 主传出协议
      "settings": {}
    }
  ]
}
```
修改说明：
端口数字 10023 改成你想要设定的，范围 1到65000 ；
ID ：22ed157d-ad58-4789-adf3-c0d097c98635 也要更改，打开网站：https://1024tools.com/uuid 生成。
4. 启动V2Ray容器
```bash
$ docker run -d --name v2ray -v /etc/v2ray:/etc/v2ray -p 10023:10023 v2ray/official v2ray -config=/etc/v2ray/config.json
```
（说明：修改两个10023为上面你改的端口）
**注意:**如果有提示`“IPv4 forwarding is disabled. Networking will not work”`，解决方法如下：
修改/etc/sysctl.conf文件，添加如下内容：
```
net.ipv4.ip_forward=1
```
然后重启网络：
```bash
$ systemctl restart network
```
查看是否添加成功：
```bash
$ sysctl net.ipv4.ip_forward
```
输出为1时则证明是成功的，之后创建镜像和端口转发都没有问题了。

# 配置BBR加速
## 什么是BBR：
TCP BBR是谷歌出品的TCP拥塞控制算法。BBR目的是要尽量跑满带宽，并且尽量不要有排队的情况。BBR可以起到单边加速TCP连接的效果。
Google提交到Linux主线并发表在ACM queue期刊上的TCP-BBR拥塞控制算法。继承了Google“先在生产环境上部署，再开源和发论文”的研究传统。
TCP-BBR已经在YouTube服务器和Google跨数据中心的内部广域网(B4)上部署。由此可见出该算法的前途。TCP-BBR的目标就是最大化利用网络上瓶颈链路的带宽。一条网络链路就像一条水管，要想最大化利用这条水管，最好的办法就是给这跟水管灌满水。
BBR解决了两个问题：
- 在有一定丢包率的网络链路上充分利用带宽。非常适合高延迟，高带宽的网络链路。
- 降低网络链路上的buffer占用率，从而降低延迟。非常适合慢速接入网络的用户。

Google 在 2016年9月份开源了他们的优化网络拥堵算法BBR，最新版本的 Linux内核(4.9-rc8)中已经集成了该算法。对于TCP单边加速，并非所有人都很熟悉，不过有另外一个大名鼎鼎的商业软件“锐速”，相信很多人都清楚。特别是对于使用国外服务器或者VPS的人来说，效果更佳。
BBR项目地址：https://github.com/google/bbr

## 安装BBR
1. yum更新系统版本：
```bash
$ yum update
```
2. 查看系统版本：
```bash
$ cat /etc/redhat-release 
```
3.安装elrepo并升级内核：
```bash
$ rpm --import https://www.elrepo.org/RPM-GPG-KEY-elrepo.org
$ rpm -Uvh https://www.elrepo.org/elrepo-release-7.0-4.el7.elrepo.noarch.rpm
$ yum --enablerepo=elrepo-kernel install kernel-ml -y
```
4. 更新grub文件并重启系统：
```bash
$ uname -r  #查看当前内核版本
$ egrep ^menuentry /etc/grub2.cfg | cut -f 2 -d \' #查看已经安装的内核版本
$ grub2-set-default 0 #修改内核
$ reboot #重启
```
重启后卸载其他内核
```bash
yum -y remove kernel kernel-tools
```
5. 查看内核是否已更换：
```bash
$ uname -r
```
6. 开启bbr
```bash
$ vim /etc/sysctl.conf 
```
在文件末尾添加如下内容
```
net.core.default_qdisc = fq
net.ipv4.tcp_congestion_control = bbr
```
7. 加载系统参数
```bash
$ sysctl -p
```
输出了我们添加的那两行配置代表正常。
8. 确定bbr已经成功开启：
```bash
$ sysctl net.ipv4.tcp_available_congestion_control
net.ipv4.tcp_available_congestion_control = reno cubic bbr
$ lsmod | grep bbr
tcp_bbr 20480 8
输出内容如上，则表示BBR已经成功开启。
```

# 参考链接
- [V2Ray 記錄](https://ppundsh.github.io/posts/e457/)
- [CENTOS7.6 配置BBR加速](https://www.diyihaodian.com/2019/02/07/14/44/27/135/)
- [如何在 Docker 安装 V2ray](https://tomford1986.blogspot.com/2019/02/docker-v2ray.html)