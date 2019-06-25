// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
var keys = [37, 38, 39, 40];

function preventDefault(e) {
  e = e || window.event;
  if (e.preventDefault)
      e.preventDefault();
  e.returnValue = false;
}

function keydown(e) {
    for (var i = keys.length; i--;) {
        if (e.keyCode === keys[i]) {
            preventDefault(e);
            return;
        }
    }
}

function wheel(e) {
  preventDefault(e);
}
//禁用滚动
function disable_scroll() {
  if (window.addEventListener) {
      window.addEventListener('DOMMouseScroll', wheel, false);
  }
  window.onmousewheel = document.onmousewheel = wheel;
  document.onkeydown = keydown;
}
//开启滚动
function enable_scroll() {
    if (window.removeEventListener) {
        window.removeEventListener('DOMMouseScroll', wheel, false);
    }
    window.onmousewheel = document.onmousewheel = document.onkeydown = null;
}

if(localStorage.getItem("adminlogin")&&localStorage.getItem("adminlogin")=='success'){

}else{
	window.location.href='unlogin.html';
}

function getUrlParam(name) {
	var thisurl = encodeURI(encodeURI(window.location));

	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
	var r = thisurl.search.substr(1).match(reg); //匹配目标参数
	if(r != null) return unescape(r[2]);
	return null; //返回参数值
}
var myUtil = {
	removalArr: function(arr) { //数组去重
		var hash = [];
		for(var i = 0; i < arr.length; i++) {
			for(var j = i + 1; j < arr.length; j++) {
				if(arr[i] === arr[j]) {
					++i;
				}
			}
			hash.push(arr[i]);
		}
		return hash;
	},
	getUrlParam: function(name) { //获取http链接?后面参数的值
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
		var r = window.location.search.substr(1).match(reg); //匹配目标参数
		if(r != null) return unescape(r[2]);
		return null; //返回参数值
	},
	setUrlParam: function(isfirst, params) { //设置http链接?后面参数的值 , isfirst: 是否有第一个参数了，params：需要传递的url名字与值的对象
		let paramsArr = [];
		if(params) {
			paramsArr = Object.keys(params).map(function(key, index) {
				let mark = "&";
				if(!isfirst && index == 0) {
					mark = '?';
				}
				return mark + key + '=' + params[key];
			});
		}
		return paramsArr.join('');
	},
	splictHid: function(Str, num) { //切割显示字符串，
		let newStr = Str;
		if(!newStr) {
			return newStr;
		}
		newStr = newStr.toString();
		if(newStr.length > num) {
			newStr = newStr.slice(0, num) + "...";
		}
		return newStr;
	},
	closeLayerAndReloadParent: function(time) { //关闭layer并重新刷新父类
		setTimeout(function() {
            // window.parent.location.reload();
			window.parent.vm.getData();
            layer_close();
        }, 1000);
	},
	closeLayer: function() { //关闭layer并重新刷新
		setTimeout(function() {
			window.location.reload();
			// layer_close();
		}, 1000);
	},
	reload: function() { //重新刷新
		setTimeout(function() {
			window.location.reload();
		}, 500);
	},
	reloadGetData: function() { //重新获取表格类数据
		setTimeout(function() {
            window.vm.getData();
		}, 500);
	},
	reloadParent: function() { //刷新父类
		window.parent.location.reload();
	},
	callbackFun: function(res, tips, fun) { //回调提示函数，接口返回data，提示消息，提示之后的回调函数
		if(res.code) {
			if(res.code == 200) {
				layer.msg(res.msg, {
					icon: 1,
					time: 1000
				}, fun);
			}else{
				layer.msg(res.msg, {
					icon: 7,
					time: 1000
				});
			}
		} else {
			layer.msg(tips + "错误", {
				icon: 7,
				time: 1000
			});
		}
	},
	PrefixIntegerL: function(num, n) { //传入 数字 和长度 前面自动补0
		return(Array(n).join(0) + num).slice(-n);
	},
	scorlltop:function(){//页面回到顶部
		 $('body,html').animate({scrollTop: 0}, 100);
	},
	ToDegrees:function(val) {//经纬度坐标转°′″坐标   传入115.32484 输出115°19′29.45″
	    if (typeof (val) == "undefined" || val == "") {
	        return "";
	    }
        val = val.toString();
	    var i = val.indexOf('.');
	    var strDu = i < 0 ? val : val.substring(0, i);
	    var strFen = 0;
	    var strMiao = 0;
	    if (i > 0) {
	        var strFen = "0" + val.substring(i);
	        strFen = strFen * 60 + "";
	        i = strFen.indexOf('.');
	        if (i > 0) {
	            strMiao = "0" + strFen.substring(i);
	            strFen = strFen.substring(0, i);
	            strMiao = strMiao * 60 + "";
	            i = strMiao.indexOf('.');
	            strMiao = strMiao.substring(0, i + 4);
	            strMiao = parseFloat(strMiao).toFixed(2);
	        }
	    }
	    return strDu + "°" + strFen + "′" + strMiao+"″";

	},
	ToDigital: function(val) {//°′″ 坐标转 经纬度坐标    传入115°19′29.45″输出115.32484
        val = val.toString();
	    var strDu=val.split("°")[0];
	    var strFen=(val.split("°")[1]).split('′')[0];
	    var strMiao=(val.split("°")[1]).split('′')[1];
	    strMiao=strMiao.substring(0,strMiao.length-1)

	    strDu = (typeof (strDu) == "undefined" || strDu == "") ? 0 : parseFloat(strDu);
	    strFen = (typeof (strFen) == "undefined" || strFen == "") ? 0 : parseFloat(strFen) / 60;
	    strMiao = (typeof (strMiao) == "undefined" || strMiao == "") ? 0 : parseFloat(strMiao) / 3600;
	    var digital = strDu + strFen + strMiao;
	    if (digital == 0) {
	        return "";
	    } else {
	        return Number(digital.toFixed(5));
	    }
	},
	dealSpace: function (e) { // 去除空格
		return e.replace(/^ +| +$/g,'');
    },
	checkNeedAttr: function (_that,needAttr,data) {//检查必填字段，
		// _that: 当前需要检查的对象，
		// needAttr: 当前必填字段对象数组，对象包括{attr：属性名，tips：属性中文名，way：方式（请选择，或者填写），
		// data：当前提交对象的属性名字，可不传，那么_that为直接检查的对象
        let flag = true;
        let Obj = _that[data] || data;//检查是否在vue对象中，
        //判断是否传入的提交对象的名字
        if (!data){
            Obj = _that;
		}
        try {
            needAttr.forEach(function (item) {
                if (!Obj[item.attr] && Obj[item.attr] !== 0) {
                    flag = false;
                    layer.msg(item.way + item.tips,{icon: 7 ,time: 1000});
                    throw new Error('error');
                }
            });

        } catch (e){
            if (e.message != 'error') throw e;
        }
        return flag;
    },
    setSearchSessionStorage: function (searchObj,currentPageName) {//存下当前的搜索条件，对象的值不能给null
        //searchObj：搜索对象
        //currentPageName：当前页面的文件名字
        Object.keys(searchObj).forEach(function (item) {
            sessionStorage.setItem(currentPageName + '-' + item,searchObj[item]);
        })
    },
    getSearchSessionStorage: function (searchObj,currentPageName) {//获取之前的搜索条件，对象的值不能给null
        //searchObj：搜索对象
		//currentPageName：当前页面的文件名字
        // searchObj[item];
        let Obj = {};
        try {
            Object.keys(searchObj).forEach(function (item) {
                let value = sessionStorage.getItem(currentPageName + '-' + item);
                let attrtype = typeof(searchObj[item]);
                if (attrtype == 'object') {
                    //对象、数组或者null
                    if (value == null) {
                        //null
						Obj = searchObj;
                        throw new Error('error');
                    } else if (attrtype.length) {
                        //数组
                        value = value.split(',');
                    } else {
                        //对象
                    }
                } else if (attrtype == 'boolean') {
                    //boolean
                    value = JSON.parse(value);
                } else if (attrtype == 'string') {
                    //字符串
                } else if (attrtype == 'number') {
                    //数字
                    value = parseInt(value);
                }
                Obj[item] = value;
            });
        } catch (e){
            if (e.message != 'error') throw e;
        }
		return Obj;
    },
    removeSearchSessionStorage: function (searchObj,currentPageName) {//清除当前的搜索条件，对象的值不能给null
        //searchObj：搜索对象
        //currentPageName：当前页面的文件名字
        Object.keys(searchObj).forEach(function (item) {
            sessionStorage.removeItem(currentPageName + '-' + item);
        })
    },
    textareaOnChange: function (obj,num) {
		if ($(obj).val().length > num) {
			layer.msg('字数不能超过' + num + '个',{icon: 7, time: 1000});
		}
    },
	inputAttr: function (data) {//输入框属性处理
		let Obj = {};
        let inputtype = 'text';
        var datatype = data.datatype;
        var unit = data.unit;
        var inputFun;
        if (unit) {
            unit = "(" + unit + ")";
        }else{
            unit = ''
        }
        if (datatype.indexOf('int') != -1){
            inputtype = 'number'
        }else if (datatype.indexOf('varchar') != -1){
            if (res.data[i].expalias) {
                inputtype = 'number'
            }
        }else if (datatype.indexOf('decimal') != -1){
        	var maxmin = myUtil.inputRule(datatype);
            inputFun = myUtil.amountVal('',maxmin[0],maxmin[1]);
            inputtype = 'number'
		}
        Obj.inputtype = inputtype;
        Obj.unit = unit;
        Obj.tip = data.tip || '';
        Obj.inputFun = inputFun;
        Obj.max = maxmin[0];
        return Obj
    },
	inputRule: function (datatype) {//输入框规则处理
		var seS = datatype.toString().substr(datatype.indexOf('('),datatype.indexOf(')'));
		return seS.split(',')
    },
    amountVal: function(value,decimal,max){
        var regStrs = [
            ['[^\\d\\.]+$', ''], //禁止录入任何非数字和点
            ['\\.(\\d?)\\.+', '.$1'], //禁止录入两个以上的点
            ['^(\\d+\\.\\d{'+ decimal +'}).+', '$1'], //禁止录入小数点后decimal位以上
            // ['^(\\d+\\d{'+ max + 1 +',})+$', '$1'], //禁止录入超过max位
        ];
        for(var i=0; i<regStrs.length; i++){
            var reg = new RegExp(regStrs[i][0]);
            value = value.replace(reg, regStrs[i][1]);
        }
        return value
    },
    returnYesOrNo: function(attr){
    	if(attr){
    		return "是"
    	}else{
	    	return '否'
    	}
    },
	numberOnly:function(value){
		return value.replace(/[^\d]/g, '').replace(/^0{1,}/g,'')
	},
	//用作批量操作时检查产品状态,
	checkStatus: function(list,attr,checkValue){
		// list，需要检查的对象数组
		// attr，需要检查的属性
		// checkValue，检查判断的值
		var flag = true;
		try {
            list.forEach(function (item) {
                if (item[attr] == checkValue) {
                    flag = false;
                    throw new Error('error');
                }
            });

        } catch (e){
            if (e.message != 'error') throw e;
        }
        return flag;
	}
};


$(document).ajaxError(function(){
	layer.msg("操作失败")
});