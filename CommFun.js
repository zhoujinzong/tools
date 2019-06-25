//获取
function callGetajax(url, params, callback) {
    $.ajax({
        url: url,
        data: params,
        type: 'get',
        dataType: 'json',
        success: function (data) {
            callback(data);
        },
        error: function (data) {
            console.log(data);
            callback(data);
        }
    });
}
//指定类型提交traditional:true 提交对象属性值为list，id=1&id=2&id=3
function callGetajaxTrad(url, params, callback) {
    $.ajax({
        url: url,
        data: params,
        type: 'get',
        dataType: 'json',
        traditional: true,
        success: function (data) {
            callback(data);
        },
        error: function (data) {
            console.log(data);
            callback(data);
        }
    });
}

//未指定指定类型提交
function callPostajaxApp(url, params, callback) {
    $.ajax({
        url: url,
        data: params,
        type: 'post',
        dataType: 'json',
        // contentType: "application/json",
        cache: false,// 不缓存
        success: function (data) {
            callback(data);
        },
        error: function (data) {
            console.log(data);
            callback(data);
        }
    });
}
//指定类型提交traditional:true 提交对象属性值为list，id=1&id=2&id=3
function callPostajaxTrad(url, params, callback) {
    $.ajax({
        url: url,
        data: params,
        type: 'post',
        dataType: 'json',
        traditional: true,
        cache: false,// 不缓存
        success: function (data) {
            callback(data);
        },
        error: function (data) {
            console.log(data);
            callback(data);
        }
    });
}
//指定类型提交traditional:true 提交对象属性值为list，id=1&id=2&id=3,formData提交
function callPostajaxTradFormData(url, params, callback) {
    $.ajax({
        url: url,
        data: params,
        type: 'post',
        // dataType: 'json',
        traditional: true,
        processData: false, // jQuery不要去处理发送的数据
        contentType: false,
        cache: false,// 不缓存
        success: function (data) {
            callback(data);
        },
        error: function (data) {
            console.log(data);
            callback(data);
        }
    });
}
//指定类型提交
function callPostajaxAppJSONString(url, params, callback) {
    $.ajax({
        url: url,
        data: JSON.stringify(params),
        type: 'post',
        dataType: 'json',
        contentType: "application/json",
        cache: false,// 不缓存
        success: function (data) {
            callback(data);
        },
        error: function (data) {
            console.log(data);
            callback(data);
        }
    });
}

//无需处理提交
function callPostajax(url, params, callback) {
    $.ajax({
        url: url,
        data: params,
        type: 'post',
        dataType: 'json',
        processData: false, // jQuery不要去处理发送的数据
        contentType: false, // jQuery不要去设置Content-Type请求头
        cache: false,// 不缓存
        success: function (data) {
            callback(data);
        },
        error: function (data) {
            console.log(data);
            callback(data);
        }
    });
}

//回调提示函数
function callbackFun(data, tips, fun, successNotTips) {
    console.log(data);
    if (data.code) {
        if (data.code === 200) {
            // layer.msg(success(data.msg), {icon: 1, time: 1000},fun);
            if (successNotTips) {
                fun();
            }else{
                layer.msg(data.msg, {icon: 1, time: 1000}, fun);
            }
        } else {
            // layer.msg(failure(data.msg), {icon: 7, time: 1000},fun);
            layer.msg(data.msg, {icon: 7, time: 1000}, fun);
        }
    } else {
        layer.msg(error(tips), {icon: 7, time: 1000}, fun);
    }
}
//标题创建函数
function CreateTitleHtml(data, tagArr) {

    data.forEach(function (item, index) {
        var li = '';
        li += '<li class="right_border">' +
            '<a id="' + item.id + '" href="javascript:void(0);" htmlUrl="list.html?abbr=' + item.abbr + '" session="' + clickNewstypeId + '"' +
            'onClick="goToDetail(this)">' + item.name + '</a>' +
            '</li>';

        $(tagArr[0]).append(li);
    });
}

//跳转到内容函数
function goToDetail(obj) {
    var id = $(obj).attr("id");
    var htmlUrl = $(obj).attr("htmlUrl");
    var session = $(obj).attr("session");

    sessionStorage.setItem(session, id);
    window.location.href = htmlUrl;
};

function DateFormat(fmt, date) {
    var o = {
        'M+': date.getMonth() + 1, //月份
        'd+': date.getDate(), //日
        'h+': date.getHours(), //小时
        'm+': date.getMinutes(), //分
        's+': date.getSeconds(), //秒
        'q+': Math.floor((date.getMonth() + 3) / 3), //季度
        S: date.getMilliseconds(), //毫秒
    };

    var fmtN = fmt;
    if (/(y+)/.test(fmtN)) {
        fmtN = fmtN.replace(RegExp.$1, (date.getFullYear()).substr(4 - RegExp.$1.length));
    }
    Object.keys(o).forEach(function (k) {
        if (new RegExp(k).test(fmt)) {
            fmtN = fmtN.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : ("00" + o[k].substr(o[k].length)));
        }
    });
    return fmtN;
}

//字符串乘法
function times(String, n) {
    if (n === 0) {
        return "";
    }
    if (n === 1) {
        return String;
    }
    var midRes = times(String, Math.floor(n / 2));
    midRes += midRes;
    if (n % 2) {
        midRes += String;
    }
    return midRes;
}

//处理form表单函数转为json
var convert_FormData_to_json = function (formData) {
    var objData = {};

    for (var entry of formData.entries()) {
        objData[entry[0]] = entry[1];
    }
    // return JSON.stringify(objData);
    return objData;
};

function success(msg) {
    return msg + "成功";
};//成功

function failure(msg) {
    return msg + "失败";
};//失败
function error(msg) {
    return msg + "错误";
};//失败

//关闭layer并重新刷新父类
function closeLayerAndReloadParent() {
    setTimeout(function () {
        reloadParent();
        layer_close();
    }, 1000);
};

//关闭layer并重新刷新
function closeLayer() {
    setTimeout(function () {
        reload();
        layer_close();
    }, 1000);
};

//重新刷新
function reload() {
    location.reload();
};

//重新刷新父类
function reloadParent() {
    parent.location.reload()
};

//加载动画
function loading(boo) {
    boo ? $("#loading").show() : $("#loading").hide();
}

//url切割参数
function UrlSplit(url) {

    var result;
    var keyValue;
    var obj = {};

    if (url.indexOf('?') === -1) {
        return obj;
    }

    result = url.split('?')[1];
    keyValue = result.split('&');

    for (var i = 0; i < keyValue.length; i++) {
        var item = keyValue[i].split('=');
        obj[item[0]] = item[1];
    }

    return obj;
}

function ReverseObj(obj){
    var Keys = Object.keys(obj);
    var targetObj = {};
    if (Keys.length === 0) {
        return
    }
    Keys.map(key =>{
        targetObj[obj[key]] = key;
    });
    return targetObj;
}