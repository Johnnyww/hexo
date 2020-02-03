---
title: Manjaro安装调教
date: 2020-01-31 21:19:52
tags: 
- Manjaro安装和配置
categories:
- 技术
- Manjaro
---

# 一.在Windows系统上进行分区

进入windows磁盘管理器，分别新建两个简单卷，只设置大小，**不需要格式化**。一个设置为600M大小用于挂载efi,另一个用于挂载根目录/,大小随意。(我是在一块500g的固态上分出一半来装的，需要注意的是如果重新装系统的时候,挂在efi那个分区不能直接格式化删除，不然后面再分成一样大小的还是挂载efi会报错，没搞懂什么问题，一开始分的1g,后面直接格式化了，一直分1g一直报错，就分了600M装，才莫名成功了，本来都想装虚拟机算了。)

##制作Manjaro镜像
直接官网下的kde镜像，此次使用的是KDE Plasma 18.1.5版本， 然后用刻录工具刻录到u盘上，这次使用的是[usbwrite](http://7dx.pc6.com/wwb5/USBWriter13.zip) ,也可以使用rufus。
<!-- more -->
# 二.Manjaro系统安装
## 1.BIOS的设置关闭掉Secure Boot
关闭掉Secure Boot
硬盘模式设置为ahci（根据机型貌似有些不用设置）
引导模式使用uefi（据说双系统win是mbr则manjaro也使用mbr比较好，我的是GPT）

## 2.进入安装界面进行安装进入U盘之后首先回车选择最后一个是简体中文
进入U盘之后首先回车选择最后一个是简体中文
driver  因为是n卡就选择no free，其他情况选free或网上查bios选项等配置
然后回车 Boot:Manjaro.x86_64 kde
进入安装安装界面之后点击launch installr
地区选择Asia 区域选择Shanghai
分区,双系统有两种情况
### mbr启动
这里我们直接划分出来一块分区文件系统选择ext4，挂载点 /
### uefi启动模式
这里需要一个esp分区
划出600MB分区，文件系统fat16或fat32，挂载点boot/efi，标记boot，esp
还需要一个根分区也就是系统分区
划出分区，文件系统ext4，挂载点 / ，无需标记
可以进行安装了。(/home,/swap都不用管，要是只有8g内存可以考虑配置/swap，挂载点选linuxswap就行)
安装完后点击重启计算机，在完全关闭后拔出u盘。开机后进入bios选择Manjaro引导到第一位，保存进入系统。

# 三.系统设置和软件安装
## 系统设置
**进行软件源设置以及系统更新首先，我们先把它打开文件的方式改为双击**
首先，我们先把它打开文件的方式改为双击
`系统设置->桌面行为->工作空间->双击打开文件和文件夹`

更换中国源
```shell
sudo pacman-mirrors -i -c China -m
```
在第命令结束的时候会弹出一个窗口让你选择想要使用的源，选最快的那个就行了。(例如:https://mirrors.ustc.edu.cn/manjaro/ 中科大的)
或者直接编辑文件添加源地址，nano  /etc/pacman.d/mirrors 地址从这[获取](https://github.com/archlinuxcn/mirrorlist-repo)
**保存设置方法：用nanoc编辑好文本后按crl + x 然后按y再按回车即可。另外manjaro中的pacman相当于centos（或redhat）中的yum命令** 
更换增加archlinuxcn软件仓库源：
编辑nano  /etc/pacman.conf，在最下方添加：
```shell
[archlinuxcn]
SigLevel = Optional TrustedOnly
Server = https://mirrors.ustc.edu.cn/archlinuxcn/$arch
```
然后运行两条命令:
```shell
sduo pacman -Syy # -Syy表示将本地的软件与软件仓库进行同步
sudo pacman -S archlinuxcn-keyring #-S表示安装某一软件 安装archlinuxcn签名钥匙
```
之后更新一下系统:
```shell
sudo pacman -Syyu #可以更新系统的一切软件包
```
更新完后安装下系统缺少的字体解决中文乱码问题:
```shell
sudo pacman -S wqy-microhei
```

## 软件安装
### 1.安装AUR管理工具:
想要使用AUR中的软件，一种方式是在图形的软件安装界面的设置中把AUR打开，然后搜索进行安装，另外是使用命令行工具进行安装。由于Yaourt已经不再维护，这里选择了Yay来管理AUR仓库中的软件。
```shell
sudo pacman -S yay
```
Yay默认使用法国的aur.archlinux.org作为AUR源，可以更改为国内清华大学提供的镜像。
yay 用户执行以下命令修改aururl:
yay --aururl "https://aur.tuna.tsinghua.edu.cn" --save
修改的配置文件位于 ~/.config/yay/config.json  去掉 # AURURL 的注释，修改为
AURURL="https://aur.tuna.tsinghua.edu.cn"
**yay 安装命令不需要加 sudo**,yay的命令参数跟pacman参数基本一致,还可通过以下命令查看修改过的配置:
```shell
yay -P -g
```
yay 的常用命令：
```shell
yay -S package # 从 AUR 安装软件包
yay -Rns package # 删除包
yay -Syu # 升级所有已安装的包
yay -Ps # 打印系统统计信息
yay -Qi package # 检查安装的版本
```

### 2.安装中文字体:
```shell
sudo pacman -S wqy-zenhei
sudo pacman -S wqy-bitmapfont
sudo pacman -S wqy-microhei
#Manjaro自带了思源系列字体（Noto家族）,补个Emoji：
yay -S noto-fonts-emoji
sudo pacman -S adobe-source-han-sans-cn-fonts
sudo pacman -S adobe-source-han-serif-cn-fonts
```

### 3.安装中文输入法ibus:
```shell
sudo pacman -S ibus #安装ibus软件包
sudo pacman -Ss ^ibus-* #查看所有可用的输入法
sudo pacman -S ibus-pinyin #选择一个可用的输入法引擎并安装
ibus-setup #运行ibus
```
出现提示:![](https://chenjunxin.oss-cn-shenzhen.aliyuncs.com/picture/blogPicture/2020/Manjaro/ibus.png)
在`$HOME/.bashrc`中加入下面这段就好了
```shell
export GTK_IM_MODULE=ibus
export XMODIFIERS=@im=ibus
export QT_IM_MODULE=ibus
```
这样就可以使用该输入法了，但是每次开机都要在命令行中输入ibus-setup才能启动ibus，太麻烦了点。所以把原来的$HOME/.bashrc的内容转移到`$HOME/.xprofile`中，并且在最后一行添加一条新的内容:
```shell
export GTK_IM_MODULE=ibus
export XMODIFIERS=@im=ibus
export QT_IM_MODULE=ibus
ibus-daemon -x -d
```
**再重启发现输入法能开机自动启动了**

### 4.更改项目文件英文名
修改目录映射文件名:
```shell
sudo nano .config/user-dirs.dirs
```
修改为以下内容:
```shell
XDG_DESKTOP_DIR="$HOME/Desktop"
XDG_DOWNLOAD_DIR="$HOME/Download"
XDG_TEMPLATES_DIR="$HOME/Templates"
XDG_PUBLICSHARE_DIR="$HOME/Public"
XDG_DOCUMENTS_DIR="$HOME/Documents"
XDG_MUSIC_DIR="$HOME/Music"
XDG_PICTURES_DIR="$HOME/Pictures"
XDG_VIDEOS_DIR="$HOME/Videos"
```
将Home目录下的中文目录名改为对应的英文名:
```shell
mv 桌面 to Desktop
mv 下载 to Downloads
mv 模板 to Templates
mv 公共 to Public
mv 文档 to Documents
mv 音乐 to Music
mv 图片 to Pictures
mv 视频 to Videos
```
**重启系统**

### 5.常用软件安装
#### 解压工具安装
```shell
sudo pacman -S unrar unzip p7zi
```

#### 为知笔记
```shell
sudo pacman -S wiznote
```

#### 思维导图
```shell
yay -S xmind-zen
```

#### WPS及WPS需要的中文字体
```shell
sudo pacman -S wps-office
yay -S wps-office-fonts wps-office-mime ttf-wps-fonts
```

#### 福昕PDF阅读器
```shell
sudo pacman -S foxitreader
```

#### 媒体播放器
```shell
sudo pacman -S vlc
sudo pacman -S ffmpeg
```

#### 截图软件
```shell
sudo pacman -S deepin-screenshot
```

#### 系统状态监控
```shell
sudo pacman -S deepin-system-monitor
```

#### 硬件温度监测
```shell
sudo pacman -S psensor
```

#### 录屏软件
```shell
sudo pacman -S deepin-screen-recorder #录屏软件，可以录制 Gif 或者 MP4 格式
sudo pacman -Ss SimpleScreenRecorder #另外一个更强大的录屏软件
```

#### deepin系列软件必备条件
首先对于非 GNOME 桌面(KDE, XFCE等)需要安装
```shell
sudo pacman -S gnome-settings-daemon
```
运行/usr/lib/gsd-xsettings
系统设置->开机或关机->自动启动->添加脚本->输入/usr/lib/gsd-xsettings

#### 深度QQ
```shell
sudo pacman -S deepin.com.qq.im
```

#### 深度微信
微信是自己从github上下的旧版的包2.7.188版本,并根据文档修改对应的安装配置    
https://github.com/countstarlight/deepin-wine-wechat-arch
![](https://chenjunxin.oss-cn-shenzhen.aliyuncs.com/picture/blogPicture/2020/Manjaro/deepin-wine-wechat.png)
安装完后手动切换deepin-wine环境
1. 安装 deepin-wine
```shell
yay -S deepin-wine
```
2. 修改 deepin-wine-wechat 的启动文件
修改如下两个文件中的 WINE_CMD 的值：
/opt/deepinwine/apps/Deepin-WeChat/run.sh
/opt/deepinwine/tools/run.sh
```shell
-WINE_CMD="wine"
+WINE_CMD="deepin-wine"
```
3. 对于非 GNOME 桌面(KDE, XFCE等)需要安装 
```shell
sudo pacman Sy gnome-settings-daemon
```
并在 /opt/deepinwine/apps/Deepin-WeChat/run.sh 中加入如下几行：
```shell
 RunApp()
    {
+    if [[ -z "$(ps -e | grep -o gsd-xsettings)" ]]
+    then
+        /usr/lib/gsd-xsettings &
+    fi
        if [ -d "$WINEPREFIX" ]; then
                UpdateApp
        else
```
注意：对 /opt/deepinwine/apps/Deepin-WeChat/run.sh 的修改会在 deepin-wine-wechat 更新或重装时被覆盖，可以单独拷贝一份作为启动脚本
4. 删除原先的微信目录
```shell
rm -rf ~/.deepinwine/Deepin-WeChat
```
5. 修复 deepin-wine 字体渲染发虚
```shell
yay -S lib32-freetype2-infinality-ultimate
```
注意：切换到 deepin-wine 后，对 wine 的修改，如更改dpi，都改为对 deepin-wine 的修改

#### 百度网盘
```shell
yay -S deepin-wine-baidupan
```

#### 迅雷
```shell
yay -S deepin.com.thunderspeed
```

### 6.开发软件
#### jdk
手动安装oracle-jdk，可选择低版本,下载tar包
解压
```shell
tar -zxvf xxx.tar.gz
```
移动到 `/usr/src`目录下
```shell
sudo mv xxx /usr/src/
```
先试一下前面这个，不行再加上后面那个
```shell
vim ~/.bashrc
```
在后面加上， 地址根据jdk修改
```shell
export JAVA_HOME=/home/johnnychan/Public/programs/java/jdk8/jdk1.8.0_241
export JRE_HOME=${JAVA_HOME}/jre
export CLASSPATH=.:${JAVA_HOME}/lib:${JRE_HOME}/lib
export PATH=${JAVA_HOME}/bin:$PATH
```
启用配置
```shell
source .bashrc
```
查看是否配置成功
```shell
java -version
```
显示
```shell
java version "1.8.0_241"
Java(TM) SE Runtime Environment (build 1.8.0_241-b07)
Java HotSpot(TM) 64-Bit Server VM (build 25.241-b07, mixed mode)
```
前面那个不行在加上底下这个配置jdk环境变量
修改配置文件`/etc/profile`
setting for jdk-oracle
```shell
JAVA_HOME=/home/johnnychan/Public/programs/java/jdk8/jdk1.8.0_241
CLASSPATH=.:$JAVA_HOME/lib/tools.jar:$JAVA_HOME/lib/dt.jar
PATH=$JAVA_HOME/bin:$PATH
export JAVA_HOME CLASSPATH PATH
```
启用配置
```shell
source /etc/profile
```

#### Maven安裝配置
在/usr/local/lib 目录下新建一个文件夹maven：
sudo mkdir /usr/local/lib/maven
将文件解压到这个目录下：
```shell
tar -zxvf apache-maven-3.6.3-bin.tar.gz -C  /usr/local/lib/maven
```
也可以放到别的路径下，可以看一下linux目录一般存放规则：http://blog.csdn.net/fuzhongyu2/article/details/52437161
配置环境变量
环境变量分为用户变量和系统变量。
用户变量配置文件：~/.bashrc（在当前用户主目录下的隐藏文件，可以通过`ls -a`查看到)
系统环境配置文件：/etc/profile
用户变量和系统变量的配置方法一样，本文以配置用户变量为例。
编译配置文件.bashrc:
在终端输入:
```shell
sudo nano ~/.bashrc
```
在打开的文档末输入：
```shell
export MAVEN_HOME=/usr/local/lib/maven/apache-maven-3.6.3
export PATH=${MAVEN_HOME}/bin:${PATH}
```
点击保存，这样maven环境变量就配置好了。 
执行命令:
```shell
source  ~/.bashrc
source  /etc/profile
```
测试是否安装成功
输入：
```shell
mvn -v
```
如果出现下列字样，则安装成功：
```shell
  Apache Maven 3.6.3 (cecedd343002696d0abb50b32b541b8a6ba2883f)
  Maven home: /usr/local/lib/maven/apache-maven-3.6.3
  Java version: 1.8.0_241, vendor: Oracle Corporation,runtime:/home/johnnychan/Public/programs/java/jdk8/jdk1.8.0_241/jre
  Default locale: zh_CN, platform encoding: UTF-8
  OS name: "linux", version: "5.4.13-3-manjaro", arch: "amd64", family: "unix"
```

#### Git
```shell
sudo pacman -S git
```

#### Vim
```shell
sudo pacman -S vim
```

#### Markdown编辑器
```shell
sudo pacman -S typora
```

#### VSCode
```shell
sudo pacman -S visual-studio-code-bin
```

#### REST工具
```shell
sudo pacman -S postman-bin
```

#### GIT管理工具
```shell
sudo pacman -S gitkraken
```

#### idea(JAVA IDE)
```shell
sudo pacman -S intellij-idea-ultimate-edition
```

#### 数据库管理工具
```shell
sudo pacman -S datagrip
sudo pacman -S dbeaver
```

#### 离线API文档管理
```shell
sudo pacman -S zeal
```

#### NodeJS与NPM
```shell
cd /usr/local/
sudo mkdir node
cd node
#下载&解压
sudo wget https://nodejs.org/dist/v12.14.1/node-v12.14.1-linux-x64.tar.xz && sudo tar   zxvf node-v12.14.1-linux-x64.tar.xz
#设置全局
sudo ln -s /usr/local/node/node-v12.14.1-linux-x64/bin/node /usr/local/bin/node
sudo ln -s /usr/local/node/node-v12.14.1-linux-x64/bin/npm /usr/local/bin/npm
#安装cnpm
sudo npm install -g cnpm --registry=https://registry.npm.taobao.org  
#设置全局
sudo ln -s /usr/local/node/node-v12.14.1-linux-x64/bin/cnpm 
```
然后查看版本信息
```shell
$ node -v
v12.14.1
$ npm -v
6.13.4
$ cnpm -v
cnpm@6.1.1 (/usr/local/node/node-v12.14.1-linux-x64/lib/node_modules/cnpm/lib/parse_argv.js)
npm@6.13.6 (/usr/local/node/node-v12.14.1-linux-x64/lib/node_modules/cnpm/node_modules/npm/lib/npm.js)
node@12.14.1 (/usr/local/node/node-v12.14.1-linux-x64/bin/node)
npminstall@3.27.0 (/usr/local/node/node-v12.14.1-linux-x64/lib/node_modules/cnpm/node_modules/npminstall/lib/index.js)
prefix=/usr/local/node/node-v12.14.1-linux-x64/node_global 
linux x64 5.4.13-3-MANJARO 
registry=https://r.npm.taobao.org
```

##### npm全局模块路径的设置
设置全局模块的存放路径和cache路径。例如我希望将以上两个文件夹放在nodejs内（不要问我为什么，因为我希望以后在别的电脑上配置起来简单，不用每次都去获取各个模块），便在nodejs目录下新建"node_global"和"node_cache"两个文件夹。
在终端输入下面两行命令:
```shell
npm config set prefix "/usr/local/node/node-v12.14.1-linux-x64/node_global"
npm config set cache "/usr/local/node/node-v12.14.1-linux-x64/node_cache"
```
接下来，安装一个模块试试，例如vue，这里直接在终端输入npm install vue -g（-g就是全局安装模块的意思，就是将vue模块安装到你修改后的模块存放路径/usr/local/node/node-v12.14.1-linux-x64/node_global），等待下载安装。

#### 阿里云OSS
阿里云[OSS客户端](https://github.com//oss-browser): 点击下载：[oss-browser-linux_64_1.9.5](https://chenjunxin.oss-cn-shenzhen.aliyuncs.com/files/oss-browser-linux_64_1.9.5.zip),解压到目录，运行`oss-browser`即可。
若出现：`./oss-browser: error while loading shared libraries: libgconf-2.so.4: cannot open shared object file: No such file or directory`,
解决：
```shell
sudo pacman -S gconf
```

#### Docker与Docker-Compose
```shell
sudo pacman -S docker docker-compose
```
设置普通用户使用 Docker 不需要使用 sudo
```shell
sudo groupadd docker
```
启动docker服务
```shell
sudo systemctl start docker
```

查看docker服务的状态
```shell
sudo systemctl status docker
```

设置docker开机启动服务
```
sudo systemctl enable docker
```

干掉讨厌的 sudo,如果还没有 docker group 就添加一个
```shell
sudo groupadd docker
```
将自己的登录名(${USER} )加入该 group 内，然后退出并重新登录就生效了。
```shell
sudo gpasswd -a ${USER} docker 
```
或者
```shell
sudo usermod -aG docker $USER
```
重启 docker 服务
```shell
sudo systemctl restart docker
```
切换当前会话到新 group 或者重启 X 会话
注意，这一步是必须的，否则因为 groups 命令获取到的是缓存的组信息，刚添加的组信息未能生效，所以 docker images 执行时同样有错。
```shell
newgrp - docker
```
或者
```shell
pkill X
```
使用中国官方镜像加速:
为了永久性保留更改，我们可以修改 /etc/docker/daemon.json 文件并添加上 registry-mirrors 键值。
```shell
 {
  "registry-mirrors": ["https://registry.docker-cn.com"]
 }
```
修改保存后重启 Docker 以使配置生效。

### 7.终端软件
```shell
sudo pacman -S neofetch # 终端打印出你的系统信息
sudo pacman -S htop #命令行显示进程信息
sudo pacman -S yakuake # 堪称 KDE 下的终端神器，KDE 已经自带，F12 可以唤醒
sudo pacman -S net-tools # 这样可以使用 ifconfig 和 netstat
yay -S tree
```

#### ZSH和Oh-my-zsh
```shell
sudo pacman -S zsh
```
接着配置oh-my-zsh：
```shell
sh -c“$（curl -fsSL https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh）”
```
查看本地有哪些shell
```shell
cat /etc/shells
```
最后更换默认的shell为zsh：
```shell
chsh -s /bin/zsh
```

#### 更改zsh主题
```shell
vim ~/.zshrc
```
修改配置文件中的 " ZSH_THEME ",例如设置为随机主题
```shell
ZSH_THEME  = "random"
```

#### zsh必备插件安装
##### 参数补全插件 zsh-completions
```shell
git clone https://github.com/zsh-users/zsh-completions ~/.oh-my-zsh/custom/plugins/zsh-completions
```

##### 语法高亮插件 zsh-syntax-highlighting
```shell
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git $ZSH_CUSTOM/plugins/zsh-syntax-highlighting
```

##### 命令自动补全插件 zsh-autosuggestions
```shell
git clone https://github.com/zsh-users/zsh-autosuggestions.git $ZSH_CUSTOM/plugins/zsh-autosuggestions
```

##### thefuck插件
```shell
pip install thefuck
```

##### fzf，模糊搜索神器
```shell
sudo pacman -S fzf
```

##### 自动跳转插件 autojump
在终端输入d，可以显示刚刚走过的路径，然后按数字选择进入哪一个目录。（这个插件需要自己下)
![](https://chenjunxin.oss-cn-shenzhen.aliyuncs.com/picture/blogPicture/2020/Manjaro/autojump.png)
```shell
# clone 到本地
git clone git://github.com/joelthelion/autojump.git
# 进入clone目录，接着执行安装文件
cd autojump
./install.py
# 接着根据安装完成后的提示，在~/.bashrc最后添加下面语句：
vim ~/.bashrc
[[ -s /home/misfit/.autojump/etc/profile.d/autojump.sh ]] && source /home/misfit/.autojump/etc/profile.d/autojump.sh
```
autojump 工作原理：它会在你每次启动命令时记录你当前位置，并把它添加进它自身的数据库中。这样，某些目录比其它一些目录添加的次数多，这些目录一般就代表你最重要的目录，而它们的“权重”也会增大。

##### 安装完后启用插件
```shell
# 编辑~/.zshrc   
vim ~/.zshrc    
# 在plugins后括号里添加安装的插件名字
plugins=( git 
          zsh-completions
          autojump 
          zsh-completions
          zsh-autosuggestions 
          zsh-syntax-highlighting
          docker
          docker-compose
          fzf
       )
# 最后刷新使配置生效
autoload -U compinit && compinit
source ~/.zshrc
```

#### 配置环境变量使得zsh和bash都生效
为了便于在bash和zsh切换后可以使用同样的配置的alias等配置，采用如下方案：
自定义配置放在.profile中
.bashrc配置文件中使用source ~/.profile加载自定义配置
.zshrc配置文件中使用[[ -e ~/.profile ]] && emulate sh -c ‘source ~/.profile’加载自定义配置
配置文件示例如下：
- .bashrc
zzzzzzzzzzzzz原有配置
下面一行为新加配置
```shell
source ~/.profile
```
- .zshrc
zzzzzzzzzzzzz原有配置
下面一行为新加配置
```shell
[[ -e ~/.profile ]] && emulate sh -c 'source ~/.profile'
```
- .profile
```shell
export EDITOR=/usr/bin/nano
# oh-my-zsh autojump配置
[[ -s /home/misfit/.autojump/etc/profile.d/autojump.sh ]] && source /home/misfit/.autojump/etc/profile.d/autojump.sh
# 在后面加上地址,根据你jdk配置
# 配置Maven环境变量
```
然后执行:
```shell
source ~/.profile
```
在bash终端执行:
```shell
source ~/.bashrc
```
在zsh终端执行:
```shell
source ~/.zshrc
```
这样把算定义配置放在.profile里，即可在bash和zsh中使用同样的自定义环境了。
    
### 8.科学上网
#### Shadowsocks客户端
先用manjaro自带的octopi搜索shadowsocks-qt5，然后安装
![](https://chenjunxin.oss-cn-shenzhen.aliyuncs.com/picture/blogPicture/2020/Manjaro/shadowsocks-qt5.webp)
安装成功并配置好你自己的ss后，如下:
![](https://chenjunxin.oss-cn-shenzhen.aliyuncs.com/picture/blogPicture/2020/Manjaro/shadowsocks-qt5.png)
此时进入系统设置-代理下配置已经连接上的代理端口，如下图:
![](https://chenjunxin.oss-cn-shenzhen.aliyuncs.com/picture/blogPicture/2020/Manjaro/global%20proxy.png)
此时，Chrome浏览器就可以科学上网了，但这是全局的设置，而且没有规则绕过一些国内的网址，因此还要继续设置。
打开Chrome网上应用商店-搜索安装Proxy SwitchyOmega扩展

然后设置一个proxy
![](https://chenjunxin.oss-cn-shenzhen.aliyuncs.com/picture/blogPicture/2020/Manjaro/SwitchyOmega_ProxySetting.png)
再新建设置一个auto switch,规则列表填写地址https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt ，点击立即更新情景模式，按照如下配置:
![](https://chenjunxin.oss-cn-shenzhen.aliyuncs.com/picture/blogPicture/2020/Manjaro/SwitchyOmega_ProxySetting_AutoSwitch.png)
把这个auto switch情景模式设置为插件默认的就可以了，实现按照规则科学上网，这里是符合规则内的才翻墙，规则之外的直连访问。**记得改回系统刚才设置的全局代理**。

#### V2Ray客户端
运行官方一键安装脚本:
```shell
sudo pacman -S v2ray
```
编辑/etc/v2ray/config.json文件，可以用[配置生成器](https://intmainreturn0.com/v2ray-config-gen/)
ArchLinux下的v2ray/config.json
使用v2ray自带了一个检查工具v2ray -test检查json文件
```shell
v2ray -test -config /etc/v2ray/config.json` #检查json
V2Ray 4.22.1 (V2Fly, a community-driven edition of V2Ray.) Custom (go1.13.5 linux/amd64)
A unified platform for anti-censorship.
Configuration OK.
```
显示OK就表示没问题了，可以开启本机的开机自启服务
```shell
systemctl enable v2ray  #开机自启v2ray
systemctl start v2ray   #启动v2ray
```
浏览器代理实现同上的shaodowsocks方式。

#### 终端代理
为了解决终端下载被墙服务器的安装包失败的问题，所以需要让终端也可以翻墙，顺便提升下载速度。工具有polipo 和 privoxy 两种,polipo 貌似只能全局代理，privoxy 全局/自动两种代理方式都可以实现。**全局代理下，访问 localhost 时也会走代理，可能导致无法正常访问本地服务**。
##### privoxy 实现全局和自动代理
privoxy 可以配置 .action 格式的代理规则文件。通过控制规则文件实现全局和自动代理。
action 文件可以手动编辑，也可以从 gfwlist 生成。
下面将先介绍 privoxy 的安装配置，再介绍 action 文件的生成。
###### 安装配置
安装 privoxy：
```shell
yay -S privoxy
```
进入目录 `/etc/privoxy`，可以看到目录结构大致为：

-`config` 配置文件，这个文件很长。。
-`*.action` 代理规则文件
-`*.filter` 过滤规则文件
-`trust` 不造干嘛用
-`templates/` 同上

开始修改配置文件。
privoxy 有 filter （过滤）的功能，可以用来实现广告拦截。不过这里只希望实现自动代理，在配置文件中把 filter 部分注释掉：
```shell
# 大约在435行
# filterfile default.filter
# filterfile user.filter      # User customizations
```

我们将使用自定义的 action 文件，所以把默认的 action 文件注释掉，并添加自定义文件：
```shell
# 386行左右
# 默认的 action 文件
# actionsfile match-all.action # Actions that are applied to all sites and maybe overruled later on.
# actionsfile default.action   # Main actions file
# actionsfile user.action      # User customizations
# 自定义 action 文件
actionsfile my.action
```
可以指定转换后的 HTTP 代理地址，这里直接使用默认端口 8118：
```shell
# 785行左右
listen-address  127.0.0.1:8118
listen-address  [::1]:8118
```
如果代理规则直接写在配置文件 config 中，那么代理规则和本地 SS 代理地址是写在一起的：
```shell
# / 代表匹配全部 URL，即全局代理
forward-socks5 / 127.0.0.1:1081 .
```
或
```shell
# 根据规则自动代理
forward-socks5 .google.com 127.0.0.1:1081 .
```
**注意！每行最后还有一个点。**
实现全局代理就是第一种写法了。
但是如果要自动代理，第二种直接写在配置文件里的做法其实不太合适，更合适的做法是写成 action 文件，配置文件中只管引用。
把上面的注释掉。
新建 action 文件 my.action，内容如下：
```shell
# 这一行表示本 action 文件中所有条目都使用代理
{+forward-override{forward-socks5 127.0.0.1:1081 .}}
# 添加一条规则
.google.com
```
把 privoxy 转换后的地址 http://127.0.0.1:8118 添加到环境变量，可以参照 polipo 部分。
启动 privoxy，这时应该可以正常访问 Google 了：
```shell
service privoxy start
curl www.google.com
```
下面看一下怎么用 gfwlist 生成 action 文件。

###### 生成 action 文件
配置文件 config 或 action 文件修改后不需要重启 privoxy。
使用的工具是 [gfwlist2privoxy](https://github.com/snachx/gfwlist2privoxy)。这个工具很简单，文档就几行，写得也很清楚。
安装：
```shell
pip install gfwlist2privoxy
```
gfwlist2privoxy 不支持 python3.x，安装时注意使用的是 pip2 还是 pip3。
参数说明：
- `-i/--input` 输入，本地 gfwlist 文件或文件 URL。这里使用上面的 gfwlist
- `-f/ --file` 输出，即生成的 action 文件的目录。这里输出到  `/etc/privoxy/gfwlist.action`
- `-p/ --proxy` SS 代理地址，生成后可以修改。这里是 `127.0.0.1:1081`
- `-t/ --type` 代理类型，生成后也可以修改。这里是 `socks5`
- `--user-rule` 用户自定义规则文件，这个文件中的规则会被追加到 gfwlist 生成的规则后面

示例：
```shell
gfwlist2privoxy -i https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt -f /etc/privoxy/gfwlist.action -p 127.0.0.1:1081 -t socks5
```
得到文件 `/etc/privoxy/gfwlist.action`,[下载地址](https://chenjunxin.oss-cn-shenzhen.aliyuncs.com/files/gfwlist.action)。

最后，把` /etc/privoxy/config` 中的`actionsfile my.action` 改为 `actionsfile gfwlist.action`就完成了。

启动 privoxy.service 服务
```shell
systemctl start privoxy.service
systemctl -l status privoxy.service
```

配置环境变量
在~/.bashrc或者~/.zshrc中输入
```shell
export https_proxy=127.0.0.1:8118
export http_proxy=127.0.0.1:8118
```
这样就完成代理的设置了。

# 四.一些命令与技巧

## 常用pacman命令
### 更新系统
在 Archlinux系 中，使用一条命令即可对整个系统进行更新:
```shell
pacman -Syu
```
如果你已经使用pacman -Sy将本地的包数据库与远程的仓库进行了同步，也可以只执行:
```shell
pacman -Su
```

### 安装包
`pacman -S` 包名：例如，执行 `pacman -S firefox` 将安装 Firefox
你也可以同时安装多个包，只需以空格分隔包名即可
`pacman -Sy` 包名：与上面命令不同的是，该命令将在同步包数据库后再执行安装
`pacman -Sv` 包名：在显示一些操作信息后执行安装
`pacman -U`：安装本地包，其扩展名为 pkg.tar.gz
`pacman -U http://www.example.com/repo/example.pkg.tar.xz` 安装一个远程包（不在pacman配置的源里面）
### 删除包
`pacman -R` 包名：该命令将只删除包，保留其全部已经安装的依赖关系
`pacman -Rs` 包名：在删除包的同时，删除其所有没有被其他已安装软件包使用的依赖
`pacman -Rsc` 包名：在删除包的同时，删除所有依赖这个软件包的程序
`pacman -Rd` 包名：在删除包时不检查依赖
### 搜索包
`pacman -Ss` 关键字：在仓库中搜索含关键字的包
`pacman -Qs` 关键字： 搜索已安装的包
`pacman -Qi` 包名：查看有关包的详尽信息
`pacman -Ql` 包名：列出该包的文件
### 其他用法
`pacman -Sw` 包名：只下载包，不安装
`pacman -Sc`：清理未安装的包文件，包文件位于/var/cache/pacman/pkg/目录 
`pacman -Scc`：清理所有的缓存文件
### pacman替代命令yay
```shell
sudo pacman -S yay
```
yay 的命令参数跟pacman参数基本一致。

## 常用命令
### 查看网卡信息
```shell
lspci|grep -i net
```

### 查看已经启用的服务
```shell
systemctl list-unit-files --state=enabled
```

### 查看关联性服务启动耗费时间
```shell
systemd-analyze critical-chain xxx.service
```

### 按时间排序，查看服务启动耗费时间
```shell
systemd-analyze blame
```

### GIT代理设置
推荐放到 .zshrc 中作为常用命令
```shell
git-proxy(){
  git config --global http.proxy socks5://127.0.0.1:1080
  git config --global https.proxy socks5://127.0.0.1:1080
}
git-noproxy(){
  git config --global --unset http.proxy
  git config --global --unset https.proxy
}
```

## 一些小技巧
### 快捷键
F12：拉幕式终端
Alt+空格：调出全局搜索
Ctrl+F8：切出多桌面窗口
### 鼠标操作
在左上角撮几下，平铺所有窗口。
鼠标滚轮好慢,
```shell
sudo pacman -S imwheel #配置文件自己上网查
```

# 参考链接
- [Manjaro 安装体验小结](https://michael728.github.io/2019/08/03/linux-manjaro-install/)
- [Manjaro的尝试](https://zzycreate.github.io/2018/11/03/Manjaro%E7%9A%84%E5%B0%9D%E8%AF%95/)
- [Manjaro安装，配置，美化指南](https://www.cnblogs.com/zryabc/p/11408297.html)
- [Manjaro Linux 踩坑调教记录](https://printempw.github.io/setting-up-manjaro-linux/)
- [Manjaro常用软件和命令行推荐](https://blog.csdn.net/was172/article/details/82826607)
- [polipo/privoxy 实现 Linux 系统全局/自动代理](juejin.im/post/5c91ff5ee51d4534446edb9a)
- [centos privoxy action 分流，黑白名单，不走代理](https://www.codeleading.com/article/22561057096/)
- [学习利器V2ray了解一下](https://www.teaper.dev/2019/06/02/v2ray/)
- [Linux bash终端设置代理(proxy)访问](https://aiezu.com/article/linux_bash_set_proxy.html)
- [Linux-zsh与bash共用](https://xueyp.github.io/linux/2019/01/15/linux-%E5%88%87%E6%8D%A2%E5%88%B0zsh.html)

