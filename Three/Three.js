// JavaScript Document
import {popWin} from '../../plugin/tc.all.js';

import * as THREE from 'three';
import {MTLLoader, OBJLoader} from 'three-obj-mtl-loader'; //这个引用不能删除,不然会报错
// import {MTLLoader, OBJLoader} from 'three-obj-mtl-loader'; //这个引用不能删除,不然会报错
import {WEBGL} from '../../plugin/WebGL';
import popWindow from '../../components/popWindow';
import mainPopWin from '../../pages/main/mainPopWin'; //机柜告警弹窗
import {$Cookie, dataValidation, getTextColor, ie_CollectGarbage, ifNullData, save_popready,} from '../../libs/public';
import QWebChannel from "../qwebchannel";
import OrbitControls from 'three/examples/js/controls/OrbitControls';
import Stats from "stats.js/src/Stats";
import Heatmap from 'heatmap.js';
// import Heatmap from  '../../plugin/heatmap.js';

export default {
  name: 'mainThreeD',
  data () {
    return {
      mainThreeI:null,
      isWebGl:false,//判断是否兼容three.js

      Loadover:7,
      isLoading:true,
      cube:[],
      cubeArry:[],//机柜信息
      meshData:[],
      mesh:[],//机柜顶上的小圆
      mesh1:[],//机柜贴图上的名字
      cubeArry_old:[],//机柜上一次信息，对比使用
      vH:[],
      Dataobj:[],//存储机柜数据对象
      Nameobj:[],//存储机柜名称对象
      NewNameobj:[],//存储机柜名称新对象，用于机柜贴图
      Allmax_flag:[],
      Allmax_over:[],
      MmovL:null,
      texture0:null,//贴图
      texture1:null,//贴图
      texture_disabled_big:null,//贴图
      texture_disabled_small:null,//贴图
      animationFlag:0,
      refreshF:0,
      anaglePI:0,
      IS_Alarm:0,
      shapeMessFlag:0,
      Dwidth:0,//容器宽度
      Dheight:0,//容器高度
      canvasScal:1,//缩放比例
      CAMERA:null,
      CONTROLS:null,
      STATS:null,//帧率
      scene:null,
      renderer:null,
      spotLight:null,
      objGroup:null,
      shapeMess:null,
      Timeinterval_3d:null,
      mainD_cabinet_timer:null,//正常机柜弹窗循环
      cabinet_pop_title:'',//机柜详细信息名字
      box_index:'',
      cab_type:'',
      dev_index:'',
      showFlag:false,
      devShow:false,
      nowItme:{//鼠标浮动机柜
        name:"",
        x:0,
        y:0
      },
      cold_hot:{}, //机柜温湿度数据
      pc_data:[], //机柜配电柜数据
      TD_sure_demo: null,
      old_Move: null,
      isRender: true,
      activatedBoo: true,
      AveEnable:0,//是否是微模块，如果是微模块显示的内容是平均问题，表头就不要显示设备名称
      equip_color_old:{
        100: 0xffffff,//无效柜不显示贴图
        // 100: 0x899AB6,
        // 100: 0x8aff00,
        101: 0xfff700,
        // 101: 0x8aff00,
        102: 0xff4700,
        // 102: 0x8aff00,
        103: 0xc0ff00,
        // 103: 0x8aff00,
        104: 0xffc800,
        // 104: 0x8aff00,
        105: 0x00c4ff,
        // 105: 0x8aff00,
        106: 0x00ffd0,
        // 106: 0x8aff00,
        113: 0x01e8ff,
        // 113: 0x8aff00,
        116: 0x00ff43,
        // 116: 0x8aff00,
        117: 0xffffff,//综合柜不显示贴图
        // 117: 0x555555,
        // 117: 0x8aff00,
      },/*机柜颜色颜色列表，与pub_set.css中的机柜颜色设置一致*/
      //配色规则， 无效柜，无；用户柜：无；空调：#01e8ff；动力：#ffc800；其他：#c0ff00
      equip_color:{
        100: 0xffffff,
        101: 0xc0ff00,
        102: 0xffc800,
        103: 0xffc800,
        104: 0xffc800,
        105: 0x01e8ff,
        106: 0xffffff,
        113: 0x01e8ff,
        116: 0xc0ff00,
        117: 0xc0ff00,
      },/*机柜颜色颜色列表，与pub_set.css中的机柜颜色设置一致*/
      equip_content:[
        //无效柜
        {
          keys: [100],
          color: 0xffffff,
        },
        //用户柜
        {
          keys: [106],
          color: 0x17ffdc,
        },
        //空调
        {
          keys: [105,113],
          color: 0x01e8ff,
        },
        //动力
        {
          keys: [102,103,104],
          color: 0xffc800,
        },
        //其他，直接写颜色
      ],
      alarmL_color:{
        // #6800e9 #3430eb #00c5cc #66cc00 #ffcc00 #ff7200 #e60011
        0: '#00c5cc',
        1: '#6800e9',
        2: '#3430eb',
        3: '#00c5cc',
        4: '#66cc00',
        5: '#ffcc00',
        6: '#ff7200',
        7: '#e60011',
      },/*告警颜色列表*/
      tag_left: 'left',
      tag_top: 'top',
      tag_reset: 'reset',
      FocalLength: 70,//初始值
      reset_position: {x:-800,y:800,z:2700},//初始位置
      reset_camera: {x:0,y:130,z:0},//初始位置
      mouseClickStartTime: 0,//鼠标点击开始时间
      mouseClickEndTime: 0,//鼠标点击结束时间
      mouseClickDuringTime: 0,//鼠标长按持续时间
      mouseClickTimeInterval: null,//鼠标长按定时器
      devScale: 2,//设备模型放大倍数，只针对于顶部邠设备
      temp_camera_obj:{//顶部设备类型对应的设备模型
        0:'af_sp_qiu',//球形摄像头
        2:'af_sp_qiang',//枪型摄像头，原来是1，因为会和开关量的烟雾重复，所以设置了2
        1:'af_smoke',//烟雾
        7:'af_smoke',//温感
      },
      temp_camera_list:[
        {
          "pos_id":1,
          "dev_id":1,
          "sub_index": 1,
          "dev_type": 15,
          "type_f": 1,
          "dev_status":0,
          "name_f":"枪形摄像头"
        },
        {
          "pos_id":2,
          "dev_id":2,
          "sub_index": 2,
          "dev_type": 15,
          "type_f": 0,
          "dev_status":0,
          "name_f":"球型摄像头"
        },
        {
          "pos_id":3,
          "dev_id":3,
          "sub_index": 3,
          "dev_type": 8,
          "type_f": 1,
          "dev_status":0,
          "name_f":"烟雾"
        },
        {
          "pos_id":4,
          "dev_id":4,
          "sub_index": 1,
          "dev_type": 8,
          "type_f": 1,
          "dev_status":1,
          "name_f":"烟雾"
        },
        {
          "pos_id":5,
          "dev_id":5,
          "sub_index": 3,
          "dev_type": 15,
          "type_f": 1,
          "dev_status":0,
          "name_f":"枪型摄像头"
        },
        {
          "pos_id":6,
          "dev_id":6,
          "sub_index": 4,
          "dev_type": 15,
          "type_f": 1,
          "dev_status":0,
          "name_f":"枪型摄像头"
        },
        {
          "pos_id":7,
          "dev_id":7,
          "sub_index": 1,
          "dev_type": 8,
          "type_f": 7,
          "dev_status":0,
          "name_f":"温感"
        },
        {
          "pos_id":8,
          "dev_id":8,
          "sub_index": 1,
          "dev_type": 8,
          "type_f": 7,
          "dev_status":0,
          "name_f":"温感"
        },
        {
          "pos_id":9,
          "dev_id":9,
          "sub_index": 1,
          "dev_type": 8,
          "type_f": 7,
          "dev_status":0,
          "name_f":"温感"
        },
        {
          "pos_id":10,
          "dev_id":10,
          "sub_index": 1,
          "dev_type": 15,
          "type_f": 1,
          "dev_status":1,
          "name_f":"枪型摄像头"
        },
      ],//摄像头与温感烟感列表
      viewFlag: 1,//当前显示的是哪个视图 (1,温度云图；2：容量云图；3：安防视图；4:普通3D视图)
      isTransparent:true,//机柜是否透明
      HeatMapInstance: null,//热点图
      objLength: 0,//机柜的总长度
      objHeight: 290,//机柜的高度
      objSingleLength: 120,//单边机柜的长度
      objSingleWidth: 64,//单边机柜的宽度
      objSmallHeight: 8,//微调的高度
      half_ll: 0,//前门
      half_rr: 0,//后门
      current_flag: 0,
      heatmap_Mesh: [],//温度云图mesh对象
      heatmap_four_mesh_Timer: null,
      smokeParticles: [],
      clock: null,
      delta: 0,
      heatmap_data_list:[
        // 0,
        // 0.457,
        0.514,
        0.595,
        0.676,
        0.757,
        0.838,
        0.919,
        1
      ],
      color_list:[
        // 'rgba(20,220,255,0.1)',
        // 'rgba(0,0,230,1)',
        // '#0000e6',
        // 'rgba(0,120,255,1)',
        // '#0078ff',
        'rgba(20,220,255)',
        // 'rgba(20,220,255,1)',
        '#14dcff',
        // 'rgba(0,255,50,1)',
        '#00ff32',
        // 'rgba(155,250,20,1)',
        '#96ff14',
        // 'rgba(255,255,10,1)',
        '#ffff0a',
        // 'rgba(255,200,0,1)',
        '#ffc800',
        // 'rgba(240,0,0,1)',
        '#f00000'
      ],
      spotLight_list: [
        {
          x:500,
          y:800,
          z:500,
        },{
          x:-500,
          y:800,
          z:500,
        },{
          x:-500,
          y:800,
          z:-500,
        },{
          x:500,
          y:800,
          z:-500,
        },
      ],
      demo_point: {},
    }
  },
  components: {
    popWindow:popWindow,
    mainPopWin:mainPopWin
  },
  watch: {
  },
  methods:{
    showChange:function(data){//子组件调用 修改父组件showFlag
      this.showFlag=data;
    },
    main_normal_close:function(){//关闭详细信息弹窗
      clearInterval(this.mainD_cabinet_timer);
      this.mainD_cabinet_timer=null;
    },
    MtextureLoad:function(myurl){
      var VM=this;
      return new THREE.TextureLoader().load('/static/models/'+myurl,function(){
        VM.Loadover--;
      });
    },
    render_setSize:function(){//缩放
      var VM = this;
      this.$nextTick(function(){
        VM.render_setSize1();
      })
    },
    clearRenderer:function() {
      var VM = this;
      var renderer = VM.renderer;
      if(renderer){
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.context = null;
        renderer.domElement = null;
        renderer.clear();//清除场景
        VM.renderer = null;
      }


    },
    /**
     * 清空当前obj对象的缓存
     * @param object object3D对象或mesh对象
     * */
    clearCache:function(group) {
      if (!group) return;
      // 删除掉所有的模型组内的mesh
      group.traverse(function (item) {
        if (item instanceof THREE.Mesh) {
          item.geometry.dispose(); // 删除几何体
          if(Array.isArray(item.material)){
            item.material.forEach(function(item){
              item.dispose();
            })
          }else{
            item.material.dispose(); // 删除材质
          }

        }
      });
      this.scene.remove(group);
    },
    //原来写在外面的方法
    threeD_alarm_ajax:function(){//模型数据交互
      var VM = this;
      if (!VM.activatedBoo) {
        return
      }
      VM.$axios({
        method: 'post',
        data: {},
        timeout:4000,
        url: "/home.cgi/get_cabinet_list"
      }).then(function (data) {
        VM.current_flag ++ ;
        data = {"data":
            {"fan_status":0,
              "list":[
                {"alarm_level":5,"box_index":1,"dev_index":1,"humi_cold":[0,1],"id":55,"is_alarm":1,"it_load":0,"name_f":"管控柜","temp_cold":[0,1],"type_f":101,"width":0,
                  "cold_passageway":[{"position":1,"temp":15},{"position":2,"temp":15},{"position":5,"temp":15}],
                  "hot_passageway":[{"position":1,"temp":22},{"position":2,"temp":22},{"position":3,"temp":22},{"position":4,"temp":22},{"position":5,"temp":22}],
                },
                {"alarm_level":0,"box_index":2,"dev_index":1,"humi_cold":[0,1],"id":56,"is_alarm":0,"it_load":0,"name_f":"空调柜","temp_cold":[0,1],"type_f":105,"width":0,
                  "cold_passageway":[{"position":1,"temp":22},{"position":2,"temp":15},{"position":3,"temp":15},{"position":4,"temp":15},{"position":5,"temp":15}],
                  "hot_passageway":[{"position":1,"temp":33},{"position":5,"temp":15}],
                },
                {"alarm_level":0,"box_index":3,"dev_index":1,"humi_cold":[0,1],"id":57,"is_alarm":0,"it_load":0,"name_f":"配电柜","temp_cold":[0,1],"type_f":102,"width":0,
                  "cold_passageway":[{"position":1,"temp":15},{"position":3,"temp":15},{"position":4,"temp":15}],
                  "hot_passageway":[{"position":1,"temp":22},{"position":5,"temp":22}],
                },
                {"alarm_level":0,"box_index":4,"dev_index":1,"humi_cold":[0,1],"id":58,"is_alarm":0,"it_load":0,"name_f":"用户机柜","temp_cold":[0,1],"type_f":106,"width":0,
                },
                {"alarm_level":0,"box_index":5,"dev_index":1,"humi_cold":[0,1],"id":59,"is_alarm":0,"it_load":0,"name_f":"电池柜","temp_cold":[0,1],"type_f":104,"width":0,
                },
                {"alarm_level":0,"box_index":6,"dev_index":1,"humi_cold":[0,1],"id":60,"is_alarm":0,"it_load":0,"name_f":"冷水柜","temp_cold":[0,1],"type_f":113,"width":0,
                },
                {"alarm_level":0,"box_index":7,"dev_index":2,"humi_cold":[0,1],"id":61,"is_alarm":0,"it_load":0,"name_f":"11","temp_cold":[0,1],"type_f":101,"width":0,
                },
                {"alarm_level":0,"box_index":8,"dev_index":2,"humi_cold":[0,1],"id":62,"is_alarm":0,"it_load":0,"name_f":"33","temp_cold":[0,1],"type_f":102,"width":0,
                },
                {"alarm_level":0,"box_index":9,"dev_index":1,"humi_cold":[0,1],"id":63,"is_alarm":0,"it_load":0,"name_f":"22","temp_cold":[0,1],"type_f":103,"width":0,
                  "cold_passageway":[{"position":1,"temp":15},{"position":3,"temp":15},{"position":4,"temp":15}],
                  "hot_passageway":[{"position":1,"temp":22},{"position":5,"temp":22}],
                },
                {"alarm_level":0,"box_index":10,"dev_index":4,"humi_cold":[0,1],"id":64,"is_alarm":0,"it_load":0,"name_f":"55","temp_cold":[0,1],"type_f":101,"width":0,
                },
                {"alarm_level":0,"box_index":11,"dev_index":4,"humi_cold":[0,1],"id":65,"is_alarm":0,"it_load":0,"name_f":"55","temp_cold":[0,1],"type_f":101,"width":0,
                },
                {"alarm_level":0,"box_index":12,"dev_index":0,"humi_cold":[0,1],"id":66,"is_alarm":0,"it_load":0,"name_f":"","temp_cold":[0,1],"type_f":100,"width":0,
                }
                ]
            },
          "diff":1};
        VM.Dataobj=[];
        VM.Nameobj=[];
        VM.NewNameobj=[];
        if(VM.Timeinterval_3d){
          clearTimeout(VM.Timeinterval_3d);
        }
        VM.Timeinterval_3d=null;
        VM.animationFlag=0;
        if(!ifNullData(data) && !ifNullData(data.data)&& !ifNullData(data.data.list)){//机柜数据不为空
          if(!VM.isRender){//渲染中
            return;
          }
          if(VM.cube.length==0 ){//机柜没有创建
            VM.isRender = false;
            VM.vH=[];
            VM.cubeArry=[];
            VM.render_dispose();//清除缓存
            VM.threeD_alarm_ajaxData(data.data.list);//处理数据
            VM.threeD_main();//三维模型初始化
            VM.cubeArry_old = data.data.list;
            setTimeout(function(){
              //if(VM.renderer){
              //  VM.renderer.clear();//清除场景
              //  VM.render_render();
              //  VM.isRender = true;
              //}
              VM.isRender = true;
            },2000);
            VM.isRender = true;
          }else if(data.data.list.length==VM.cubeArry_old.length){//机柜数量不变
            if(data.diff==1){//数值不同时
              VM.threeD_alarm_ajaxData(data.data.list);//处理数据
              VM.animation();//动画
            }else if(data.diff==0 && VM.Loadover==0){//数值不变动+加载结束
              //if(VM.cube[0].material.needsUpdate==true){
              //  VM.no_animation();//不更新材质
              //}
            }
          }else{//机柜数量变动--重新渲染
            if(VM.LCD == 1){
              clearInterval(VM.mainThreeI);
              save_popready(0, '机柜数量发生变化，需重新登录', function () {
                VM.goto_login();
              });
              return
            }
            VM.webglcontextlost();
            VM.webglcontextrestored();
          }
        }else{//没有机柜
          if(VM.cubeArry_old.length!=0){//之前存在机柜
            VM.webglcontextlost();
            VM.webglcontextrestored(0);
          }
          VM.isLoading=false;
        }
        VM.refreshF=0;
      });
    },
    threeD_alarm_ajaxData:function(returnData){//处理机柜数据，渲染顺序，根据返回机柜list顺序，单数在后面，双数在前面，一前一后
      var VM = this;
      VM.IS_Alarm=0;
      var position_limit = 5;
      $.each(returnData,function(key,value){
        var numb=Number(value.box_index)-1;//顺序
        if(!VM.cubeArry[numb]){
          VM.cubeArry[numb]={}
        }
        VM.cubeArry[numb]['is_alarm']=value.is_alarm;//告警等级--判断机柜是否异常,1告警，0正常
        VM.cubeArry[numb]['alarm']=value.alarm_level;//告警等级--判断机柜是否异常
        VM.cubeArry[numb]['name']=dataValidation(value.name_f);//名称
        VM.cubeArry[numb]['type']=value.type_f;//类型
        VM.cubeArry[numb]['width']=value.width;//宽度
        VM.cubeArry[numb]['index']=value.dev_index;//id
        VM.cubeArry[numb]['box_index']=value.box_index;//id
        var cold_passageway = VM.complete_tem_data(value.cold_passageway,position_limit,'cold');//冷通道
        var hot_passageway =  VM.complete_tem_data(value.hot_passageway,position_limit,'hot');//热通道
        VM.cubeArry[numb]['cold_passageway']=cold_passageway;//冷通道
        VM.cubeArry[numb]['hot_passageway']=hot_passageway;//热通道
        //处理一下数据,如果没有冷热通道数据的话自动补全, 当前5个位置
        if(value.type_f==106){//机柜
          if (/^(-)?\d+(\.\d+)?$/.test(value.it_load)) {
            var data_load=Number(value.it_load);
            if(data_load>=0 && data_load<=100){
              VM.cubeArry[numb]['z']=data_load;//it负载率
            }else if(data_load<0){
              VM.cubeArry[numb]['z']=0;
            }else if(data_load>100){
              VM.cubeArry[numb]['z']=100;
            }
          }else{
            VM.cubeArry[numb]['z']=0;
          }
        }else{
          VM.cubeArry[numb]['z']=100;
        }
        if(value.alarm_level!=-1&&!ifNullData(value.alarm_level)){//异常
          VM.IS_Alarm++;
        }
        if(VM.Allmax_over.length!=returnData.length){
          VM.Allmax_over.push(0)
        }
      });
    },
    complete_tem_data:function(passageway,position_limit,way){
      var posi_obj_demo = {"position":1,"temp": way === 'cold'? 16 : 22};//初始设置用默认用22，暂时先用8
      var position_arr = [];//位置列表
      for (let i = 1; i <= position_limit; i++) {
        position_arr.push(i)
      }
      if (ifNullData(passageway)) {//如果没有通道温度数据
        passageway = [];
        for (let j = 1; j <= position_limit; j++) {
          var new_posi_obj = JSON.parse(JSON.stringify(posi_obj_demo));
          new_posi_obj.position = j;
          passageway.push(new_posi_obj)
        }
      }else if (passageway.length < position_limit) {//如果只有一部分通道温度数据
        for (let k = 0; k < passageway.length; k++) {
          var pos_index = position_arr.indexOf(passageway[k].position);
          if (pos_index !== -1) {
            position_arr.splice(pos_index,1)
          }
        }
        for (let m = 0; m < position_arr.length; m++) {
          var new_posi_obj = JSON.parse(JSON.stringify(posi_obj_demo));
          new_posi_obj.position = position_arr[m];
          passageway.push(new_posi_obj)
        }
      }
      passageway.sort(function (a,b) {
        return a.position - b.position
      });
      return passageway
    },
    ThreeDinterval:function(){//设置定时器，实时刷新数据
      var VM = this;
      VM.isLoading=true;//进度gif
      VM.TD_sure_demo=null;
      if(VM.isWebGl){//非-B液晶屏  判断是否兼容three.js
        this.threeD_alarm_ajax();
        VM.mainThreeI=setInterval(function () {
          if(VM.refreshF==0){
            VM.threeD_alarm_ajax();
          }
        },5000);
        VM.obj_action();
      }
    },
    threeD_main:function(){//三维模型初始化
      var VM = this;
      if(VM.LCD==1){//1液晶屏,0是PC端//液晶屏上展示pc端代码--大屏展示:放大2倍，缩小0.5倍
        VM.canvasScal=2;
        VM.Dwidth =VM.canvasScal*$("#main_model").width();
        VM.Dheight =VM.canvasScal*$("#main_model").height();
      }
      VM.initThree();//渲染器
      VM.initScene();//场景
      VM.initCamera();//摄像机
      VM.initLight();//光源
      VM.initModel();//导入模型
      if (VM.LCD === 0){
        VM.initStats();//显示帧率
      }
      // VM.init_smoke();//导入烟雾模型
    },
    initThree: function() {//渲染器
      var VM = this;
      VM.renderer = new THREE.WebGLRenderer({antialias : true,alpha:true,//抗锯齿效果 底色透明
        shadowMap:true,//它包含阴影贴图的引用
        setPixelRatio:window.devicePixelRatio,//设置设备像素比。通常用于避免HiDPI设备上绘图模糊
      });
      VM.renderer.setSize(VM.Dwidth, VM.Dheight);//设置渲染器大小
      VM.renderer.sortObjects = false;// //是否排列对象 默认是true
      VM.renderer.shadowMap.enabled=true;//阴影是否启用
      VM.renderer.shadowMapSoft = true;//阴影柔化
      VM.renderer.shadowMap.type=THREE.PCFSoftShadowMap;//阴影类型
      $('#main_model').find('canvas').remove();//清空canvas对象
      document.getElementById('main_model') && document.getElementById('main_model').appendChild(VM.renderer.domElement);//添加canvas对象
      VM.renderer.setClearColor(0xFFFFFF, 0.0);//设置清除样色
      VM.renderer.localClippingEnabled = true;//剪裁平面是否启用 空间中与平面的符号距离为负的点被剪裁（未渲染）
      VM.renderer.domElement.addEventListener( 'mousedown', VM.LCD === 0 ? VM.onDocumentMouseDown : VM.onDocumentMouseDownFun, false );
      VM.renderer.domElement.addEventListener( 'mouseup', VM.onDocumentMouseup, false );
      // VM.renderer.domElement.addEventListener( 'mousemove', VM.onDocumentMove, false );
      VM.renderer.domElement.addEventListener("webglcontextlost", VM.webglcontextlost, false);//上下文丢失--停止循环，等待恢复
      VM.renderer.domElement.addEventListener("webglcontextrestored", VM.webglcontextrestored, false);//上下文恢复--重新渲染
    },
    webglcontextlost:function(){//上下文丢失--停止循环，等待恢复
      var VM = this;
      clearTimeout(VM.Timeinterval_3d);
      VM.refreshF=1;
    },
    webglcontextrestored:function(flag){//上下文恢复--重新渲染
      var VM = this;
      if(VM.renderer){
        VM.renderer.domElement.removeEventListener( 'mousedown', VM.LCD === 0 ? VM.onDocumentMouseDown : VM.onDocumentMouseDownFun, false );
        VM.renderer.domElement.removeEventListener( 'mouseup', VM.onDocumentMouseup, false );
        // VM.renderer.domElement.removeEventListener( 'mousemove', VM.onDocumentMove, false );
        VM.renderer.domElement.removeEventListener("webglcontextlost", VM.webglcontextlost, false);
        VM.renderer.domElement.removeEventListener("webglcontextrestored", VM.webglcontextrestored, false);
        VM.render_dispose();//解除绑定
      }
      ie_CollectGarbage();
      VM.isLoading=true;
      if(flag!=0){
        this.threeD_alarm_ajax();
      }
    },
    initScene:function() {
      var VM = this;
      if(ifNullData(VM.scene)){
        VM.scene = new THREE.Scene();
        // VM.scene.fog=new THREE.Fog(0xffffff,1,10000)
      }
      VM.clock = new THREE.Clock();
    },
    initCamera:function() {//摄像机
      var VM = this;
      VM.CAMERA = new THREE.PerspectiveCamera(45, VM.Dwidth / VM.Dheight, 1, 10000);
      VM.CAMERA.position.set(VM.reset_position.x,VM.reset_position.y,VM.reset_position.z);
      if (VM.LCD === 0){
        VM.CONTROLS = new OrbitControls( VM.CAMERA, VM.renderer.domElement );
        VM.CONTROLS.addEventListener('change', VM.render_render);
        VM.CONTROLS.maxPolarAngle = Math.PI * 0.5;//半圆
        VM.CONTROLS.target = new THREE.Vector3(VM.reset_camera.x, VM.reset_camera.y, VM.reset_camera.z);//视角，与相机视角一致，必须先设置视角在相机设置视角之前
        VM.CONTROLS.minDistance = 1000;//相机向内移动多少
        VM.CONTROLS.maxDistance = 3500;//相机向外移动多少
        VM.CONTROLS.autoRotate = false;//自动旋转开关，以自动围绕目标旋转
        // VM.CONTROLS.autoRotateSpeed = 4;//自动旋转开关，以自动围绕目标旋转
        VM.CONTROLS.rotateSpeed = 0.2;//旋转速度，鼠标左键
        VM.CONTROLS.enableDamping = true;//使动画循环使用时阻尼或自转 意思是否有惯性
        VM.CONTROLS.dampingFactor = 0.2;//阻尼惯性有多大 意思是鼠标拖拽旋转灵敏度
        VM.CONTROLS.enableKeys = false;//是否打开支持键盘方向键操作
        VM.CONTROLS.update();
        VM.CONTROLS.saveState();//保存初始状态，不然reset()会回不到之前的位置;
        VM.CONTROLS.mouseButtons = {
          LEFT: THREE.MOUSE.LEFT,
          MIDDLE: THREE.MOUSE.MIDDLE,
          // RIGHT: VM.LCD === 0 ? THREE.MOUSE.RIGHT : null,//液晶屏禁用右键
          RIGHT: null,//禁用右键
        }
      }
      VM.CAMERA.lookAt(new THREE.Vector3(VM.reset_camera.x,VM.reset_camera.y,VM.reset_camera.z));//VM.scene.position
      VM.CAMERA.setFocalLength (VM.FocalLength);
      VM.CAMERA.updateMatrixWorld();
    },
    initLight:function() {//光源
      var VM = this;
      VM.scene.add( new THREE.AmbientLight( 0x808080 ,VM.LCD === 0 ? (VM.viewFlag === 1 ? 3 : 3) : 3) ); //环境光
      VM.spotLight_list.forEach((light,index)=>{
        //第一盏灯
        var spotLight = new THREE.SpotLight(0xffffff,0.4,10000, Math.PI / 2, 0.75,1);
        spotLight.position.set(light.x,light.y,light.z);
        spotLight.shadow.camera.near=2;
        spotLight.shadow.camera.far=1000;
        spotLight.shadow.camera.fov=30;
        // spotLight.distance = 10000;
        spotLight.shadowDarkness = 1;
        spotLight.target.position.set(0,0,0);
        // spotLight.shadow.mapSize.width = 1024;
        // spotLight.shadow.mapSize.height = 1024;
        spotLight.castShadow=true;
        VM['spotLight'+ index] = spotLight;
        VM.scene.add(spotLight);
      });
    },
    initStats:function(){
      var VM = this;
      var stats = new Stats();
      //设置统计模式
      stats.setMode(0); // 0: fps, 1: ms
      //统计信息显示在左上角
      stats.domElement.style.position = 'absolute';
      stats.domElement.style.left = '0px';
      stats.domElement.style.top = '0px';
      //将统计对象添加到对应的<div>元素中
      if(document.getElementById("Stats_output") ){
        document.getElementById("Stats_output").appendChild(stats.domElement);
        VM.STATS = stats;
      }
    },
    render_render:function(){
      var VM = this;
      if (VM.STATS) {
        VM.STATS.update();
      }
      VM.renderer.render(VM.scene,VM.CAMERA);
    },
    cal_model_length_unit:function(data){
      var VM = this;
      var width=data.width;
      var airL=34,cabL=64,half_L=0;//空调柜宽度  机柜宽度
      if(width==1){ //0 全柜  1 半柜
        half_L=airL/2;
      }else{
        half_L=cabL/2;
      }
      return half_L;
    },
    cal_model_length:function(i){
      var VM = this;
      var half_L=0;
      if(i>=2){
        half_L+=VM.cal_model_length_unit(VM.cubeArry[i-2]);//0 2
        half_L+=VM.cal_model_length_unit(VM.cubeArry[i]);//2 4
      }
      return half_L;
    },
    initModel:function(){//导入模型
      var VM = this;
      VM.objGroup=new THREE.Group();//成组
      var onProgress = function ( xhr ) {};
      var onError = function ( xhr ) {};
      var changeMaterial = function (oo) {
        if (!VM.isTransparent) {
          return
        }
        oo.traverse(function(child){
          if ( child instanceof THREE.Mesh ) {//给模型设置一部分材质，加透明度
            child.material= new THREE.MeshBasicMaterial({
              transparent:true,
              opacity: (VM.viewFlag === 1 ? 0.5 : 0.1) ,
              side:THREE.DoubleSide,
            });
            child.material.color.setHex(VM.viewFlag === 1 ? 0x8c9bbd :0x9397bb);
          }
        });
      };
      var changeDevMaterial = function (oo) {
        if (!VM.isTransparent) {
          return
        }
        oo.traverse(function(child){
          if ( child instanceof THREE.Mesh ) {//给模型设置一部分材质，加透明度
            child.material= new THREE.MeshBasicMaterial({
              // transparent:true,
              opacity: 1,
              side:THREE.DoubleSide,
            });
            child.material.color.setHex(0x9D0000);
          }
        });
      };
      var changeDevMaterialOpacity = function (oo,name,condition_obj) {
        var flag = true;
        var name_material = oo.getObjectByName(name);
        $.each(condition_obj,(key,value)=>{
          if (VM[key] !== value) {
            flag = false;
            return false
          }
        });
        if (name_material && flag) {
          name_material.material.opacity = 0
        }
      };
      var basicURL= '/static/models/';//模型、贴图根路径
      var mtlLoader = new MTLLoader();
      mtlLoader.setPath( basicURL );
      VM.half_ll =VM.cal_model_length_unit(VM.cubeArry[0]);//前门
      VM.half_rr =VM.cal_model_length_unit(VM.cubeArry[VM.cubeArry.length-1]);//后门
      mtlLoader.load( 'jg_02.mtl', function( materials ) {//普通机柜
        materials.preload();
        var objLoader = new OBJLoader();
        objLoader.setMaterials( materials );
        objLoader.setPath(basicURL );
        objLoader.load( 'jg_02.obj', function ( oo ) {
          changeMaterial(oo);
          var objLengh=0;
          for(var i=0;i<VM.cubeArry.length;i++){
            objLengh=objLengh+VM.cal_model_length(i);

            VM.cubeArry[i]['x']=objLengh;
            VM.cubeArry[i+1]['x']=objLengh;
            if(VM.cubeArry[i].width!=1){
              var obj_clone=oo.clone();
              VM.cube[i]=obj_clone.getObjectByName('Jigui_01');
              VM.cube[i+1]=obj_clone.getObjectByName('Jigui_02');
              obj_clone.position.set(objLengh,0, 0);
              VM.objGroup.add( obj_clone );
            }
            i++;
          }
          VM.objLength = objLengh;
          oo=null;
          //前门
          var mtlLoader_door0 = new MTLLoader();
          mtlLoader_door0.setPath( basicURL );
          mtlLoader_door0.load( 'men_01.mtl', function( materials ) {
            materials.preload();
            var objLoader = new OBJLoader();
            objLoader.setMaterials( materials );
            objLoader.setPath(basicURL);
            objLoader.load( 'men_01.obj', function ( oo ) {
              //找一下logo  Kehua_logo_02
              changeMaterial(oo);
              var obj_clone=oo.clone();
              changeDevMaterialOpacity(obj_clone,'Kehua_logo_02',{isTransparent:true});//logo
              changeDevMaterialOpacity(obj_clone,'Rectangle058',{isTransparent:true,viewFlag: 1});//门框四周
              changeDevMaterialOpacity(obj_clone,'Box314',{isTransparent:true,viewFlag: 1});//门框上面
              changeDevMaterialOpacity(obj_clone,'Box345',{isTransparent:true,viewFlag: 1});//门框底部
              changeDevMaterialOpacity(obj_clone,'Box342',{isTransparent:true,viewFlag: 1});//门框上面靠里
              oo.position.set(0-objLengh/2-VM.half_ll-9,0, 0);
              VM.scene.add( oo );
              VM.Loadover--;
            }, onProgress, onError );
            objLoader=null;
            materials=null;
          });
          mtlLoader_door0=null;
          //后门
          var mtlLoader_door1 = new MTLLoader();
          mtlLoader_door1.setPath( basicURL );
          mtlLoader_door1.load( 'men_02.mtl', function( materials ) {
            materials.preload();
            var objLoader = new OBJLoader();
            objLoader.setMaterials( materials );
            objLoader.setPath(basicURL );
            objLoader.load( 'men_02.obj', function ( oo ) {
              //找一下logo  Kehua_logo_01
              changeMaterial(oo);
              var obj_clone = oo.clone();
              changeDevMaterialOpacity(obj_clone,'Kehua_logo_01',{isTransparent:true});
              changeDevMaterialOpacity(obj_clone,'Rectangle028',{isTransparent:true,viewFlag: 1});//门框四周
              changeDevMaterialOpacity(obj_clone,'Box021',{isTransparent:true,viewFlag: 1});//门框上面
              changeDevMaterialOpacity(obj_clone,'Box280',{isTransparent:true,viewFlag: 1});//门框底部
              changeDevMaterialOpacity(obj_clone,'Box066',{isTransparent:true,viewFlag: 1});//门框上面靠里
              oo.position.set(objLengh/2+VM.half_rr+9,0, 0);
              VM.scene.add( oo );
              VM.Loadover--;
            }, onProgress, onError );
            materials=null;
            objLoader=null;
          });
          mtlLoader_door1=null;
          if (VM.isTransparent && VM.viewFlag === 3) {//透明视图
            //根据设备类型判断所要载入的模型
            VM.temp_camera_list.forEach(function (item, index) {
              var type_f = item.type_f;
              var isRotate = false;
              if (item.dev_type === 15 && type_f) {//枪型摄像头，在数组中特殊设置为2，不能影响传值
                type_f = 2;
                isRotate = item.pos_id <= 5;
              };
              var dev_model_name = VM.temp_camera_obj[type_f];//设备类型对应模型的名字
              if (!dev_model_name) {//如果在预设的类型中没有对应类型，不加载
                return
              }
              var half_rr=VM.cal_model_length_unit(VM.cubeArry[VM.cubeArry.length-1]);//机柜一半的宽度
              var oo_position = VM.cal_dev_camera_position(objLengh,half_rr,item.pos_id);
              var mtlLoader = new MTLLoader();
              mtlLoader.setPath( basicURL );
              mtlLoader.load( dev_model_name + '.mtl', function( materials ) {
                materials.preload();
                var objLoader = new OBJLoader();
                objLoader.setMaterials( materials );
                objLoader.setPath(basicURL );
                objLoader.load( dev_model_name + '.obj', function ( oo ) {
                  if (item.dev_status !== 0){//如果设备告警了
                    changeDevMaterial(oo);
                  }
                  if (isRotate) {//枪型摄像头需要旋转,旋转要用π
                    // oo.rotation.x = 0;
                    oo.rotation.y = Math.PI;
                    // oo.rotation.z = 0;
                  }
                  oo.scale.x=VM.devScale;//调整放大倍数
                  oo.scale.y=VM.devScale;
                  oo.scale.z=VM.devScale;
                  oo.position.set( oo_position.x,oo_position.y, oo_position.z);
                  VM.scene.add( oo );
                  VM.Loadover--;
                }, onProgress, onError );
                materials=null;
                objLoader=null;
              });
              mtlLoader=null;
            });
          }
          VM.init_heatmap_four_mesh();
          VM.heatmap_four_mesh_Timer = setInterval(function () {
            // VM.init_heatmap_four_mesh();
          },500);
          //空调
          var mtlLoader_air = new MTLLoader();
          mtlLoader_air.setPath( basicURL );
          mtlLoader_air.load( 'jg_03.mtl', function( materials ) {
            materials.preload();
            var objLoader = new OBJLoader();
            objLoader.setMaterials( materials );
            objLoader.setPath(basicURL );
            objLoader.load( 'jg_03.obj', function ( oo ) {
              var objLengh=0;
              changeMaterial(oo);
              for(var i=0;i<VM.cubeArry.length;i++){
                objLengh=objLengh+VM.cal_model_length(i);
                if(VM.cubeArry[i].width==1){
                  var obj_clone=oo.clone();

                  VM.cube[i]=obj_clone.getObjectByName('Jigui_01');
                  VM.cube[i+1]=obj_clone.getObjectByName('Jigui_02');
                  obj_clone.position.set(objLengh,0, 0);
                  VM.objGroup.add( obj_clone );
                }
                i++;
              }
              VM.objGroup.position.set(0-objLengh/2,0, 0);
              VM.scene.add( VM.objGroup );
              VM.initObject(objLengh/2);
              VM.MmovL=objLengh/2;
              VM.animation();//动画
              VM.isLoading=false;//进度gif
              VM.Loadover--;
              oo=null;
            }, onProgress, onError );
            materials=null;
          });
          mtlLoader_air=null;
        }, onProgress, onError );
        objLoader=null;
      });
      mtlLoader=null;
    },
    /*计算十个位置 ，单个机柜长度按照比例计算，单个机柜宽度为64（已固定的值），单个机柜比例为三等分，前中后，单边长度为120，总长就为360,这是固定值
    * 规则
    * x：1-5 在最左边，6-10 在最右边
    * y：全部一个高度,为280,这是固定值 this.objHeight
    * z: 1,6 负的一半单对机柜长度；5，10 一半单对机柜长度；2，7，负的单对机柜长度的6分之一；4，9，单对机柜长度的6分之一，3，8，位置为0，根据实际情况会对位置进行微调
    * */
    cal_dev_camera_position:function(objLengh,half_rr,position){
      var pos_obj = {x:0,y:0,z:0};
      var half_length = objLengh / 2 + half_rr - 9;
      var sigle_length = this.objSingleLength * 3;//单个机柜的长度
      //一个一个计算，
      /*x*/
      if(position <= 5){
        pos_obj.x = - half_length;
      }else{
        pos_obj.x = half_length;
      }
      /*y*/
      pos_obj.y = this.objHeight - 5;
      /*z*/
      if (position == 1 || position == 6){
        pos_obj.z = - sigle_length / 2 - 5;
      } else if (position == 5 || position == 10) {
        pos_obj.z = sigle_length / 2 + 5;
      } else if (position == 2 || position == 7) {
        pos_obj.z = - sigle_length / 6 + 5;
      } else if (position == 4 || position == 9) {
        pos_obj.z = sigle_length / 6 - 5;
      } else if (position == 3 || position == 8) {
        pos_obj.z = 0;
      }
      return pos_obj
    },
    /*
    * 机柜与热力图位置对应计算，四个位置的计算，从外到内，以此内推位置，当前position的计算为图的中心点位置设定
    * 位置1，x轴为0，y轴为正的机柜的高度一半，z轴为正的整个机柜宽度的一半
    * 位置2，x轴为0，y轴为正的机柜的高度一半，z轴为正的整个机柜宽度的六分之一
    * 位置3，x轴为0，y轴为正的机柜的高度一半，z轴为负的整个机柜宽度的六分之一
    * 位置4，x轴为0，y轴为正的机柜的高度一半，z轴为负的整个机柜宽度的一半
    * 位置5，x轴为负的整个机柜长度的一半，y轴为正的机柜的高度一半，z轴为正的整个机柜宽度的三分之一
    * 位置6，x轴为0，y轴为整个机柜的高度，z轴为正的整个机柜宽度的三分之一
    * 位置7，x轴为0，y轴为正的机柜的高度一半，z轴为负的整个机柜宽度的一半//Y轴高度存在疑问
    * 位置8，x轴为负的整个机柜长度的一半，y轴为正的机柜的高度一半，z轴为0; //Y轴高度存在疑问
    * 位置9，x轴为0，y轴为整个机柜的高度，z轴为0
    * 位置10，x轴为0，y轴为正的机柜的高度一半，z轴为0//Y轴高度存在疑问
    * 位置11，x轴为正的整个机柜长度的一半，y轴为正的机柜的高度一半，z轴为正的整个机柜宽度的三分之一//Y轴高度存在疑问
    * 位置12，x轴为0，y轴为正的整个机柜的高度一半，z轴为负的整个机柜宽度三分之一
    * 位置13，x轴为正的整个机柜长度的一半，y轴为正的机柜的高度一半，z轴为负的整个机柜宽度的一半//Y轴高度存在疑问
    * position：位置 1 ，2， 3， 4...13
    * */
    cal_heatmap_position:function(position){
      var VM = this;
      var width = VM.objLength + VM.objSingleWidth + VM.half_ll;//机柜的整体长度
      var height = VM.objHeight + VM.objSmallHeight;//机柜的整体高度
      var littleWidth = -1;//z轴微调，防止贴太近闪烁
      var allWidth = VM.objSingleLength * 3;//乘3是因为左右各一排加上中间通道，宽度都是一样的
      var position_obj = {x: 0,y: height / 2,z: 0};
      switch (position) {
        case 1:
          position_obj.z = allWidth / 2 + littleWidth;
          break;
        case 2:
          position_obj.z = allWidth / 6 + littleWidth;
          break;
        case 3:
          position_obj.z = - (allWidth / 6 + littleWidth);
          break;
        case 4:
          position_obj.z = - (allWidth / 2 + littleWidth);
          break;
        case 5:
          position_obj.x = - (width / 2);
          position_obj.z = allWidth / 3;
          break;
        case 6:
          position_obj.y = height;
          position_obj.z = allWidth / 3;
          break;
        case 7:
          position_obj.x = width / 2;
          position_obj.z = allWidth / 3;
          break;
        case 8:
          position_obj.x =  - (width / 2);
          break;
        case 9:
          position_obj.y = height;
          break;
        case 10:
          position_obj.x =  width / 2;
          break;
        case 11:
          position_obj.x =  - (width / 2);
          position_obj.z = - (allWidth / 3);
          break;
        case 12:
          position_obj.y = height;
          position_obj.z = - (allWidth / 3);
          break;
        case 13:
          position_obj.x =  width / 2;
          position_obj.z = - (allWidth / 3);
          break;
      }
      return position_obj
    },
    /*
    * 热力图在机柜翻转的位置对应计算，九个位置的计算，初始位置(0,0)都在当前面的左上角顶点位置
    * 位置5，x轴不动，y轴旋转90度，z轴不变
    * 位置6，x轴旋转90度，y轴不变，z轴旋转90度
    * 位置7，x轴不动，y轴旋转90度，z轴不变
    * 位置8，x轴不动，y轴旋转90度，z轴不变
    * 位置9，x轴旋转90度，y轴不变，z轴旋转90度
    * 位置10，x轴不动，y轴旋转90度，z轴不变
    * 位置11，x轴不动，y轴旋转90度，z轴不变
    * 位置12，x轴旋转90度，y轴不变，z轴旋转90度
    * 位置13，x轴不动，y轴旋转90度，z轴不变
    * position：位置 1 ，2， 3， 4，
    * */
    cal_heatmap_nine_position:function(mesh,position){
      switch (position) {
        case 5:
          mesh.rotateY(Math.PI / 2);
          break;
        case 6:
          mesh.rotateX(Math.PI / 2);
          mesh.rotateZ(Math.PI / 2);
          break;
        case 7:
          mesh.rotateY(Math.PI / 2);
          break;
        case 8:
          mesh.rotateY(Math.PI / 2);
          break;
        case 9:
          mesh.rotateX(Math.PI / 2);
          mesh.rotateZ(Math.PI / 2);
          break;
        case 10:
          mesh.rotateY(Math.PI / 2);
          break;
        case 11:
          mesh.rotateY(Math.PI / 2);
          break;
        case 12:
          mesh.rotateX(Math.PI / 2);
          mesh.rotateZ(Math.PI / 2);
          break;
        case 13:
          mesh.rotateY(Math.PI / 2);
          // mesh.rotateX(Math.PI);
          break;
      }
    },
    /*
    * 计算热力图数值的位置,坐标系定点为左上角 ，x轴箭头右，y轴箭头向下,注意，这里的x y 轴的值需要为数字
    * x轴：机柜的总长度/机柜的数量 * （机柜在列表中下标），得到中间的位置，注意，如果是半柜，需要再除以2，位置可能有偏差，需要考虑左右两测门的宽度
    * y轴：机柜的高度/5（固定5个位置）* (position - 1/2)（添加设备时所选的位置，有1上，2上中，3中，4中下，5下,），得到中间位置
    * length: 机柜的总长度
    * height: 机柜的高度
    * cabinet_num: 机柜的数量
    * position: 温湿度所处的位置，1上，2上中，3中，4中下，5下
    * index: 机柜在列表中的下标
    * */
    cal_heatmap_data_position:function(length,height,cabinet_num,position,index){
      var smile_per = 1/4;//微调
      if(index % 2 === 0){//背面
        smile_per += 1
      }
      var position_obj = {x: 0,y: 0};
      var splitNum = 5;//y轴被分割的数量，即上下位置
      position_obj.x = Number(Number(length / cabinet_num * (index + smile_per)).toFixed(2));
      position_obj.y = Number(Number(height / splitNum * (position - 1/2)).toFixed(2));
      return position_obj
    },

    /*
    * 计算热力图数值剩下九个的位置,坐标系定点为正面看位置的左上角 ，x轴箭头右，y轴箭头向下,注意，这里的x y 轴的值需要为数字，最好限制数字长度，不然渲染会有问题
    * x轴：单个总长度（固定值 120）/ 2
    * y轴：机柜的高度 (固定值 290,或者是整体机柜的长度 ) / 5（固定5个位置）* (position - 1/2)（添加设备时所选的位置，有1上，2上中，3中，4中下，5下,），得到中间位置
    * length: 单个总长度
    * height: 机柜的高度
    * position: 温湿度所处的位置，1上，2上中，3中，4中下，5下
    * arr_length: 数据的长度，用作Y轴分割
    * */
    cal_heatmap_nine_data_position:function(length,height,position,arr_length){
      var position_obj = {x: 0,y: 0};
      position_obj.x = Number(Number(length / 2).toFixed(2));
      position_obj.y = Number(Number(height / arr_length * (position - 1/2)).toFixed(2));
      return position_obj
    },
    /*
    * 计算获取指定的温度值
    * data_arr:需要筛选位置的数组
    * position:指定的位置
    * */
    cal_heatmap_one_position:function(data_arr,position){
      return data_arr.filter((item, index) => {
        if (item.position === position){
          return item
        }
      });
    },/*
    * 计算两个点的平均的温度值，要求两个数组长度一致，所筛选的位置一致
    * hot_arr:热通道数组
    * cold_arr:冷通道数组
    * flag: 是否需要特殊处理位置，针对于顶部三个位置
    * */
    cal_heatmap_ave_position:function(hot_arr,cold_arr,flag){
      if (hot_arr.length !== cold_arr.length){
        return cold_arr
      }
      return hot_arr.map((item,index)=>{
        // item.temp = Number(item.temp + cold_arr[index].temp) / (per || 2);
        var new_item = JSON.parse(JSON.stringify(item));
        if (flag) {
          new_item.position = index + 1
        }
        new_item.temp = Number(new_item.temp + cold_arr[index].temp) / 2;
        return new_item;
      });
    },
    initObject:function(movL) {
      var VM = this;
      var cube_maxH=250,z_y=120,cube_y,text_y,text_r;
      var localPlane = new THREE.Plane( new THREE.Vector3( 0,1, 0 ), 0.8 );//切割面
      var array_length=VM.cubeArry.length;
      for(var iNum=0;iNum<array_length;iNum++){
        var cubeMaterial= new THREE.MeshPhongMaterial( {//正面及背面材质
          vertexColors:THREE.FaceColors,
          transparent: VM.isTransparent,//是否使用透明度，通过玻璃所看的柜子是否显示透明
          side:THREE.FrontSide,
          polygonOffset:true,//开启偏移
          polygonOffsetFactor:-0.2,//与相机距离减0.2
          clippingPlanes: [ localPlane ],//切割面
          ambient:0xffffff,//材质的环境色
          emissive: 0x333333,//材质发光的颜色 ,缺省黑色
          specular: 0xffffff,//材质的光亮程度及其高光部分的颜色
          shininess: 30,//高光部分亮度 缺省30
          opacity: 0.1,
        });
        VM.cube[iNum].name='cabinet_'+iNum;//根据这个名字计算了点击事件
        VM.cube[iNum].geometry =new THREE.Geometry().fromBufferGeometry( VM.cube[iNum].geometry );//BufferGeometry 装换为 Geometry
        VM.cube[iNum].material= cubeMaterial;
        VM.cube[iNum].castShadow = true;
        VM.cube[iNum].receiveShadow = true;
        if(iNum%2==0){//偶数
          cube_y=0-z_y;
          text_y=cube_y-(113.3/2+5);
          text_r=Math.PI;
        }else{
          cube_y=z_y;
          text_y=cube_y+(113.3/2+5);
          text_r=0;
        }
        //文字 设备名
        VM.initTextName(VM.cubeArry[iNum].name, VM.cubeArry[iNum].is_alarm, iNum, 0, VM.cubeArry[iNum].alarm);
        VM.initCabinetName(VM.cubeArry[iNum].name, VM.cubeArry[iNum].is_alarm, iNum, 0, VM.cubeArry[iNum].index);
        var materialText = new THREE.MeshBasicMaterial({
          map:VM.Nameobj[iNum],//文字贴图
          side:THREE.DoubleSide,
          // side:THREE.FrontSide,
          fog:false
        });
        // var geometryText = new THREE.PlaneGeometry( 22, 22, 1, 1 );
        var geometryText = new THREE.CircleGeometry( 20, 22);
        VM.mesh[iNum]  = new THREE.Mesh( geometryText,materialText );
        VM.mesh[iNum].position.set(VM.cubeArry[iNum].x-movL,330,text_y);
        VM.mesh[iNum].rotation.y=text_r;
        if (VM.cubeArry[iNum].is_alarm && (!VM.isTransparent && VM.viewFlag !== 1)) {//有告警才显示
          VM.scene.add( VM.mesh[iNum]);
        }
        // if(VM.LCD === 0){
        //处理一下机柜上面的文字信息
        var materialText1 = new THREE.MeshBasicMaterial({
          map:VM.NewNameobj[iNum],//文字贴图
          // side:THREE.DoubleSide,
          side:THREE.FrontSide,
          transparent:true,//是否使用透明度
          fog:false,
        });
        var geometryText1 = new THREE.PlaneGeometry( 64, 250);
        VM.mesh1[iNum]  = new THREE.Mesh( geometryText1,materialText1 );
        VM.mesh1[iNum].name='cabinet_'+iNum;//根据这个名字计算了点击事件，不然事件无法响应
        VM.mesh1[iNum].position.set(VM.cubeArry[iNum].x-movL - 2,150,text_y);
        VM.mesh1[iNum].rotation.y=text_r;
        VM.mesh1[iNum].is_alarm = VM.cubeArry[iNum].is_alarm;
        if (!VM.isTransparent && VM.viewFlag !== 1) {
          VM.scene.add( VM.mesh1[iNum]);
        }
        // }

        //文字 数据 暂时废弃
        /*if(textArray(iNum).texture==null){
         if(!ifNullData(VM.cubeArry[iNum].z)){
         initCubeData(VM.cubeArry[iNum].z,iNum);
         }
         var data_materialText = new THREE.MeshBasicMaterial({
         map:VM.Dataobj[iNum],
         transparent:true,
         side:THREE.DoubleSide
         });
         var data_geometryText = new THREE.PlaneGeometry( 55, 25, 1, 1 );
         VM.meshData[iNum]  = new THREE.Mesh( data_geometryText,data_materialText );
         VM.meshData[iNum].position.set(VM.cubeArry[iNum].x-movL,VM.cubeArry[iNum].z/200*cube_maxH,text_y);
         VM.meshData[iNum].rotation.y=text_r;
         VM.scene.add( VM.meshData[iNum]);
         }*/
      }
    },
    initCubeData:function(cubeData,i){//数据 贴图
      var VM = this;
      var canvas=document.createElement( "canvas" );
      canvas.width = 128;
      canvas.height = 64;
      var data_context = canvas.getContext("2d");
      data_context.fillStyle = 'rgba(192, 80, 77, 0.0)';
      data_context.fillRect( 0, 0, 128, 64);
      data_context.font = "34px Arial";
      data_context.fillStyle = "#ffffff";
      cubeData=Number(cubeData).toFixed(1)+'%';
      data_context.fillText(cubeData,5,40);
      VM.Dataobj[i]=new THREE.CanvasTexture( canvas );
      if(document.getElementById("CanvasHide")){
        document.getElementById("CanvasHide").appendChild(canvas);/*放入垃圾桶*/
        document.getElementById("CanvasHide").innerHTML = '';//将a从页面上删除 /*清除垃圾桶*/
      }
      canvas=null;
      data_context=null;
    },
    roundedRect:function( ctx, x, y, width, height, radius ) {  //形状
      var VM = this;
      ctx.moveTo( x, y + radius );
      ctx.lineTo( x, y + height - radius );
      ctx.quadraticCurveTo( x, y + height, x + radius, y + height );
      ctx.lineTo( x + width - radius, y + height );
      ctx.quadraticCurveTo( x + width, y + height, x + width, y + height - radius );
      ctx.lineTo( x + width, y + radius );
      ctx.quadraticCurveTo( x + width, y, x + width - radius, y );

      ctx.lineTo( x + width/2 + radius/2, y );
      ctx.quadraticCurveTo( x + width/2 + radius/2, y, x + width/2, y-radius/2 );
      ctx.quadraticCurveTo(  x + width/2, 0-radius/2,x + width/2 -radius/2, y);

      ctx.lineTo( x + radius, y );
      ctx.quadraticCurveTo( x, y, x, y + radius );
    },
    Three_shape:function(iNum){//创建浮动是显示的文字冒泡
      var VM = this;
      var z_y=120,cube_y,text_y,text_r,text_mov;
      if(iNum%2==0){
        cube_y=0-z_y;
        text_y=cube_y-(113.3/2+25);
        text_r=Math.PI;
        text_mov=-VM.MmovL+50;
      }else{
        cube_y=z_y;
        text_y=cube_y+(113.3/2+25);
        text_r=0;
        text_mov=-VM.MmovL-50;
      }
      var roundedRectShape = new THREE.Shape();
      VM.roundedRect( roundedRectShape, 0, 0, 100, 50, 20 );//创建冒泡形状
      VM.initTextName(VM.cubeArry[iNum].name,VM.cubeArry[iNum].is_alarm,iNum,1);//填入机柜名称
      var geometry = new THREE.ShapeBufferGeometry( roundedRectShape );
      var maxAnisotropy = VM.renderer.getMaxAnisotropy();
      VM.Nameobj[iNum].wrapS = VM.Nameobj[iNum].wrapT = THREE.RepeatWrapping;
      VM.Nameobj[iNum].repeat.set( 0.01, 0.01);
      VM.Nameobj[iNum].anisotropy = maxAnisotropy;//提高贴图清晰度
      var materialText = new THREE.MeshBasicMaterial({
        map:VM.Nameobj[iNum],//文字贴图
        // side:THREE.DoubleSide,
        side:THREE.FrontSide,
        transparent:VM.isTransparent,//是否使用透明度，通过玻璃所看的柜子是否显示透明
        opacity: 0.9,
        fog:false
      });
      VM.shapeMess  = new THREE.Mesh( geometry,materialText );
      VM.shapeMess.position.set(VM.cubeArry[iNum].x+text_mov,300,text_y);
      VM.shapeMess.rotation.y=text_r;
      VM.scene.add(VM.shapeMess);
    },
    initTextName:function(Name,is_alarm,i,flag,alarm_level){//设备名称 顶部小提醒
      var VM = this;
      var canvas=document.createElement( "canvas" );
      canvas.width = 64;
      canvas.height = 64;
      var context = canvas.getContext("2d");
      context.arc(32,32,32,0,2*Math.PI);
      // if(is_alarm!=0&&!ifNullData(is_alarm)){
      //   context.fillStyle = "#e7251b";//背景色 异常 红
      // }else{
      //   context.fillStyle = "#004e90";//背景色 正常 蓝色
      //   //context.fillStyle = "#00c5cc";//背景色 正常 蓝色
      // }
      context.fillStyle = VM.alarmL_color[alarm_level] || '#ffffff';
      context.fill();
      // context.fillRect( 0, 0, 128, 64);
      if(flag==1){
        context.scale(0.65,0.65);
      }
      context.fillStyle = VM.alarmL_color[alarm_level] ? "#ffffff" : "#000000";//字色 白
      context.textAlign="center";
      if(flag==1){
        context.font = "25px Arial";
        context.fillText(Name,100,85);
      }else{
        context.font = "bold 46px Arial,sans-serif";
        context.fillText("i",32,45);
      }
      VM.Nameobj[i]= new THREE.CanvasTexture( canvas);
      if(document.getElementById("CanvasHide")){
        document.getElementById("CanvasHide").appendChild(canvas);/*放入垃圾桶*/
        document.getElementById("CanvasHide").innerHTML = '';//将a从页面上删除 /*清除垃圾桶*/
      }
      canvas=null;
      context=null;
    },
    initCabinetName:function(Name,is_alarm,i,dev_index){//设备名称 机柜贴图
      var VM = this;
      var canvas=document.createElement( "canvas" );
      // var dpr = window.devicePixelRatio || 1;
      var dpr = 3;
      var width = 64 *dpr;
      var height = 250 *dpr;
      canvas.width = width;
      canvas.height = height;
      if (!VM.isTransparent) {
        var context = canvas.getContext("2d");
        context.arc(32,32,32,0,2*Math.PI);
        context.fillStyle = "transparent";
        context.fill();
        context.shadowBlur = 0.8;//阴影模糊级数
        context.shadowColor = "#ffffff";
        context.fillStyle = "#ffffff";//字色 白
        context.textAlign="center";
        context.font = "60px Microsoft YaHei";
        let x = width / 2 ,y = 0.256 * height; // 文字开始的坐标
        let letterSpacing = 3; // 设置字间距
        for(let i = 0; i < Name.length; i++){
          const str = Name.slice(i,i+1).toString();
          if (str.match(/[A-Z0-9]/)) {//大写和数字
            letterSpacing = 18
          }else if(str.match(/[a-z]/)){//小写字母
            letterSpacing = 36;
          }else{
            letterSpacing = 3;
          }
          context.save();
          context.textBaseline = 'Middle';
          context.fillText(str,x,y);
          context.scale(dpr, dpr);
          context.restore();
          y+=context.measureText(str).width+letterSpacing; // 计算文字宽度
        }
        // context.fillText(Name,32,60);
        context.scale(dpr, dpr);
        if (dev_index) {
          context.font = "20px Microsoft YaHei";
          context.fillText("#" + dev_index,32,30);
          // context.scale(0.5, 0.5);
        }
      }
      VM.NewNameobj[i]= new THREE.CanvasTexture( canvas);
      if(document.getElementById("CanvasHide")){
        document.getElementById("CanvasHide").appendChild(canvas);/*放入垃圾桶*/
        document.getElementById("CanvasHide").innerHTML = '';//将a从页面上删除 /*清除垃圾桶*/
      }
      canvas=null;
      context=null;
    },
    textArray:function(nn){//柱状体--贴图
      var VM = this;
      var cube_maxH=250;
      var texture;
      var CabinetType=VM.cubeArry[nn].type;//机柜类型
      var myopacity= 1;
      var cube_pY=cube_maxH/2;
      // var mycolor = VM.equip_color[CabinetType];
      var color_item =  {color: 0xc0ff00};//默认给绿色
      VM.equip_content.forEach(function (item, index) {
        if (item.keys.indexOf(CabinetType) !== -1) {
          color_item = item;
        }
      });
      if(VM.cubeArry[nn].width==1){//半柜
        texture=VM.texture1;
      }else{
        texture=VM.texture0;
      }
      if(CabinetType==105){//空调
        // texture=VM.texture1;//空调贴图，2019年10月12日13:58:00 删除空调贴图 zjz
      }else if(CabinetType==100 ){//无效柜
        if(VM.cubeArry[nn].width==1){//半柜
          texture=VM.texture_disabled_small;
        }else{
          texture=VM.texture_disabled_big;
        }
      }else{//用户机柜
        // texture=null;
        // mycolor=0x35f521;//绿色
        myopacity=0.95;
        cube_pY=0-cube_maxH/2;
      }
      return {"texture":texture,"mycolor":color_item.color,"myopacity":myopacity,"cube_pY":cube_pY};
    },
    no_animation:function(){//没有动画时，删除更新属性
      var VM = this;
      for(var i=0;i<VM.cubeArry.length;i++){
        VM.cube[i].material.needsUpdate=false;//使纹理不更新
        VM.cube[i].geometry.colorsNeedUpdate = false;//使颜色不更新
      }
    },
    normal_animation:function(){//所有设备正常
      var VM = this;
      var cube_maxH=250;
      for(var i=0;i<VM.cubeArry.length;i++){
        var maxH=cube_maxH*(VM.cubeArry[i].z-100)/100;
        if(VM.cube[i].material.map!=null){VM.cube[i].material.map.dispose();}
        VM.cube[i].material.needsUpdate=true;//使纹理可以更新
        VM.cube[i].geometry.colorsNeedUpdate = true;//使颜色可以更新
        VM.cube[i].material.opacity=VM.textArray(i).myopacity;
        VM.cube[i].material.map=VM.textArray(i).texture;
        VM.cube[i].material.color.setHex(VM.textArray(i).mycolor);
        if(VM.textArray(i).texture==null){//没有贴图的柱状体
          for ( var k = 0; k <4; k++ ) {
            VM.cube[i].geometry.faces[ k ].color.setHex( 0x1aa81f );
          }
          VM.meshData[i].material.opacity=1;
        }
        if(ifNullData(VM.vH[i])){
          VM.vH[i]=(maxH-VM.cube[i].position.y)/5;//速度列表
          VM.mesh[i].material.map.dispose();
          VM.initTextName(VM.cubeArry[i].name,VM.cubeArry[i].is_alarm,i,0,0,VM.cubeArry[i].alarm);//设备名
          VM.mesh[i].material.map =VM.Nameobj[i];//设备名
        }
        if(VM.cube[i].position.y!=maxH){
          VM.cube[i].position.y=VM.cube[i].position.y+VM.vH[i];
        }
        if(VM.cube[i].position.y<=0-cube_maxH){// 0~-cube_maxH
          VM.cube[i].position.y=0-cube_maxH;
        }
        if(VM.cube[i].position.y>=0){
          VM.cube[i].position.y=0;
        }
        if(VM.meshData[i]!=null) {
          VM.meshData[i].material.map.dispose();
          VM.initCubeData((1+VM.cube[i].position.y/cube_maxH)*100,i);//数值
          VM.meshData[i].material.map =VM.Dataobj[i];
        }
        if(VM.meshData[i]!=null){
          VM.meshData[i].position.y=(VM.cube[i].position.y+250)>0?(VM.cube[i].position.y+250):20;
        }
        if(VM.cube[i].position.y!=maxH){
          VM.Allmax_flag[i]=1;
        }else{
          VM.Allmax_flag[i]=0;
        }
        if(VM.Allmax_flag.join("")==VM.Allmax_over.join("") && VM.Loadover==0){
          VM.stop_animation();
        }
      }
    },
    abnormal_animation:function(){//设备有异常
      var VM = this;
      for(var i=0;i<VM.cubeArry.length;i++){
        VM.cube[i].position.y=0;
        VM.cube[i].material.transparent=true;//材料透明
        VM.cube[i].material.needsUpdate=true;//使纹理可以更新
        VM.cube[i].geometry.colorsNeedUpdate = true;//使颜色可以更新
        VM.cube[i].material.opacity= VM.isTransparent ? (VM.viewFlag === 1 ? 0.4 : 0.2) : 0.8;
        if(VM.cube[i].material.map!=null){VM.cube[i].material.map.dispose();}
        if(VM.cubeArry[i].is_alarm!=0 && !ifNullData(VM.cubeArry[i].is_alarm) && (!VM.isTransparent && VM.viewFlag !== 1)){//异常  根据数据判断是否告警
          VM.cube[i].material.color.setHex(0xe60000);//柱状体 材质 红  e60000 ff3000
          VM.cube[i].material.map =null;//去除贴图
          VM.cube[i].material.transparent=false;//材料透明
          VM.cube[i].material.opacity= 1;
        }else{
          // VM.textArray(i).mycolor 0x9397bb
          VM.cube[i].material.color.setHex(VM.isTransparent ? 0x9397bb : VM.textArray(i).mycolor);//柱状体 材质 白
          //2019年10月10日11:50:55 删除贴图，根据机柜显示对应颜色 zjz
          for ( var k = 0; k < 6; k ++ ) {//柱状体 面颜色 白
            // VM.cube[i] && VM.cube[i].geometry && VM.cube[i].geometry.faces[ k ].color.setHex(VM.isTransparent ?  0x9397bb : VM.textArray(i).mycolor);
          }
          // if (!VM.isTransparent) {
          VM.cube[i].material.map = VM.textArray(i).texture || VM.texture0;//机柜上面的门贴图
          // }
        }
        if(VM.meshData[i]!=null){//去除数值
          VM.meshData[i].material.opacity=0;
        }
        if(!ifNullData(VM.cubeArry_old) && (!VM.isTransparent && VM.viewFlag !== 1)){
          // if(!(VM.cubeArry_old[i].name==VM.cubeArry[i].name && VM.cubeArry_old[i].alarm==VM.cubeArry[i].alarm)){
          VM.mesh[i].material.map.dispose();
          VM.mesh1[i].material.map.dispose();
          VM.initTextName(VM.cubeArry[i].name,VM.cubeArry[i].is_alarm,i,0,VM.cubeArry[i].alarm);//设备名设备名
          VM.initCabinetName(VM.cubeArry[i].name,VM.cubeArry[i].is_alarm,i,VM.cubeArry[i].index);//设备名设备名
          VM.mesh[i].material.map =VM.Nameobj[i];
          VM.mesh1[i].material.map =VM.NewNameobj[i];
        }
      }
      if(VM.Loadover <= 0){
        // VM.init_heatmap_four_mesh();
        VM.stop_animation();
      }
    },
    stop_animation:function(){
      var VM = this;
      VM.vH=[];
      VM.Dataobj=[];
      VM.Nameobj=[];
      VM.NewNameobj=[];
      VM.Allmax_flag=[];
      VM.cubeArry_old=[].concat(VM.cubeArry);
      clearTimeout(VM.Timeinterval_3d);
      VM.animationFlag=1;
      VM.Timeinterval_3d=null;
      THREE.Cache.clear();
      ie_CollectGarbage();
    },
    animation:function(){
      var VM = this;
      VM.renderer.clear();//清除场景
      // requestAnimationFrame(VM.animation);
      if (VM.CONTROLS) {
        VM.CONTROLS.update();
      }
      /*if(VM.IS_Alarm==0) {//所有设备正常
       VM.normal_animation();
       }else{//设备有异常*/
      VM.abnormal_animation();
      if (VM.smokeParticles.length > 0){
        // VM.evolveSmoke();
      }
      /* }*/
      VM.Timeinterval_3d=setTimeout(function(){
        if(VM.animationFlag==0){
          VM.animation();//动画
        }
      },3000);
      if(VM.LCD==1){//液晶屏上展示pc端代码--大屏展示:放大2倍，缩小0.5倍
        $("#main_model canvas").css({
          'transform-origin': 'left top',
          'transform': 'scale(0.5,0.5)',
          '-moz-transform': 'scale(0.5,0.5)',
          '-webkit-transform': 'scale(0.5,0.5)',
          '-ms-transform': 'scale(0.5,0.5)',
          '-o-transform': 'scale(0.5,0.5)'
        });
      }
      VM.render_render();
    },
    render_dispose:function(){//解绑三维场景中的机柜 释放内存
      var VM = this;
      if(!VM.renderer){
        return;
      }
      VM.renderer.clear();//清除场景
      for(var i=VM.scene.children.length -1;i>=0;i--){
        if(VM.scene.children[i] && VM.scene.children[i].geometry){
          VM.scene.children[i].geometry.dispose();
        }
        if(VM.scene.children[i] && VM.scene.children[i].material){
          VM.scene.children[i].material.dispose();
          if(!ifNullData(VM.scene.children[i].material.map)){
            VM.scene.children[i].material.map.dispose();
          }
        }
        if(VM.scene.children[i]){
          VM.scene.remove(VM.scene.children[i]);
        }
      }
      VM.scene.children=null;VM.scene=null;
      VM.renderer.context = null;
      //document.getElementById('main_model') && document.getElementById('main_model').removeChild(VM.renderer.domElement);
      $("#main_model").find('canvas,#heatmap').remove();//这里有清除一下渲染的canvas画布和云图内容
      VM.renderer.domElement = null;
      VM.renderer=null;
      VM.CAMERA=null;
      VM.Timeinterval_3d=null;
      clearTimeout(VM.Timeinterval_3d);
      VM.spotLight_list.forEach((light,index) =>{
        VM['spotLight'+index] = null
      });
      VM.spotLight=null;
      VM.shapeMess=null;VM.shapeMessFlag=0;
      VM.meshData=[];VM.mesh=[];VM.mesh1=[];VM.heatmap_Mesh=[];VM.cube=[];VM.cubeArry=[];VM.cubeArry_old=[];VM.vH=[];VM.Dataobj=[];VM.Nameobj=[];VM.NewNameobj=[];VM.Allmax_flag=[];
      VM.Allmax_over=[];VM.objGroup=null;
      VM.Loadover= 3;
      THREE.Cache.clear();
    },
    render_setSize1:function(){
      var VM = this;
      var ww=$("#main_model").width();
      var dd=$("#main_model").height();
      if(VM.LCD==1) {//液晶屏上展示pc端代码--大屏展示:放大2倍，缩小0.5倍
        VM.canvasScal=2;
      }
      VM.Dwidth=VM.canvasScal*ww;
      VM.Dheight=VM.canvasScal*dd;
      if(VM.CAMERA){
        if (VM.CONTROLS) {
          VM.CONTROLS.reset();
        }
        VM.CAMERA.aspect = VM.Dwidth / VM.Dheight;//视窗的宽高比
        VM.CAMERA.setFocalLength (VM.FocalLength);
        VM.CAMERA.updateProjectionMatrix();
      }
      if(VM.renderer){
        VM.renderer.clear();//清除场景
        VM.renderer.setSize(VM.Dwidth,VM.Dheight);
        VM.render_render();
      }
    },
    obj_action:function(){
      var VM = this;
      $("#circeRight").unbind("mousedown").bind("mousedown",function(){
        VM.circle_action(-1,VM.tag_left);
      });
      $("#circeLeft").unbind("mousedown").bind("mousedown",function(){
        VM.circle_action(1,VM.tag_left);
      });
      $("#circeTop").unbind("mousedown").bind("mousedown",function(){
        VM.circle_action(-1,VM.tag_top);
      });
      $("#circeBottom").unbind("mousedown").bind("mousedown",function(){
        VM.circle_action(1,VM.tag_top);
      });
      $("#circeReset").unbind("mousedown").bind("mousedown",function(){
        // VM.render_setSize();
        VM.circle_action(1,VM.tag_reset);
        // if (VM.LCD === 0){
        //   VM.render_setSize();
        // } else{
        //   VM.circle_action(1,VM.tag_reset);
        // }
      });
    },
    circle_action:function(flag,tag){
      var VM = this;
      // if (VM.LCD === 0){
      //   return
      // }
      if (!VM.isWebGl || VM.animationFlag !== 1) {
        return
      }
      VM.spotLight_list.forEach((light,index) =>{
        var spotLight = VM['spotLight'+index];
        if (spotLight){
          VM.myCameraTween(spotLight,Math.PI*flag/16,1,0,tag,0);
        }
      });
      VM.myCameraTween(VM.CAMERA,Math.PI*flag/16,1,0,tag,1);
      VM.anaglePI=VM.anaglePI+flag;
      if(VM.anaglePI==32*flag) {
        VM.anaglePI = 0;
      }
    },
    onDocumentMove_clear:function(){//清除上一个机柜名提示
      var VM = this;
      VM.devShow = false;
      //if(VM.old_Move!=null && !ifNullData(VM.cube[VM.old_Move])){
      //  VM.cube[VM.old_Move].position.z=0;
      //  VM.old_Move=null;
      //}
      //if(VM.shapeMess){
      //  VM.shapeMess.material.map.dispose();
      //}
      //VM.scene.remove(VM.shapeMess);
    },
    onDocumentMove:function(event){
      var VM = this;
      var Mouse = {};
      var INTERSECTED;//三维射线
      var raycaster=new THREE.Raycaster();
      event.preventDefault();
      Mouse.x = ( event.offsetX / VM.Dwidth) * 2 - 1;
      Mouse.y = - ( event.offsetY / VM.Dheight) * 2 + 1;
      raycaster.setFromCamera(Mouse,VM.CAMERA); //新建一条从相机的位置到vector向量的一道光线
      var intersects = raycaster.intersectObjects(VM.scene.children,true);
      //VM.shapeMessFlag=1;
      if (intersects.length > 0) {//产生碰撞
        INTERSECTED = intersects[0].object;//获取碰撞对象
        if(INTERSECTED.name.indexOf('cabinet_')>=0) {//判断碰撞对象是否机柜
          var i=Number(INTERSECTED.name.split("_")[1]);
          if(i!=VM.old_Move){//判断碰撞对象是否是上一次存储碰撞对象---避免重复渲染统
            VM.nowItme = {
              name:VM.cubeArry[i].name,
              x:event.offsetX,
              y:event.offsetY +100
            };
            if(VM.cubeArry[i].name && VM.cubeArry[i].name!= ""){
              VM.devShow = true;
            }else{
              VM.devShow = false;
            }
          }else{

            //VM.shapeMessFlag=0;//不进行渲染
          }
        }else{
          VM.onDocumentMove_clear();//清除上一个机柜名提示
        }
      }else{
        VM.onDocumentMove_clear();//清除上一个机柜名提示
      }
      if(VM.shapeMessFlag==1){//只渲染一次
        VM.shapeMessFlag=0;
        VM.renderer.clear();//清除场景
        VM.render_render();

      }
    },
    getTimeNow:function(){
      let now = new Date();
      return now.getTime();
    },
    onDocumentMouseDown:function(event) {
      var VM = this;
      //获取鼠标按下时的时间
      // if (VM.LCD === 1){
      //   return
      // }
      VM.mouseClickStartTime = VM.getTimeNow();

      //setInterval会每100毫秒执行一次，也就是每100毫秒获取一次时间
      VM.mouseClickTimeInterval = setInterval(function () {
        VM.mouseClickEndTime= VM.getTimeNow();

        //如果此时检测到的时间与第一次获取的时间差有500毫秒
        VM.mouseClickDuringTime = VM.mouseClickEndTime - VM.mouseClickStartTime;//持续时间
        if (VM.mouseClickDuringTime > 500) {
          //便不再继续重复此函数 （clearInterval取消周期性执行）
          clearInterval(VM.mouseClickTimeInterval);
        }
      }, 100);
    },
    onDocumentMouseup:function(event){
      var VM = this;
      // if (VM.LCD === 1){
      //   return
      // }
      clearInterval(VM.mouseClickTimeInterval);
      if (VM.mouseClickDuringTime < 500){
        VM.onDocumentMouseDownFun(event)
      }
    },
    onDocumentMouseDownFun:function(event){
      var VM = this;
      var Mouse = new THREE.Vector2();
      var INTERSECTED;//三维射线
      event.preventDefault();
      Mouse.x = ( event.offsetX / VM.Dwidth) * 2 - 1;
      Mouse.y = - ( event.offsetY / VM.Dheight) * 2 + 1;
      var raycaster=new THREE.Raycaster();
      raycaster.setFromCamera(Mouse,VM.CAMERA ); //新建一条从相机的位置到vector向量的一道光线
      var intersects = raycaster.intersectObjects(VM.scene.children,true);

      if (intersects.length > 0) {
        INTERSECTED = intersects[0].object;//把选中的对象放到全局变量SELECTED中
        if(!INTERSECTED || !INTERSECTED.material.color){
          return
        }
        INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
        var NewArray;
        if(ifNullData(VM.cubeArry)){
          NewArray=VM.cubeArry_old;
        }else{
          NewArray=VM.cubeArry;
        }
        clearInterval(VM.mainD_cabinet_timer);
        if(INTERSECTED.name.indexOf('cabinet_')>=0){
          var i=Number(INTERSECTED.name.split("_")[1]);
          VM.box_index=(i+1);
          VM.cab_type=NewArray[i].type;
          VM.dev_index=NewArray[i].index;
          // if(INTERSECTED.currentHex==0xe7251b) {//红色告警
          if(INTERSECTED.is_alarm) {//自定义告警属性
            document.getElementById("loadingPage").style.display='block';
            VM.showFlag=true;//机柜告警弹窗
          }else{
            if(NewArray[i].type==106 && !VM.isTransparent){//机柜
              $("#loadingPage").show();
              popWin('main_cabinet_message');
              VM.mainD_cabinet_Message();
              VM.mainD_cabinet_timer=setInterval(function(){
                VM.mainD_cabinet_Message();
              },5000);
            }
          }
        }
      } else {
        if (INTERSECTED) INTERSECTED.material.color.set(INTERSECTED.currentHex);
        INTERSECTED = null;
      }
    },
    /*
     *camera:相机
     *angle：旋转角度
     *segs:分段，即圆弧对应的路径分为几段，转多少次
     *during：动画执行的时间
     *tag：左右还是上下,或者重置
     *type：是相机还是灯光
     * 相机视角所转的角度与机柜运动的方向相反，实际上机柜并没有动，只是相机视角在动。
     */
    myCameraTween:function(cameraObj, angle, segs, during,tag,type) {
      var VM = this;
      var x = cameraObj.position.x,y = cameraObj.position.y,z = cameraObj.position.z;
      // console.log('x:' + x,'y:' + y,'z:' + z);
      var endPosArray =[];
      var perAngle = angle / segs;//计算得到每次转的角度
      for (var i = 1 ; i <= segs ; i++) {
        var endPos = {
          // "x": tag === VM.tag_left ? z * Math.sin(i * perAngle) + x * Math.cos(i * perAngle) : 0,
          "x": z * Math.sin(i * perAngle) + x * Math.cos(i * perAngle) ,
          // "y":  tag === VM.tag_top ? y * Math.cos(i * perAngle) - z * Math.sin(i * perAngle)  : y,
          "y": y,
          // "z": tag === VM.tag_left ? z * Math.cos(i * perAngle) - x * Math.sin(i * perAngle) : z * Math.cos(i * perAngle)
          "z": z * Math.cos(i * perAngle) - x * Math.sin(i * perAngle)
        };
        endPosArray.push(endPos);
      }
      var flag = 0;
      if (tag === VM.tag_reset) {//如果是重置
        endPosArray = [];
        endPosArray.push(VM.reset_position);
        segs = 1;//重置只转一次
      }
      var id = setInterval(function () {
        if(!VM.renderer){
          return;
        }
        VM.renderer.clear();//清除场景
        VM.render_render();
        if (flag == segs) {
          clearInterval(id);
          id=null;
        } else {
          // if ((type === 0 && endPosArray[flag].y < 450) || (type === 1 && (endPosArray[flag].y < -120 || endPosArray[flag].y > 2877 ))){
          //   console.log(111)
          //   clearInterval(id);
          //   return
          // }
          cameraObj.position.set(endPosArray[flag].x, endPosArray[flag].y, endPosArray[flag].z);
          VM.CAMERA.lookAt(new THREE.Vector3(VM.reset_camera.x,VM.reset_camera.y,VM.reset_camera.z));//VM.scene.position
          flag++;
        }
      }, during / segs);
    },
    /************************************机柜详细信息弹窗*********************************/
    mainD_cabinet_Message:function(){//获取机柜详细信息
      var VM = this;
      if (!VM.activatedBoo) {
        return
      }
      VM.$axios({
        method: 'post',
        timeout:5000,
        data: {
          //"index":VM.dev_index
          "box_index":VM.box_index
        },
        url: "/home.cgi/get_cabinet_info"
      }).then(function (data) {
        VM.cabinet_pop_title=data.box_name;
        VM.AveEnable = data.AveEnable;
        VM.main_cabinet_th(data.Tem_Humi);//创建机柜详细信息--温湿度
        //VM.main_cabinet_pd(data.pd);//创建机柜详细信息--配电柜
        document.getElementById("loadingPage").style.display='none';
      });
    },
    /**
     * 文字颜色
     * 1正常，2异常，0 NA, -1 该数据无正常异常之说不标颜色
     */
    air_state_rule:function(getData,fixNumber){
      var VM = this;
      var arrayData=[0,0],DataValue=getData[0];
      if(!ifNullData(getData)){
        if(arguments.length==3 && !ifNullData(DataValue)){//有传参数fix 且 不为空
          DataValue=Number(getData[0]).toFixed(fixNumber);//精确值
        }
        if($.isArray(getData)){//数据是数组形式
          arrayData=[DataValue,getData[1]]
        }
      }else{//数据为空
        arrayData=[0,0]
      }
      return getTextColor(arrayData[0],arrayData[1],fixNumber).html;
    },
    main_cabinet_th:function(returnData){//创建机柜详细信息--温湿度
      var VM = this;
      var cold_hot={
        cold:[],
        hot:[]};
      if(!ifNullData(returnData)) {
        if (!ifNullData(returnData.cold)){
          cold_hot.cold = returnData.cold;
        }
        if (!ifNullData(returnData.hot)) {
          cold_hot.hot = returnData.hot;
        }
      }
      VM.cold_hot = cold_hot;
      return;
      var cold_hot={cold:[],hot:[]};
      if(!ifNullData(returnData)){
        $.each(returnData,function(kl,vl){
          if(kl=='cold' || kl=='hot'){
            if(ifNullData(vl)){
              return;
            }
            var newArr=[];
            $.each(vl,function(key,value){
              if(key!='ave_temp' && key!='ave_humi'){
                newArr.push({
                  title:value.dev_name,
                  temp:VM.air_state_rule(($.isArray(value.temp))?value.temp:[0,0],2),
                  humi:VM.air_state_rule(($.isArray(value.humi))?value.humi:[0,0],2)
                })
              }
            });
            if(!ifNullData(vl.ave_temp)){
              newArr.push({
                title:'平均值',
                temp:VM.air_state_rule(vl.ave_temp,2),
                humi:VM.air_state_rule(vl.ave_humi,2)
              });
            }
            cold_hot[kl]=newArr;
          }
        })
      }
      VM.cold_hot=cold_hot;
    },
    main_cabinet_pd:function(returnData){//创建机柜详细信息--配电柜
      var VM = this;
      var pc_data=[];
      var pc_data_rule=function(data){
        var newArr='';
        if(!ifNullData(data)){
          newArr=VM.air_state_rule($('<span></span>'),data['a'],2);
          if(!ifNullData(data['b'])) {//三相
            newArr+='/'+VM.air_state_rule($('<span></span>'),data['b'],2);
            newArr+='/'+VM.air_state_rule($('<span></span>'),data['c'],2);
          }
        }else{
          newArr=VM.air_state_rule($('<span></span>'),[0,0],2);
        }
        return newArr;
      };
      if(!ifNullData(returnData)){
        $.each(returnData,function(key,value){
          pc_data.push({
            title:value["dev_name"]+'—'+value["branch_name"],
            vol:pc_data_rule(value.vol),
            cur:pc_data_rule(value.cur),
            power:pc_data_rule(value.power)
          });
        });
      }
      VM.pc_data=pc_data;
    },
    main_event_action:function(urlF,dev_type,dev_index,sub_type){//触发二级弹窗
      var VM = this;
      $("#event_more").unbind("mousedown").bind("mousedown",function(event){//跳转事件详细信息
        event.preventDefault();
        $("#main_event_message,.maskLayer[pid=main_event_message]").remove();
        $pub.go_page_rule('PC','RecordsearchHistory',function(){
          var st='all',sN='all';
          if(!ifNullData(dev_type)){
            st=dev_type;
            sN=dev_index;
          }
          $("#RH_devType").val(st);
          $("#RH_devName").val(sN);
          $("#RH_Recovery").val('true').data('func',function(){
            if(!ifNullData(sub_type)){//返回开关量`
              $pub.go_page_rule('PC',urlF,function(){
                $("#Env_Eguard").find("input[name='devType']").val(dev_type);
                $("#Env_Eguard").find("input[name='swType']").val(sub_type);
              },sub_type);
            }else{
              $pub.go_page_rule('PC',urlF);
            }
          });
          $("#RH_devType").trigger("click");
        });
      });

    },
    goto_login:function () {
      if (!window.webcontrol) {
        new QWebChannel(qt.webChannelTransport, function (channel) {
          window.webcontrol = channel.objects.webcontrol;
          webcontrol.clearCache();
        });
      } else {
        webcontrol.clearCache();
      }
      $('.maskLayer').remove();
      $('.detail').hide();
      $Cookie.delCookie('CGISID');//清楚cookie
      // VM.$store.commit('setLoginSate',false);
      // this.$router.options.routes[2].children = [];//清空一下之前的路由
      // this.$router.push({path: '/login'});
    },
    changeView:function (flag) {
      var VM = this;
      if (VM.viewFlag === flag){
        return
      }
      VM.viewFlag = flag;
      VM.isTransparent = flag !== 4;
      VM.main_normal_close();
      VM.render_dispose();//清除缓存
      clearInterval(this.mainThreeI);
      VM.$nextTick(()=>{
        VM.ThreeDinterval();//设置定时器，实时刷新数据
      });
    },
    clearFun:function () {
      var VM = this;
      this.main_normal_close();
      clearInterval(this.mainThreeI);
      clearTimeout(this.Timeinterval_3d);
      clearTimeout(this.heatmap_four_mesh_Timer);
      VM.clearRenderer();
      if(VM.scene && VM.scene.children){
        for(var i =0;i<VM.scene.children.length;i++){
          this.clearCache(VM.scene.children[i]);
        }
      }
      if(VM.objGroup){
        this.clearCache(VM.objGroup);
      }
      VM.scene = null;
      VM.objGroup = null;
      if(VM.scene && VM.scene.children){
        for(var i =0;i<VM.scene.children.length;i++){
          this.clearCache(VM.scene.children[i]);
        }
      }
      if(VM.objGroup){
        this.clearCache(VM.objGroup);
      }
      VM.scene = null;
      VM.objGroup = null;
      this.mainThreeI=null;
      this.Timeinterval_3d=null;
    },
    /*
    * 创建四个温度云图mesh
    * */
    init_heatmap_four_mesh:function(){
      var VM = this;
      if (VM.isTransparent && VM.viewFlag === 1){//云图视图
        /*
        * 位置计算规则:
        * 按照cubeArry中的顺序,即,双数在后面,单数数在前面(注意单双数的指的是下标,从0开始)
        * 位置1:cubeArry为单数的热通道,
        * 位置2:cubeArry为单数的冷通道,
        * 位置3:cubeArry为双数的冷通道,
        * 位置4:cubeArry为双数的热通道,
        * 位置5:（cubeArry第一个为单数的热通道 + cubeArry第一个为单数的冷通道）/ 2,
        * 位置6:（cubeArry为单数的热通道position为1的值 + cubeArry为单数的冷通道position为1的值）/ 2,
        * 位置7:（cubeArry最后一个为单数的热通道 + cubeArry最后一个为单数的冷通道）/ 2,
        * 位置8:(cubeArry第一个为单数的冷通道 + cubeArry第一个为双数的冷通道) /2,
        * 位置9:(cubeArry为单数的冷通道position为1的值 + cubeArry为双数的冷通道position为1的值) /2,
        * 位置10:(cubeArry最后一个为单数的冷通道 + cubeArry最后一个为双数的冷通道) /2,
        * 位置11:(cubeArry第一个为双数的热通道 + cubeArry第一个为双数的冷通道) /2,
        * 位置12:(cubeArry为双数的热通道position为1的值 + cubeArry为双数的冷通道position为1的值) /2,
        * 位置13:(cubeArry最后一个为双数的热通道 + cubeArry最后一个为双数的冷通道) /2,
        * */
        // var m = 2;
        for (let m = 1; m <= 13; m ++) {
          var width = VM.objLength + VM.objSingleWidth + VM.half_ll;
          var height = VM.objHeight + VM.objSmallHeight;
          var cubeArrL = VM.cubeArry.length;
          var data_arr = [];//位置与数据对象数组
          var data_max = 0;//一组数据的最大值
          var opacity = 0.9;
          if (m <= 4){
            if (m === 1 || m === 4) {
              // continue
            }
            for(var n = 0 ; n < cubeArrL ; n ++ ){
              var passageway_data = [];//
              if ((m === 1 && n % 2 === 1) || (m === 4 && n % 2 === 0)){//位置1: 单数,热通道 //位置4: 双数,热通道
                passageway_data = VM.cubeArry[n].hot_passageway;
              }else if ((m === 2 && n % 2 === 1) || (m === 3 && n % 2 === 0)) {//位置2: 单数,冷通道 //位置3: 双数,冷通道
                passageway_data = VM.cubeArry[n].cold_passageway;
              }
              if(!ifNullData(passageway_data)){
                for (let k = 0; k < passageway_data.length; k++) {
                  var data_position = VM.cal_heatmap_data_position(width - VM.objSingleWidth / 3,height,cubeArrL,passageway_data[k].position,n);
                  data_position.value = passageway_data[k].temp;
                  data_max = Math.max(data_max,data_position.value);
                  data_arr.push(data_position);
                  if (m===2 && k === 1){
                    VM.demo_point = {x:data_arr[0].x + data_arr[1].x ,y:data_arr[0].y + data_arr[1].y }
                  }
                }
              }
            }
          }else{
            // opacity = 0.6;
            width = VM.objSingleLength;
            height = VM.objHeight + VM.objSmallHeight;
            if (m === 6 || m === 9 || m === 12) {
              // continue
              height = VM.objLength + VM.objSingleWidth + VM.half_ll;
            }
          }
          var new_passageway_data = [];
          if (m === 5){//位置5
            new_passageway_data = VM.cal_heatmap_ave_position(VM.cubeArry[1].hot_passageway,VM.cubeArry[1].cold_passageway);
          } else if (m === 6) {//位置6
            var all_hot = [];
            var all_cold = [];
            for(var n = 0 ; n < cubeArrL ; n ++ ){
              if (n % 2 ===1 ){
                all_hot = [...all_hot,...VM.cubeArry[n].hot_passageway];
                all_cold = [...all_cold,...VM.cubeArry[n].cold_passageway];
              }
            }
            var new_all_hot = VM.cal_heatmap_one_position(all_hot,1);
            var new_all_cold = VM.cal_heatmap_one_position(all_cold,1);
            new_passageway_data = VM.cal_heatmap_ave_position(new_all_hot,new_all_cold,true);
          } else if (m === 7) {//位置7
            new_passageway_data = VM.cal_heatmap_ave_position(VM.cubeArry[cubeArrL - 1].hot_passageway,VM.cubeArry[cubeArrL - 1].cold_passageway);
          } else if (m === 8) {//位置8
            new_passageway_data = VM.cal_heatmap_ave_position(VM.cubeArry[1].cold_passageway,VM.cubeArry[1].cold_passageway);
          } else if (m === 9) {//位置9
            var all_cold = [];
            var all_cold1 = [];
            for(var n = 0 ; n < cubeArrL ; n ++ ){
              if (n % 2 ===1 ){
                all_cold = [...all_cold,...VM.cubeArry[n].cold_passageway];
              }else{
                all_cold1 = [...all_cold1,...VM.cubeArry[n].cold_passageway];
              }
            }
            new_passageway_data = VM.cal_heatmap_ave_position(VM.cal_heatmap_one_position(all_cold,1),VM.cal_heatmap_one_position(all_cold1,1),true);
          } else if (m === 10) {//位置10
            new_passageway_data = VM.cal_heatmap_ave_position(VM.cubeArry[cubeArrL - 1].cold_passageway,VM.cubeArry[cubeArrL - 2].cold_passageway);
          } else if (m === 11) {//位置11
            new_passageway_data = VM.cal_heatmap_ave_position(VM.cubeArry[0].hot_passageway,VM.cubeArry[0].cold_passageway);
          } else if (m === 12) {//位置12
            var all_hot = [];
            var all_cold = [];
            for(var n = 0 ; n < cubeArrL ; n ++ ){
              if (n % 2 === 0){
                all_hot = [...all_hot,...VM.cubeArry[n].hot_passageway];
                all_cold = [...all_cold,...VM.cubeArry[n].cold_passageway];
              }
            }
            new_passageway_data = VM.cal_heatmap_ave_position(VM.cal_heatmap_one_position(all_hot,1),VM.cal_heatmap_one_position(all_cold,1),true);
          } else if (m === 13) {//位置13
            new_passageway_data = VM.cal_heatmap_ave_position(VM.cubeArry[cubeArrL - 2].hot_passageway,VM.cubeArry[cubeArrL - 2].cold_passageway);
          }
          // console.log(m + ':' + JSON.stringify(new_passageway_data));
          if(!ifNullData(new_passageway_data)){
            for (let k = 0; k < new_passageway_data.length; k++) {
              var data_position = VM.cal_heatmap_nine_data_position(width,height,new_passageway_data[k].position,new_passageway_data.length);
              data_position.value = new_passageway_data[k].temp;
              data_max = Math.max(data_max,data_position.value);
              data_arr.push(data_position);
            }
          }
          /*
          * 造900个常温数据位置,使图层显示看起来比较完整
          * x: 30个
          * y: 30个
          * */
          var pointss = [];
          var Limit = 10;//注意此处为需要点数量的开根号
          for (let i = 0; i < Limit; i++) {
            for(let j = 0; j < Limit; j++){
              var point = {
                x: Number((width / Limit * ( i + 1/2)).toFixed(2)),
                y: Number((height / Limit * ( j + 1/2)).toFixed(2)),
                value: 16
              };
              pointss.push(point);
            }
          }
          var heatmapBase64 = VM.init_heatmap(width,height,data_arr,data_max);//拿到base64的图片资源
          if(VM.heatmap_Mesh.length <= 13){//说明是第一次加载
            VM.init_heatmap_mesh(width,height,heatmapBase64,m,opacity);
          }else{
            // if (VM.current_flag > 3) {
            //   console.log(heatmapBase64);
            // }
            //注意这里减一是因为之前的设定就是m是从1开始的，方便位置计算
            if (VM.Loadover == 0) {
              VM.heatmap_Mesh[m - 1].material.map.dispose();
              VM.heatmap_Mesh[m - 1].material.map = VM.init_heatmap_canvas(width, height, heatmapBase64);
            }
          }
        }
      }
    },
    /*
    * 创建heatmap对象
    * 创建heatmap对象
    * */
    init_heatmap_mesh:function(width,height,heatmapBase64,m,opacity){
      var VM = this;
      $('#heatmap').remove();//删掉创建的dom
      var new_heatmap = VM.init_heatmap_canvas(width,height,heatmapBase64);
      // var new_heatmap = new THREE.CanvasTexture(canvas);
      var material = new THREE.MeshBasicMaterial({
        map:new_heatmap,//热力图贴图
        side:THREE.DoubleSide,
        // side:THREE.FrontSide,
        transparent:true,//是否使用透明度
        fog:false,
        opacity: opacity
      });
      var geometry = new THREE.PlaneGeometry( width, height);
      var heatmap_mesh  = new THREE.Mesh( geometry,material );
      if (m >= 5){//位置5以后的旋转
        VM.cal_heatmap_nine_position(heatmap_mesh,m);
      }
      var position = VM.cal_heatmap_position(m);
      heatmap_mesh.position.set(position.x,position.y,position.z);
      VM.heatmap_Mesh[m - 1] = heatmap_mesh;//注意这里减一是因为之前的设定就是m是从1开始的，方便位置计算
      VM.scene.add( VM.heatmap_Mesh[m - 1]);
    },
    init_heatmap_canvas:function(width,height,heatmapBase64){
      var heatmapImg = new Image();
      heatmapImg.src = heatmapBase64;
      var canvas = document.createElement( "canvas" );
      canvas.width = width; //这里canvas大小设置要和图片一致
      canvas.height = height;
      var context = canvas.getContext("2d");
      heatmapImg.onload = function () {
        context.drawImage(heatmapImg,0,0);
      };
      // function drawImage() {
      //   context.drawImage(heatmapImg,0,0);
      //   console.log('drawImage:'+ m);
      //   return canvas
      // }
      //这里做超时回收是因为 new Image()的onload 是一个异步的加载过程，如果直接回收，会导致前面异步记载回来之后context的内容为空，drawImage报错，图片就画不出来了
      setTimeout(function () {
        //回收
        if(document.getElementById("CanvasHide")){
          document.getElementById("CanvasHide").appendChild(canvas);/*放入垃圾桶*/
          document.getElementById("CanvasHide").innerHTML = '';//将a从页面上删除 /*清除垃圾桶*/
        }
        canvas=null;
        context=null;
      },1000);
      // return drawImage;
      return new THREE.CanvasTexture(canvas);
    },
    init_heatmap:function (width,height,points,data_max) {
      var VM = this;
      // console.log(JSON.stringify(points));
      var heatmap_dom = document.createElement( "div" );//创建一个dom节点来渲染热力图
      heatmap_dom.id = 'heatmap';
      //这里图片大小设置要和canvas一致，这边宽度需要加一个机柜，还不找到为什么
      $(heatmap_dom).css({width: width || '600px',height: height});
      $('#main_model').append(heatmap_dom);
      VM.HeatMapInstance = Heatmap.create({
        container: heatmap_dom,
        backgroundColor: 'rgba(240,0,0)',//背景颜色
        // backgroundColor: '#ffffff',//背景颜色
        radius: 100,//每个数据点的半径,
        // maxOpacity: 1,//最大不透明度，如果设置了不透明度，就会给覆盖
        // minOpacity: 0,//最小不透明度，如果设置了不透明度，就会给覆盖
        blur: 0.85,//模糊因子，越高，渐变就越平滑，缺省0.85
        // opacity: 0.8,
        useGradientOpacity: true,//热力图渲染是否使用gradient渐变色的透明度
        gradient: VM.deal_heatmap_color_data()
        //   {//渐变对象，你的最大值是37，那么每个value就要除以37,然后得到的值为颜色系数
        //   "0":'rgba(20,220,255,0.1)',//value为0的颜色 0/27
        //   // "0.457":"#0000e6",//value为16的颜色 16/37
        //   // "0.514":"#0078ff",//value为19的颜色 19/37
        //   "0.595":"#14dcff",//value为22的颜色 22/37
        //   "0.676":"#00ff32",//value为25的颜色 25/37
        //   "0.757":"#96ff14",//value为28的颜色 28/37
        //   "0.838":"#ffff0a",//value为31的颜色 31/37
        //   "0.919":"#ffc800",//value为34的颜色 34/37
        //   "1":"#f00000",//value为37的颜色 37/37
        // }
      });
      /*假数据*/
      var pointss = [];
      var max = 0;
      var dataLimit = 400;
      var flag = 100;
      for (let i = 0; i < dataLimit; i++) {
        if (i < dataLimit / 2){
          flag = 0
        }
        var val = Math.floor(Math.random()*flag);
        max = Math.max(max, val);
        var point = {
          x: Math.floor(Math.random()*width),
          y: Math.floor(Math.random()*height),
          value: val
        };
        pointss.push(point);
      }
      var data = {
        min: 0,//最小值默认设为0
        max: 37,//最大值默认设为37
        data: points
      };
      this.HeatMapInstance.setData(data);//从热图实例中删除所有先前存在的点，然后重新初始化数据存储。
      this.HeatMapInstance.repaint();//重绘
      return this.HeatMapInstance.getDataURL();//返回的值是热图实例的base64编码的dataURL。
    },
    init_smoke:function () {
      var VM = this;
      var smokeTexture = THREE.ImageUtils.loadTexture('/static/models/Smoke-Element.png');
      var limit = 50;
      for (let p = 0; p < limit; p++) {
        var color = '#0709dd';
        if (p < limit/2){
          color = '#dd010a'
        }
        var smokeMaterial = new THREE.MeshLambertMaterial({
          map: smokeTexture,
          color: color,
          transparent: true,
          side: THREE.DoubleSide
        });
        var smokeGeo = new THREE.PlaneGeometry(300,300);
        var particle = new THREE.Mesh(smokeGeo,smokeMaterial);
        particle.position.set(Math.random()*500-250,Math.random()*500-250,Math.random()*1000-100);
        particle.rotation.z = Math.random() * 360;
        VM.scene.add(particle);
        VM.smokeParticles.push(particle);
      }

    },
    evolveSmoke:function () {
      var VM = this;
      VM.delta = VM.clock.getDelta();
      var sp = VM.smokeParticles.length;
      while(sp--) {
        VM.smokeParticles[sp].rotation.z += (VM.delta * 0.01);
      }
    },
    /*
    * 处理温度值与颜色对应的方法
    * */
    deal_heatmap_color_data:function () {
      var VM = this;
      var gradient = {};
      VM.heatmap_data_list.forEach((coe,index)=>{
        // if (index === 0 || index === 1){
        //   return
        // }
        gradient[coe] = VM.color_list[index]
      });
      return gradient
    },
    /*
    * 处理一下色值参考
    * */
    deal_color_list:function () {
      //这里显示需要剔除一个为0的底色值
      var new_color_list = this.color_list.filter((color,index)=>{
        // return index !== 0 && index !== 1
        return color
      });
      $('#color_list').css('background-image','linear-gradient(to right,'+ new_color_list.join(',') +')');
      this.calc_color_position('temp_16',17);
      this.calc_color_position('temp_22',23);
      this.calc_color_position('temp_28',29
      );
      this.calc_color_position('temp_34',36);
    },
    calc_color_position:function (Idn, temp) {
      $('#'+ Idn).css('left', ((temp - 16) / (37 - 16)) * 180 - $('#'+Idn).width() / 2 + 'px');
    }
  },
  created:function (){
    this.isWebGl=WEBGL.isWebGLAvailable();//是否支持webgl
    if(this.isWebGl){
      this.texture0=this.MtextureLoad('cabinet_60.jpg');//普通机柜贴图
      this.texture1=this.MtextureLoad('fair.jpg');//空调贴图
      this.texture_disabled_big=this.MtextureLoad('fgrey_big.jpg');//灰色贴图 大
      this.texture_disabled_small=this.MtextureLoad('fgrey_small.jpg');//灰色贴图 小
    }
  },
  mounted:function(){
    var VM=this;
    var idn=$("#main_model");
    VM.Dwidth=idn.width();
    VM.Dheight=idn.height();
    VM.ThreeDinterval();//设置定时器，实时刷新数据
    VM.deal_color_list();
    // VM.init_heatmap();
  },
  activated:function(){
    this.activatedBoo = true;
    this.render_setSize()
  },
  deactivated:function(){
    this.activatedBoo = false;
  },
  beforeDestroy:function(){
    this.clearFun();
  }
}
