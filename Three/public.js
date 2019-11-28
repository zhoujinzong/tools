/**
 * Created by Administrator on 2018/6/29.
 * 公共方法
 */

import "../plugin/Validform_v5.3.2_min.js";
import {popWin} from "../plugin/tc.all.js";

var MYHumeURL='';
var TimerArray = {},FuncArray = {};
var YE_interval=null;
var LCDFLAG=this.LCDFLAG;

var URL_from_mod='?from_mod=Home&random=';
var pubicLocator='index.php/Home//';// 'index.php/Home/'

function interval_active(VM){//-----前端调用 flag:0 登录页循环 后台需要用此函数计算登录超时时间
  VM.$axios({
    method: "GET",
    url: MYHumeURL + "Global/active_session",
    timeout:5000,
    data: {}
  }).then(function (data) {});
}
function clearTimers_rule(){//清除所有循环、清空删除页面循环
  $.each(TimerArray,function(key,value){
    $.each(value,function(k,v){
      clearInterval(v);//清除 定时器
      v=null;//清除 intervalID
    });
    if($('#'+key.replace(/\//, "_")).length==0){//不存在该页面--该页面的循环置空
      FuncArray[key]=[];
      TimerArray[key]=[];
    }
  });
}

export const ifNullData=function(data){//判断是否为空
  if(data!=null && data!= "undefined" && data!= undefined && data.length!=0){
    if(typeof data == 'object'){
      return $.isEmptyObject(data);
    }
    return false;
  }else{
    return true;
  }
};
export const pop_create_rule=function(idn, cotainer, title, type, pIdn){
  $("#"+idn).remove();
  var htmlpop_button1=
    '<div class="bot bot_note">'+
    '<button  type="button" class="input_5 close">'+'确定'+'</button>'+
    '</div>';
  var htmlpop_button=
    '<div class="bot bot_apply">'+
    '<button  type="button" class="input_5 close1">'+'确定'+'</button>'+
    '</div>';
  var htmlpop_button2=
    '<div class="bot bot_apply">'+
    '<button  type="button" class="input_5 close1">'+'取消'+'</button>'+
    '</div>';
  if(type==1){
    htmlpop_button=htmlpop_button1
  }else if(type == 0){
    htmlpop_button = "";
  }else if(type == 3){
    htmlpop_button = htmlpop_button1+htmlpop_button2;
  }
  var htmlpop='<div id="'+idn+'" class="detail"  unselectable="on" onselectstart="return false;">'+
    '<div class="detail_cotainer">';
  htmlpop+='<div class="tit">'+
    '<span class="tit_span">'+title+'</span>'+
    '<i class="close"></i>'+
    '</div>';
  htmlpop+='<div class="popup2" >'+ cotainer+ '</div>'+
    htmlpop_button+
    '</div>'+
    '</div>';
  var ind=pIdn|| 'body';
  $(ind).append(htmlpop);
};
export const validform_init=function(form,idn){//表单验证
  $.each($(form).find('input[datatype],textarea[datatype]'),function(k,v){
    if((!$(v).attr("nullmsg"))||($(v).attr("nullmsg")=="")){
      $(v).attr("nullmsg",'不能为空')
    }
    if((!$(v).attr("errormsg"))||($(v).attr("errormsg")=="")){
      $(v).attr("errormsg",'不能为空')
    }
  });
  var demoFome=$(form).Validform({
    tiptype:function(msg,o,cssctl){
      if(!o.obj.is("form")){//验证表单元素时o.obj为该表单元素，全部验证通过提交表单时o.obj为该表单对象;
        validform_wrong_tip(msg,idn,o,cssctl);
      }
    },
    ajaxPost:true,
    showAllError:false,//false逐条验证 true一起验证
    ignoreHidden:true,//可选项 true | false 默认为false，当为true时对:hidden的表单元素将不做验证;
    datatype:{//gets--表单元素值  obj--表单元素  curform-表单  regxp为内置的一些正则表达式的引用;
      "signText":function(gets,obj,curform,regxp){
        var form=/^[\u4e00-\u9fa5,，。.;:“‘？?!！ A-Za-z0-9_-]*$/;
        return  input_lenght_limit(form,gets,obj,150);
      },
      "servename30":function(gets,obj,curform,regxp){
        var form= /^[A-Za-z0-9]*$/;//数字  字母
        return input_lenght_limit(form,gets,obj,30);
      },
      "timeStart" :function(gets,obj,curform,regxp){//开始时间
        var form1=/^(0\d{1}|1\d{1}|2[0-3]):([0-5]\d{1})$/;
        return timeLimit_rule(gets,obj,form1,0);
      },
      "timeEnd" :function(gets,obj,curform,regxp){
        var form1=/^(0\d{1}|1\d{1}|2[0-3]):([0-5]\d{1})$/;
        return timeLimit_rule(gets,obj,form1,1);
      },
      "name": function(gets,obj,curform,regxp){//名称 ：中文、英文 数字 _ -
        var form=/^[\u4e00-\u9fa5A-Za-z0-9-_ ~@\+\(\)（）￥\$&;；\.。,，、]+$/;
        var ll=32;
        if(!ifNullData(obj.attr('maxN'))){
          ll=obj.attr('maxN');
        }
        return input_lenght_limit(form,gets,obj,ll);
      },
      "describeText": function(gets,obj,curform,regxp){//备注 //限制'"
        var form=/^[^\r\'\"\?]*$/;
        return  input_lenght_limit(form,gets,obj,obj.attr('maxN'),2);
      },
      "passageLimit" : /^[0-9a-zA-Z~!@#$%^&*,_]{1,32}$/,  //  密码;
      "passageLimit2":function(gets,obj){
        var reg =/^[A-Za-z0-9]{1,32}$/;
        if(gets.match(reg)){
          return true;
        }else{
          obj.attr("errormsg",'密码应为字母或数字且长度在1到32个字符之间！');
          return false;
        }
      },
      "passageLimit3":function(gets,obj){
        var reg =/^[0-9a-zA-Z~!@#$%^&*,_\-]{4,64}$/;//FTP不做字符限制
        if(gets.match(reg)){
          return true;
        }else{
          obj.attr("errormsg",'密码应为字母或数字且长度在4到64个字符之间！');
          return false;
        }
      },
      "passageLimit2_check":function(gets,obj){//对应密码2的 确认密码校验
        var reg =/^[A-Za-z0-9]{1,32}$/;
        if(gets.match(reg)){
          return true;
        }else if(gets!=$('#password_login').val()){
          obj.attr("errormsg",'确认密码与密码不一致！');
          return false;
        }
      },
      "re_passageLimit2_check":function(gets,obj){//对应密码2的 确认密码校验
        var reg =/^[A-Za-z0-9]{1,32}$/;
        if(gets.match(reg)){
          return true;
        }else if(gets!=$('#re_password').val()){
          obj.attr("errormsg",'确认密码与密码不一致！');
          return false;
        }
      },
      "Float1":/^[\-\+]?\d+(\.\d)?$/,//正负数字1.0
      "positiveNum":/^(?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,}[0-9]{0,}$/,//大于0正数
      "PUEnumber":function(gets,obj){
        var reg=/^(?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,}[0-9]{0,}$/;
        if(gets.match(reg)){
          return true;
        }else{
          obj.attr("errormsg",'请输入大于0的数字！');
          return false;
        }
      },
      "Float2":/^[\-\+]?\d+(\.\d{0,2})?$/,//正负数字1.00
      "integer0":/^[1-9]\d*$/,//除0 以外的整数
      "negative_integer":/^[0-9]\d*$/,//非负整数
      "maxminLimit"://注：只能用于告警事件页面
        function(gets,obj,curform,regxp){//动态上下限----告警事件  //正负数字1.00
          var form1=/^[\-\+]?(0|[1-9]\d*)(\.\d{0,2})?$/;//正负数字1.00,可以输入0，但不能以0开头022之类
          if(gets.match(form1)){
            var inputN=obj.attr('name').split('_');
            var nn=parseInt(Number(inputN[1])/10)*10+1;//11
            var rowspan=$('input[name='+inputN[0]+'_'+nn+']').parent('td').parent('tr').find('td[rowspan]').attr('rowspan');//跨行数
            var range=obj.attr("rangeL").split("#");
            var arr=[],nowIndex,min=range[2],max=range[3];
            var j=-1;
            for(var i=0;i<rowspan;i++){
              var otherinputN='input[name='+inputN[0]+'_'+(nn+i)+']';
              if(!$(otherinputN).prop('disabled')){
                var deadband=Number($('input[name=deadbandN_'+(nn+i)+']').val());
                arr.push(Number($(otherinputN).val())+deadband);
                j++;
              }
              if((nn+i)==inputN[1]){//当前输入框
                nowIndex=j;
              }
            }
            var arr2=arr.join("_");//保存之前排序
            arr = arr.sort(function(a,b){//大小排序
              return b-a;
            });
            if(arr2!=arr.join("_")){//不符合 （极高+滞回>=高值+滞回>=低值+滞回>=极低+滞回）
              arr2=arr2.split('_');
              if(arr2[nowIndex-1]){
                max=arr2[nowIndex-1]
              }
              if(arr2[nowIndex+1]){
                min=arr2[nowIndex+1]
              }
            }
            obj.attr("mmLimit",min+'#'+max);
            if(Number(min)>Number(max)){
              obj.attr("errormsg",'（极高+滞回>=高值+滞回>=低值+滞回>=极低+滞回）');
              return false;
            }else{
              return mmLimit_rule(gets,obj,form1);
            }
          }else{
            obj.attr("errormsg",'格式错误！');
            return false;
          }
        },
      "Numberlimit" ://整数  最小值-最大值
        function(gets,obj,curform,regxp){
          var form1 = /^(^-?\d+$)$/;//正负数字
          return mmLimit_rule(gets,obj,form1);
        },
        "Numberlimit2"://小数 最小值-最大值
        function(gets,obj,curform,regxp){
          var form1=/^[\-\+]?(0|[1-9]\d*)(\.\d{0,2})?$/;
          return mmLimit_rule(gets,obj,form1);
        },
      "integerLim":function(gets,obj,curform,regxp){//整数大小限制
        var form1 = /^(^-?\d+$)$/;//正负数字
        if(gets.match(form1)){
          return mmLimit_rule(gets,obj,form1);
        }else{
          obj.attr("errormsg",'请输入整数！');
          return false;
        }
      },
      "IpAddress" :function(gets,obj,curform,regxp){
        var form1 = /^((2[0-4]\d|25[0-5]|[01]?\d\d?|\*)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?|\*)$/;//ip地址
        if(gets.match(form1)){
          return get_ip_normal_form(gets);
        }
        return false;
      },
      "searchname": function(gets,obj,curform,regxp){//根据姓名搜索，可以为空
        if(gets==""){
          return true;
        }else{
          var form=/^[\u4e00-\u9fa5A-Za-z0-9_-]+$/;
          return input_lenght_limit(form,gets,obj,45);
        }
      },
      "servename":/^[A-Za-z0-9]*$/,//数字  字母
      "SMTPaddress":/^[. A-Za-z0-9]*$/,//数字  字母
      "normal" : /^[^\s\'\"\?]*$/,//限制'"
      "sysname" :
        function(gets,obj,curform,regxp){
          var form= /^[^\s\'\"~#\?]*$/;//限制'"#~
          return input_lenght_limit(form,gets,obj,20);
        },
      "NumberFloat3" ://小数点3位  最小值-最大值
        function(gets,obj,curform,regxp){
          var form1 = /^[\-\+]?\d+(\.\d{0,3})?$/;//正负数字1.000
          obj.attr("errormsg",'请输入0-3位小数');
          return mmLimit_rule(gets,obj,form1);
        },
      "NumberFloat2" ://小数点2位  最小值-最大值
        function(gets,obj,curform,regxp){
          var form1 = /^[\-\+]?\d+(\.\d{0,2})?$/;//正负数字1.00
          return mmLimit_rule(gets,obj,form1);
        },
      "NumberFloat" ://小数点一位  最小值-最大值
        function(gets,obj,curform,regxp){
          var form1 = /^[\-\+]?\d+(\.\d)?$/;//正负数字1.0
          return mmLimit_rule(gets,obj,form1);
        },
      "searchNumberlimit" ://根据编号搜索，可以为空
        function(gets,obj,curform,regxp){
          if(gets==""){
            return true;
          }else{
            var form1 = /^(^-?\d+$)$/;//正负数字
            return mmLimit_rule(gets,obj,form1);
          }
        },
      "NumberFloatlimit" ://小数点一位  最小值-最大值
        function(gets,obj,curform,regxp){
          var form1 = /^[\-\+]?\d+(\.\d)?$/;//正负数字1.0
          return mmLimit_rule(gets,obj,form1);
        },
      "NumberMax" ://小数点一位  上限
        function(gets,obj,curform,regxp){
          var form1 = /^[\-\+]?\d+(\.\d)?$/;//正负数字1.0
          return mmLimit_rule(gets,obj,form1,0);
        },
      "NumberMin" ://小数点一位  下限
        function(gets,obj,curform,regxp){
          var form1 = /^[\-\+]?\d+(\.\d)?$/;//正负数字1.0
          return mmLimit_rule(gets,obj,form1,1);
        },
      "NumberMax2" ://小数点2位  上限
        function(gets,obj,curform,regxp){
          var form1 = /^[\-\+]?\d+(\.\d{0,2})?$/;//正负数字1.00
          return mmLimit_rule(gets,obj,form1,0);
        },
      "NumberMin2" ://小数点一位  下限
        function(gets,obj,curform,regxp){
          var form1 = /^[\-\+]?\d+(\.\d{0,2})?$/;//正负数字1.00
          return mmLimit_rule(gets,obj,form1,1);
        },
      "integerMax" ://正负整数  上限
        function(gets,obj,curform,regxp){
          var form1 = /^-?[0-9]\d*$/;//正负数字
          return mmLimit_rule(gets,obj,form1,0);
        },
      "integerMin" ://正负整数  下限
        function(gets,obj,curform,regxp){
          var form1 = /^-?[0-9]\d*$/;//正负数字
          return mmLimit_rule(gets,obj,form1,1);
        },
      "IpAddress_2"://ip地址 除了0.0.0.0 255.255.255.255
        function(gets,obj,curform,regxp){
          var form1 = /^((2[0-4]\d|25[0-5]|[01]?\d\d?|\*)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?|\*)$/;//ip地址
          if(gets.match(form1)){
            if(gets!="0.0.0.0" && gets!="255.255.255.255"){
              return get_ip_normal_form(gets);
            }else{
              obj.attr("errormsg",'请输入正确IP地址，且范围为0.0.0.1至255.255.255.254');
            }
          }else{
            obj.attr("errormsg",'请输入正确IP地址，且范围为0.0.0.1至255.255.255.254');
          }
          return false;
        },
      "passageName" :/^[0-9a-zA-Z-]{1,32}$/,//32位 "数字 字母 -"   用户名
      "passageName2" :function(gets,obj,curform,regxp){
        var reg =/^[A-Za-z0-9]{1,32}$/;
        if(gets.match(reg)){
          return true;
        }else{
          obj.attr("errormsg",'用户名应为字母或数字且长度在1到32个字符之间！');
          return false;
        }
      },
      "passageName3" :function(gets,obj,curform,regxp){
        var reg =/^[0-9a-zA-Z~!@#$%^&*,_\-]{4,64}$/;//FTP不做字符限制
        if(gets.match(reg)){
          return true;
        }else{
          obj.attr("errormsg",'用户名应为字母或数字且长度在4到64个字符之间！');
          return false;
        }
      },
      "Name" :function(gets,obj,curform,regxp){
        var reg =/^[A-Za-z0-9]{1,32}$/;
        if(gets.match(reg)){
          return true;
        }else{
          obj.attr("errormsg",'姓名应为字母或数字且长度在1到32个字符之间！');
          return false;
        }
      },
      "passageLimit4" :/^[0-9]{1,4}$/,//1-4位 只能是数字  密码
      "IpNormal" :function(gets,obj,curform,regxp){
        var form1 = /^((25[0-5]|2[0-4]\d|1\d\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;//ip地址-2.2.2.2
        if(gets.match(form1)){
          return get_ip_normal_form(gets);
        }
        return false;
      },
      "DNSaddress" :function(gets,obj,curform,regxp){//不允许输入0.0.0.0
        var form1 = /^((25[0-5]|2[0-4]\d|1\d\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;//ip地址-2.2.2.2
        if(gets.match(form1)){
          if (gets!="0.0.0.0") {
            return get_ip_normal_form(gets,obj,"1");
          }
        }
        return false;
      },
      "gatewayNormal" :function(gets,obj,curform,regxp){
        var form1 = /^((25[0-5]|2[0-4]\d|1\d\d|[0-9]\d|[0-9])\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;//网关地址
        if(gets.match(form1)){
          return get_ip_normal_form(gets);
        }
        return false;
      },
      "maskNormal" :
        /^(254|252|248|240|224|192|128|0)\.0\.0\.0|255\.(254|252|248|240|224|192|128|0)\.0\.0|255\.255\.(254|252|248|240|224|192|128|0)\.0|255\.255\.255\.(254|252|248|240|224|192|128|0)$/ ,//子网掩码
      "cardNum":/^[0-9]{1,12}$/, //卡号，输入1-12位数字/字母
      "cardNum1":/^[0-9]{1,9}$/, //卡号，输入1-9位数字/字母 2019年8月9日15:46:33 修改 zjz
      "userNum":/^[0-9]{1,8}$/, //编号，输入1-8位数字
      "userNumlimit" ://整数  最小值-最大值
        function(gets,obj,curform,regxp){
          var form1 =/^[1-9]\d*$/ ;//整数，不能输入01
          return mmLimit_rule(gets,obj,form1);
        },
      "country_num":function (gets,obj,curform,regxp) {
        var form1=/^[0-9]{1,4}$/;//1-4位
        var check=Number(obj.attr('ischeck'))   //判断是否检测
        if(gets.length===0){        //如果输入框为空
          if(check){                //是否需要校验
            return false;
          }else{
            return true;
          }
        }else if(gets.length!==0){      //不为空都要校验
          return notNull_rule(gets,obj,form1);
        }
      },
      "phone_num":function (gets,obj,curform,regxp) { //同上
        //var form1=/^[0-9]{6,16}$/;
        var form1=/^1\d{10}$/;//1开头11位
        var check=Number(obj.attr('ischeck'))
        if(gets.length===0){
          if(check){
            return false;
          }else{
            return true;
          }
        }else if(gets.length!==0){
          return notNull_rule(gets,obj,form1);
        }
      },
      "check_alarm_level":function(gets,obj){//检测告警等级是否启用
        // console.log(gets)
        if(gets.length===0){
          obj.addClass("select-error-boder");
          // return false;
        }else{
          obj.removeClass("select-error-boder");
          // return true;
        }
      },
      "need1":function(gets,obj,curform,regxp){
        var need=1;
        var numselected=curform.find("input[name='"+obj.attr("name")+"']:checked").length;
        return numselected>=need?true:"至少选择"+need+"项";
      },
      "channelNum":/^([1-9]|[1][0-6])$/,
      "email":function (gets,obj,curform,regxp) {//邮箱验证
        var form1=/^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;
        return notNull_rule(gets,obj,form1);
      },
    }
  });
  return demoFome;
};
export const timeLimit_rule=function(gets,obj,form1,flag){
  var maxHour, maxMinute,getsHour,getsMinute,minHour,minMinute;
  if (gets!="") {
    gets=gets.split(":");
    getsHour=(gets[0].replace(/\b(0+)/gi,"")==""?0:gets[0].replace(/\b(0+)/gi,""));//01,02等转换为1,2
    getsMinute=(gets[1].replace(/\b(0+)/gi,"")==""?0:gets[1].replace(/\b(0+)/gi,""));
  }
  if(flag==0){//开始时间
    var endtime=obj.attr("timelimit");//timelimit='open_end1'
    if (($("#"+endtime).val())!="") {
      var max=$("#"+endtime).val().split(":");//获得结束时间的时和分
      maxHour=(max[0].replace(/\b(0+)/gi,"")==""?0:max[0].replace(/\b(0+)/gi,""));
      maxMinute=max[1].replace(/\b(0+)/gi,"");
      if(getsHour<maxHour){
        return true;
      }else if (getsHour==maxHour && getsMinute<maxMinute) {
        return true;
      }else{
        return false;
      }
    }else{
      maxHour=0;
      maxMinute=0;
    }
  }
  if (flag==1) {
    var starttime=obj.attr("timelimit");//timelimit='open_end1'
    if (($("#"+starttime).val())!="") {
      var min=$("#"+starttime).val().split(":");//获得开始时间的时和分
      minHour=(min[0].replace(/\b(0+)/gi,"")==""?0:min[0].replace(/\b(0+)/gi,""));
      minMinute=min[1].replace(/\b(0+)/gi,"");
      if(getsHour>minHour){
        return true;
      }else if (getsHour==minHour && getsMinute>minMinute) {
        return true;
      }else{
        return false;
      }
    }
  }
  obj.attr("errormsg","开始时间应小于结束时间");
  obj.attr("nullmsg",'不能为空');//不能为空
};
export const notNull_rule=function (gets,obj,form1) {
  var nullObj=obj.attr("objConnect");//关联的不为空id
  if(obj.prop("disabled")==true){
    obj.removeClass("Validform_error");
    return true;
  }else{
    var notNull_objCon=$("#"+nullObj);
    if (gets=="" && notNull_objCon.val()=="") {
      notNull_objCon.attr("ignore","ignore");
      notNull_objCon.removeClass("Validform_error");
    }else if (gets!="" && notNull_objCon.val()=="") {
      if (gets.match(form1)) {
        notNull_objCon.removeAttr("ignore");
        if(notNull_objCon.is(":focus")!=true){//没有焦点
          notNull_objCon.focus();
          notNull_objCon.blur();
        }
        notNull_objCon.attr("nullmsg",'不能为空');
      }else{
        return false;
      }
    }else if(gets=="" && notNull_objCon.val()!=""){
      return false;
    }else if(gets!="" && notNull_objCon.val()!=""){
      if (!gets.match(form1)) {
        return false;
      }
    }
  }
};

/*表单验证规则---add by caofei*/
export const mmLimit_rule=function(gets,obj,form1,flag){
  var lim=obj.attr("mmLimit").split("#");
  var seconderrormsg=obj.attr("seconderrormsg");//错误消息第二部分
  if(obj.prop("disabled")==true){
    obj.removeClass("Validform_error");
    return true;
  }else{
    var min=Number(eval(lim[0]));
    var max=Number(eval(lim[1]));
    if(lim.length==3 && flag==0){//上限
      var idn_x=$("input[name="+lim[2]+"]").not(":hidden").val();
      if(idn_x<=max && idn_x>=min  && idn_x!=null && idn_x.length!=0 && idn_x!='undefined'){
        min=idn_x;
      }
    }
    else if(lim.length==3 && flag==1){//下限
      var idn_s=$("input[name="+lim[2]+"]").not(":hidden").val();
      if(idn_s>=min && idn_s<=max && idn_s!=null && idn_s.length!=0 && idn_s!='undefined'){
        max=idn_s;
      }
    }
    if(lim[0].indexOf(".")>0){
      var nn=lim[0].split(".")[1].length;//判断位数
      min=Number(min).toFixed(nn);
      max=Number(max).toFixed(nn);
    }
    obj.attr("errormsg",'数据范围:'+min+"-"+max + (seconderrormsg || ''));
    obj.attr("nullmsg",'不能为空');//不能为空
    if(gets.match(form1) && Number(gets)>=min && Number(gets)<=max){
      return true;
    }else{
      return false;
    }
  }
};
/*中文 2  英文 1*/
export const input_lenght_limit=function(i_rule,i_gets,obj,i_length,flag){
  var bytesCount=0;
  if (i_gets != null && i_gets.match(i_rule)) {
    for (var i = 0; i < i_gets.length; i++) {
      var c = i_gets.charAt(i);
      if (/^[\u4e00-\u9fa5]$/.test(c)) {
        bytesCount += 2;
      } else{
        bytesCount += 1;
      }
    }
    var chinese_l=Math.floor(i_length/2);
    if(bytesCount>i_length){
      if(flag==1){
        obj.attr("errormsg",'最多为'+i_length+'个字符');
      }else{
        obj.attr("errormsg",'最多为'+chinese_l+'个中文字符'+","+i_length+'个英文字符');
      }
      return false;
    }else{
      return true;
    }
  }else{
    obj.attr("errormsg",'格式不正确');
    return false;
  }
};
export const validform_wrong_tip=function(msg,idn,o,cssctl){
  var valid_tip="";
  if(LCDFLAG=='LCD') {//LCD
    var newIdn=(!ifNullData(idn))?'#'+idn:'body';
    tip_popwindow(newIdn,msg,2);
  }else{
    valid_tip= $('<div class="info">' +
      '<span class="Validform_checktip">'+msg+'</span>' +
      '<span class="dec"><a class="dec1"></a></span>' +
      '</div>');
    $(".info").remove();
    o.obj.parent().append(valid_tip);
    cssctl(valid_tip.find(".Validform_checktip"),o.type);
    var left=o.obj.position().left;
    var top=o.obj.position().top;
    valid_tip.css({
      left:left,
      top:top-25
    }).show();
    setTimeout(function(){valid_tip.fadeOut(200);},1000);
  }
};
export const get_ip_normal_form=function(gets){
  var gets_p=gets.split(".");
  var is_right=gets_p.length;
  for(var i=0;i<gets_p.length;i++){
    if(gets_p[i].length>1){
      if(gets_p[i].substr(0,1)!=0){//不能01 02
        is_right--;
      }
    }else{
      is_right--;
    }
  }
  return (is_right==0);
};
export const tip_popwindow=function(idn,content,type){//提示信息--PC:弹窗渐隐  LCD:div渐隐
  if(LCDFLAG=='LCD') {
    var classN="";
    if(type==0){
      classN='result_success';
    }else if(type==1){
      classN='result_fail';
    }else{
      classN='wrong_center';
    }
    var valid_tip= $('<div class="'+classN+' valid_tip">'+content+'</div>');
    $(".valid_tip").remove();
    $(idn).not(':hidden').eq(0).append(valid_tip);
    valid_tip.show();
    setTimeout(function(){
      valid_tip.fadeOut(200);
    },1000);
  }else{
    pop_create_rule("detail_tip_re",'<span  class="midwin" >'+content+'</span>','提示',0);
    popWin("detail_tip_re");
    $("#detail_tip_re .close").hide();
    setTimeout(function(){
      $("#detail_tip_re,.maskLayer[pid=detail_tip_re]").fadeOut(200);
    },500);
  }
};

export const brower_type=function(){
  var browser=navigator.appName;
  var b_version=navigator.appVersion;
  var version=b_version.split(";");
  if(document.all){
    var trim_Version=version[1].replace(/[ ]/g,"");
    if(browser=="Microsoft Internet Explorer" && trim_Version=="MSIE6.0"){
      return 6;
    }
    else if(browser=="Microsoft Internet Explorer" && trim_Version=="MSIE7.0"){
      return 7;
    }
    else if(browser=="Microsoft Internet Explorer" && trim_Version=="MSIE8.0"){
      return 8;
    }
    else if(browser=="Microsoft Internet Explorer" && trim_Version=="MSIE9.0"){
      return 9;
    }
  }else{
    return 100
  }
};

export const  clearTimers=function(){//清除所有定时器
  clearTimers_rule();//清除所有循环、清空删除页面循环
};


export const  active_session=function(){
  interval_active();
};
//导出请稍后
export const record_wait=function(msg,idn){
  var pop_idn="successMsg";
  var tipMessage ="<div class='load_pop'>" +
    "<img src='"+require("../assets/images/loading.gif")+"'>" +
    "<p>" +msg+"</p>" +
    "</div>";
  if(arguments.length==2){
    pop_idn=idn;
  }
  $(".detail,.maskLayer").hide();
  pop_create_rule(pop_idn,tipMessage,'提示',0);
  $("#"+pop_idn+" .close").hide();
  popWin(pop_idn);
};
/**
 * save_popready(0)  save_popready(0,func)  保存成功
 * save_popready(1)  save_popready(1,func)  保存失败
 * save_popready(0，ww，func)  save_popready(0，内容ww，确认后执行函数func)
 * @param n   0保存成功  1保存失败
 * @param ww  内容
 * @param f   确认后执行函数
 */
export const save_popready=function(n,ww,f,type){
  document.getElementById("loadingPage").style.display='none';
  var w,func,arg=arguments.length,type=ifNullData(type)?1:type;
  if(arg>=3){
    w=ww;
    func=f;
  }else{
    func=ww;
    w=(n==0)?"保存成功！":"保存失败！";//0："保存成功！"   其他："保存失败！"
  }
  var html='<span  class="midwin" >'+w+'</span>';
  pop_create_rule("detail_result_save",html,'提示',type);/*"提示"*/
  var container_w=$("#detail_result_save .midwin").text();//提示内容
  if(!ifNullData(container_w)){
    $(".detail").hide();
    popWin("detail_result_save");
    if(n==0){
      if(type==1){//点击确定和取消 都继续执行func
        $("#detail_result_save").find(".close").bind("click",function(event){
          if(arg==1){
            location.reload();
          }else{
            func();
            $("#detail_result_save,.maskLayer[pid=detail_result_save]").remove();
          }
          $(this).unbind(event);
        });
      }else{//点击确定 继续执行func
        $("#detail_result_save").find(".close,.close1").bind("click",function(event){
          if($(this).hasClass('close1')){
            func();
          }
          $("#detail_result_save,.maskLayer[pid=detail_result_save]").remove();
          $(this).unbind(event);
        });
      }
    }
  }
};
//创建二级弹窗
export const make_sure_create=function(popId,type,id){
  var html_bottom="";
  if(type==0){
    html_bottom='<li class="mainThreeD_pop_text">确认描述：</li>' +
      '<li class="make_sure_last">' +
      '<form class="makeSure_textarea_form">' ;
    if(( LCDFLAG!='LCD') || (typeof qt == "undefined" && LCDFLAG=='LCD')){//pc 平板
      html_bottom+='<textarea  rows="3" class="make_sure_textarea" maxn="240" datatype="describeText"></textarea>'
    }else{//液晶屏
      html_bottom+=
        '<textarea disabled="disabled" rows="3" class="make_sure_textarea" maxn="240" datatype="describeText">液晶屏确认</textarea>';
    }
    html_bottom+='</form>' +
      '<button class="event_blue_button" id="main_event_sure" event_id="'+id+'">确认</button>' +
      '</li></ul>'
  }else{//详情
    html_bottom=
      '<li class="make_sure_last">' +
      '<table class="mainThreeD_pop_table">' +
      '<tr><td width="30%">确认时间：</td><td>'+getText(id,"confirm")+'</td></tr>' +
      '<tr><td>确认人员：</td><td>'+getText(id,"user")+'</td></tr>' +
      '<tr><td valign="top">确认描述：</td><td>'+getText(id,"confirm_content")+'</td></tr>' +
      '</table>'+
      '</li></ul>'
  }
  $(".make_sure_ul").find("i").off("click");
  $("body").on("click",".make_sure_ul i",function(){//二级弹窗取消
    $(this).closest(".make_sure_ul").remove();
    $("#mainTwo_bg").remove();
  });
  return mainThreeD_messagetip_create(popId,id)+ html_bottom + '</ul>';
};
export const mainThreeD_messagetip_create=function(popId,id){//创建二级弹窗内容上部分
  return '<ul class="make_sure_ul" id="'+popId+'">' +
    '<li class="detail_tit"><span>详细信息</span>' +
    '<i>×</i>' +
    '</li>' +
    '<ul class="make_sure_ul_ul">' +
    '<li class="detail_c">' +
    '<table class="mainThreeD_pop_table">' +
    '<tr><td width="30%">发生时间：</td><td>'+getText(id,"occurred")+'</td></tr>' +
    '<tr><td>事件来源：</td><td>'+getText(id,"source")+'</td></tr>' +
    '<tr><td>事件内容：</td><td>'+getText(id,"description")+'</td></tr>' +
    '<tr><td>告警等级：</td><td>'+getText(id,"level")+'</td></tr>' +
    '<tr><td>处理建议：</td><td>'+getText(id,"suggest")+'</td></tr>' +
    '</table>'+
    '</li>';
};
export const getText=function(id,name){//获取一级弹窗表格内容文字
  var idn=$('[event_id='+id+']').not(":hidden").parent().parent();
  return idn.find('[type='+name+']').text();
};
//获取界面语言 中文  英文
export const getlanguage=function(){
  var strCookie=document.cookie;
  var web_lang="";//语言
  if(strCookie.match(/zh-CN/) || strCookie.match(/zh-cn/) ){
    web_lang='zh-cn';//中文
  }
  else{
    web_lang='en';//英文
  }
  return web_lang;
};
export const ten_check=function(nn){/*小于10 补0*/
  var number=Number(nn);
  return (number<10)?("0"+number):number;
};
export const getTimeNumber=function(t){//时间格式转换为时间戳
  var sysTime,basicT='1970-01-01 00:00:00';
  if(!t){
    t=basicT;
  }
  if(t.length!=basicT.length){// 1970-02-06
    t=t+basicT.substring(t.length);
  }
  sysTime=new Date(t.replace(/-/g,'/'));
  sysTime=sysTime.getTime()/1000;
  return sysTime;
};
export const getLocalTime=function(nS,isTimeStr){//时间戳转换为时间格式  yyyy-mm-dd  HH:mm:ss，isTimeStr 是否是时间戳
  if(!isTimeStr){
    nS = parseInt(nS) * 1000
  }
  var now = new Date(nS);
  var  year=now.getFullYear();
  var  month=now.getMonth()+1;
  var  date=now.getDate();
  var   hour=now.getHours();
  var   minute=now.getMinutes();
  var   second=now.getSeconds();
  return   year+"-"+ten_check(month)+"-"+ten_check(date)+" "+ten_check(hour)+":"+ten_check(minute)+":"+ten_check(second);
};

export const ie_CollectGarbage=function(){//ie回收内存
  if( brower_type()!=100 && CollectGarbage){
    setTimeout(function(){
      CollectGarbage();//ie 内存
    }, 1);
  }
};
export const rem_scal=function(px){//按屏幕比例计算px rem
  var docEl = document.documentElement;
  var clientWidth = docEl.clientWidth;
  if (!clientWidth) return;
  return Number(px)*(clientWidth / 1600)
};
export const FontListener=function (VM) {//文字大小自适应 兼容ie8
  var doc=document,win=window;
  var docEl = doc.documentElement;
  var resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';//orientationchange 用户水平或者垂直翻转设备
  var recalc = function () {
    if(VM.LCD==0){//PC
      var fontS=rem_scal(20);
      $("body").removeClass().addClass('Window_'+docEl.clientWidth).attr('clientWidth',docEl.clientWidth);
      docEl.style.fontSize = Math.round(fontS)+ 'px';
    }else{//液晶屏
      var clientWidth = docEl.clientWidth/ 1280;
      var clientHeight = docEl.clientHeight/ 800;
      if (!clientWidth || !clientHeight) return;
      var clien_re=(clientWidth<clientHeight)?clientWidth:clientHeight;
      //docEl.style.fontSize = Math.round(clien_re*20)-2+ 'px';
      docEl.style.fontSize = Math.round(clien_re*20) + 'px';
    }
  };
  recalc();
  addEvent(win,resizeEvt, recalc);
  addEvent(doc,'DOMContentLoaded', recalc);
};
export const addEvent=function(object,type,handler,remove){
  if(typeof object!='object'||typeof handler!='function') return;
  try{
    object[remove?'removeEventListener':'addEventListener'](type,handler,false);
  }catch(e){
    var xc='_'+type;
    object[xc]=object[xc]||[];
    if(remove){
      var l=object[xc].length;
      for(var i=0;i<l;i++){
        if(object[xc][i].toString()===handler.toString()) object[xc].splice(i,1);
      }
    }else{
      var l=object[xc].length;
      var exists=false;
      for(var i=0;i<l;i++){
        if(object[xc][i].toString()===handler.toString()) exists=true;
      }
      if(!exists) object[xc].push(handler);
    }
    object['on'+type]=function(){
      var l=object[xc].length;
      for(var i=0;i<l;i++){
        object[xc][i].apply(object,arguments);
      }
    }
  }
};
export const dataValidation=function(data,fix){ //数据验证，空则返回空字符 null undefined等转换为''
  if(!ifNullData(data)){
    if(arguments.length==2 && !ifNullData(fix)){
      return Number(data).toFixed(fix);
    }else{
      return data;
    }
  }else{
    return "";
  }
};
//DEV_ID_UPS = 0x01,    // 1 UPS设备
//  DEV_ID_BMS,           // 2 电池监控系统
//  DEV_ID_PRECISION_AIR, // 3 精密空调
//  DEV_ID_COMMON_AIR,    // 4 普通空调,485
//  DEV_ID_ELECT_METER,   // 5 电量仪PDM, ELECTRICITY_METER,485
//  DEV_ID_PDU,           // 6 智能PDU,485
//  DEV_ID_TEMP_HUMI,     // 7 th温湿度,485
//  DEV_ID_DIST_SWITCH,   // 8 sw开关检测模块，输入开关量
//  DEV_ID_RELAY,         // 9 继电器，输出开关量
//  DEV_ID_IO_MODULE,     // 10 远程开关量模块
//  DEV_ID_USELESS2,
//  DEV_ID_PDC,           // 12 配电柜
//  DEV_ID_SWITCH_POWER,  // 13 开关电源
//  DEV_ID_HVDC,          // 14 高压直流
//  DEV_ID_VIDEO ,        // 15 视频模块
//  DEV_ID_EGUARD,        // 16 门禁
//  DEV_ID_GSM ,          // 17 短信模块
//  DEV_ID_INVERTER,      // 18 逆变器
//  DEV_ID_ATS,           // 19 ATS
//  DEV_ID_VESDA,         // 20 极早期
//  DEV_ID_FIRE_CONTROL,  // 21 消防
//  DEV_ID_COLLECTOR ,    // 22 数据采集器,串口服务器
//  DEV_ID_SWITCH_BOARD,  // 23 交换机
//  DEV_ID_HMI,           // 24 HMI 7寸触摸屏,485
//  DEV_ID_EMAIL,         // 25 邮件模块
//  DEV_ID_CAMERA,        // 26 摄像头
//  DEV_ID_BAT_GROUP,     // 27 电池组
//  DEV_ID_PRESSURE_TRANS,// 28 微差压变送器
//  DEV_ID_SYS,           // 29 系统
//  DEV_ID_WISEWAY,       // 30 SNMP卡
//  DEV_ID_ROOM_AIR,      // 31 房级空调
//  DEV_ID_HYDROGEN_SENSOR,      // 32 氢气传感器

/*机柜/位置类型定义：101 管控柜 102 配电柜 103 HVDC柜 104 电池柜  105 空调柜  106 用户机柜  109 消防  111 视频监控  112 环境  115 适配机柜*/
/*更改为显示设备类型*/
export const mainD_position_device=function(positon,positon_type,device){//获取来源
  var source="";
  if(ifNullData(positon)){//如果没有具体地址
    var positonArray="";
    switch(Number(positon_type)){
      case 1:
        positonArray='UPS';
        break;
      case 2:
        positonArray='电池监控系统';
        break;
      case 3:
        positonArray='精密空调';
        break;
      case 4:
        positonArray='普通空调';
        break;
      case 5:
        positonArray='电量仪';
        break;
      case 6:
        positonArray='PDU';
        break;
      case 7:
        positonArray='温湿度';
        break;
      case 8:
        positonArray='输入开关量';
        break;
      case 9:
        positonArray='输出开关量';
        break;
      case 10:
        positonArray='远程开关量模块';
        break;
      case 12:
        positonArray='配电柜';
        break;
      case 13:
        positonArray='开关电源';
        break;
      case 14:
        positonArray='高压直流';
        break;
      case 15:
        positonArray='视频模块';
        break;
      case 16:
        positonArray='门禁';
        break;
      case 17:
        positonArray='移动通讯模块';
        break;
      case 18:
        positonArray='逆变器';
        break;
      case 19:
        positonArray='ATS';
        break;
      case 20:
        positonArray='极早期';
        break;
      case 21:
        positonArray='消防';
        break;
      case 22:
        positonArray='串口服务器';
        break;
      case 23:
        positonArray='交换机';
        break;
      case 24:
        positonArray='触摸屏';
        break;
      case 25:
        positonArray='邮件模块';
        break;
      case 26:
        positonArray='摄像头';
        break;
      case 27:
        positonArray='电池组';
        break;
      case 28:
        positonArray='压差传感器';
        break;
      case 29:
        positonArray='系统';
        break;
      case 30:
        positonArray='SNMP卡';
        break;
      case 31:
        positonArray='房级空调';
        break;
      case 32:
        positonArray='氢气传感器';
        break;
      default:
        positonArray='无';
        break;
    }
    source=positonArray;
  }else{
    source=positon;
  }
  if(!ifNullData(device)){
    source+="/"+device;
  }
  return source;
};

export const alarmLevel_get_ajax=function(VM){//获取所有告警等级的配置 公共接口
  return VM.$axios({
    method:"POST",
    url:"/alarm.cgi/get_level_conf_list",
    timeout:5000,
    data:{}
  })
};
export const get_all_devlist_ajax=function(VM) {//获取所有设备类型列表（包括启用、未启用的） 公共接口
  return VM.$axios({
    method: "post",
    url:  "/alarm.cgi/alarm_record/get_all_dev_type",
    timeout:8000,
    data: {}
  });
};
export const enable_all_dev_type=function(VM) {//获取所有设备类型列表（只有启用） 公共接口
  return VM.$axios({
    method: "post",
    url:  "/alarm.cgi/alarm_record/record_all_dev_type",
    timeout:8000,
    data: {}
  })
};
export const get_area_list=function(VM){//获取微模块列表 公共接口
  return VM.$axios({
    method: "POST",
    data: {},
    url: "/config.cgi/layoutConfig/get_region_list"
  })
};
export const getAlarmstate=function(n,flag){//获取确认状态
  var name,stateclass;
  switch(Number(n)){
    case 0:
      name="确认";
      stateclass='abnormal_font';
      break;
    case 1:
      name="已确认";
      stateclass='normal_font';
      break;
    default:
      name="---";
      break;
  }
  if(arguments.length==2&&flag=='logout'){
    stateclass='disabled_font';//灰色
  }
  return '<span class="'+stateclass+'">'+name+'</span>';
};

export const mima_check_ajax=function(VM,func,ss){
  var arg=arguments.length;
  if(VM.$store.state.ifMimaUse!=0) {//启用密码验证
    check_popready(VM,{
      'id':'detail_common_caozuo',
      'html':'<span class="more_midwin">'+
                VM.$t('lang._COMMOM_WARNING_PASSWORD_')+
                ':<input type="password" name="MiMaPassword" id="MiMaPassword">' +
                '<p class="text_red" id="mima_wrong" style="display:none"></p>' +
            '</span>',
      'close':false,
      'func':function(){
        var pwd=$("#MiMaPassword").val();
        var idn_wrong=$("#mima_wrong");
        idn_wrong.html('').hide();
        if(ifNullData(pwd) || !pwd.match(/^[0-9a-zA-Z-]{1,32}$/)){
          idn_wrong.html('密码格式错误').show();
        }else{
          VM.$axios({
            method:"POST",
            url:pubicLocator+"UsermanageManager/check_pwd",
            data:{"pwd":$.md5(pwd)}
          }).then(function(data){
            if(data.code==0){
              $("#detail_common_caozuo,.maskLayer[pid=detail_common_caozuo]").remove();
              func();
            }else{
              idn_wrong.html('密码错误').show();
            }
          });
        }
      }
    });
    $("input[name=MiMaPassword]").focus();
  }else{//不启用密码验证
    if(arg==3){//可以删除多选
      var text="";
      if(ss==0){
        text='确认删除';
      }else{
        text=ss;
      }
      check_popready(VM,{
        'id':'detail_common_confirmDelete',
        'text':text,
        'func':function(){
          func();
        }
      });

    }else{
      func();
    }
  }
};
// 用户操作权限判断 //权限：1:一般用户；2:系统操作员；3:系统管理员 0:kh-admin 超过系统管理员权限的设置为10，理论高于3就好了，预留到10
export const user_has_permission=function(VM){
  var boo = false;
  var userPower = VM.$store.state.userPower;//用户权限
  var currentRoute = VM.$route;//当前请求的路由
  // var currentPath = VM.$route.path;//当前请求的路由
  // var allRoutes = VM.$router.options.routes[2];//当前所有的路由
  // var checkChildren = function(router){//检查当前路由是否有children，递归处理，找到当前的路由对应配置，处理minPer
  //   if (router.children) {//找到最后一个children
  //     for(var kl in router.children){
  //       checkChildren(data.children[kl])
  //     }
  //   }
  //   if (router.path == currentPath) {
  //     return router
  //   }
  // }
  // var currentRoute = checkChildren(allRoutes);
  var minPer = currentRoute.meta.minPer;
  if (userPower >= minPer) {
    boo = true;
  }
  //如果是kh-admin，就直接是true
  return userPower == 0 || boo;
};
/**
 * value 数值  staus 状态量  fix 保留小数位数
 * getTextColor(...).value  获取数值
 *  getTextColor(...).style  获取样式
 *  getTextColor(...).html  获取节点
 * */
export const getTextColor=function(value,status,fix){// 0：正常 绿 1 ：NA 灰 2：异常 红
  var styleJson={1:'text_grey',0:'text_green',2:'text_red','-1':'text_black'};
  var result={
    value:(status == 1)?"N/A":dataValidation(value,fix),
    style:styleJson[status] || ''//数据不同状态下的颜色
  };
  result['html']='<span class="'+result['style']+'">'+result['value']+'</span>';
  return result;
};

export const getTextColor2=function(value,status,fix){// 0：正常 绿 1 ：异常 红 灰 255：绿
  var styleJson={1:'text_red',0:'text_green',2:'text_red','-1':'text_black',255:'text_grey'};
  var result={
    value:dataValidation(value,fix),
    style:styleJson[status] || ''//数据不同状态下的颜色
  };
  result['html']='<span class="'+result['style']+'">'+result['value']+'</span>';
  return result;
};


export const init_ychart_data=function(len){//初始化y轴
  var res = [];
  while (len--) {
    res.push('-');
  }
  return res;
};
export const  init_xchart_data=function(len){//初始化x轴
  var ttt=get_sys_pub_time().number;
  var now = new Date(parseInt(ttt) * 1000);
  var res = [];
  while (len--) {
    now = new Date(now - 5000);//间隔5秒
    res.unshift(ten_check(now.getHours())+":"+ten_check(now.getMinutes())+":"+ten_check(now.getSeconds()));
  }
  return res;
};
//判断图表数据是否 '-'
export const chart_getTextColor=function(value,status,fix){
  var arn=arguments.length;
  if((arn>=2 && status==0)|| (arn==1 && (value=='N/A' || value=='NA'|| ifNullData(value)))){
    return '-'
  }else{
    return dataValidation(value,fix)
  }
};
export const get_sys_pub_time=function(){//获取当前系统时间
  var tt=$("#headerTime").html();
  return {
    val:tt, //2019-10-10 12:00
    number:getTimeNumber(tt), //1232324
    date:tt.split(' ')[0], //2019-10-10
    time:tt.split(' ')[1] //12:00
  }
};


//日期格式补全
export const data_form_create=function(startTime,endTime){
  var defaultStart='1970-01-01 00:00:00',defaultEnd='1970-12-31 23:59:59';
  var timeL=startTime.length;
  return {
    start:startTime+defaultStart.substr(timeL),
    end:endTime+defaultEnd.substr(timeL)
  }
};
//日期初始化  相差七天 yyyy-MM-dd
export const begin_overdate_init=function(Message){
  var defaultMess={dayNum:(Message && Message.dayNum) || 7, daytype: (Message && Message.daytype) || 'YYYY-MM-DD'};
  var ttt=get_sys_pub_time().number;
  var myDate = new Date(parseInt(ttt) * 1000);
  var mytime =get_sys_pub_time().date;
  var date;
  if(defaultMess.daytype=='YYYY-MM-DD'){
    date = new Date(myDate.getTime() - (Number(defaultMess.dayNum)-1) * 24 * 3600 * 1000);//相差..天
    var myget_begindate=date.getDate();
    var myget_beginmonth=date.getMonth()+1;
    date = date.getFullYear()+"-"+ten_check(myget_beginmonth)+"-"+ten_check(myget_begindate);//结束日期
  }else if(defaultMess.daytype=='YYYY'){
    mytime= mytime.split('-')[0];
    date = mytime-(Message.dayNum-1);//相差..年
  }else if(defaultMess.daytype=='YYYY-MM'){
    mytime=mytime.split('-');
    var mytime_month=mytime[1];
    var mytime_year=mytime[0];
    if(mytime_month-(Message.dayNum-1) >0){
      myget_beginmonth=mytime_month-(Message.dayNum-1);
    }else{
      myget_beginmonth=mytime_month-(Message.dayNum-1)+12;
      mytime_year=mytime_year-1;
    }
    if (myget_beginmonth <= 0) {
      myget_beginmonth = myget_beginmonth + 12;
      mytime_year --;
    }
    date=mytime_year+'-'+ten_check(myget_beginmonth);
    mytime=mytime[0]+'-'+ten_check(mytime[1]);
  }
  return {
    'start':String(date),'end':String(mytime)
  };
};
//dataMax:总条数   pageNum：一页展示的最大条数
export const cal_pageNum=function(dataMax,pageNum){
  var pcout=Math.ceil(dataMax / pageNum);//总页数
  if(pcout==0){pcout=1}
  return pcout;
};
export const air_null_data=function(idn,data){//判断图表数据是否为空
  var idn_elem=$("#"+idn);
  var flag=0;
  for(var i=0;i<data.length;i++){
    if(!ifNullData(data[i]) && data[i].join("").replace(/-/g,"").match(/^[0-9]+/)){
      flag++
    }
  }
  if(flag==0){
    if(idn_elem.find('.noData_air').length==0){
      var hh=idn_elem.height();
      idn_elem.append('<div class="noData_air" style="line-height:'+hh+'px">暂无数据</div>');
    }
  }else{
    idn_elem.find('.noData_air').remove();
  }
};
/**
 * 计算2个日期间的
 * @param d1 日期1 'yyyy-MM -dd'
 * @param d2 日期2
 * @param type 'Y':年;'M':月;'D':日
 * @param val 差值
 */
export const chenkTimeDif=function(d1,d2,type,val){
  var date1  = new Date(d1),date2  = new Date(d2);
  var timeDif=0;
  if(type=='Y'){
    timeDif=date2.getFullYear()-date1.getFullYear()+1;
  }else if(type=='M'){
    timeDif = (date2.getFullYear()-date1.getFullYear())*12 + (date2.getMonth()-date1.getMonth()+1);
  }else if(type=='D'){
    timeDif  =  parseInt((date2.getTime() -  date1.getTime())  /  1000  /  60  /  60  /24)+1;
  }
  if((timeDif)<=val){
    return true;
  }else{
    return false;
  }
};
/**
 * 日期初始化
 * @param type 类型 （年:"Y",月:"M",日:"D",时:"H",分:"S"）
 * @param num 整形 （-2,-1,0,1,2,3...）
 * ex:data_time_rang('D',-1)  获得一个月前的时间
 */
export const data_time_rang=function(type,num){
  var ttt=get_sys_pub_time().number;
  var now = new Date(parseInt(ttt) * 1000);
  var date =now.getDate();
  var Month =now.getMonth();
  var Year = now.getFullYear();
  var now_t=get_sys_pub_time().val;
  if(type == "Y"){
    Year=Year+num;
    Month=Month+1;
  }else if(type == "M"){
    if(num<0 || num>=12){
      num=0-num;
      Year=Year-Math.floor(num/12);
      Month=Month-num%12;
    }else{
      Year=Year+Math.floor(num/12);
      Month=Month+num%12;
    }
    Month=Month+1;
    if(Month>12){
      Month=Month-12;
      Year++;
    }
    if(Month <= 0) {
      Month = Month + 12;
      Year --;
    }
  }else if(type == "D"){
    now.setDate(now.getDate()+num);
    date=now.getDate();
    Month=now.getMonth()+1;
    Year = now.getFullYear();
  }else if(type == "H"){//获取时间戳，减去相应的时间再返回
    now = new Date(now).getTime()+num*60*60*1000;
    return getLocalTime(now,true)
  }else if(type == "S"){
    now = new Date(now).getTime()+num*60*1000;
    return getLocalTime(now,true)
  }
  return Year+'-'+ten_check(Month)+'-'+ten_check(date)+' '+now_t.split(" ")[1];
};

//图表空数据
export const echart_null_data=function(data,fix){
  var n=arguments.length;
  if(ifNullData(data)){
    return '-';
  }else{
    if(data[1]==1){//NA
      return '-';
    }else{
      if(ifNullData(data[0])|| data[0]=='-'){
        return '-';
      }else{
        if(n==2){
          data[0]=Number(data[0]).toFixed(fix);
        }
        return data[0]
      }
    }
  }
};

export const small_popwindow_ajax=function(Info,eventID){//获取二级弹窗确认信息
  VM.$axios({
    method: "POST",
    url: pubicLocator + "main/to_confirm"+URL_from_mod+Math.random(),
    timeout:5000,
    data: {
      'confirm_f':Info,
      'id':"["+eventID.split("_")[1]+"]"
    }
  }).then(function (data) {
    $("#main_event_message").find(".make_sure_ul").remove();
    if(data.code==0){
      var idn=$(".main_event_op[event_id="+eventID+"]");
      var idn_tr=idn.parent().parent("tr");
      save_popready(0, "确认成功！",function(){});
      idn.html("详情").attr("esure",1);
      idn_tr.find('[type=is_confirm]').html('已确认');
      idn_tr.find('[type=confirm]').html(data.data.confirm_time);
      idn_tr.find('[type=user]').html(data.data.user_name);
      idn_tr.find('[type=confirm_content]').html(data.data.confirm_f);
    }else{
      save_popready(0, "确认失败！",function(){});
    }
  });
};


//显示上传文件名
export const Fileaction=function(){
    $(".inputFile").unbind("change").bind("change",function(){
      var filePath=$(this).find("input[type='file']").val();
      $(this).prev("input[type=text]").val(filePath)
    });
  };

  //***计算字节   getBytesCount(str) ***获得n字节的字符串   getBytesCount(str,n)
export const getBytesCount=function(str,n) {
    var bytesCount = 0;
    var result;
    var num;
    if(arguments.length==2){
      num=n+1;
    }else{
      num=0;
    }
    if (str != null) {
      for (var i = 0; i < str.length; i++) {
        var c = str.charAt(i);
        if (/^[\u0000-\u00ff]$/.test(c)) {
          bytesCount += 1;
          if(bytesCount<num){
            result=str.substring(0,bytesCount);
          }
        } else {
          bytesCount += 2;
          if(bytesCount<num){
            result=str.substring(0,bytesCount/2);
          }
        }
      }
    }
    if(arguments.length==2){
      return result;
    }else{
      return bytesCount;
    }
  };

  //检测浏览器及版本号
export const getExplorerInfo=function () {//判断浏览器及版本号
    var explorer = window.navigator.userAgent.toLowerCase() ;
    if (explorer.indexOf("msie") >= 0) {//ie 旧版本
       var ver=explorer.match(/msie ([\d.]+)/)[1];
       return {type:"IE",version:ver};
    }else if(explorer.indexOf("Windows NT 6.1; Trident/7.0;")>=0){//IE edge
      return {type:"IEedge",version:""};
    }else if (explorer.indexOf("firefox") >= 0) {//firefox
       var ver=explorer.match(/firefox\/([\d.]+)/)[1];
       return {type:"Firefox",version:ver};
    }else if(explorer.indexOf("chrome") >= 0){//Chrome
       var ver=explorer.match(/chrome\/([\d.]+)/)[1];
        return {type:"Chrome",version:ver};
    }else if(explorer.indexOf("opera") >= 0){//Opera
      var ver=explorer.match(/opera.([\d.]+)/)[1];
      return {type:"Opera",version:ver};
    }else if(explorer.indexOf("Safari") >= 0){//Safari
      var ver=explorer.match(/version\/([\d.]+)/)[1];
      return {type:"Safari",version:ver};
    }else{
      return {type:"",version:""};
    }
  };


/*浏览按钮初始化*/
export const inputFileAction=function(){
  $("a input[type=file]").each(function(){
    if($(this).prop("disabled")==true){
      $(this).parent("a").removeClass("inputFile").addClass("inputFile_disabled");
    }else{
      $(this).parent("a").removeClass("inputFile_disabled").addClass("inputFile");
    }
  });
};
var Html_load_over;
export const mainchart_WH_init=function(maxN,idn,w_Scal,h_scal){
  var n=arguments.length;
  if(n==2){
    var Dwidth =document.getElementById(idn).clientWidth;
    var Dheight =document.getElementById(idn).clientHeight;
    $('#'+idn).removeData("Dwidth Dheight").data({'Dwidth':Dwidth,'Dheight':Dheight});
  }else if(n==4){
    var idnn=$('#'+idn);
    idnn.css({ 'width':idnn.parent().width()*w_Scal,'height':idnn.parent().height()*h_scal});
  }
  Html_load_over++;
  if(Html_load_over==maxN){
    setTimeout(function(){$(".loading_main").hide();},200)
  }
};
export const record_export_rule=function(func){//导出（本地、USB）
  if(LCDFLAG!='LCD'){//pc本地+USB
    var html='<option value="0">本地</option><option value="1">主机USB</option>';
    save_popready(0,'导出到：<select id="reHisExp_Type">'+html+'</select>',function(){
      func($("#reHisExp_Type").val());
    },2);
  }else{//液晶屏只有导出到USB
    func(1);
  }
};

export const check_popready=function(VM,obj){
  var func=obj['func'] || function(){};
  var close=obj.hasOwnProperty('close') || false;
  var html=obj['html'] || '<span  class="midwin" >'+(obj['text']||'')+'</span>';
  pop_create_rule(obj['id'],html,VM.$t('lang._COMMOM_POPWIN_VERIFY_'),2);
  popWin(obj['id']);
  $("#"+obj['id']+" .close1").unbind("click").bind("click",function() {
    if(!close){
      $("#"+obj['id']+",.maskLayer[pid="+obj['id']+"]").remove();
      $(this).unbind("click");
    }
    func()
  });
};
export const download_file = function(path){
  //var file_name = path.substr(path.lastIndexOf('/') + 1);
  // let downloadLink = document.createElement('a');
  // downloadLink.href = '/' + path;
  // downloadLink.οnclick = function(event){
  //   event.preventDefault()
  // };
  //downloadLink.download = file_name;
  // downloadLink.click();
  window.open(path);
};
export const download_file2 = function(path){
  var file_name = path.substr(path.lastIndexOf('/') + 1);
  let downloadLink = document.createElement('a');
  downloadLink.href = '/' + path;
  downloadLink.οnclick = function(event){
    event.preventDefault()
  };
  downloadLink.download = file_name;
  downloadLink.click();
  // window.open(path);
};
export const $Cookie = {
  //添加cookie
  addCookie:function (name, value, time) {//名字，值，超时时间--天(1d或者1D)、时(1h或者1H)、分(1m或者1M)、秒(1s或者1S);不区分大小写传入
    var exp = new Date();
    var strSec = $Cookie.getSec(time || '10m');
    exp.setTime(exp.getTime() + strSec);//默认十分钟过期
    //设置cookie的名称、值、失效时间
    document.cookie = name + "=" + value + ";expires="+ exp.toUTCString();
  },
  getCookie:function (name) {//传入cookie 的名字，获取所有不传
    //存下所有的Cookie
    var allCookies = [];//为对象数组，对象属性为cookie的名字，值就是值
    //获取当前所有cookie
    var strCookies = document.cookie;
    //截取变成cookie数组
    var array = strCookies.split(';');
    //循环每个cookie
    for (var i = 0; i < array.length; i++) {
      //将cookie截取成两部分
      var item = array[i].split("=");
      //判断cookie的name 是否相等
      if(!name){
        var obj = {};
        obj[item[0]] = item[1];
        allCookies.push(obj);
        if(i == array.length - 1){
          return allCookies
        }
        continue
      }
      if (item[0] == name) {
        return item[1];
      }
    }
    return null;
  },
  delCookie:function (name) {//删除cookie，可以传入单个，或者传入数组，不传则会清除所有
    var dealCookie = function(key){
      var exp = new Date();
      exp.setTime(exp.getTime() - 1);//设置为上一秒，直接就过期了
      var value = $Cookie.getCookie(key);
      if (value != null) {
        document.cookie = key + "=" + value + ";expires="+ exp.toUTCString();
      }
    };
    if(!Array.isArray(name)){
      name = [name];
    }else if(!name){
      name = Object.keys($Cookie.getCookie())
    }
    //循环每个Cookie名字，遍历处理
    for (var i = 0; i < name.length; i++) {
      dealCookie(name[i])
    }
  },
  getSec:function(str){ //天(1d或者1D)、时(1h或者1H)、分(1m或者1M)、秒(1s或者1S);不区分大小写传入
    var str1 = str.substr(0, str.length - 1);  //时间数值
    var str2 = str.substr(str.length-1, 1);    //时间单位
    if (str2 == "s") {
      return str1 * 1000;
    }
    else if (str2 == "m") {
      return str1 * 60 * 1000;
    }
    else if (str2 == "h") {
      return str1 * 60 * 60 * 1000;
    }
    else if (str2 == "d") {
      return str1 * 24 * 60 * 60 * 1000;
    }
  }
};
export const setAutoInterval = function(func,time){
  if(typeof func == "function"){
    var timer = time||5000;
    var interval = setInterval(function(){
      if(typeof window.isUpdate == "undefined"){
        window.isUpdate = true;
      }
      if(window.isUpdate){
        func();
      }
    },timer)
    return interval;
  }
};
export const deal_time = function (time, index) {
  if (time) {
    time.toString();
    time = time.split(' ')[index]
  }
  return time
};
export const deal_time_html = function (time) {
  var html = '';
  if (time) {
    time.toString();
    time = time.split(' ');
    html = '<span>'+ time[0] +'<br>'+ time[1] +'</span>';
  }
  return html
};
// export default {
//   getExplorerInfo:getExplorerInfo,//检测浏览器版本
//   brower_type:brower_type,       //判断浏览器类型
//
//   ifNullData:ifNullData,    //判断是否为空
//   dataValidation:dataValidation, //数据验证，空则返回空字符 null undefined等转换为''
//   active_session:active_session,   //向后台发送点击切换信息
//
//   getBytesCount:getBytesCount,//计算字节
//   validform_init:validform_init,  //验证
//   validform_wrong_tip:validform_wrong_tip,    //验证提示信息
//   tip_popwindow:tip_popwindow,     //验证提示信息
//
//   pop_create_rule:pop_create_rule,  //创建弹窗
//   record_wait:record_wait,     //等待弹窗
//   save_popready:save_popready,   //弹窗
//   make_sure_create:make_sure_create,   //创建二级弹窗
//   mainD_position_device:mainD_position_device,  //获取来源
//   check_popready:check_popready,
//   mima_check_ajax:mima_check_ajax,//密码验证
//
//   getlanguage:getlanguage,  //获取界面语言 中文  英文
//
//   ie_CollectGarbage:ie_CollectGarbage, //ie回收内存
//   rem_scal:rem_scal,  //按屏幕比例计算px rem
//   FontListener:FontListener,//文字大小自适应 兼容ie8
//
//   alarmLevel_get_ajax:alarmLevel_get_ajax,//获取所有告警等级的配置 公共接口
//   get_area_list:get_area_list,//获取微模块列表 公共接口
//   get_all_devlist_ajax:get_all_devlist_ajax,//获取所有设备类型列表 公共接口
//   enable_all_dev_type:enable_all_dev_type,//获取启用设备类型列表 公共接口
//
//   getAlarmstate:getAlarmstate,
//   getTextColor:getTextColor,// 0 ：绿 1：异常 红  255：NA 灰
//
//   record_export_rule:record_export_rule,
//   init_ychart_data:init_ychart_data,
//   init_xchart_data:init_xchart_data,
//   chart_getTextColor:chart_getTextColor,
//   cal_pageNum:cal_pageNum,
//   air_null_data:air_null_data,//判断图表数据是否为空
//   echart_null_data:echart_null_data,
//   mainchart_WH_init:mainchart_WH_init,
//
//   getTimeNumber:getTimeNumber,  //时间格式转换为时间戳
//   getLocalTime:getLocalTime,  //时间戳转换为时间格式
//   get_sys_pub_time:get_sys_pub_time,
//   data_form_create:data_form_create,//日期格式补全 2019-6-21 补全 2019-06-21 00:00:00
//   begin_overdate_init:begin_overdate_init,
//   chenkTimeDif:chenkTimeDif,
//   data_time_rang:data_time_rang,
//   Fileaction:Fileaction,
//   inputFileAction:inputFileAction,
//   ten_check:ten_check,
//   download_file: download_file,//下载文件
//   $Cookie: $Cookie,//设置cookie
//   user_has_permission: user_has_permission,//用户操作权限判断
// }
