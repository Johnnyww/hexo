---
title: 使用Travis部署Hexo
date: 2020-02-06 21:24:06
tags: 
- Travis
categories:
- 工具
- Travis
---
使用Travis平台的可持续集成服务来部署自己的Hexo博客。

# 环境说明

Github公开项目(Travis对开源项目是免费，对私有项目是收费的)
Linux服务器(这里用的阿里云的学生机，系统是CentOS 7.0)
终端连接器（用的是Manjaro终端直接连接）

<!--more-->

# 自动化部署流程
1.本地修改代码，提交到指定分支
2.Travis监听仓库改变
3.Travis执行install和script任务（这里可以做一些安装测试构建任务的依赖和测试构建命令。）
4.任务执行成功后，在Travis的 after_success 钩子里面用 ssh免密登陆 服务器
5.自动在服务器上执行配置的脚本
# Travis项目配置
1.在Github创建一个公有(public)仓库，然后访问官方网站travis-ci.org或者travis.com，推荐后一个，因为可以私有仓库（每个帐号一开始有100次私有仓库构建的体验服务）和公有仓库的构建都能一起管理，.org只能单看公有仓库的构建。点击右上角的个人头像，使用 Github 账户登入 Travis CI。
Travis 会列出 Github 上面你的所有仓库，以及你所属于的组织。此时，选择你需要 Travis 帮你构建的仓库，打开仓库旁边的开关。一旦激活了一个仓库，Travis 会监听这个仓库的所有变化。
假设现在已经对某个项目开启了 Travis，那么先去看看 Settings 里默认开启的那几项，根据自己实际需求进行设置，没什么特殊需求默认的设置就可以了。
2.创建添加 .travis.yml 到项目的根目录（稍后要提交到你关联的仓库中的）说白了接下来的事情都是如何去写这个配置文件，因为 Travis 全是根据这个配置文件去执行相应动作的。
3.在本地项目根目录的master分支里面添加 .travis.yml 配置文件，添加如下配置:
```yaml
# .travis.yml
language: node_js   #前端工程所以是JavaScript，编译环境是node_js
node_js:
- 12.14.1   #指定node版本
branchs:
  only:
  - master  #指定只有检测到master分支有变动时才执行任务
```
将该配置文件推送到服务器。 返回Travis网站，此时Travis已经检测到该仓库的变动（有可能会有点延迟），所以会根据仓库根目录下的.travis.yml配置文件开始执行任务。
可以在Job log界面看任务执行时的输出，在View config的标签页下面看到此次任务的配置信息，包括了你在.travis.yml里面配置的和Travis自动配置的信息。
此时，Travis监听仓库变化，自动执行任务已经完成了，也就是流程中的前三步已经完成了。
# Travis使用SSH免密登陆服务器
SSH的登陆原理看这个:[SSH公钥登陆原理](https://www.cnblogs.com/scofi/p/6617394.html)。SSH录利用的是非对称加密的方式。基本步骤就是
- 在客户端生成公钥和私钥
- 然后将私钥保存在客户端的~/.ssh/id_rsa中
- 将公钥保存在服务器的~/.ssh/authorized_keys文件中
更改文件的权限后，我们就能直接通过ssh免密登录我们的服务器。但是我们是无法操作travis的客户端的，但是如果我们了解ssh免密登录的原理后，你会发现公钥和私钥在什么地方生成都行，最重要的是两个要成对。

ssh免密登录的大致过程就是：客户端向服务器发起登录请求，服务器向客户端返回一段随机字符串，客户端收到这段字符串后使用自己的私钥进行加密，然后发给服务器。服务器接收后使用自己保存的公钥解密，如果解密后的数据相等就登录成功，否则断开连接。

所以，公钥和私钥的生成我们完全可以在自己的服务器上进行操作。首先，登录到自己的服务器。

## 生成公钥/私钥对
这里直接在服务器上面生成密钥对，理论上在哪里生成密钥对都可以，只要是配套的。
用一个非root的常用用户或者新建一个用户，切到该用户下
```bash
# 生成RSA密钥对，后面所有的直接以默认就行，passphase一定要为空
$ ssh-keygen -t rsa
```
可以看到生成密钥对在用户家目录的.ssh文件夹下面。 由于Linux权限的控制规则，文件的权限不是越大越好，所有需要设置合适的权限。这里需要把.ssh目录设置为700权限（可能默认就是），目录下面的文件设置为600权限。
```bash
$ chmod 600 ~/.ssh/*
```
然后将生成的公钥(id_rsa.pub)中的内容添加到.ssh/authorized_keys中
```bash
$ touch ~/.ssh/authorized_keys
$ cat ~/.ssh/id_rsa.pub >>  ~/.ssh/authorized_keys
```
到此，密钥对已经生成完成。下面，我们就需要测试一下免密登录的操作是否能成功。在.ssh目录下执行一下操作：
```bash
$ touch config
```
然后在config中添加如下内容:
```bash
Host test
# 换成需要登录的主机ip
HostName $IP
# 端口号
Port 6666
# 换成需要登录的用户名
User $UserName
StrictHostKeyChecking no
IdentitiesOnly yes
# 私钥的存放路径
IdentityFile ~/.ssh/id_rsa
```
```bash
$ ssh test
```
运行ssh test后报错Bad owner or permissions on ~/.ssh/config。这里同样要求我们要把.ssh/config和.ssh/authorized_keys权限设置为600。登录成功的花会有另外的信息，同时在.ssh/下多了一个known_hosts文件。
下面我们就需要将上面的密钥对中的私钥放在travis上，但是我们是无法直接操作travis服务器的，因此我们也就不能将私钥放在travis服务器上。但是，我们可以将私钥放在travis服务器能够读取的地方，因为travis是能够直接读取我们项目的工程的，所以，我们可以将私钥放在我们的项目中，travis提供了对私钥进行加密的功能，我们可以将私钥加密之后放在我们的工程中，当travis需要连接我们的服务器时，就解密这个私钥用于连接。

## 安装Travis客户端
### 安装ruby
Travis是通过gem进行安装的，`gem`是ruby的管理工具，所以我们需要先安装ruby。
```bash
$ curl -sSL https://get.rvm.io | bash -s stable
sudo yum install ruby #这是centos系统下安装命令
yum install rubygems
yum install ruby-devel
```
查看RubyGems环境变量配置命令：
which gem
正确找到会输出内容 /usr/bin/gem，如果没有找，则需要进行环境变量的设置，有则无需设置了。
### 修改镜像源
安装完ruby之后就可以使用gem包管理工具了，但是好像官方镜像源被墙了，所以需要更换gem的镜像源。参考[Ruby China](https://gems.ruby-china.com/)
```bash
$ gem sources -l
*** CURRENT SOURCES ***

https://rubygems.org/
$ gem -v
2.7.7
#更换镜像源
$ gem sources --add https://gems.ruby-china.com/ --remove https://rubygems.org/
https://gems.ruby-china.com/ added to sources
https://rubygems.org/ removed from sources
$ gem sources -l
*** CURRENT SOURCES ***

https://gems.ruby-china.com/
```
### 安装Travis命令行工具
```bash
$ gem install travis
$ travis help #测试travis客户端是否安装成功
```
将项目用git克隆到服务器上，进入到项目的根目录下
```bash
$ travis login
或者运行以下其中一条命令，根据GitHub关联授权的travis网址后缀选择
$ travis login --com
$ travis login --org
# 加密私钥匙并把的对应信息加入到.travis.yml中
$ travis encrypt-file ~/.ssh/id_rsa  --add
```
然后，你就会发现在项目的根目录下多了一个id_rsa.enc文件以及.travis.yml多了一个before_install指令
```bash
$ cat .travis.yml
language: node_js
node_js:
- 12.14.1
branchs:
  only:
  - master
before_install:
- openssl aes-256-cbc -K $encrypted_311a3ff6a6ef_key -iv $encrypted_311a3ff6a6ef_iv
  -in id_rsa.enc -out ~/.ssh/id_rsa -d
```
解密命令中 -in 和 -out 参数:
- in 参数指定待解密的文件，位于仓库的根目录(Travis执行任务时会先把代码拉到Travis自己的服务器上，并进入仓库更目录)
- out 参数指定解密后的密钥存放在Travis服务器的~/.ssh/id_rsa
**需要手动将-out选项的值多了的一个\符号去掉**

然后将变更推送到master分支，触发travis构建。

# 配置after_success

到此，我们就差最后一个步骤了：在.travis.yml中添加一些配置，主要是after_success钩子配置。修改之后的配置如下：
```yaml
language: node_js
node_js:
- 12.14.1
branchs:
  only:
  - master  #设定分支
addons:
  ssh_known_hosts:
  - $SERVER_IP  #受信主机，在使用 ssh 登陆时会确认主机信息，travis-ci 无法进行交互操作。所以需要在 .travis.yml 中添加addons:ssh_known_hosts
before_install:
- openssl aes-256-cbc -K $encrypted_311a3ff6a6ef_key -iv $encrypted_311a3ff6a6ef_iv
  -in id_rsa.enc -out ~/.ssh/id_rsa -d
- chmod 600 ~/.ssh/id_rsa #还是Linux文件权限问题
- echo -e "Host "$SERVER_IP"\n\tStrictHostKeyChecking no\n" >> ~/.ssh/config
after_success:
- ssh chenjunxin@"$SERVER_IP" -p "$SERVER_PORT" -o StrictHostKeyChecking=no '. /home/chenjunxin/deploy/deployhexo.sh'
# - ssh chenjunxin@"$SERVER_IP" -o StrictHostKeyChecking=no 'cd ~/hexo && git pull && npm install && hexo clean && hexo g'
```
ssh命令需要加上StrictHostKeyChecking=no选项，具体的可以查看禁用ssh远程主机的公钥检查。
可以直接在ssh连接后面写要运行的命令，也可以写在服务器上的shell文件里，然后远程登录执行。
after_success是在Travis执行完 install 和 script 之后执行的钩子,其他的Travis配置可以参考官方文档。
"$SERVER_IP":这个值是Travis加密的值，可以设置在Job log中是否显示。可以在Travis控制台中的Setting中设置。
![](https://chenjunxin.oss-cn-shenzhen.aliyuncs.com/picture/blogPicture/2020/Travis/travis_dashboard_hexo_setting.png)
也可以在服务器上运行以下命令（$IP填具体IP的值）
```bash
$ travis encrypt  "SERVER_IP=$IP" --add
```
命令执行之后会在.travis.yml新增一个sercure的值。
在运行的时候，Travis那边的服务器会分别从Setting设置与.travis.yml文件获取定义的变量值。更详细的内容可以查阅[官方文档](https://docs.travis-ci.com/user/environment-variables/)

# 一点补充

服务器上的travis客户端的配置文件在用户目录下的`$HOME/.travis/`中。其中的config。yml里可以 endpoint可以配置数据库构建的地址，可以是https://api.travis-ci.com/ 或者 https://api.travis-ci.com/

# 参考链接
- [使用Travis CI自动部署Hexo博客](https://www.itfanr.cc/2017/08/09/using-travis-ci-automatic-deploy-hexo-blogs/)
- [travis自动化部署github项目到server](https://www.dazhuanlan.com/2019/10/15/5da588149783f/)
- [Hexo + GitHub + Travis CI + VPS 自动部署](https://changkun.us/archives/2017/06/232/)
- [Travis CI 系列自动化部署测试教程（VPS服务器）](https://www.jonhuu.com/sample-post/1108.html)
- [travis自动化部署续篇](https://andyliwr.github.io/2018/04/28/travis_node_publish2/)
- [Travis-CI自动化测试并部署至自己的CentOS服务器](https://juejin.im/post/5a9e1a5751882555712bd8e1)
- [利用travis-ci持续部署nodejs应用](https://cnodejs.org/topic/5885f19c171f3bc843f6017e)
- [禁用SSH远程主机的公钥检查](http://www.worldhello.net/2010/04/08/1026.html)
- [解决linux中ssh登录Warning:Permanently added (RSA) to the list of known hosts](https://blog.csdn.net/bingguang1993/article/details/82415543)
- [TrueChain持续集成项目打包（Travis-CI）](http://www.cocoachina.com/articles/24904)