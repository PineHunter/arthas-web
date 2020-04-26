> 相信很多人都有这样一种感受，自己写的代码在开发、测试环境跑的稳得一笔，可一到线上就抽风，不是缺这个就是少那个反正就是一顿报错，而线上调试代码又很麻烦，让人头疼得很。不过, 阿里巴巴出了一款名叫`Arthas`的工具，可以在线分析诊断Java代码，让人眼前一亮。



### Arthas 是什么?

   `Arthas(阿尔萨斯)` 是阿里开源的一个Java在线分析诊断工具。

### Arthas 能解决啥问题？

在日常开发上线过程中，我们多多少少都会遇到下边这些问题，苦于无法在线调试，**只能通过老鸟的经验来硬分析bug，效率上不去还总开口问别人答疑解惑，多少有些不好意思**。

- 这个类从哪个 jar 包加载的？为什么会报各种类相关的 Exception？
    
 -  我改的代码为什么没有执行到？难道是我没 commit？分支搞错了？
    
 - 遇到问题无法在线上 debug，难道只能通过加日志再重新发布吗？
    
 - 线上遇到某个用户的数据处理有问题，但线上同样无法 debug，线下无法重现！
    
 - 是否有一个全局视角来查看系统的运行状况？
    
 - 有什么办法可以监控到JVM的实时运行状态？
    
 - 线上代码有错误，不想重新发布？那能不能改class文件替换一下？

### Arthas两种安装、启动方式

#### 1、jar包启动


```javascript
wget https://alibaba.github.io/arthas/arthas-boot.jar

java -jar arthas-boot.jar --target-ip 0.0.0.0
```
首先想用`arthas`调试项目，服务器必须要有运行着的Java服务，`demo-0.0.1-SNAPSHOT.jar`就是我启动的测试项目，启动`arthas`后它会自动检测本地所有的Java服务列出来，我们只需按照序号输入想要调试的项目即可，选`1`进入对应进程的`arthas`交互平台

```javascript
[root@iz2zehzeir87zi8q99krk1z data]# java -jar arthas-boot.jar   --target-ip 172.17.72.201
[INFO] arthas-boot version: 3.1.0
[INFO] Found existing java process, please choose one and hit RETURN.
* [1]: 28679 demo-0.0.1-SNAPSHOT.jar
```


#### 2、在线安装

```javascript
curl -L https://alibaba.github.io/arthas/install.sh | sh
```

执行上面的命令会在所在的文件中生成as.sh执行文件
![在这里插入图片描述](https://user-gold-cdn.xitu.io/2020/4/26/171b51dd16298d7a?w=714&h=44&f=png&s=6159)
启动arthas 

```javascript
./as.sh PID #进程id 指定JAVA进程id
./as.sh -h #h来获取更多参数信息
```


#### 3、远程连接：

**要想使用arthas服务的 web console必须对外暴露本机ip**

```javascript
java -jar arthas-boot.jar --target-ip 172.17.72.201
java -jar arthas-boot.jar --telnet-port 9999 --http-port -1
```

```javascript
./as.sh --target-ip 0.0.0.0
./as.sh --telnet-port 9999 --http-port -1
```

访问`arthas`控制台也有两种方法

**(1)、web console 界面**


**重点说明**：-`-target-ip`  的`ip` 一定要是`arthas`所在机器对外暴露的ip，**但如果用的是阿里云机器必须要使用私有ip启动arthas服务，但访问必须是公网IP**
![在这里插入图片描述](https://user-gold-cdn.xitu.io/2020/4/26/171b51dd17fc5bb3?w=554&h=91&f=png&s=7251)

**(2)、telnet方式**


```javascript
telnet 10.0.2.5 8563
```
![在这里插入图片描述](https://user-gold-cdn.xitu.io/2020/4/26/171b51dd18af9d85?w=868&h=357&f=png&s=19471)
访问 http://59.110.218.9:8563/ ，进入交互平台
![在这里插入图片描述](https://user-gold-cdn.xitu.io/2020/4/26/171b51dd18a4ae64?w=1795&h=549&f=png&s=76196)

### Arthas 命令使用


#### 1、Dashboard 命令

查看当前系统的实时数据面板，例如：服务器thread信息、内存memory、GC回收等情况
![在这里插入图片描述](https://user-gold-cdn.xitu.io/2020/4/26/171b51dd18044e9a?w=958&h=579&f=png&s=218256)

#### 2、Thread（线程监控）

```javascript
$ thread -n 3
"as-command-execute-daemon" Id=57 cpuUsage=72% RUNNABLE
    at sun.management.ThreadImpl.dumpThreads0(Native Method)
    at sun.management.ThreadImpl.getThreadInfo(ThreadImpl.java:448)
    at com.taobao.arthas.core.command.monitor200.ThreadCommand.processTopBusyThreads(ThreadCommand.java:133)
    at com.taobao.arthas.core.command.monitor200.ThreadCommand.process(ThreadCommand.java:79)
    at com.taobao.arthas.core.shell.command.impl.AnnotatedCommandImpl.process(AnnotatedCommandImpl.java:82)
    at com.taobao.arthas.core.shell.command.impl.AnnotatedCommandImpl.access$100(AnnotatedCommandImpl.java:18)
    at com.taobao.arthas.core.shell.command.impl.AnnotatedCommandImpl$ProcessHandler.handle(AnnotatedCommandImpl.java:111)
    at com.taobao.arthas.core.shell.command.impl.AnnotatedCommandImpl$ProcessHandler.handle(AnnotatedCommandImpl.java:108)
    at com.taobao.arthas.core.shell.system.impl.ProcessImpl$CommandProcessTask.run(ProcessImpl.java:370)
    at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
    at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
    at java.lang.Thread.run(Thread.java:748)

    Number of locked synchronizers = 1 
    - java.util.concurrent.ThreadPoolExecutor$Worker@a2f70c7
```



**可以看到这个线程是被`synchroned`关键字锁导致的阻塞** ，目前只支持找出`synchronized`关键字阻塞住的线程， 如果是`java.util.concurrent.Lock`， 目前还不支持。

```javascript
Number of locked synchronizers = 1
    - java.util.concurrent.ThreadPoolExecutor$Worker@a2f70c7
thread -n 3 #当前最忙的前N个线程
thread -b, ##找出当前阻塞其他线程的线程
thread -n 3 -i 1000 #间隔一定时间后展示
```

**重点学习**：`thread -b`, ##**找出当前阻塞其他线程的线程**

####  3、JVM （jvm实时运行状态，内存使用情况等）

```javascript
$ jvm
 RUNTIME                                                                                                                                                                                                                                    
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 MACHINE-NAME                                                       28679@iz2zehzeir87zi8q99krk1z                                                                                                                                           
 JVM-START-TIME                                                     2019-03-28 17:32:16                                                                                                                                                     
 MANAGEMENT-SPEC-VERSION                                            1.2                                                                                                                                                                     
 SPEC-NAME                                                          Java Virtual Machine Specification                                                                                                                                      
 SPEC-VENDOR                                                        Oracle Corporation                                                                                                                                                      
 SPEC-VERSION                                                       1.8                                                                                                                                                                     
 VM-NAME                                                            Java HotSpot(TM) 64-Bit Server VM                                                                                                                                       
 VM-VENDOR                                                          Oracle Corporation                                                                                                                                                      
 VM-VERSION                                                         25.191-b12                                                                                                                                                              
 INPUT-ARGUMENTS                                                    []                                                                                                                                                                      
 CLASS-PATH                                                         demo-0.0.1-SNAPSHOT.jar                                                                                                                                                 
 BOOT-CLASS-PATH                                                    /usr/local/jdk/jre/lib/resources.jar:/usr/local/jdk/jre/lib/rt.jar:/usr/local/jdk/jre/lib/sunrsasign.jar:/usr/local/jdk/jre/lib/jsse.jar:/usr/local/jdk/jre/lib/jce.jar 
                                                                    :/usr/local/jdk/jre/lib/charsets.jar:/usr/local/jdk/jre/lib/jfr.jar:/usr/local/jdk/jre/classes                                                                          
 LIBRARY-PATH                                                       /usr/java/packages/lib/amd64:/usr/lib64:/lib64:/lib:/usr/lib       
```




####  4、trace (当前方法内部调用路径，路径上每个节点的耗时)

```javascript
$ trace #类名  #方法名 
```
![在这里插入图片描述](https://user-gold-cdn.xitu.io/2020/4/26/171b51dd17107a9e?w=788&h=84&f=png&s=9688)
对于执行耗时相对较长的方法，调用链路耗时属性会高亮显示方便排查
![在这里插入图片描述](https://user-gold-cdn.xitu.io/2020/4/26/171b51dd3692bf8f?w=722&h=175&f=png&s=19927)

参数 `-j` 可以过滤jdk的函数  `trace -j  com.example.demo.controller index2`
参数 `#cost` 可以按执行耗时毫秒ms过滤   `trace -j  com.example.demo.controller index2 ’#cost >10‘` 


#### 5、watch

当前方法执行数据观测，能观察到的范围为：返回值、抛出异常、入参

```javascript
$ trace #类名  #方法名 "{params,target,returnObj，throwExp }" 
```

```javascript
OGNL 表达式 {params,target,returnObj，throwExp }
```
`throwExp`：异常
`params` ：入参（数组），单个参数params【0】
`returnObj`：返回值 

```javascript
$ watch com.example.demo.controller index2 "{params,target,returnObj}" -x 5
Press Q or Ctrl+C to abort.
Affect(class-cnt:1 , method-cnt:1) cost in 81 ms.
ts=2019-03-29 14:24:14; [cost=1000.746582ms] result=@ArrayList[
    @Object[][
        @String[辛志富],
    ],
    @controller[
    ],
    @String[index2],
]
```



####  6、stack

 当前方法被调用的路径，显示当前方法被那些方法调用

```javascript
public static String uuidOne() {
    return uuidTwo();
}
public static String uuidTwo() {
    return UUID.randomUUID().toString().replaceAll("-", "");
}
```

```javascript
$ stack  com.example.demo.controller uuidTwo
Press Q or Ctrl+C to abort.
Affect(class-cnt:1 , method-cnt:1) cost in 58 ms.
ts=2019-03-29 14:38:19;thread_name=http-nio-8888-exec-5;id=13;is_daemon=true;priority=5;TCCL=org.springframework.boot.web.embedded.tomcat.TomcatEmbeddedWebappClassLoader@525b461a
    @com.example.demo.controller.uuidOne()
        at com.example.demo.controller.index2(controller.java:31)
        at sun.reflect.GeneratedMethodAccessor36.invoke(null:-1)
        at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
```


####  7、monitor 命令

监控类、方法的调用进行监控，调用次数、成功次数、失败次数、平均响应时长、失败率等

```javascript
$ monitor -c 4 com.example.demo.controller uuidTwo
Press Q or Ctrl+C to abort.
Affect(class-cnt:1 , method-cnt:1) cost in 56 ms.
 timestamp            class                        method   total  success  fail  avg-rt(ms)  fail-rate                                                                                                                                     
--------------------------------------------------------------------------------------------------------                                                                                                                                    
 2019-03-29 14:55:40  com.example.demo.controller  uuidTwo  7      7        0     0.18        0.00%      
```


####  8、classloader 命令

 将JVM中所有的类加载器统计出来，树状展示

```javascript
$ classloader #每种classloader加载类的个树
 name                                                    numberOfInstances  loadedCountTotal                                                                                                                                                
 org.springframework.boot.loader.LaunchedURLClassLoader  1                  4463                                                                                                                                                            
 com.taobao.arthas.agent.ArthasClassloader               2                  3631                                                                                                                                                            
 BootstrapClassLoader                                    1                  2961                                                                                                                                                            
 java.net.FactoryURLClassLoader                          1                  835                                                                                                                                                             
 sun.misc.Launcher$AppClassLoader                        1                  46                                                                                                                                                              
 sun.reflect.DelegatingClassLoader                       41                 41                                                                                                                                                              
 sun.misc.Launcher$ExtClassLoader                        1                  25                                                                                                                                                              
Affect(row-cnt:7) cost in 7 ms.
$ classloader -t    # 类加载器间的层级关系
+-BootstrapClassLoader                                                                                                                                                                                                                      
+-sun.misc.Launcher$ExtClassLoader@1959f618                                                                                                                                                                                                 
  +-com.taobao.arthas.agent.ArthasClassloader@5fc476c6                                                                                                                                                                                      
  +-com.taobao.arthas.agent.ArthasClassloader@5017e14b                                                                                                                                                                                      
  +-sun.misc.Launcher$AppClassLoader@5c647e05                                                                                                                                                                                               
    +-java.net.FactoryURLClassLoader@4ad317f0                                                                                                                                                                                               
    +-org.springframework.boot.loader.LaunchedURLClassLoader@20ad9418                                                                                                                                                                       
Affect(row-cnt:7) cost in 5 ms
```

### 线上代码热更新（动态修改上线项目代码）


手动在代码中抛异常，**不停机不重新发包的情况下，修改线上代码**
![在这里插入图片描述](https://user-gold-cdn.xitu.io/2020/4/26/171b51dd37fe861f?w=684&h=351&f=png&s=34048)
启动服务也达到我们预期异常
![在这里插入图片描述](https://user-gold-cdn.xitu.io/2020/4/26/171b51dd3bd0789d?w=1195&h=167&f=png&s=31529)

**替换代码的流程：**

#### 1、`jad命令` 将需要更改的文件先进行反编译，保存下来 ，编译器修改

```javascript
$ jad --source--only com.example.demo.DemoApplication > /data/DemoApplication.java
```
![在这里插入图片描述](https://user-gold-cdn.xitu.io/2020/4/26/171b51dd3d565323?w=622&h=198&f=png&s=15998)

修改完以后需要将类重新加载到JVM

####  2、`SC命令` 查找当前类是哪个classLoader加载的

```javascript
$ sc -d *DemoApplication | grep classLoader

 classLoaderHash   20ad9418 #类加载器  编号     
```

                                                                                                                                                                                               

####  3、`MC命令` 用指定的classloader重新将类在内存中编译

```javascript
$ mc -c 20ad9418 /data/DemoApplication.java -d /data 
Memory compiler output:
/data/com/example/demo/DemoApplication.class
```


#### 4、redefine命令 将编译后的类加载到JVM

上边编译后的.class文件地址

```javascript
$ redefine /data/com/example/demo/DemoApplication.class  
redefine success, size: 1
```


**文件替换后我们再次访问一下程序，发现异常没有了程序已经是我们修改正确后的，class文件替换成功**

![](https://user-gold-cdn.xitu.io/2020/4/26/171b51dd4642271b?w=817&h=135&f=png&s=13228)


### 总结

这样我们就用`arthas`现实了不停机、不发包替换了生产环境的Java代码，功能确实比较强大，本文只揭开了`arthas`强大功能的冰山一角，后续将出更详细的文章，方便大家一起学习。

### 越懒越勤快

`arthas`的整体功能虽然很强大，但命令行的输入方式让我头疼不已，岁数大了记忆力真的下降严重，而且作为一个贼 `TM` 懒的程序员，让我去记住如此多的命令和参数，简直是要了老命。又一次因为懒让我勤快起来，我决定做个`arthas`命令可视化平台。

![](https://imgkr.cn-bj.ufileos.com/b467e768-c2d6-4789-b8e4-13d6a3a2c6d1.png)


**设计初衷**：设计这个平台的初衷很简单，就是让程序员们把更多的精力放在问题的排查上，而不是记那么多枯燥无趣的命令。本身我也不是一个愿意死记硬背的人，觉得脑子里还是应该多放一些有趣、有意义的东西。可能在用惯了命令行的大佬眼里，这个功能比较鸡肋，甚至有点多余，但毕竟像我这样平凡的人更多一些，每天还陷入在重复的工作当中，工作量能减一点就多轻松一点嘛。

目前平台还在持续的开发中，由于平台是自己在维护，开发进度并不客观，平时利用一些碎片时间开发，毕竟不能耽误工作丢了饭碗嘛。不管会不会有人用，我都会一直做下去。

**github地址** : https://github.com/chengxy-nds/arthas-web.git

**感兴趣的小伙伴可以私信我，让我们一起打造这个有趣的东西吧！**

