---
title: Docker踩坑后的总结
tags:
  - Docker
categories:
  - 技术
  - Docker
keywords:
  - Docker总结
  - volumn
  - mount
description: 在封装Docker镜像还有启动容器的时候，被Docker在挂载目录方面的内容坑了下，后面处理完也加深了对Docker的一些了解，在这里总结一下。
abbrlink: cec51938
date: 2020-04-25 16:24:22
---
# Docker数据挂载
要想将容器的内容保存在主机上，Docker有两种做法：volumn和bind mount,在Linux系统上的Docker还可以使用tmpfs mount。三种方式的差异如下图所示:
![](https://oss.chenjunxin.com/picture/blogPicture/cec51938_bind_mount_principle.webp)

1. volume 存放在主机中由 Docker 管理的地方，在 Linux 系统上是在 `/var/lib/docker/volumes/` 路径下。非 Docker 的程序不应该修改此路径下的文件。要保存Docker中的文件资料  ，volumes 是最好的方法。
2. `bind mount` 可存放在主机的任意位置的文件夹上，无论是否是 Docker 容器都可以随时修改其中的内容。
3.  `tmpfs mount` 只存放在内存中，不会写入系统的文件系统，即硬盘上。

以下是对三种方式的进一步说明：

## Volume
volume(数据卷)是一个可供一个或多个容器使用的特殊目录，它绕过 UFS，可以提供很多有用的特性：

- volume可以在容器之间共享和重用
- 对volume的修改会立马生效
- 对volume的更新，不会影响镜像
- volume默认会一直存在，即使容器被删除
注意：volume的使用，类似于 Linux 下对目录或文件进行 mount，镜像中的被指定为挂载点的目录中的文件会隐藏掉，能显示看的是挂载的volume。  

volume(数据卷)是由 Docker 建立与管理的，可用`docker volume create`指令直接建立，或者在建立容器或服务时一起建立。volume创建时存放在主机的目录中，将volume挂载到容器中，就是挂载该目录。一个 volume 可同時挂载到多个容器中，即使沒有运行中的容器使用此volume，它对 Docker 还是可用的，不会被自动删除。volume可以是具名或匿名 (anonymous) 的，Docker 会给匿名volume生成一个随机的目录名，然后在该目录名下的\_data文件夹下，在同一个 Docker 主机中不会有重复。  

与 volume 相关的命令為`docker volume`  
**创建一个volume**
```bash
$ docker volume create my-vol
```
create 之后如果不加参数，就会建立一个匿名volume，由 Docker给此 volume一個随机的名字。  

**列出volume**
```bash
$ docker volume ls
DRIVER              VOLUME NAME
local               fce415e10e9142e304769ff2f4cd1d45faf9fba17aaa309e4bcd7a3e53eaaaae
local               my-vol     
```
前者是匿名volume，后者是具体名字的volume  

**查看指定volume信息**
```bash
$ docker volume inspect my-vol
[
    {
        "CreatedAt": "2020-04-27T09:32:52+08:00",
        "Driver": "local",
        "Labels": {},
        "Mountpoint": "/var/lib/docker/volumes/my-vol/_data",
        "Name": "my-vol",
        "Options": {},
        "Scope": "local"
    }
]
```

**启动一个挂载volume的容器**  
在用`docker run`命令的时候，使用`-v`或者`--mount`标记来将volume 挂载到容器里。在一次 docker run 中可以挂载多个volume。  
下面创建一个名为`web`的容器，并加载一个volume到容器的 /webapp 目录。  
```bash
$ docker run -d -P \
    --name web training/webapp:latest \
    -v my-vol:/wepapp
    #--mount source=my-vol,target=/webapp
```

**查看volume的具体信息**  
使用以下命令可以查看`web`容器的数据卷信息：
```bash
$ docker inspect web
```
volume信息在 "Mounts" Key 下面
```bash
"Mounts": [
    {
        "Type": "volume",
        "Name": "my-vol",
        "Source": "/var/lib/docker/volumes/my-vol/_data",
        "Destination": "/app",
        "Driver": "local",
        "Mode": "",
        "RW": true,
        "Propagation": ""
    }
],
```

**移除volume**
```bash
$ docker volume rm my-vol
```
**数据卷是被设计用来持久化数据的，它的生命周期独立于容器，Docker不会在容器被删除后自动删除数据卷，并且也不存在垃圾回收这样的机制来处理没有任何容器引用的数据卷。**
如果需要在删除容器的同时移除数据卷。可以在删除容器的时候使用命令
```bash
$ docker rm -v 容器id
```
无主的数据卷可能会占据很多空间，要清理请使用以下命令
```bash
$ docker volume prune
```

## Bind Mount
使用`bind mount`时，会将主机上的指定文件或目录挂载到容器上，挂载的方式和volume类似。以`--mount`标记挂载要加上額外的参数，另外主机上的来源文件(或目录)地址参数必须使用绝对路径。  
首先是`--mount`方式，注意加上`type=bind`。
```bash
$ docker run -d --name nginx nginx:latest \
  --mount type=bind,source=/usr/local/target,target=/app
```
`-v`方式范例：
```bash
$ docker run -d --name nginx nginx:latest \
  -v /usr/local/target:/app
```

### Docker 又是如何做到把一个宿主机上的目录或者文件，挂载到容器里面去呢
这里要使用到的挂载技术，就是 Linux 的绑定挂载（bind mount）机制。它的主要作用就是，允许你将一个目录或者文件，而不是整个设备，挂载到一个指定的目录上。并且，这时你在该挂载点上进行的任何操作，只是发生在被挂载的目录或者文件上，而原挂载点的内容则会被隐藏起来且不受影响。  
其实，如果了解 Linux 内核的话，就会明白，绑定挂载实际上是一个 inode 替换的过程。在 Linux 操作系统中，inode 可以理解为存放文件内容的“对象”，而 dentry，也叫目录项，就是访问这个 inode 所使用的“指针”。
![](https://oss.chenjunxin.com/picture/blogPicture/cec51938_bind_mount_principle.webp)
正如上图所示，mount --bind /home /test，会将 /home 挂载到 /test 上。其实相当于将 /test 的 dentry，重定向到了 /home 的 inode。这样当我们修改 /test 目录时，实际修改的是 /home 目录的 inode。这也就是为何，一旦执行 umount 命令，/test 目录原先的内容就会恢复：因为修改真正发生在的，是 /home 目录里。  

### `-v`和`--mount`不同点：
-  `-v`可以主机上不存在的目录。当挂载的路径（目录或文件）不存在，`-v`会以目录方式建建立该路径，`--mount`會產生錯誤。
-  如果`bind mount`是挂载了主机的一个非空的目录，则容器内的挂载的目录中的原本的内容会被屏蔽掉，以外部主机的目录内容为准。

### `volume`与`bind mount`不同点:
- **当容器外的对应目录是空的，volume会先将容器内的内容拷贝到容器外目录，而`bind mount`会将外部的目录覆盖容器内部目录！！**
- `volume`还有一个不如`bind mount`的地方，不能直接挂载文件，例如挂载nginx容器的配置文件：nginx.conf。

这里需要说明，类似于配置文件这种单文件方式并不适合使用`volume`，`bind mount`虽然也可以解决，但由于config文件中包含一些类似于数据库密码等敏感信息，因此，最好的方式是使用`tmpfs`。

## tmpfs mount
`tmpfs mount`只能用在Linux中运行的Docker，只是暂时性地将资料留在主机内存之中，当容器停止的时候，`tmpfs mount`就会被移除。它通常用來存放敏感性的资料，另外也不能在多个容器中共用。  
要挂载`tmpfs mount`可以使用`--tmpfs`或`--mount`两种标记，和volume的情況类似，在 Docker 17.06 后也可以在容器使用`--mount`。挂载时不需要指定来源(source)，示范如下：
```bash
$ docker run -d --name tmptest  nginx:latest \
  --mount type=tmpfs,destination=/app 
  
$ docker run -d --name tmptest  nginx:latest \
  --tmpfs /app 
```

##  Docker数据挂载使用场景总结
使用 volume 的场景：

1. 多个运行容器之间的数据共享。就算停掉容器卷也还存在，多个容器可以同时挂载、读写、只读相同的 volume
2. 当主机不能保证有给定的目录或者文件
3. 存储数据在远程主机或者云上, 而非本地
4. 需要从主机备份、恢复、迁移数据到另一个主机上. 可以停掉容器后，备份卷目录，如 /var/lib/docker/volumes/<volume_name>

使用 bind mount 的场景：

1. 容器和主机共享配置文件. Docker 默认为容器提供 DNS 解析就是这种方式，从主机挂载 /etc/resolv.conf 到每个容器
2. 和主机的开发环境共享源码或者文件。例如挂载 Maven 的 target 目录到容器，每次 Maven 构建完毕，容器就会访问重构建的文件。
3. 当主机的文件或者目录结构保证与容器所需的`bind mount`一致

使用 tmpfs mount 场景：无需主机和容器间数据的持久存储
tmpfs, 它把数据存储在内存里，不会被写入主机的文件系统或者 docker 内，可以用来存储非持久状态和敏感信息。
`docker swarm service`就是使用`tmpfs`挂载`docker secrets`(如密码、SSH 密钥、SSL 认证等) 到一个服务的容器里。

要注意：

- 当挂载一个空`volume`到容器的非空目录时，目录里的内容都会被拷贝到卷内。
- 当挂载一个非空`volumne`或者`bind mount`到容器的非空目录时，容器非空目录下的内容都会被遮住。他们没有被删除或者改变，只是无法被访问到了。
- `bind mount`和`volume`都可以使用`-v`挂载到容器，但是在 Docker 17.06 及更高版本建议使用`--mount`挂载容器和服务，用于`bind mount`,`volume`或者`tmpfs mount`，这样语法更清晰些。

## docker run -v 挂载数据卷异常
用docker启动redis的时候出现以下异常：
```bash
$ docker run -d -p 6379:6379  -v $PWD/data:/data  redis --appendonly yes
d06e8905aeb84458e5930e086f0a087d2ef35774c0cc6a3e1ff9f74b5925a80b
$ docker logs d0
chown: changing ownership of './appendonly.aof': Permission denied
chown: changing ownership of '.': Permission denied
```
解决方案，加上–privileged=true
```bash
$ docker run -d -p 6379:6379 -v $PWD/data:/data --privileged=true redis --appendonly yes
```
注:`–privileged=true`最好紧跟` -v`指令，要不然可能不起作用。
使用该参数，container内的root拥有真正的root权限,否则，container内的root只是外部的一个普通用户权限。  
使用该参数启动的容器，可以看到很多host上的设备，并且可以执行mount,甚至允许你在docker容器中启动docker容器。

# Docker镜像相关
## Docker Hub 镜像加速器
国内从 Docker Hub 拉取镜像有时会遇到困难，此时可以配置镜像加速器。Docker 官方和国内很多云服务商都提供了国内加速器服务。

### 配置加速地址
创建或修改 `/etc/docker/daemon.json`：
```
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
    "registry-mirrors": [
        "https://1nj0zren.mirror.aliyuncs.com",
        "https://docker.mirrors.ustc.edu.cn",
        "http://f1361db2.m.daocloud.io",
        "https://registry.docker-cn.com"
    ]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```

### Docker Hub 镜像加速器列表
|镜像加速器|镜像加速器地址|专属加速器|
|----|----|----|
|[Docker 中国官方镜像]()|https://registry.docker-cn.com ||
|[DaoCloud 镜像站]()|http://f1361db2.m.daocloud.io|可登录，系统分配 ||
|[Azure 中国镜像]()|https://dockerhub.azk8s.cn ||
|[科大镜像站]()|https://docker.mirrors.ustc.edu.cn ||
|[阿里云]()|https://<your_code>.mirror.aliyuncs.com |需登录，系统分配|
|[七牛云]()|https://reg-mirror.qiniu.com ||
|[网易云]()|https://hub-mirror.c.163.com ||
|[腾讯云]()|https://mirror.ccs.tencentyun.com ||


### 检查加速器是否生效
命令行执行`docker info`，如果从结果中看到了如下内容，说明配置成功。
```
Registry Mirrors:
  https://dockerhub.azk8s.cn/
  https://hub-mirror.c.163.com/
  http://f1361db2.m.daocloud.io/
  https://registry.docker-cn.c
```

### Docker Hub 镜像测速
使用镜像前后，可使用`time`统计所花费的总时间。测速前先移除本地的镜像！
```bash
$ docker rmi node:latest
$ time docker pull node:latest
Pulling repository node
[...]

real   1m14.078s
user   0m0.176s
sys    0m0.120s
```

## 镜像的导入导出：
```bash
[root@localhost ~]# docker ps -a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                   NAMES
e1cfa12a7593        nginx               "nginx -g 'daemon of…"   3 minutes ago       Up 2 minutes        0.0.0.0:32769->80/tcp   sharp_jepsen
#将上面镜像名称为nginx的镜像保存到mynginx.tar这个包中
[root@localhost ~]# docker save -o mynginx.tar e1cfa12a7593
Error response from daemon: No such image: e1cfa12a7593
[root@localhost ~]# docker save -o mynginx.tar nginx
[root@localhost ~]# ll
-rw-------  1 root root  112703488 8月  18 21:19 mynginx.tar
[root@localhost ~]# ls | grep myngi
mynginx.tar
[root@localhost ~]#
```
发现上面已经有了一个mynginx.tar的包  
复制到另一台机器上导入（接下来是机器192.168.106.110机器，上面是109机器）：
```bash
[root@localhost ~]# pwd
/root
[root@localhost ~]# ll
-rw-r--r--  1 root root 112703488 8月  18 21:31 mynginx.tar
[root@localhost ~]# docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
[root@localhost ~]# docker load < mynginx.tar 
cdb3f9544e4c: Loading layer [==================================================>]  58.44MB/58.44MB
a8c4aeeaa045: Loading layer [==================================================>]  54.24MB/54.24MB
08d25fa0442e: Loading layer [==================================================>]  3.584kB/3.584kB
Loaded image: nginx:latest
[root@localhost ~]# docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
nginx               latest              c82521676580        3 weeks ago         109MB
[root@localhost ~]#
```
通过上面我们可以看到开始docker images中没有镜像列表，在导入之后发现多了一个镜像

## 用commit 提交相关镜像生成一个新镜像：
```bash
[root@localhost ~]# docker ps -a
CONTAINER ID        IMAGE               COMMAND                  CREATED              STATUS                     PORTS                   NAMES
dfd1c30384f1        centos              "/bin/bash"              About a minute ago   Exited (0) 4 seconds ago                           ecstatic_booth
e1cfa12a7593        nginx               "nginx -g 'daemon of…"   24 minutes ago       Up 24 minutes              0.0.0.0:32769->80/tcp   sharp_jepsen
[root@localhost ~]# docker commit -m "Add tuzuoquan.txt" -a "toto-txt" dfd1c30384f1 toto
sha256:232eab347b5b848ef4484b47e912515b53b5f75af4d3ae507a0af6e42f10a46d
```

- -m:表示备注信息
- -a:作者相关信息。
- dfd1c30384f1：就是刚刚我们创建的容器ID
- toto: 表示生成的镜像名称：
当然我们不推荐这种方式，应该使用Dockerfile来操作的。后面才讲。

### 查看本地文件一探究竟：
```bash
[root@localhost ~]# cd /var/lib/docker/
[root@localhost docker]# ll
total 8
drwx------. 20 root root 4096 Mar 12 17:11 containers      ##容器运行相关信息
drwx------.  5 root root   50 Dec 17 22:59 devicemapper    ##存储对应的存储池和相关的元数据
drwx------.  3 root root   25 Dec 17 22:52 image           ##各层相关信息
drwxr-x---.  3 root root   18 Dec 17 22:52 network         
drwx------   4 root root   30 Feb 21 14:26 plugins
drwx------.  2 root root    6 Dec 19 11:54 swarm
drwx------.  5 root root   96 Mar 12 16:57 tmp
drwx------.  2 root root    6 Dec 17 22:52 trust
drwx------. 15 root root 4096 Mar  3 00:45 volumes        ##数据卷相关信息
```

# docker login登录非docker hub仓库
使用语法：docker login \[OPTIONS\]  [SERVER\]，其中options的取值有三种：`--password`或者`-p`，表示密码；`--password-stdin`表示通过标准输入使用密码，这种使用方式输入密码时，不可见；`--username`或者`-u`，表示用户名。  
一般`-u`和`-p`配合使用，默认情况下是通过标准输入来登录，即`--password-stdin`。例如：
```bash
$ docker login -u test -p 123456
```

## 登录你自己的仓库
默认情况下，docker login会登录docker hub上的仓库。如果你想登录其他镜像仓库，你只需要在登录时将服务器名添加进去即可。
```bash
$docker login registry.csdn.com
```
登录完成后就可以在$HOME/.docker/config.json文件中找到你的相关认证信息，例如：
```bash
{
	"auths": {
		"https://index.docker.io/v1/": {
			"auth": "aJKvamllasdffzp6aGoxJKL2RTY="
		},
		"registry.csdn.com": {
			"auth": "aJKvamllasdffW86WmhqBNMyMzE2"
		}
	},
	"HttpHeaders": {
		"User-Agent": "Docker-Client/18.06.1-ce (linux)"
	}
}
```

## 退出仓库
```bash
$docker logout registry.csdn.com
```

# 使用Dockerfile 创建镜像遇到的坑
当用Dockerfile去创建容器，步骤如下：

## 创建并编辑dockerfile
```bash
mkdir mydocker
cd /mydocker
vim DockerFile
(输入以下指令)
  FROM centos（指定其后构建新镜像所使用的基础镜像）
  VOLUME ["/opt/dockerShare1","/opt/dockerShare2"]（容器中的挂载点）
  CMD echo "finish scuess !!!!"（指定在容器启动时所要执行的命令）
  CMD /bin/bash
```
保存退出

## 使用build命令
```bash
$ docker build -f /mydocker/Dockfile -t mycentos:1.01
# --tag, -t: 镜像的名字及标签，通常 name:tag 或者 name 格式；可以在一次构建中为一个镜像设置多个标签。
# -f :指定要使用的Dockerfile路径；
```
但是这里却报错了
```bash
"docker build" requires exactly 1 argument(s).
```
后面在官网看到这行
```bash
$ docker build -f dockerfiles/Dockerfile.debug -t myapp_debug .

$ docker build -f dockerfiles/Dockerfile.prod -t myapp_prod .
```
大致意思是说：
此示例指定路径为`.`因此，本地目录中的所有文件都被排序并发送到Docker守护进程。该路径指定在何处找到Docker守护进程上构建的“上下文”的文件。
所以，要想用指定路径的Dockerfile构建，貌似必须用这个` .` 。

# Docker 容器日志
## docker logs命令概述
`docker logs`: 获取容器的日志  
语法：
```
docker logs [OPTIONS] CONTAINER
```
OPTIONS说明：

- -f : 跟踪日志输出
- --since :显示某个开始时间的所有日志
- -t : 显示时间戳
- --tail :仅列出最新N条容器日志

## docker logs实例
```bash
#跟踪查看容器mynginx的日志输出。
$ docker logs -f mynginx

#查看容器mynginx从2016年7月1日后的最新10条日志。
docker logs --since="2016-07-01" --tail=10 mynginx
```

# Docker 下的网络模式
构建容器的时候使用了`--net anyesu_net`这个选项, 意思是让容器使用自定义的网络 anyesu_net , **注意：Docker默认是根据容器运行的顺序设置IP的，所以会出现重启容器后IP改变的情况**，以下是对Docker 下四种网络模式的一个简单介绍。

## bridge
这是 Docker 默认使用的模式, Docker Daemon 启动时默认会创建 Docker0 这个网桥, 网段为 172.17.0.0/16 , 宿主机 IP 为 172.17.0.1 , 作为这个虚拟子网的 网关 。

当然, 也可以新建一个名为 anyesu_net 网段为 172.18.0.0/16 的网桥：

docker network create --subnet=172.18.0.0/16 anyesu_net
启动 容器 时指定 --net anyesu_net 即可。

## host
容器 共享 宿主机 的网络 ( IP 和 端口 ) 。使用 Docker 有相当一部分目的是为了隔离 宿主机 和 容器 , 使用 host 模式就违背了这一点, 不是很好。另外有很多 镜像 如 tomcat 默认监听 8080 端口的, 使用 host 模式后开多个 容器 就会造成端口冲突, 而不得不修改 tomcat 的监听端口。

## none
这种模式下, 创建的 容器 拥有自己的 Network Namespace, 但是没有任何网络配置, 所以默认是没有网络的, 可以自己对 容器 的 网卡、IP 进行配置, 适合用来配置比默认设置更加复杂的网络环境。

## container
类似于 host 模式, 不过这种模式是共享已存在的 容器 使用的网络。


# 获取 docker 容器(container)的 ip 地址
1. 进入容器内部后
```bash
#显示自己以及(– link)软连接的容器IP
$ cat /etc/hosts
```

2. 使用命令
```bash
$ docker inspect --format '{{ .NetworkSettings.IPAddress }}' <container-ID>
或
$ docker inspect <container id>
或
$ docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' container_name_or_id
```
3. 可以考虑在 ~/.bashrc 中写一个 bash 函数：
```bash
function docker_ip() {
    sudo docker inspect --format '{{ .NetworkSettings.IPAddress }}' $1
}
```
`source ~/.bashrc` 然后：
```bash
$ docker_ip <container-ID>
172.17.0.6
```
4. 要获取所有容器名称及其IP地址只需一个命令。
```bash
docker inspect -f '{{.Name}} - {{.NetworkSettings.IPAddress }}' $(docker ps -aq)
```
如果使用docker-compose命令将是：
```bash
docker inspect -f '{{.Name}} - {{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $(docker ps -aq)
```
5. 显示所有容器IP地址：
```bash
docker inspect --format='{{.Name}} - {{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $(docker ps -aq)
```

# 一些Docker命令
## 运行相关
```bash
# -t 终端
# -i 交互操作
docker run -it ubuntu /bin/bash

# 后台运行一个容器
docker run -d -it ubuntu
```
附着到正在运行的容器, 附着完以后退出会导致容器也终止
```bash
docker attach 容器id
```
进入正在运行的 container 并且执行
```bash
$ docker exec -it 839a6cfc9496 /bin/bash

#注意这里如果后面用exit命令退出容器，会导致容器也停止。正确的退出方式是按住Ctrl键+大写P+大写Q
```
在容器中运行一段程序
```bash
$ docker run ubuntu apt-get update
```
拷贝文件
```bash
#将容器中文件拷往主机
$ docker cp  CONTAINER_ID:SRC_PATH DEST_PATH

#eg：将容器96f7f14e99ab的/www目录拷贝到主机的/tmp目录中
$ docker cp  96f7f14e99ab:/www /tmp/

#eg:将主机/www/runoob目录拷贝到容器96f7f14e99ab中，目录重命名为www
$ docker cp /www/runoob 96f7f14e99ab:/www

# 从主机往容器中拷贝
$ docker cp SRC_PATH CONTAINER_ID:DEST_PATH

# eg：将主机/www/runoob目录拷贝到容器96f7f14e99ab的/www目录下
$ docker cp /www/runoob 96f7f14e99ab:/www/
```

# 参考链接
- [Docker 常见问题汇总(转)](https://www.jianshu.com/p/082bf977ce0e)
- [一篇文章学会Docker命令](https://www.cnblogs.com/Survivalist/p/11199292.html)
- [Docker入门-数据挂载](https://juejin.im/post/5d58db96e51d453bc64801d5)
- [Docker - 挂载目录（bind mounts）和Volume是不同的](https://blog.csdn.net/qingyafan/article/details/89577717)
- [[Day 21] Docker (7)](https://ithelp.ithome.com.tw/articles/10207973)
- [Docker: volume 使用](https://rjerk.xyz/index.php/archives/73/)
- [5. docker之挂载](https://blog.liu-kevin.com/2019/06/02/dockergua-zai/)