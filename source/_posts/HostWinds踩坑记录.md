---
title: HostWinds踩坑记录
tags:
  - VPS
categories:
  - 技术
  - VPS
keywords:
  - HostWinds
  - VPS
abbrlink: 4c3baba4
date: 2020-03-01 16:08:45
description:
---
最近发现在用的Vultr的VPS网络不太稳定，查了几篇评测文章，最后决定试试HostWinds，买了半年的最基础的那个4点多刀的VPS。用起来发现确实是相对比较稳定，速度嘛，没有网上评测的那么夸张，貌似是HostWinds的线路对国内联通的比较友好，我家里是电信的网。后面有机会再试试搬瓦工的CN2 GIA-E 限量版的机型，貌似线路更好点。CN2的最便宜只有$49.99年付，暂时不想一次买那么久。
<!--more-->
进入正题,这次在用HostWinds的时候，一上来就连接不上VPS，用[ping.pe](http://ping.pe/)测试国外都通，国内全红“表示被封”,显然给的ip被墙了。之前是看到HostWinds现在是可以免费换ip才买的，就刚好试试看。
点击这个按钮就可以免费更换IP:
![](https://oss.chenjunxin.com/picture/blogPicture/4c3baba4_HostWinds_IP.webp)
然而我这边一开始弹出来的是显示要付费3$更换IP，后面是根据下面的排查才解决的。
1. 这个按钮是专门针对中国用户设计的，其他国家和地区是没有这个按钮，所以系统会判断你是否是中国用户，判断的标准有2个：
- 当前你是否使用的是中国IP来访问Hostwinds的官方网站
- 你用户资料中的国家是否是选择的中国
只要针对这两个问题一一排查就可以解决了。
- 你必须要用中国IP，当前不要用翻墙工具上网，这点关闭相应的工具就可以了。（不然购买服务器时付费方式那里也不会显示支付宝的选项）
- 需要登录Hostwinds网站后台，查看你的资料信息中的国家一栏是否选择的中国，资料信息地址：https://clients.hostwinds.com/clientarea.php?action=details ，查看如下图所示地方是否选择中国：
![](https://oss.chenjunxin.com/picture/blogPicture/4c3baba4_HostWinds_Region.webp)
只要完成了相关操作就会出现“Fix ISP Block”这个免费换IP按钮了，如果没有出现就退出账号，重新登录试一下或者换个浏览器，再没有就寻求在线客服帮助一下，注意千万别去点旁边那个"Change Main IP"按钮，那个是给中国之外的用户使用的，需要3美元的。
2. 根据上面那样操作后，点击`Fix ISP Block`按钮，等待一下，然后刷新，一个新的IP分配完成。此方法更换的IP不保证百分百可用，这也要看人品的。国内可以使用了。这个时候再去ping，发现还是不行。这个时候可以试试重装系统和重启网络系统的方法。
打开官网进入个人中心如下图所示：https://www.hostwinds.com
![](https://oss.chenjunxin.com/picture/blogPicture/4c3baba4_HostWinds_Manage_00.webp)
点击管理服务器，如下图所示：
![](https://oss.chenjunxin.com/picture/blogPicture/4c3baba4_HostWinds_Manage_01.webp)
然后进入云管理面板，如下图所示：
![](https://oss.chenjunxin.com/picture/blogPicture/4c3baba4_HostWinds_Manage_02.webp)
然后进入选择选项即可（如下图所示），一般重新生成网络就可以解决连不上问题，不行的话就重装系统重新搭建下就可以。
![](https://oss.chenjunxin.com/picture/blogPicture/4c3baba4_HostWinds_Manage_03.webp)
重装系统后需要等个五六分钟，然后在测试下，如果还是全部不通，就再次重装，有时候重装好几次才能装成功，因为最便宜的机器，内存小，装系统的容错率高。

# 参考链接
- [2020年搬瓦工、Vultr、DigitalOcean等国外VPS怎么样？谈谈怎样选择VPS云服务商](https://zhuanlan.zhihu.com/p/105116450)
- [Vultr、Linode、搬瓦工、DigitalOcean 和 Hostwinds 5家国外VPS主机速度对比](https://www.vps234.com/vultr-linode-bandwagonhost-digitalocean-hostwinds-compare/)
- [美国 VPS Hostwinds 购买流程新手教程](https://www.vps234.com/hostwinds-purchase-tutorial/)
- [重启Hostwinds的VPS重新生成网络和重装系统的方法](https://www.bbaaz.com/thread-361-1-1.html)
- [Hostwinds：免费换IP，找不到Fix ISP Block按钮的解决办法](https://www.zhuji123.com/post/575.html)
