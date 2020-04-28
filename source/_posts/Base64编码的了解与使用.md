---
title: Base64编码的了解与使用
tags:
  - Base64编码
categories:
  - 编码
  - Base64编码
keywords:
  - Base64
  - Base64编码
description: Base64 是一种使用 64 个可打印的字符来表示二进制数据的方法，Base64 中仅且包括字母 A-Za-z0-9+/ 共64个字符。Base64通常处理文本数据，表示、传输、存储二进制数据。
abbrlink: '29497496'
date: 2020-04-27 13:03:54
---

# Base64是什么
&emsp;Base64是一种常用的简单的编解码方式，有些网络传送渠道不支持所有字节，比如邮件发送，图像字节不可能全部都是可见字符，所以受到了很大限制。最好的解决办法就是在不改变传统协议的情况下，利用一种扩展方式来支持二进制文件的传送，把不可打印的字符用可打印字符来表示。Base64 就是一种基于64个可打印字符来表示二进制数据的方法。  
&emsp;电子邮件刚问世的时候，只能传输英文，但后来随着用户的增加，中文、日文等文字的用户也有需求，但这些字符并不能被服务器或网关有效处理，因此Base64就登场了。随之，Base64在URL、Cookie、网页传输少量二进制文件中也有相应的使用。随之，Base64在URL、Cookie、网页传输少量二进制文件中也有相应的使用。  
&emsp;Base64不是一种加密方式，因此它不提供任何安全特性。在论坛、个人博客中发现很多人使用 Base64编码显示自己邮箱主要是避免被搜索引擎及其他批量化工具发现和索引。

# Base64原理

## btoa 和 atob 的意义
&emsp;首先我们要知道为什么编码叫 btoa，而解码叫 atob  
&emsp;btoa = binary to ASCII = encode  
&emsp;atob = ASCII to binary = decode  
&emsp;C语言中有一个函数叫 atoi，意思是 convert a string to an integer，也就是 "10" => 10  
i 是 integer 很好理解，那为什么 a 是 string 呢？ a 其实是 ASCII 的缩写，ASCII 也是一种编码，string 为什么还有编码呢？因为电脑只认识二进制0和1，string 和 二进制的对应关系就是编码，比如 01100001 对应字符 'a' 就是由 ASCII 编码规定的。  
&emsp;理解了 atoi 再理解 btoa 就很简单了，a 是 ASCII，也就是 string，而 b 就是 binary。

## 原理
&emsp;理解Base64或其他类似编码的关键有两点：

- 计算机最终存储和执行的是01二进制序列，这个二进制序列的含义则由解码程序/解释程序决定
- 很多场景下的数据传输要求数据只能由简单通用的字符组成，比如HTTP协议要求请求的首行和请求头都必须是ASCII编码

&emsp;Base64的原理比较简单，每当我们使用Base64时都会先定义一个类似这样的数组：['A', 'B', 'C', ... 'a', 'b', 'c', ... '0', '1', ... '+', '/']。
&emsp;上面就是Base64的索引表，字符选用了`A-Z、a-z、0-9、+、/` 64个可打印字符，这是`标准`的Base64协议规定。在日常使用中我们还会看到`=`或`==`号出现在Base64的编码结果中，`=`在此是作为填充字符出现。

## 具体转换步骤

1. 将待转换的字符串每三个字节分为一组，每个字节占8bit，那么共有24个二进制位。
2. 将上面的24个二进制位每6个一组，共分为4组。
3. 在每组前面添加两个0，每组由6个变为8个二进制位，总共32个二进制位，即四个字节。
4. 根据<span id="standard_base64_dictionary">Base64编码对照表</span>（见下表）获得对应的值。

```
                   Table 1: The Base 64 Alphabet

     Value Encoding  Value Encoding  Value Encoding  Value Encoding
         0 A            17 R            34 i            51 z
         1 B            18 S            35 j            52 0
         2 C            19 T            36 k            53 1
         3 D            20 U            37 l            54 2
         4 E            21 V            38 m            55 3
         5 F            22 W            39 n            56 4
         6 G            23 X            40 o            57 5
         7 H            24 Y            41 p            58 6
         8 I            25 Z            42 q            59 7
         9 J            26 a            43 r            60 8
        10 K            27 b            44 s            61 9
        11 L            28 c            45 t            62 +
        12 M            29 d            46 u            63 /
        13 N            30 e            47 v
        14 O            31 f            48 w         (pad) =
        15 P            32 g            49 x
        16 Q            33 h            50 y
```
从上面的步骤我们发现：

- Base64字符表中的字符原本用6个bit就可以表示，现在前面添加2个0，变为8个bit，会造成一定的浪费。因此，Base64编码之后的文本，要比原文大约三分之一。
- 为什么使用3个字节一组呢？因为6和8的最小公倍数为24，三个字节正好24个二进制位，每6个bit位一组，恰好能够分为4组。

## 示例说明
```bash
原始字符                        T           o           m
ASCII十进制值      		        84          111         109
二进制值(8bit1字节):            01010100    01101111    01101101
Base64编码二进制值(6bit1字节):   010101      000110      111101      101101
Base64编码十进制值:              21          6           61          45
Base64编码后的字符:              V           G           9           t
```
因此 Tom 在 Base64 编码之后变成了 VG9t。

### 位数不足情况
上面是按照三个字节来举例说明的，如果字节数不足三个，那么该如何处理？
```bash
原始字符                               A                       
ASCII十进制值      		               65                  
二进制值(8bit1字节):                   01000001        
Base64编码二进制值(6bit1字节)，后面补0:  010000      010000     
Base64编码十进制值:                    16          16           
Base64编码后的字符:                    Q           Q           =      =

原始字符                               B           C                     
ASCII十进制值      		               66          67        
二进制值(8bit1字节):                    01000010    01000011   
Base64编码二进制值(6bit1字节)，后面补0:   010000      100100     001100     
Base64编码十进制值:                     16          36         12
Base64编码后的字符:                     Q           k          M       =
```

- 两个字节：两个字节共16个二进制位，依旧按照规则进行分组。此时总共16个二进制位，每6个一组，则第三组缺少2位，用0补齐，得到三个Base64编码，第四组完全没有数据则用“=”补上。因此，上图中“BC”转换之后为“QKM=”；
- 一个字节：一个字节共8个二进制位，依旧按照规则进行分组。此时共8个二进制位，每6个一组，则第二组缺少4位，用0补齐，得到两个Base64编码，而后面两组没有对应数据，都用“=”补上。因此，上图中“A”转换之后为“QQ==”；

## 注意事项
- **大多数编码都是由字符串转化成二进制的过程，而Base64的编码与常规恰恰相反,是从二进制转换为字符串**。
- Base64编码主要用在传输、存储、表示二进制领域，**不能算得上加密，只是无法直接看到明文**。也可以通过打乱Base64编码来进行加密，但是还是容易被破解。
- 中文有多种编码（比如：utf-8、gb2312、gbk等），不同编码对应Base64编码结果都不一样。
- 上面我们已经看到了Base64就是用6位（2的6次幂就是64）表示字符，因此成为Base64。同理，Base32就是用5位，Base16就是用4位。

## 验证
### Linux命令
&emsp;较高版本的Linux提供了命令行方式的Base64编码和解码。
![](https://oss.chenjunxin.com/picture/blogPicture/29497496_base64__demo_verify_result00.webp)
&emsp;**注意：**echo默认是有换行的， -n的时候， 是不换行的。不加-n的话
会导致出来的结果是不一样的，我试过，后面用Java8的Base64工具解密得出来，发现比起用Java8的直接加密，结果多了一个换行符"\n"。

### Java8验证
```java
 public static void main(String[] args) {
        System.out.println(System.getProperty("file.encoding"));
        final Base64.Decoder decoder = Base64.getDecoder();
        final Base64.Encoder encoder = Base64.getEncoder();
        String[] testText = {"A", "B"};
        for (String s : testText) {
            byte[] textByte = s.getBytes(StandardCharsets.UTF_8);
            //编码
            String encodedText = encoder.encodeToString(textByte);
            System.out.println(encodedText);
            //解码
            System.out.println(new String(decoder.decode(encodedText), StandardCharsets.UTF_8));
        }
    }
```
结果如下图:
![](https://oss.chenjunxin.com/picture/blogPicture/29497496_base64__demo_verify_result01.webp)

# Base64 的字典表
&emsp;Base64 根据编码字典表不同以及是否 padding (使用`=`作为 padding 字符)，对同一数据的编码结果可能不同。使用最多的字典表有两个：[标准的字典表](#standard_base64_dictionary)与URL Safe版本字典表(如下)。
```
  Table 2: The "URL and Filename safe" Base 64 Alphabet

     Value Encoding  Value Encoding  Value Encoding  Value Encoding
         0 A            17 R            34 i            51 z
         1 B            18 S            35 j            52 0
         2 C            19 T            36 k            53 1
         3 D            20 U            37 l            54 2
         4 E            21 V            38 m            55 3
         5 F            22 W            39 n            56 4
         6 G            23 X            40 o            57 5
         7 H            24 Y            41 p            58 6
         8 I            25 Z            42 q            59 7
         9 J            26 a            43 r            60 8
        10 K            27 b            44 s            61 9
        11 L            28 c            45 t            62 - (minus)
        12 M            29 d            46 u            63 _
        13 N            30 e            47 v           (underline)
        14 O            31 f            48 w
        15 P            32 g            49 x
        16 Q            33 h            50 y         (pad) =
```
&emsp;标准 Base64 中的两个非字母数字 + 和 / 设计的特别坑爹，因为它们不管在 url 中还有文件系统中都属于特殊字符。  
&emsp;而剩下的那个 padding 字符 = 就更坑爹了，因为 = 直接就是 query string 中的 equal 字符。  
&emsp;因此机智的人类又发明了 Base64 url safe 版本，和标准版区别有三：

- \+ 被 \- 代替，加号对应减号
- / 被 _ 代替
- 没有 = 这个 padding 字符

## Base64 编码结果中的等号（=）可以省略吗？是多余的设计吗？
&emsp;可以省略，但不是多余的设计。  
&emsp;对于数据 `A`, 如果我们省略padding的等号，解码的时候我们从`QQ`是可以推断出来，原始数据长度必然是1 byte, 因此可以可以正确解码。数据 `BC` 同理。
&emsp;但是对于一些将多个Base64编码拼接在一起的场景，padding的等号可以标记一个 Base64 编码单元的边界，使得拼接后的 Base64 编码整体是可以无歧义正确解码的。如果省略等号，则无法保证无歧义性。我们看一个例子：

- `I` Base64编码为 `SQ` (`SQ==` with padding)
- `AM` Base64编码为 `QU0` (`QU0=` with padding)
- `Daniel` Base64编码为 `RGFuaWVs` (`RGFuaWVs` with padding)

&emsp;如果使用省略等号的方式，拼接后的Base64编码是 `SQQU0RGFuaWVs`, 因为我们无法区分边界，我们只能对整个字符串进行解码，显然解码结果是不正确的。如果不省略等号，则拼接后的编码 `SQ==QU0=RGFuaWVs` 可以根据等号区分边界，然后分块正确解码。

# Base64用途
- Base64 大部分用处是用在二进制文件上的，任何数据都能被 Base64，因为 Base64 接受的参数是 binary，任何数据都是 binary，如 img, mp3, gzip 等。
- Base64 最大的好处是二进制文件本来是完全不可读而且不可显示的，转成 Base64 就成了文本，不仅可读可编辑，而且传输数据也方便。
- Base64是可逆的，在只可以传递纯文本的时候，通过 Base64 我们就可以传递一切了
- 不过正因为如此，Base64 肯定是不能用来加密的，因此 Base64 的 encode 和 decode 应该称为编码和解码，而不能称为加密和解密
- 然不能用来加密，但可以用来混淆，比如邮箱地址。

# Base64工具与实现
## Linux命令：base64
`base64` 命令用于对文件或者标准输入进行编码和解码。

### 用法
```
$ base64 --help
用法：base64 [选项]... [文件]
使用 Base64 编码/解码文件或标准输入输出。

如果没有指定文件，或者文件为"-"，则从标准输入读取。

必选参数对长短选项同时适用。
  -d, --decode          解码数据
  -i, --ignore-garbag   解码时忽略非字母字符
  -w, --wrap=字符数     在指定的字符数后自动换行(默认为76)，0 为禁用自动换行

      --help            显示此帮助信息并退出
      --version         显示版本信息并退出

数据以 RFC 4648 规定的 base64 字母格式进行编码。
解码时，输入数据（编码流）可能包含一些非有效 base64 字符的换行符。
可以尝试用 --ignore-garbage 选项来绕过编码流中的无效字符。

GNU coreutils 在线帮助：<https://www.gnu.org/software/coreutils/>
请向 <http://translationproject.org/team/zh_CN.html> 报告 base64 的翻译错误
完整文档请见：<https://www.gnu.org/software/coreutils/base64>
或者在本地使用：info '(coreutils) base64 invocation'
```

### 示例
编码标准输入
```bash
# 在终端输入 `base64` ，执行后，在终端中输入要编码的内容，按 `ctrl+D` 结束输入
$ base64 
你好
5L2g5aW9Cg==

#echo命令默认带换行符
$ echo "你好" | base64
5L2g5aW9Cg==

#echo -n不带换行符
$ echo -n "你好" | base64
5L2g5aW9
```

编码文件
```bash
$ touch testing.txt
$ echo "你好"> testing.txt
$ base64 testing.txt 
5L2g5aW9Cg==
```

解码标准输入
```bash
$ base64 -d
5L2g5aW9Cg==
你好
```

解码文件
```bash
$ base64 testing.txt  > encoded.txt
$ cat encoded.txt 
5L2g5aW9Cg==
$ base64 -d encoded.txt > decoded.txt
$ cat decoded.txt 
你好
```

## Java使用
参考这篇文章[关于base64编码Encode和Decode编码的几种方式](https://blog.csdn.net/Alex_81D/article/details/80997146),推荐是用Java8自带的Base64工具类。

# 参考链接
- [魔鬼在细节中：Base64 你可能不知道的几个细节](https://liudanking.com/sitelog/%E9%AD%94%E9%AC%BC%E5%9C%A8%E7%BB%86%E8%8A%82%E4%B8%AD%EF%BC%9Abase64-%E4%BD%A0%E5%8F%AF%E8%83%BD%E4%B8%8D%E7%9F%A5%E9%81%93%E7%9A%84%E5%87%A0%E4%B8%AA%E7%BB%86%E8%8A%82/)
- [base64 前世今生](https://zhuanlan.zhihu.com/p/21250813)
- [关于base64编码Encode和Decode编码的几种方式](https://blog.csdn.net/Alex_81D/article/details/80997146)