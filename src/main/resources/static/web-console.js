var ws;
var xterm;
var commandThreadStr = "thread  ";
var classloaderStr = "classloader  ";
var smStr = "sm  ";
var watchStr = "watch ";
var scStr = "sc  ";
var redefineStr = "redefine  ";

$(function () {
    var url = window.location.href;
    var ip = getUrlParam('ip');
    var port = getUrlParam('port');

    if (ip != '' && ip != null) {
        $('#ip').val(ip);
    }
    if (port != '' && port != null) {
        $('#port').val(port);
    }

    //startConnect(true);

});

/** 获取参数 **/
function getUrlParam(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function getCharSize() {
    var tempDiv = $('<div />').attr({'role': 'listitem'});
    var tempSpan = $('<div />').html('qwertyuiopasdfghjklzxcvbnm');
    tempDiv.append(tempSpan);
    $("html body").append(tempDiv);
    var size = {
        width: tempSpan.outerWidth() / 26,
        height: tempSpan.outerHeight(),
        left: tempDiv.outerWidth() - tempSpan.outerWidth(),
        top: tempDiv.outerHeight() - tempSpan.outerHeight(),
    };
    tempDiv.remove();
    return size;
}

/** 获取窗口尺寸 **/
function getWindowSize() {
    var e = window;
    var a = 'inner';
    if (!('innerWidth' in window)) {
        a = 'client';
        e = document.documentElement || document.body;
    }
    var terminalDiv = document.getElementById("terminal-card");
    var terminalDivRect = terminalDiv.getBoundingClientRect();
    return {
        width: terminalDivRect.width,
        height: e[a + 'Height'] - terminalDivRect.top
    };
}

/** 命令行的尺寸 **/
function getTerminalSize() {
    var charSize = getCharSize();
    var windowSize = getWindowSize();
    console.log('charsize');
    console.log(charSize);
    console.log('windowSize');
    console.log(windowSize);
    return {
        cols: Math.floor((windowSize.width - charSize.left) / 10),
        rows: Math.floor((windowSize.height - charSize.top) / 17)
    };
}

/** 初始化 websocket **/
function initWs(ip, port) {
    var path = 'ws://' + ip + ':' + port + '/ws';
    ws = new WebSocket(path);
}

/** 初始化 xterm 命令行模拟器 **/
function initXterm(cols, rows) {
    xterm = new Terminal({
        cols: cols,
        rows: rows,
        screenReaderMode: true,
        rendererType: 'canvas',
        convertEol: true
    });
}

/** 开始连接arthas服务 **/
function startConnect(silent) {

    var ip = $('#ip').val();
    var port = $('#port').val();
    if (ip == '' || port == '') {
        tip("警告", "端口、IP不能为空");
        return;
    }
    if (ws != null) {
        tip("警告", "已经连接，请勿重复提交");
        return;
    }
    // init webSocket
    initWs(ip, port);
    ws.onerror = function () {
        ws = null;
        !silent && tip("警告", "连接失败");
    };
    ws.onopen = function () {
        console.log('open');
        $('#fullSc').show();
        var terminalSize = getTerminalSize()
        console.log('terminalSize')
        console.log(terminalSize)
        // init xterm
        initXterm(terminalSize.cols, terminalSize.rows)
        ws.onmessage = function (event) {

            if (event.type === 'message') {
                var data = event.data;
                xterm.write(data);
            }
        };
        xterm.open(document.getElementById('terminal'));
        xterm.on('data', function (data) {
            ws.send(JSON.stringify({action: 'read', data: data}))
        });
        ws.send(JSON.stringify({action: 'resize', cols: terminalSize.cols, rows: terminalSize.rows}));
        window.setInterval(function () {
            if (ws != null) {
                ws.send(JSON.stringify({action: 'read', data: ""}));
            }
        }, 30000);
    }
}

/**
 * 断开连接
 */
function disconnect() {
    try {
        ws.onmessage = null;
        ws.onclose = null;
        ws = null;
        xterm.destroy();
        $('#fullSc').hide();
        tip("警告", "成功断开连接");
    } catch (e) {
        alert('No connection, please start connect first.');
    }
}

/** 全屏幕展示 **/
function xtermFullScreen() {
    var ele = document.getElementById('terminal-card');
    requestFullScreen(ele);
}

/** 全屏幕展示 **/
function requestFullScreen(element) {
    var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;
    if (requestMethod) {
        requestMethod.call(element);
    } else if (typeof window.ActiveXObject !== "undefined") {
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript !== null) {
            wscript.SendKeys("{F11}");
        }
    }
}


/**
 * 执行命令
 */
function sendCommondtext() {

    //clearConmmond();
    if (ws == null) {
        tip("警告", "请先连接arthas服务");
        return;
    }
    var commond = $("#commond").val();
    if (commond == null || commond == "") {
        tip("警告", "命令不能为空");
        return;
    }
    ws.send(JSON.stringify({action: 'read', data: commond + "\r"}))
}

function tip(title, content) {
    layer.open({
        title: title
        , content: content
    });
}

/**
 * 执行命令
 */
function sendCommond(commond) {

    //clearConmmond();
    if (ws == null) {
        tip("警告", "请先连接arthas服务");
        return;
    }
    if (commond == null || commond == "") {
        tip("警告", "命令不能为空");
        return;
    }
    $("#commond").val(commond);

    ws.send(JSON.stringify({action: 'read', data: commond + "\r"}))
}

/**
 * 命令框回车事件
 */
function enter_btn(keycode) {
    if (keycode == 13) {
        sendCommondtext();
    }
    return;
}

function clearConmmond() {
    $("#commond").val("");
    ws.send(JSON.stringify({action: 'read', data: "cls \r"}))
    return;
}

/**
 * 左侧菜单点击事件
 * @param type
 * @param commondType
 */
function commondsClick(type, commondType) {

    var commandArray = {
        threads: {all: " ", block: " -b ", threadId: " ", threadN: " -n "},
        jvm: "jvm",
        dashboard: "dashboard",
        classloader: {tree: " -t", loadclass: " -c 类加载器ID --load 类名全路径"},
        sm: {methods: " ", methodInfo: " -d "},
        sysprop: {all: " ", single: "-h"},
        pwd: "pwd",
        jad: "jad",
        cat: "cat",
        watch: {before: "-b", return: "-s", exception: "-e", end: "-f"},
        trace: "trace",
        monitor: "monitor",
        sc: {classInfo: "-d", prop: "-f"},
        tt: "tt",
        mc: "mc",
        redefine: {localClass: "", jvmClasses: "jvm"},
        sysenv:"sysenv",
        dump:"dump"

    };


    var Command;
    // 线程
    if (type == 'thread') {
        addAllLauiHide();
        threadCommand = commandArray.threads[commondType];
        if (commondType == "block" || commondType == "all") {
            $("#thread_ID_Div").addClass("layui-hide");
            $("#thread_NID_Div").addClass("layui-hide");
        } else if (commondType == "threadId") {
            $("#thread_ID_Div").removeClass("layui-hide");
            $("#thread_NID_Div").addClass("layui-hide");
        } else if (commondType == "threadN") {
            $("#thread_ID_Div").addClass("layui-hide");
            $("#thread_NID_Div").removeClass("layui-hide");
        }
        $("#commond").val(commandThreadStr + threadCommand);
    }

    // JVM内存
    if (type == 'jvm') {
        addAllLauiHide();
        Command = commandArray[commondType];
        $("#commond").val(Command);
    }

    if (type == 'dump'){
        addAllLauiHide();
        commonModel(type);
        Command = commandArray[commondType];
        $("#commond").val(Command);
    }

    if (type == 'sysenv') {
        addAllLauiHide();
        commonModel(type)
        Command = commandArray[commondType];
        $("#commond").val(Command);
    }

    // 内存编译器
    if (type == 'mc') {
        Command = commandArray[commondType];
        commonModel();
        $("#commond").val(Command);
    }

    //sc 查看jvm已加载的类的信息
    if (type == "sc") {
        Command = commandArray.sc[commondType]
        if (commondType == 'classInfo') {
            commonModel('sc');
            Command = commandArray.sc[commondType];

        } else if (commondType == 'prop') {
            commonModel("");
            Command = commandArray.sc[commondType];
        }
        $("#commond").val(scStr + Command);

    }

    //系统数据面板
    if (type == "dashboard") {
        addAllLauiHide();
        Command = commandArray[commondType];
        $("#commond").val(Command);
    }

    //从外部加载classs文件
    if (type == "redefine") {
        Command = commandArray.redefine[commondType]
        if (commondType == 'localClass') {
            commonModel("");
        } else if (commondType == 'jvmClasses') {
            addAllLauiHide();
        }
        $("#commond").val(redefineStr + Command);
    }

    //类加载器
    if (type == "classloader") {
        addAllLauiHide();
        Command = commandArray.classloader[commondType];
        $("#commond").val(classloaderStr + Command);
    }

    //查询类方法信息
    if (type == "sm") {
        addAllLauiHide();
        Command = commandArray.sm[commondType];
        $("#commond").val(smStr + Command);
    }

    //查看文件
    if (type == "cat") {
        commonModel("");
        Command = commandArray[commondType];
        $("#commond").val(Command);
    }

    //查看当前路径
    if (type == 'pwd') {
        addAllLauiHide();
        Command = commandArray[commondType]
        $("#commond").val(Command);
    }

    //反编译文件
    if (type == 'jad') {
        commonModel(type);
        Command = commandArray[commondType]
        $("#commond").val(Command);

    }

    //查看方法调用链路
    if (type == "trace") {

        commonModel('trace');
        Command = commandArray[commondType]
        $("#commond").val(Command);
    }

    //监控方法信息
    if (type == "monitor") {
        commonModel('monitor');
        Command = commandArray[commondType]
        $("#commond").val(Command);
    }

    //watch 观察方法
    if (type == 'watch') {
        commonModel("")
        Command = commandArray.watch[commondType];
        if (commondType == 'before') {
            $("#commond").val(watchStr + Command);
        } else if (commondType == 'return') {
            $("#commond").val(watchStr + Command);
        } else if (commondType == 'exception') {
            $("#commond").val(watchStr + Command);
        } else if (commondType == 'end') {
            $("#commond").val(watchStr + Command);
        }
    }

    //tt命令
    if (type == "tt") {
        commonModel()
        Command = commandArray[commondType]
        $("#commond").val(Command);
    }
}


function addAllLauiHide() {
    $("#jad_clazz_method_div").addClass("layui-hide");
    $("#thread_ID_Div").addClass("layui-hide");
    $("#thread_NID_Div").addClass("layui-hide");
    $("#sm_class_div").addClass("layui-hide");
}

function commonModel(type) {
    var commandNoticeArray = {
        jad: "参数:class-pattern、[E]、[c:]",
        monitor:"参数:class-pattern、method-pattern、[E]、[c:]",
        trace:"参数:class-pattern、method-pattern、condition-express、[E]、[n:]、#cost",
        sc:"参数:[d]、[E]、[f]、[x:]",
        sysenv:"sysenv;查看所有环境信息，sysenv+属性:查看单个",
        dump:"参数:class-pattern、[c:]、[E]"
    };
    if (type == ""){
        $("#jad_clazz_method_text").prop("placeholder", "请输入命令参数");
    }
    $("#jad_clazz_method_text").prop("placeholder", commandNoticeArray[type]);

    addAllLauiHide();
    $("#jad_clazz_method_div").removeClass("layui-hide");
}

function threadIDText() {
    $("#commond").val($("#commond").val() + $("#thread_ID_Text").val());
}

function threadNIDText() {
    $("#commond").val($("#commond").val() + $("#thread_NID_Text").val());
}

function jadClazzText() {
    $("#commond").val($("#commond").val() + "  " + $("#jad_clazz_method_text").val())
    $("#jad_clazz_method_text").val("");
    commonModel("")
}







