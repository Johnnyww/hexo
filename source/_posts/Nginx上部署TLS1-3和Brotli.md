---
title: Nginx上部署TLS1.3和Brotli
tags:
  - Nginx
  - TLS
  - Brotil
categories:
  - 技术
  - Nginx
keywords:
  - Nginx
  - TLS
  - Brotil
abbrlink: 9f670eb
date: 2020-04-08 17:25:32
description:
---

# SSL/TLS 

## 什么是 SSL/TLS
&emsp;传输层安全性协议（英语：Transport Layer Security，缩写作 TLS），及其前身安全套接层（Secure Sockets Layer，缩写作 SSL）是一种安全协议，目的是为互联网通信提供安全及数据完整性保障。网景公司（Netscape）在 1994 年推出首版网页浏览器，网景导航者时，推出 HTTPS 协议，以 SSL 进行加密，这是 SSL 的起源。IETF 将 SSL 进行标准化，1999 年公布第一版 TLS 标准文件。随后又公布 RFC 5246 （2008 年 8 月）与 RFC 6176 （2011 年 3 月）。
&emsp;在浏览器、电子邮件、即时通信、VoIP、网络传真等应用程序中，广泛支持这个协议。主要的网站，如 Google、Facebook 等也以这个协议来创建安全连线，发送数据。当前已成为互联网上保密通信的工业标准。

<!--more-->

## SSL/TLS 的版本

|  协议   | 发布时间 |        状态        |
| :-----: | :------: | :----------------: |
| SSL 1.0 |  未公布  |       未公布       |
| SSL 2.0 | 1995 年  |  已于 2011 年弃用  |
| SSL 3.0 | 1996 年  |  已于 2015 年弃用  |
| TLS 1.0 | 1999 年  | 计划于 2020 年弃用 |
| TLS 1.1 | 2006 年  | 计划于 2020 年弃用 |
| TLS 1.2 | 2008 年  |                    |
| TLS 1.3 | 2018 年  |                    |

## 为什么要禁用 TLS1.0、TLS1.1
&emsp;SSL 由于以往发现的漏洞，已经被证实不安全。而 TLS1.0 与 SSL3.0 的区别实际上并不太多，并且 TLS1.0 可以通过某些方式被强制降级为 SSL3.0。
&emsp;由此，支付卡行业安全标准委员会（PCI SSC）强制取消了支付卡行业对 TLS 1.0 的支持，同时强烈建议取消对 TLS 1.1 的支持。
&emsp;苹果、谷歌、微软、Mozilla 也发表了声明，将于 2020 年初放弃对 TLS 1.1 和 TLS 1.0 的支持。其原因是这两个版本使用的是过时的算法和加密系统，经发现，这些算法和系统是十分脆弱的，比如 SHA-1 和 MD5。它们也缺乏像完美的前向保密性这样的现代特征，并且容易受到降级攻击的影响。

## TLS 1.3
在2018年8月份，IETF终于宣布TLS 1.3规范正式发布了，标准规范（Standards Track）定义在 [rfc8446](https://tools.ietf.org/html/rfc8446)。

![](https://oss.chenjunxin.com/picture/blogPicture/9f670eb_TLS1.2_Principle.webp)

![](https://oss.chenjunxin.com/picture/blogPicture/9f670eb_TLS1.3_Principle.webp)

### TLS 1.3 相较之前版本的优化内容有：
- **握手时间：**同等情况下，TLSv1.3 比 TLSv1.2 少一个 RTT
- **应用数据：**在会话复用场景下，支持 0-RTT 发送应用数据
- **握手消息：**从 ServerHello 之后都是密文。
- **会话复用机制：**弃用了 Session ID 方式的会话复用，采用 PSK 机制的会话复用。

总结一下就是在更安全的基础上还做到了更快，目前 TLS 1.3 的重要实现是 OpenSSL 1.1.1 开始支持了，在 Nginx 上的实现需要 Nginx 1.13+。

# Brotli
&emsp;Brotli 是由 Google 于 2015 年 9 月推出的无损压缩算法，它通过用变种的 LZ77 算法，Huffman 编码和二阶文本建模进行数据压缩，是一种压缩比很高的压缩方法，现代网站大多用的压缩算法都是 GZIP，它也是非常有效的一种压缩算法，可以节省网站服务器和用户之间传输数据所需要花费的时间，但是这个 Brotli，据闻能比 gzip 做得更好，不仅能获得更高的压缩比率，而且对压缩/解压速度影响也比较小，可以去谷歌的 GitHub 了解一下[该项目](https://github.com/google/brotli)

Brotli 具有如下特点:

- 针对常见的 Web 资源内容，Brotli 的性能要比 GZIP 好 17-25%；
- Brotli 压缩级别为 1 时，压缩速度是最快的，而且此时压缩率比 gzip 压缩等级为 9（最高）时还要高；
- 在处理不同 HTML 文档时，brotli 依然提供了非常高的压缩率; 

在兼容 GZIP 的同时，相较 GZIP:

- JavaScript 上缩小 14%
- HTML上缩小 21%
- CSS上缩小 17% 

&emsp;Brotli 的支持必须依赖 HTTPS，不过换句话说就是只有在 HTTPS 下才能实现 Brotli。Brotli压缩可以和GZIP和谐共存，而且Brotli压缩效率要高于GZIP，因此推荐给服务器编译配置Brotli压缩。当同时开启Brotli跟GZIP两种压缩算法时，Brotli压缩等级优先级高于GZIP，并不会造成冲突。

# 安装
## 下载源码
HTTP/2 要求 Nginx 1.9.5+，OpenSSL 1.0.2+  
TLS 1.3 要求 Nginx 1.13+，OpenSSL 1.1.1及之后的版本+  
Brotli 要求 HTTPS，并在 Nginx 中添加扩展支持  
建议去官网随时关注最新版：[Nginx](https://nginx.org/en/download.html)，[OpenSSL](https://www.openssl.org/source/)，[ngx_brotil](https://github.com/google/ngx_brotli)

**Nginx**
```bash
$ cd /opt
$ wget -c https://nginx.org/download/nginx-1.16.1.tar.gz
$ tar xzf nginx-1.16.1.tar.gz
```
**OpenSSL**
```bash
# 可以先查看已安装OpenSSL版本
$ openssl version -a
OpenSSL 1.1.1d  10 Sep 2019
built on: Sun Mar  8 08:45:14 2020 UTC
platform: linux-x86_64
options:  bn(64,64) rc4(16x,int) des(int) idea(int) blowfish(ptr) 
compiler: gcc -fPIC -pthread -m64 -Wa,--noexecstack -Wall -O3 -DOPENSSL_USE_NODELETE -DL_ENDIAN -DOPENSSL_PIC -DOPENSSL_CPUID_OBJ -DOPENSSL_IA32_SSE2 -DOPENSSL_BN_ASM_MONT -DOPENSSL_BN_ASM_MONT5 -DOPENSSL_BN_ASM_GF2m -DSHA1_ASM -DSHA256_ASM -DSHA512_ASM -DKECCAK1600_ASM -DRC4_ASM -DMD5_ASM -DVPAES_ASM -DGHASH_ASM -DECP_NISTZ256_ASM -DX25519_ASM -DPOLY1305_ASM -DNDEBUG
OPENSSLDIR: "/usr/local/openssl/ssl"
ENGINESDIR: "/usr/local/openssl/lib/engines-1.1"
Seeding source: os-specific

# 开始下载新版本
$ cd /opt
$ wget https://www.openssl.org/source/openssl-1.1.1f.tar.gz
$ tar xzf openssl-1.1.1f.tar.gz
```
**Brotli**
```bash
$ cd /opt
$ git clone https://github.com/google/ngx_brotli.git
$ cd ngx_brotli
$ git submodule update --init
```

## 编译以及安装
```bash
$ nginx -V
```
先用使用以上命令查询出已有nginx有安装的模块以及配置的路径，之后再原有的基础上增加
```
--prefix=/usr/local/nginx \  ## 编译后安装的目录位置，可以替换成跟原来一样
--with-openssl=/opt/openssl-1.1.1f  \ ## 指定单独编译入 OpenSSL 的源码位置
--with-openssl-opt=enable-tls1_3 \ ## 开启 TLS 1.3 支持
--with-http_v2_module \ ## 开启 HTTP/2 
--with-http_ssl_module \ ## 开启 HTTPS 支持
--with-http_gzip_static_module \ ## 开启 GZIP 压缩
--add-module=/opt/ngx_brotli ## 编译入 ngx_BroTli 扩展
```
综合两者，最后编译Nginx
```bash
$ cd /opt/nginx-1.16.1

$ ./configure \
--prefix=/etc/nginx \
--sbin-path=/usr/sbin/nginx \
--modules-path=/usr/lib64/nginx/modules \
--conf-path=/etc/nginx/nginx.conf \
--error-log-path=/var/log/nginx/error.log \
--http-log-path=/var/log/nginx/access.log \
--pid-path=/var/run/nginx.pid \
--lock-path=/var/run/nginx.lock \
--http-client-body-temp-path=/var/cache/nginx/client_temp \
--http-proxy-temp-path=/var/cache/nginx/proxy_temp \
--http-fastcgi-temp-path=/var/cache/nginx/fastcgi_temp \
--http-uwsgi-temp-path=/var/cache/nginx/uwsgi_temp \
--http-scgi-temp-path=/var/cache/nginx/scgi_temp \
--user=nginx \
--group=nginx \
--with-compat \
--with-file-aio \
--with-threads \
--with-http_addition_module \
--with-http_auth_request_module \
--with-http_dav_module \
--with-http_flv_module \
--with-http_gunzip_module \
--with-http_gzip_static_module \
--with-http_mp4_module \
--with-http_random_index_module \
--with-http_realip_module \
--with-http_secure_link_module \
--with-http_slice_module \
--with-http_ssl_module \
--with-http_stub_status_module \
--with-http_sub_module \
--with-http_v2_module \
--with-mail \
--with-mail_ssl_module \
--with-stream \
--with-stream_realip_module \
--with-stream_ssl_module \
--with-stream_ssl_preread_module \
--with-cc-opt='-O2 -g -pipe -Wall -Wp,-D_FORTIFY_SOURCE=2 -fexceptions -fstack-protector-strong --param=ssp-buffer-size=4 -grecord-gcc-switches -m64 -mtune=generic -fPIC' \
--with-ld-opt='-Wl,-z,relro -Wl,-z,now -pie' \
--with-openssl=/opt/src/openssl-1.1.1f \
--with-openssl-opt=enable-tls1_3 \
--add-module=/opt/src/ngx_brotli

# 编译并安装
$ make && make install
```

# Nginx配置
**HTTP2**
```
listen 443 ssl http2;
```
只要在 server{} 下的lisen 443 ssl 后添加 http2 即可。而且从 1.15 开始，只要写了这一句话就不需要再写 ssl on 了。

**只开启TLS 1.2与TLS1.3**
```
ssl_protocols  TLSv1.2 TLSv1.3;
```
**然后我们再修改对应的加密算法算法：**
```
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
```
默认情况下 Nginx 因为安全原因，没有开启 TLS 1.3 0-RTT，可以通过添加 ssl_early_data on; 指令开启 0-RTT的支持。

**Brotli**  
只需要在对应配置文件中，添加下面代码即可：
```
    brotli                     on;
    brotli_comp_level          6;
    brotli_min_length          1k;
    brotli_types               text/plain text/css text/xml text/javascript text/x-component application/json application/javascript application/x-javascript application/xml application/xhtml+xml application/rss+xml application/atom+xml application/x-font-ttf application/vnd.ms-fontobject image/svg+xml image/x-icon font/opentype;
```
下面放一个完整的`server{}`供大家参考：
```
server {
        listen       443 ssl http2; # 开启 http/2
        server_name  chenjunxin.com;

        #证书部分
        ssl_certificate cert/3475595_www.chenjunxin.com.pem;
        ssl_certificate_key cert/3475595_www.chenjunxin.com.key;

        #TLS 握手优化
        ssl_session_cache    shared:SSL:1m;
        ssl_session_timeout  5m;
        keepalive_timeout    75s;
        keepalive_requests   100;
     
        #TLS 版本控制
        ssl_protocols TLSv1.2 TLSv1.3; # Requires nginx >= 1.13.0 else use TLSv1.2
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    
        #服务端加密算法优先 
        ssl_prefer_server_ciphers on;
        
        #开启1.3 0-RTT
        ssl_early_data on;
     
         # GZip 和 Brotli
        gzip            on;
        gzip_comp_level 6;
        gzip_min_length 1k;
        gzip_types      text/plain text/css text/xml text/javascript text/x-component application/json application/javascript application/x-javascript application/xml application/xhtml+xml application/rss+xml application/atom+xml application/x-font-ttf application/vnd.ms-fontobject image/svg+xml image/x-icon font/opentype;
        brotli          on;
        brotli_comp_level   6;
        brotli_min_length   1k;
        brotli_types    text/plain text/css text/xml text/javascript text/x-component application/json application/javascript application/x-javascript application/xml application/xhtml+xml application/rss+xml application/atom+xml application/x-font-ttf application/vnd.ms-fontobject image/svg+xml image/x-icon font/opentype;
    
        ##OCSP Stapling开启,OCSP是用于在线查询证书吊销情况的服务，使用OCSP Stapling能将证书有效状态的信息缓存到服务器，提高TLS握手速度
        ssl_stapling  on;   
        #OCSP Stapling验证开启
        ssl_stapling_verify on;
        #用于查询OCSP服务器的DNS
        resolver 8.8.8.8 114.114.114.114 valid=300s;
        #查询域名超时时间
        resolver_timeout 5s;   
    
        #开启HSTS，并设置有效期为31536000秒，包括子域名(根据情况可删掉)：includeSubdomains，预加载到浏览器缓存(根据情况可删掉)
        add_header  Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";

        location / {
            root   html;
            index  index.html index.htm;
        }
    }
```
后面就可以用`nginx -t`检测配置是否正确，正确的话可以用`nginx -s reload`重载Nginx。

# 验证
[MySSL.com](https://myssl.com/chenjunxin.com?status=success)检测A+，整体配置过关。
![](https://oss.chenjunxin.com/picture/blogPicture/9f670eb_Myssl_Result.webp)


![ssllabs.com](https://www.ssllabs.com/ssltest/analyze.html?d=chenjunxin.com)检测A+，整体配置过关。
![](https://oss.chenjunxin.com/picture/blogPicture/9f670eb_Ssllabs_Result.webp)

## OSCP
在Nginx配置中开启OSCP配置，可以在以上的[ssllabs.com](https://www.ssllabs.com/ssltest/analyze.html?d=chenjunxin.com)的检测信息中看到:
![](https://oss.chenjunxin.com/picture/blogPicture/9f670eb_OCSP_Result.webp)

## HTTP/2
通过浏览器的**开发者工具**，我们可以在**Network**栏目中看到**Protocol**中显示 `h2`有无来判断。
![](https://oss.chenjunxin.com/picture/blogPicture/9f670eb_HTTP2_Result.webp)

## TLS 1.3
目前主流的浏览器都支持 TLS 1.3 版本：
Chrome 从 62 版本默认开启 TLS 1.3 的支持，如果是 62 以下的版本，可以进行下列的配置
1. 工具栏上打开 chrome://flags/
2. 启用 TLS 1.3
![](https://oss.chenjunxin.com/picture/blogPicture/9f670eb_Chrome_TLS1.3_Setting.webp)

Firefox 从 47 版本默认开启 TLS 1.3 的支持，如果是 47 以下的版本，可以进行下列的配置。
1. 工具栏上打开 about:config
2. 修改 security.tls.version.max 为 4
3. 重新启动浏览器

然后可以通过浏览器的**开发者工具**中的**Security**栏目看到**Connection**栏目下是否有显示 TLS 1.3
![](https://oss.chenjunxin.com/picture/blogPicture/9f670eb_TLS1.3_Result.webp)

## HSTS
Nginx配置中设置了HSTS，这使得服务器每次response都告诉浏览器所有请求都强制使用https，就算用户手动输入http 地址也会在浏览器内部替换为https 请求，在根源上杜绝浏览器与服务器建立非安全连接。
![](https://oss.chenjunxin.com/picture/blogPicture/9f670eb_HSTS_Result.webp)

## Brotli
通过浏览器的开发者工具，我们可以在 Network 栏目中，打开具体页面的头信息，看到 **accept-encoding **中有 br 字眼就行。
![](https://oss.chenjunxin.com/picture/blogPicture/9f670eb_Brotli_Result.webp)


# 参考链接
- [Nginx 上部署 TLS1.3、Brotli、ECC双证书实践](https://www.mf8.biz/nginx-install-tls1-3/)
- [TLS1.3正式更新，为Nginx添加TLS1.3的支持](https://razeencheng.com/post/nginx-tls1.3-draft26)
- [Nginx禁用TLS1.0与1.1的尝试](https://herbertgao.com/16/)
- [让Nginx快速支持TLS1.3协议](https://www.jianshu.com/p/aa3f7c4d3a10)
- [我博客的nginx配置文件详解](https://ngx.hk/2018/02/20/%E6%88%91%E5%8D%9A%E5%AE%A2%E7%9A%84nginx%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6%E8%AF%A6%E8%A7%A3.html)
- [使用 OCSP Stapling 来优化 SSL 的速度与隐私安全](https://chziyue.com/post/37.html)
- [Strong SSL Security on nginx](https://raymii.org/s/tutorials/Strong_SSL_Security_On_nginx.html#toc_0)
- [TLS / SSL密码强化的建议](https://www.cnblogs.com/xuegqcto/p/10681774.html)
- [Nginx 配置双证书（RSA、ECC）](https://hexuanzhang.com/1716447603.html)