// JavaScript Document
import {popWin} from "../../plugin/tc.all.js"

import * as THREE from "three"
import {MTLLoader, OBJLoader} from "three-obj-mtl-loader" //这个引用不能删除,不然会报错
// import {MTLLoader, OBJLoader} from 'three-obj-mtl-loader'; //这个引用不能删除,不然会报错
import {WEBGL} from "../../plugin/WebGL"
import popWindow from "../../components/popWindow"
import myVideoPlay from "../../components/myVideoPlay"
import mainPopWin from "../../pages/main/mainPopWin" //机柜告警弹窗
import {
  $Cookie,
  dataValidation,
  getTextColor,
  ie_CollectGarbage,
  ifNullData,
  save_popready,
  isEqual,
  alarmLevel_get_ajax,
  defaultAlarmLevelColorList,
  loadingPage,
} from "../../libs/public"
import QWebChannel from "../qwebchannel"
import OrbitControls from "three/examples/js/controls/OrbitControls"
import Stats from "stats.js/src/Stats"
import Heatmap from "heatmap.js"
import clickOutSide from "../../libs/clickOutSide"//外部点击方法
// import Heatmap from  '../../plugin/heatmap.js';

export default {
  name: "mainThreeD",
  data() {
    return {
      mainThreeI: null,
      isWebGl: false,//判断是否兼容three.js

      Loadover: 3,//loadMTL + loadJPG + 3
      isLoading: true,
      hasEnterMounted: false,//是否已经进过mounted
      isControlsChange: false,//是否正在旋转
      isRoateing: false,//表示正在旋转，左右点击的旋转
      cube: [],
      cubeArry: [],//机柜信息
      meshData: [],
      mesh: [],//机柜顶上的小圆
      mesh1: [],//机柜贴图上的名字
      mesh2: [],//机柜的容量数值
      mesh3: {},//机柜的温度柱图上的数, 注意这里用了对象存
      mesh4: {},//机柜的温度柱图的mesh, 注意这里用了对象存
      // mesh5: {},//机柜的容量云图的mesh, 注意这里用了对象存
      sphereMesh: null,//切换菜单的模型对象
      coneMesh: null,//切换菜单的模型对象
      latheMesh: null,//切换菜单的模型对象
      capacityMesh: [],//机柜的容量
      cubeArry_old: [],//机柜上一次信息，对比使用
      vH: [],
      Dataobj: [],//存储机柜数据对象
      Nameobj: [],//存储机柜名称对象
      NewNameobj: [],//存储机柜名称新对象，用于机柜贴图
      Allmax_flag: [],
      Allmax_over: [],
      MmovL: null,
      texture0: null,//贴图
      texture1: null,//贴图
      texture_disabled_big: null,//贴图
      texture_disabled_small: null,//贴图
      threeD_chose_menu_texture: null,//切换菜单的贴图
      animationFlag: 0,
      refreshF: 0,
      anaglePI: 0,
      IS_Alarm: 0,
      shapeMessFlag: 0,
      Dwidth: 0,//容器宽度
      Dheight: 0,//容器高度
      canvasScal: 1,//缩放比例
      CAMERA: null,
      CONTROLS: null,
      STATS: null,//帧率
      scene: null,
      renderer: null,
      spotLight: null,
      objGroup: null,
      shapeMess: null,
      Timeinterval_3d: null,
      mainD_cabinet_timer: null,//正常机柜弹窗循环
      cabinet_pop_title: "",//机柜详细信息名字
      box_index: "",
      cab_type: "",
      dev_index: "",
      showFlag: false,
      devShow: false,
      nowItme: {//鼠标浮动机柜
        name: "",
        x: 0,
        y: 0,
        is3d: false
      },
      cold_hot: {}, //机柜温湿度数据
      pc_data: [], //机柜配电柜数据
      TD_sure_demo: null,
      old_Move: null,
      isRender: true,
      activatedBoo: true,
      AveEnable: 0,//是否是微模块，如果是微模块显示的内容是平均问题，表头就不要显示设备名称
      equip_color_old: {
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
        117: 0xffffff//综合柜不显示贴图
        // 117: 0x555555,
        // 117: 0x8aff00,
      },/*机柜颜色颜色列表，与pub_set.css中的机柜颜色设置一致*/
      //配色规则， 无效柜，无；用户柜：无；空调：#01e8ff；动力：#ffc800；其他：#c0ff00
      equip_color: {
        100: 0xffffff,
        101: 0xc0ff00,
        102: 0xffc800,
        103: 0xffc800,
        104: 0xffc800,
        105: 0x01e8ff,
        106: 0xffffff,
        113: 0x01e8ff,
        116: 0xc0ff00,
        117: 0xc0ff00
      },/*机柜颜色颜色列表，与pub_set.css中的机柜颜色设置一致*/
      equip_content: [
        //无效柜
        {
          keys: [100],
          color: 0xffffff
        },
        //用户柜
        {
          keys: [106],
          color: 0x17ffdc
        },
        //空调
        {
          keys: [105, 113],
          color: 0x07beff
        },
        //动力
        {
          keys: [102, 103, 104],
          color: 0xffc800
        }
        //其他，直接写颜色
      ],
      alarmL_color: {
        // #6800e9 #3430eb #00c5cc #66cc00 #ffcc00 #ff7200 #e60011
        // 0: '#00c5cc',
        // 1: '#6800e9',
        // 2: '#3430eb',
        // 3: '#00c5cc',
        // 4: '#66cc00',
        // 5: '#ffcc00',
        // 6: '#ff7200',
        // 7: '#e60011',
      },/*告警颜色列表*/
      tag_left: "left",
      tag_top: "top",
      tag_reset: "reset",
      oldFocalLength: 70,//初始值，设置模型大小
      FocalLength: 70,//初始值，设置模型大小
      cabinetMax: 16,//初始值，设置模型大小单排最大长度
      FocalPer: 2,//模型缩小系数
      reset_position: {x: -800, y: 800, z: 2700},//初始位置
      reset_camera: {x: 0, y: 130, z: 0},//初始位置
      mouseClickStartTime: 0,//鼠标点击开始时间
      mouseClickEndTime: 0,//鼠标点击结束时间
      mouseClickDuringTime: 0,//鼠标长按持续时间
      mouseClickTimeInterval: null,//鼠标长按定时器
      devScale: 2,//设备模型放大倍数，只针对于顶部邠设备
      temp_camera_obj: {//顶部设备类型对应的设备模型
        0: "af_sp_qiu",//球形摄像头
        2: "af_sp_qiang",//枪型摄像头，原来是1，因为会和开关量的烟雾重复，所以设置了2
        1: "af_smoke",//烟雾
        7: "af_smoke"//温感
      },
      temp_camera_list: [
        // {
        //   "pos_id": 1,
        //   "dev_id": 1,
        //   "sub_index": 1,
        //   "dev_type": 15,
        //   "type_f": 1,
        //   "dev_status": 0,
        //   "name_f": "枪形摄像头"
        // },
      ],//摄像头与温感烟感列表
      old_temp_camera_list: [],
      old_temp_camera_Obj: {},//旧数据
      viewFlag: 4,//当前显示的是哪个视图 (1,温度云图；2：容量云图；3：安防视图；4:普通3D视图；6:温度柱图)
      isTransparent: false,//机柜是否透明
      HeatMapInstance_Arr: [],//热点图
      objLength: 0,//机柜的总长度
      objLengh_air: 0,//空调机柜的总长度
      objHeight: 290,//机柜的高度
      objSingleLength: 120,//单边机柜的长度
      objAllCabinetWidth: 360,//机柜的宽度，后面一排+中间通道+正面一排
      objSingleWidth: 64,//单边机柜的宽度
      objSingleHalfWidth: 34,//单边机柜的宽度 半柜
      objSmallHeight: 8,//微调的高度
      objCabinetHeight: 250,//单个机柜内部的高度
      objCabinetBottomHeight: 23.29,//单个机柜底座的高度
      objCabinetTopHeight: 22,//单个机柜底座的高度
      objBottomWidth: 45,//底部线框模型宽度
      objBottomLength: 45,//底部线框模型长度
      // objBottomHeight: 32.5,//底部线框模型高度
      objBottomHeight: 45,//底部线框模型高度
      half_ll: 0,//前门
      half_rr: 0,//后门
      current_flag: 0,
      heatmap_Mesh: [],//温度云图mesh对象
      heatmap_map: [],//温度云图mesh对象
      heatmap_Mesh_three: [],//温度云图mesh对象
      heatmap_map_three: [],//温度云图mesh对象
      camera_dev_group: {},//安防设备group对象
      heatmap_four_mesh_Timer: null,
      clock: null,
      delta: 0,
      heatmap_data_list: [
        // 0,
        // 0.457,
        0.432,//16
        0.595,//22
        0.757,//28
        0.838,//31
        0.919,//34
        1
      ],
      color_list: [
        "#14dcff",
        // 'rgba(0,255,50,1)',
        "#00ff32",
        // 'rgba(155,250,20,1)',
        "#96ff14",
        // 'rgba(255,255,10,1)',
        "#ffff0a",
        // 'rgba(255,200,0,1)',
        "#ffc800",
        // 'rgba(240,0,0,1)',
        "#f00000"
      ],
      spotLight_list: [
        {
          x: 0,
          y: 1000,
          z: -1000
        },
        {
          x: 0,
          y: 1000,
          z: 1000
        },
        {
          x: 1000,
          y: -1000,
          z: 1000
        }
      ],
      demo_point: {},
      current_capacity_type: 0,//当前容量类型
      capacity_type_list: [
        {
          index: 1,
          key: "u_rate",//字段后台还未定义
          name: "U位云图",
          colors: ["#83ff62", "#9fffcf"]
        },
        {
          index: 2,
          key: "pdc_rate",
          name: "配电云图",
          colors: ["#ff8e52", "#fff640"]
        },
        {
          index: 3,
          key: "cooling_rate",
          name: "制冷云图",
          colors: ["#03adff", "#3cebff"]
        }
      ],//容量类型对应属性名字
      capacity_color_list: [
        {
          key: 0,
          color: "#2e8de5"
          // color: 'rgba(28,188,255,0.8)',
        },
        {
          key: 20,
          color: "#2ee2e5"
          // color: '#00c9cc',
          // color: 'rgba(26,255,91,0.8)',
        },
        {
          key: 40,
          color: "#2ee56a"
          // color: '#00cc99',
          // color: 'rgba(177,255,26,0.8)',
        },
        {
          key: 60,
          color: "#f2c230"
          // color: '#a67c00',
          // color: 'rgba(255,242,26,0.8)',
        },
        {
          key: 80,
          color: "#f27c3d"
          // color: 'rgba(255,182,26,0.8)',
        },
        {
          key: 100,
          color: "#e54545"
          // color: 'rgba(255,74,26,0.8)',
        }
      ],//容量云图对应颜色
      projectiveObj: null,//当前点击的对象
      RAYCASTER: null,//光线投射器
      MOUSE: null,
      has_old_pdc_rate_set: false,//是否已经设置了旧值
      has_old_cooling_rate_set: false,//是否已经设置了旧值
      has_old_u_rate: false,//是否已经设置了旧值
      three_map_type: {0: "机柜云图", 1: "3个平面云图"},
      three_map_chose: {"-1": "全部", 0: "上", 1: "中", 2: "下"},
      heatmap_type: 0,//温度云图类型，0：全景，1：立面 , -1：三个平面
      cap_temp_type: -1,//温度柱图类型，-1：全部机柜：0：热通道1，1：冷通道1：，2：热通道2，3；冷通道2
      heatmap_view: -1,//温度云图三个平面上中下类型 -1：全部 ，0:上，1：中；2:下
      heatmap_view1: -1,//温度云图全景中的前排后排类型 -1：全部 ，0:前排，1：后排
      heatmap_view2: -1,//温度云图立面视图中的四个面类型 -1：全部 ，0:第一面，1:第二面，2:第三面，3:第四面，
      cap_temp_view: -1,//温度云图三个平面冷热通道类型 0:冷，1：热，暂时不用
      requestAnimationFrameID: null,//自动动画的ID

      //用作判断是否是点击对象的名字
      cabinet_: "cabinet_",
      cabinetName_: "cabinetName_",
      cameraDev_: "cameraDev_",
      cabinetTemp_: "cabinetTemp_",
      cabinetCapacity: "cabinetCapacity_",
      cabinetChoseMenu: "cabinetChoseMenu_",//3D菜单
      capacityTemp: "capacityTemp_",//温度柱图

      key_hot: "hot",//热的key
      key_cold: "cold",//冷的key
      key_way_hot: "hot_passageway",//冷通道的key
      key_way_cold: "cold_passageway",//冷通道的key

      temp_default: {
        hot: 20,//热通道给的默认温度值
        cold: 18//冷通道给的默认温度值
      },
      all_max_hot: 20,//当前所有的最大值
      all_max_cold: 18,//当前所有的最大值
      randomNum: 1,//补充随机点个数
      randomCoe: 1,//随机数系数
      all_passageway_data: {},//所有的原来通道的数据
      limit_per: 3,//临近距离多少需要删除这个点
      defaultRadius: 80,//默认大小
      defaultDataMax: 37,//默认最大值
      defaultDataMin: 18,//默认最小值
      max_coe: 0.3,//点击值的最高系数
      min_coe: 0.2,//点击值的最低系数

      basicURL: "/static/models/",//模型、贴图根路径
      pop_camera_dev: {},//弹窗摄像头设备

      video_dev_type: 0,//弹出框摄像头设备类型
      video_dev_index: 0,//弹出框摄像头设备编号
      main_ico_3d: null,

      MyisRender: false,//当前切换view的控制

      hide_opacity: 0.4,//淡化的透明度
      show_opacity: 0.9,//显示的透明度

      threeD_chose_menu_show: false,//图上切换的菜单显示
      threeD_chose_menu_position: {
        x: 500,
        y: 500
      },//温度云图切换菜单
      heatmap_dev_menu: [
        {
          name: "全景视图",
          value: 0,
          showChildren: false,
          key: "heatmap_type",
          children: [
            {
              name: "全部",
              value: -1,
              key: "heatmap_view1"
            },
            {
              name: "前排",
              value: 0,
              key: "heatmap_view1"
            }, {
              name: "后排",
              value: 1,
              key: "heatmap_view1"
            }
          ]
        },
        {
          name: "立面视图",
          value: 1,
          showChildren: false,
          key: "heatmap_type",
          children: [
            {
              name: "全部机柜",
              value: -1,
              key: "heatmap_view2"
            }, {
              name: "热通道1",
              value: 0,
              key: "heatmap_view2"
            }, {
              name: "冷通道1",
              value: 1,
              key: "heatmap_view2"
            }, {
              name: "热通道2",
              value: 3,
              key: "heatmap_view2"
            }, {
              name: "冷通道2",
              value: 2,
              key: "heatmap_view2"
            }
          ]
        }, {
          name: "平面视图",
          value: -1,
          showChildren: false,
          key: "heatmap_type",
          children: [
            {
              name: "全部",
              value: -1,
              key: "heatmap_view"
            },
            {
              name: "上层",
              value: 0,
              key: "heatmap_view"
            }, {
              name: "中层",
              value: 1,
              key: "heatmap_view"
            }, {
              name: "下层",
              value: 2,
              key: "heatmap_view"
            }
          ]
        }
      ],
      temp_menu: [
        {
          name: "全部机柜",
          value: -1,
          showChildren: false,
          key: "cap_temp_type"
        },
        {
          name: "热通道1",
          value: 0,
          showChildren: false,
          key: "cap_temp_type"
        },
        {
          name: "冷通道1",
          value: 1,
          showChildren: false,
          key: "cap_temp_type"
        }, {
          name: "热通道2",
          value: 2,
          showChildren: false,
          key: "cap_temp_type"
        }, {
          name: "冷通道2",
          value: 3,
          showChildren: false,
          key: "cap_temp_type"
        }
      ]
    }
  },
  directives: {//自定义指令 ，v-
    clickOutSide
  },
  components: {
    popWindow: popWindow,
    mainPopWin: mainPopWin,
    myVideoPlay: myVideoPlay
  },
  watch: {
    isLoading(val, oldVal) {
      this.$store.commit("setIsLoading3D", val)//及时更新3D更新状态
      if (!val) {
        this.MyisRender = false;
        this.hasEnterMounted = false//重置一下
      }
    }
  },
  computed: {
    objCabinetHeightCoe() {//单个机柜内部的高度拉伸的系数，只针对于容量云图
      return (this.objCabinetHeight + this.objCabinetBottomHeight) / this.objCabinetHeight
    },
    jg_02() {
      return {
        name: "jg_02.mtl",
        data_name: "mtl_jg_02",
        loader: "MTLLoader",
        children: {
          name: "jg_02.obj",
          data_name: "obj_jg_02",
          loader: "OBJLoader",
          mtl: "mtl_jg_02"
        }
      }
    },
    men_01() {
      return {
        name: "men_01.mtl",
        data_name: "mtl_men_01",
        loader: "MTLLoader",
        children: {
          name: "men_01.obj",
          data_name: "obj_men_01",
          loader: "OBJLoader",
          mtl: "mtl_men_01"
        }
      }
    },
    men_02() {
      return {
        name: "men_02.mtl",
        data_name: "mtl_men_02",
        loader: "MTLLoader",
        children: {
          name: "men_02.obj",
          data_name: "obj_men_02",
          loader: "OBJLoader",
          mtl: "mtl_men_02"
        }
      }
    },
    jg_03() {
      return {
        name: "jg_03.mtl",
        data_name: "mtl_jg_03",
        loader: "MTLLoader",
        children: {
          name: "jg_03.obj",
          data_name: "obj_jg_03",
          loader: "OBJLoader",
          mtl: "mtl_jg_03"
        }

      }
    },
    loadJPG() {//需要提前加载的材质 , name: 材质名字，data_name: vue对象中对应要创建的属性名字，loader：使用什么加载器，
      return [
        {
          name: "cabinet_60.jpg",//普通机柜贴图
          data_name: "texture0",
          loader: "TextureLoader"
        },
        {
          name: "fair.jpg",//空调贴图
          data_name: "texture1",
          loader: "TextureLoader"
        },
        {
          name: "fgrey_big.jpg",//灰色贴图 大
          data_name: "texture_disabled_big",
          loader: "TextureLoader"
        },
        {
          name: "fgrey_small.jpg",//灰色贴图 小
          data_name: "texture_disabled_small",
          loader: "TextureLoader"
        },
        {
          name: "heatmap_view_type.png",//灰色贴图 小
          data_name: "threeD_chose_menu_texture",
          loader: "TextureLoader"
        }
      ]
    },
    // Loadover:{
    //   get(){
    //     return this.loadMTL.length * 2 + this.loadJPG.length;//乘以2是因为正好每个MTL都只有一个children
    //   },
    //   set(val){
    //
    //   }
    // },
    is_show_safe() {//是否显示安防视图
      return this.$store.state.DouleRowCabinet && this.$store.state.DouleRowCabinet.SecurityView
    },
    is_show_temp() {//是否显示温度云图
      return this.$store.state.DouleRowCabinet && this.$store.state.DouleRowCabinet.TempCloudChart
    },
    is_show_u() {//是否显示U位
      return this.$store.state.DouleRowCabinet && this.$store.state.DouleRowCabinet.CapacityManage
    },
    is_show_pd() {//是否显示配电
      return this.$store.state.DouleRowCabinet && this.$store.state.DouleRowCabinet.CapacityManage
    },
    is_show_cold() {//是否显示制冷
      return this.$store.state.DouleRowCabinet && this.$store.state.DouleRowCabinet.CapacityManage
    },
    threeD_switch_menu() {
      return [
        {id: "cabinet_3d", isShow: true, viewFlag: 4, selectClass: "cabinet_3d_select", title: "3D视图"},
        {id: "cabinet_safe", isShow: this.is_show_safe, viewFlag: 3, selectClass: "cabinet_safe_select", title: "安防视图"},
        {id: "cabinet_temp", isShow: this.is_show_temp, viewFlag: 1, selectClass: "cabinet_temp_select", title: "温度云图"},
        {
          id: "cabinet_temp_column",
          isShow: true,
          viewFlag: 6,
          selectClass: "cabinet_temp_column_select",
          title: "温度柱图"
        },
        {id: "cabinet_u", isShow: this.is_show_u, viewFlag: 2, type: 1, selectClass: "cabinet_u_select", title: "U位云图"},
        {
          id: "cabinet_pd",
          isShow: this.is_show_pd,
          viewFlag: 2,
          type: 2,
          selectClass: "cabinet_pd_select",
          title: "配电视图"
        },
        {
          id: "cabinet_cold",
          isShow: this.is_show_cold,
          viewFlag: 2,
          type: 3,
          selectClass: "cabinet_cold_select",
          title: "制冷视图"
        }
      ]
    },
    is_qt() {
      return typeof qt != "undefined"
    },
    threeD_chose_menu() {
      if (this.viewFlag === 1) {
        return this.heatmap_dev_menu
      } else if (this.viewFlag === 6) {
        return this.temp_menu
      } else {
        return []
      }
    },
    isShowSwitchMenu() {
      return this.LCD === 0 || !this.is_qt
      // return true
    },
    /**
     * 有点击的视图
     * @returns {{"1": string, "3": string, "4": string}}
     */
    viewFlagAndModelName() {
      return {
        1: this.cabinetTemp_,
        3: this.cameraDev_,
        // 4: this.cabinet_
      }
    },
    /**
     * 当前需要判断所点击的模型名字
     * @returns {*}
     */
    theOneObj() {
      return this.viewFlagAndModelName[this.viewFlag]
    }
  },
  methods: {
    showChange: function (data) {//子组件调用 修改父组件showFlag
      this.showFlag = data
    },
    main_normal_close: function () {//关闭详细信息弹窗
      clearInterval(this.mainD_cabinet_timer)
      this.mainD_cabinet_timer = null
    },
    camera_dev_message_message() {//摄像头设备详细信息
      var param = this.pop_camera_dev
      this.video_dev_type = param.dev_type
      this.video_dev_index = param.dev_index
      if (this.$refs.myVideo) {
        this.$refs.myVideo.get_specific_map_info(param.dev_type, param.dev_index)
      }
      popWin("showVideo")
    },
    MtextureLoad: function (myurl) {
      var VM = this
      return new THREE.TextureLoader().load("/static/models/" + myurl, function () {
        VM.Loadover--
      })
    },
    render_setSize: function () {//缩放
      var VM = this
      this.$nextTick(function () {
        VM.render_setSize1()
      })
    },
    clearRenderer: function () {
      var VM = this
      var renderer = VM.renderer
      if (renderer) {
        renderer.dispose()
        renderer.forceContextLoss()
        renderer.context = null
        renderer.domElement = null
        renderer.clear()//清除场景
        VM.renderer = null
      }


    },
    /**
     * 清空当前obj对象的缓存
     * @param group object3D对象或mesh对象
     * */
    clearCache: function (group) {
      if (!group || !group.traverse) {
        return
      }
      // 删除掉所有的模型组内的mesh
      group.traverse(function (item) {
        if (item instanceof THREE.Mesh) {
          item.geometry.dispose() // 删除几何体
          if (Array.isArray(item.material)) {
            item.material.forEach(function (item) {
              item.dispose()
            })
          } else {
            item.material.dispose() // 删除材质
          }

        }
      })
      this.scene.remove(group)
    },
    //原来写在外面的方法
    threeD_alarm_ajax: function () {//模型数据交互
      var VM = this
      if (!VM.activatedBoo || !isUpdate) {//需要先判断一些isUpdate是不是存在
        return
      }
      VM.$axios({
        method: "post",
        data: {type: VM.viewFlag},//接口优化，针对不同模块传入不同的值，/*1:温度云图2：容量云图3：安防视图4：3D视图5：微型，小型模块 6: 容量柱图*/
        timeout: 4000,
        url: "/home.cgi/get_cabinet_list"
      })
        .then(function (data) {
          // data.diff = 1;
          if (Object.prototype.toString.call(data) !== "[object Object]") {//timeout也会进这里
            return
          }
          VM.current_flag++
          VM.Dataobj = []
          VM.Nameobj = []
          VM.NewNameobj = []
          if (VM.Timeinterval_3d) {
            clearTimeout(VM.Timeinterval_3d)
          }
          VM.Timeinterval_3d = null
          VM.animationFlag = 0
          if (!ifNullData(data) && !ifNullData(data.data) && !ifNullData(data.data.list)) {//机柜数据不为空
            // data.diff = 0;
            if (!VM.isRender) {//渲染中
              return
            }
            //以单排16为最低值，初始视角70，增加机柜之后相应比例减小视角
            if (VM.viewFlag !== 5 && data.data.list.length / 2 > VM.cabinetMax) {//剔除 微型，小型模块 单排超过16个需要重新设置视觉大小 3D模型中这个长度一定为双数
              VM.FocalLength = VM.oldFocalLength - (VM.FocalPer * ((data.data.list.length / 2) - VM.cabinetMax))
            }
            if (VM.cube.length === 0) {//机柜没有创建
              VM.isRender = false
              VM.vH = []
              VM.cubeArry = []
              VM.render_dispose()//清除缓存
              VM.threeD_alarm_ajaxData(data.data)//处理数据
              VM.threeD_main()//三维模型初始化
              VM.cubeArry_old = data.data.list
              setTimeout(function () {
                //if(VM.renderer){
                //  VM.renderer.clear();//清除场景
                //  VM.render_render();
                //  VM.isRender = true;
                //}
                VM.isRender = true
              }, 2000)
              VM.isRender = true
            } else if (data.data.list.length === VM.cubeArry_old.length) {//机柜数量不变
              if (data.diff === 1) {//数值不同时
                VM.threeD_alarm_ajaxData(data.data)//处理数据
                VM.animation("threeD_alarm_ajax")//动画
              } else if (data.diff === 0 && VM.Loadover === 0) {//数值不变动+加载结束
                //if(VM.cube[0].material.needsUpdate==true){
                //  VM.no_animation();//不更新材质
                //}
              }
            } else {//机柜数量变动--重新渲染
              if (VM.LCD === 1) {
                clearInterval(VM.mainThreeI)
                save_popready(0, "机柜数量发生变化，需重新登录", function () {
                  VM.goto_login()
                })
                return
              }
              VM.webglcontextlost()
              VM.webglcontextrestored()
            }
          } else {//没有机柜
            if (VM.cubeArry_old.length !== 0) {//之前存在机柜
              VM.webglcontextlost()
              VM.webglcontextrestored(0)
            }
            VM.isLoading = false
          }
          VM.refreshF = 0
        })
    },
    threeD_alarm_ajaxData: function (returnData) {//处理机柜数据，渲染顺序，根据返回机柜list顺序，单数在后面，双数在前面，一前一后
      var VM = this
      VM.IS_Alarm = 0
      var position_limit = 5
      VM.temp_camera_list = returnData.pos_list || []
      // var min_hot = VM.get_min_max_data(returnData.list, VM.key_hot, VM.key_way_hot)
      // var min_cold = VM.get_min_max_data(returnData.list, VM.key_cold, VM.key_way_cold)
      // var max_hot = VM.get_min_max_data(returnData.list, VM.key_hot, VM.key_way_hot, true)//获取当前所有数据的最大值
      // var max_cold = VM.get_min_max_data(returnData.list, VM.key_cold, VM.key_way_cold, true)//获取当前所有数据的最大值

      // VM.temp_default[VM.key_hot] = !ifNullData(min_hot) ? min_hot : 22;//根据返回值设置最小值，如果没有返回值，需要重新设置为默认的
      // VM.temp_default[VM.key_cold] = !ifNullData(min_cold) ? min_cold : 18;//根据返回值设置最小值，如果没有返回值，需要重新设置为默认的
      // VM.all_max_hot = !ifNullData(max_hot) && max_hot > 22 ? max_hot : 22;//根据返回值设置最小值，如果没有返回值，需要重新设置为默认的
      // VM.all_max_cold = !ifNullData(max_cold) && max_cold > 18 ? max_cold : 18;//根据返回值设置最小值，如果没有返回值，需要重新设置为默认的

      var is_width_change = false

      $.each(returnData.list, function (key, value) {
        var numb = Number(value.box_index) - 1//顺序
        if (is_width_change) {
          return false
        }
        if (!ifNullData(VM.cubeArry_old) && VM.cubeArry_old[numb].width !== value.width) {//判断某个机柜宽度是否发生了变化
          is_width_change = true
          VM.webglcontextlost()
          VM.webglcontextrestored()
          return false
        }
        if (!VM.cubeArry[numb]) {
          VM.cubeArry[numb] = {}
        }
        VM.cubeArry[numb]["is_alarm"] = value.is_alarm//告警等级--判断机柜是否异常,1告警，0正常
        VM.cubeArry[numb]["alarm"] = value.alarm_level//告警等级--判断机柜是否异常
        VM.cubeArry[numb]["name"] = dataValidation(value.name_f)//名称
        VM.cubeArry[numb]["type"] = value.type_f//类型
        VM.cubeArry[numb]["width"] = value.width//宽度
        VM.cubeArry[numb]["index"] = value.dev_index//id
        VM.cubeArry[numb]["box_index"] = value.box_index//id

        if (!VM.is_qt) {
          VM.cubeArry[numb][VM.key_way_cold] = VM.complete_tem_data(value.cold_passageway, position_limit, VM.key_cold, numb);//冷通道
          VM.cubeArry[numb][VM.key_way_hot] = VM.complete_tem_data(value.hot_passageway, position_limit, VM.key_hot, numb);//热通道
          // VM.cubeArry[numb][VM.key_way_cold] = value.cold_passageway || [];//冷通道
          // VM.cubeArry[numb][VM.key_way_hot] = value.hot_passageway|| [];//热通道

          // VM.cubeArry[numb]['pdc_rate'] = value.pdc_rate || (Math.random() * 100).toFixed(0);//使用率
          // VM.cubeArry[numb]['cooling_rate'] = value.cooling_rate || (Math.random() * 100).toFixed(0);//使用率
          // VM.cubeArry[numb]['u_rate'] = value.u_rate || (Math.random() * 100).toFixed(0);//U位
          VM.cubeArry[numb]['pdc_rate'] = value.pdc_rate;//配电
          VM.cubeArry[numb]['cooling_rate'] = value.cooling_rate;//制冷
          VM.cubeArry[numb]['u_rate'] = value.u_rate;//u位

          // VM.cubeArry[numb]['temp_cold'] = value.temp_cold || (Math.random() * 100).toFixed(0);//温度柱图的冷通道温度
          // VM.cubeArry[numb]['temp_hot'] = value.temp_hot || (Math.random() * 100).toFixed(0);//温度柱图的冷通道温度
          VM.cubeArry[numb]['temp_cold'] = value.temp_cold;//温度柱图的热通道温度
          VM.cubeArry[numb]['temp_hot'] = value.temp_hot;//温度柱图的热通道温度
          // VM.cubeArry[numb]['temp_hot'] = 100;//温度柱图的热通道温度
          // VM.cubeArry[numb]['temp_hot'] = 3;//温度柱图的热通道温度

          if (!VM.cubeArry[numb]['old_pdc_rate']) {//注意 此处的命名要使用 old_ 加上原来属性名字，否则下面第二次渲染时值的判断会出错
            VM.cubeArry[numb]['old_pdc_rate'] = value.pdc_rate;//使用率
            VM.has_old_pdc_rate_set = true;
          }
          if (!VM.cubeArry[numb]['old_cooling_rate']) {
            VM.cubeArry[numb]['old_cooling_rate'] = value.cooling_rate;//使用率
            VM.has_old_cooling_rate_set = true;
          }
          if (!VM.cubeArry[numb]['old_u_rate']) {
            VM.cubeArry[numb]['old_u_rate'] = value.u_rate;//U位
            VM.has_old_u_rate = true;
          }
        }
        //处理一下数据,如果没有冷热通道数据的话自动补全, 当前5个位置
        if (value.type_f == 106) {//机柜
          if (/^(-)?\d+(\.\d+)?$/.test(value.it_load)) {
            var data_load = Number(value.it_load);
            if (data_load >= 0 && data_load <= 100) {
              VM.cubeArry[numb]['z'] = data_load;//it负载率
            } else if (data_load < 0) {
              VM.cubeArry[numb]['z'] = 0;
            } else if (data_load > 100) {
              VM.cubeArry[numb]['z'] = 100;
            }
          } else {
            VM.cubeArry[numb]['z'] = 0;
          }
        } else {
          VM.cubeArry[numb]['z'] = 100;
        }
        if (value.alarm_level != -1 && !ifNullData(value.alarm_level)) {//异常
          VM.IS_Alarm++;
        }
        if (VM.Allmax_over.length != returnData.length) {
          VM.Allmax_over.push(0)
        }
      });
    },
    complete_tem_data: function (passageway, position_limit, way, numb) {
      var VM = this;
      var per = VM.temp_default[way];
      var posi_obj_demo = {"position": 1, "temp": per};
      var position_arr = [];//位置列表
      var postion_judge_obj = {
        1: [2],
        2: [1, 3],
        3: [2, 4],
        4: [3, 5],
        5: [4],
      };//需要判断的位置相应对象
      for (let i = 1; i <= position_limit; i++) {
        position_arr.push(i)
      }
      // if (VM.viewFlag === 1 && numb === 1){
      //   passageway = [
      //     {
      //       position: 1,
      //       temp: 23.6
      //     },
      //     {
      //       position: 3,
      //       temp: 23.6
      //     },
      //     {
      //       position: 5,
      //       temp: 23.6
      //     },
      //   ];
      //   // if (numb === 1){
      //   //   passageway[2].temp = 50
      //   // }
      // }
      if (ifNullData(passageway)) {//如果没有通道温度数据
        passageway = [];
        for (let j = 1; j <= position_limit; j++) {
          var new_posi_obj = JSON.parse(JSON.stringify(posi_obj_demo));
          new_posi_obj.position = j;
          passageway.push(new_posi_obj)
        }
      } else if (passageway.length < position_limit) {//如果只有一部分通道温度数据
        var flag = true;//是否需要计算平均值
        if (passageway.length === 1 && passageway[0].temp >= 30) {//整个机柜只有一个且超过30度，整列机柜都变红
          flag = false;
          posi_obj_demo.temp = passageway[0].temp;
        }
        for (let k = passageway.length - 1; k >= 0; k--) {
          if (passageway[k].temp_alarm === 1) {// 温湿度异常就不用这条数据了
            passageway.splice(k, 1);
            continue
          }
          var pos_index = position_arr.indexOf(passageway[k].position);
          passageway[k].baseroot = true;//代表最原始的数据
          if (pos_index !== -1) {
            position_arr.splice(pos_index, 1)
          }
        }
        for (let m = 0; m < position_arr.length; m++) {
          var new_posi_obj1 = JSON.parse(JSON.stringify(posi_obj_demo));
          var myPosition = position_arr[m];
          var pos_arr = postion_judge_obj[myPosition];//需要对比的位置
          if (flag) {
            VM.filter_temp_data_fun(new_posi_obj1, per, passageway, pos_arr);
          }
          new_posi_obj1.position = myPosition;
          passageway.push(new_posi_obj1)
        }
      }
      //存入一些机柜信息
      passageway.forEach((item) => {
        item.numb = numb
        item.way = way
      })
      VM.sort_fun(passageway, "position")
      return passageway
    },
    /*
    * 位置1如果没有值,判断位置2的是否有温度来进行计算平均值，如果没有，那就是默认值
    * 位置2如果没有值，判断位置1和位置3是否都有值，都有直接用两者平均值，如果只有一个，另一个取平均值，如果都没有，那就时默认值
    * 位置3如果没有值，判断位置2和位置4是否都有值，判断方法与位置2一致
    * 位置4如果没有值，判断位置3和位置5是否都有值，判断方法与位置2一致
    * 位置5如果没有值,判断位置4的是否有温度来进行计算平均值，如果没有，那就是默认值
    * */
    filter_temp_data_fun(new_posi_obj, per, passageway, pos_arr) {
      var the_twins = passageway.filter(item => pos_arr.indexOf(item.position) >= 0)
      if (the_twins.length === 1) {
        new_posi_obj.temp = (Number(the_twins[0].temp) + per) / 2
      } else if (the_twins.length >= 2) {//防止后台出现位置重复问题，导致处理不生效，例如有两个位置1的
        new_posi_obj.temp = (Number(the_twins[0].temp) + Number(the_twins[1].temp)) / 2
      }
    },
    ThreeDinterval: function () {//设置定时器，实时刷新数据
      var VM = this
      VM.isLoading = true//进度gif
      VM.TD_sure_demo = null
      console.time("alltime")
      if (VM.isWebGl) {//非-B液晶屏  判断是否兼容three.js
        clearInterval(this.mainThreeI)
        VM.current_flag = 0
        this.threeD_alarm_ajax()
        VM.mainThreeI = setInterval(function () {
          if (VM.refreshF === 0) {
            VM.threeD_alarm_ajax()
          }
        }, 5000);
        // VM.obj_action();
      }
    },
    threeD_main: function () {//三维模型初始化
      var VM = this;
      if (VM.LCD === 1) {//1液晶屏,0是PC端//液晶屏上展示pc端代码--大屏展示:放大2倍，缩小0.5倍
        VM.canvasScal = 2;
        VM.Dwidth = VM.canvasScal * $("#main_model").width();
        VM.Dheight = VM.canvasScal * $("#main_model").height();
      }
      VM.initThree();//渲染器
      VM.initScene();//场景
      VM.initCamera();//摄像机
      VM.initLight();//光源
      VM.initModel();//导入模型
      // VM.initMouseClick();// 监听鼠标点击事件
      if (VM.LCD === 0) {
        // VM.initStats();//显示帧率
      }
      // window.addEventListener("resize", VM.onWindowResize, false)
    },
    initThree: function () {//渲染器
      var VM = this;
      VM.renderer = new THREE.WebGLRenderer({
        antialias: true, alpha: true,//抗锯齿效果 底色透明
        shadowMap: true,//它包含阴影贴图的引用
        setPixelRatio: window.devicePixelRatio//设置设备像素比。通常用于避免HiDPI设备上绘图模糊
      })
      VM.renderer.setSize(VM.Dwidth, VM.Dheight)//设置渲染器大小
      VM.renderer.sortObjects = false// //是否排列对象 默认是true
      VM.renderer.shadowMap.enabled = true//阴影是否启用
      VM.renderer.shadowMapSoft = true//阴影柔化
      VM.renderer.shadowMap.type = THREE.PCFSoftShadowMap//阴影类型
      $("#main_model").find("canvas").remove()//清空canvas对象
      document.getElementById("main_model") && document.getElementById("main_model").appendChild(VM.renderer.domElement)//添加canvas对象
      VM.renderer.setClearColor(0xFFFFFF, 0.0)//设置清除样色
      VM.renderer.localClippingEnabled = true//剪裁平面是否启用 空间中与平面的符号距离为负的点被剪裁（未渲染）
      VM.renderer.domElement.addEventListener("mousedown", VM.onDocumentMouseDown, false)
      VM.renderer.domElement.addEventListener("mouseup", VM.onDocumentMouseup, false)
      VM.renderer.domElement.addEventListener("touchstart", VM.onDocumentMouseDown, false)
      VM.renderer.domElement.addEventListener("touchend", VM.onDocumentMouseup, false)
      VM.renderer.domElement.addEventListener("mousemove", VM.onDocumentMove, false)
      VM.renderer.domElement.addEventListener("webglcontextlost", VM.webglcontextlost, false)//上下文丢失--停止循环，等待恢复
      VM.renderer.domElement.addEventListener("webglcontextrestored", VM.webglcontextrestored, false)//上下文恢复--重新渲染
    },
    webglcontextlost: function () {//上下文丢失--停止循环，等待恢复
      var VM = this;
      clearTimeout(VM.Timeinterval_3d);
      VM.refreshF = 1;
    },
    webglcontextrestored: function (flag) {//上下文恢复--重新渲染
      var VM = this;
      if (VM.renderer) {
        VM.renderer.domElement.removeEventListener("mousedown", VM.onDocumentMouseDown, false)
        VM.renderer.domElement.removeEventListener("mouseup", VM.onDocumentMouseup, false)
        VM.renderer.domElement.removeEventListener("touchstart", VM.onDocumentMouseDown, false)
        VM.renderer.domElement.removeEventListener("touchend", VM.onDocumentMouseup, false)
        VM.renderer.domElement.removeEventListener("mousemove", VM.onDocumentMove, false)
        VM.renderer.domElement.removeEventListener("mousemove", VM.onDocumentMove, false)
        VM.renderer.domElement.removeEventListener("webglcontextlost", VM.webglcontextlost, false)
        VM.renderer.domElement.removeEventListener("webglcontextrestored", VM.webglcontextrestored, false)
        VM.render_dispose()//解除绑定
      }
      ie_CollectGarbage();
      VM.isLoading = true;
      if (flag != 0) {
        this.threeD_alarm_ajax();
      }
    },
    initScene: function () {
      var VM = this;
      if (ifNullData(VM.scene)) {
        VM.scene = new THREE.Scene();
        // VM.scene.fog=new THREE.Fog(0xffffff,1,10000)
      }
      //坐标辅助线
      var axes = new THREE.AxesHelper(800);
      // VM.scene.add(axes);
      // VM.clock = new THREE.Clock();
    },
    initCamera: function () {//摄像机
      var VM = this
      VM.CAMERA = new THREE.PerspectiveCamera(45, VM.Dwidth / VM.Dheight, 1, 10000)
      VM.CAMERA.position.set(VM.reset_position.x, VM.reset_position.y, VM.reset_position.z)
      if (VM.LCD === 0 || !VM.is_qt) {//不是QT
        VM.CONTROLS = new OrbitControls(VM.CAMERA, VM.renderer.domElement)
        VM.CONTROLS.addEventListener("change", VM.OrbitControlsChange)
        VM.CONTROLS.maxPolarAngle = Math.PI * 0.5//半圆
        VM.CONTROLS.target = new THREE.Vector3(VM.reset_camera.x, VM.reset_camera.y, VM.reset_camera.z)//视角，与相机视角一致，必须先设置视角在相机设置视角之前
        VM.CONTROLS.minDistance = 1000//相机向内移动多少
        VM.CONTROLS.maxDistance = 3500//相机向外移动多少
        VM.CONTROLS.autoRotate = false//自动旋转开关，以自动围绕目标旋转
        // VM.CONTROLS.autoRotateSpeed = 4;//自动旋转开关，以自动围绕目标旋转
        VM.CONTROLS.rotateSpeed = 0.15//旋转速度，鼠标左键
        VM.CONTROLS.enableDamping = true//使动画循环使用时阻尼或自转 意思是否有惯性
        VM.CONTROLS.dampingFactor = 0.2//阻尼惯性有多大 意思是鼠标拖拽旋转灵敏度
        VM.CONTROLS.enableKeys = false//是否打开支持键盘方向键操作
        VM.CONTROLS.enablePan = false//启用或禁用摄像机平移，默认为true。防止键盘ctrl控制
        VM.CONTROLS.update()
        VM.CONTROLS.saveState()//保存初始状态，不然reset()会回不到之前的位置;
        VM.CONTROLS.mouseButtons = {
          LEFT: THREE.MOUSE.LEFT,
          MIDDLE: THREE.MOUSE.MIDDLE,
          // RIGHT: VM.LCD === 0 ? THREE.MOUSE.RIGHT : null,//液晶屏禁用右键
          RIGHT: null//禁用右键
        }
      }
      VM.CAMERA.lookAt(new THREE.Vector3(VM.reset_camera.x, VM.reset_camera.y, VM.reset_camera.z))//VM.scene.position
      VM.CAMERA.setFocalLength(VM.FocalLength)
      VM.CAMERA.updateMatrixWorld(true)
    },
    initLight: function () {//光源
      var VM = this
      let viewFlag2_6 = VM.viewFlag === 2 || VM.viewFlag === 6
      // VM.scene.add(new THREE.AmbientLight((VM.viewFlag === 2 || VM.viewFlag === 6 ? 0x555555: 0x808080), VM.LCD === 0 ? (VM.viewFlag === 1 ? (VM.viewFlag === 2 ? 3: 3): 3) : 3)); //环境光
      VM.scene.add(new THREE.AmbientLight((viewFlag2_6 ? 0x555555 : 0x808080), viewFlag2_6 ? 3 : 3)) //环境光

      var color = 0xffffff
      var intensity = (viewFlag2_6 ? 0.2 : 0.3)
      var distance = 8000
      var angle = Math.PI / 2
      var exponent = 0.75
      var decay = 1

      var spotLight1 = new THREE.SpotLight(color, intensity, distance, angle, exponent, decay);
      spotLight1.position.set(0, 1000, -1000);
      spotLight1.shadow.camera.near = 2;
      spotLight1.shadow.camera.far = 1000;
      spotLight1.shadow.camera.fov = 30;
      // spotLight1.distance = 10000;
      spotLight1.shadowDarkness = 1;
      spotLight1.target.position.set(0, 0, 0);
      // spotLight1.shadow.mapSize.width = 1024;
      // spotLight1.shadow.mapSize.height = 1024;
      spotLight1.castShadow = true;
      VM.spotLight1 = spotLight1;
      VM.scene.add(spotLight1);

      var spotLight2 = new THREE.SpotLight(color, intensity, distance, angle, exponent, decay);
      spotLight2.position.set(0, 1000, 1000);
      spotLight2.shadow.camera.near = 2;
      spotLight2.shadow.camera.far = 1000;
      spotLight2.shadow.camera.fov = 30;
      // spotLight2.distance = 10000;
      spotLight2.shadowDarkness = 1;
      spotLight2.target.position.set(0, 0, 0);
      // spotLight2.shadow.mapSize.width = 1024;
      // spotLight2.shadow.mapSize.height = 1024;
      spotLight2.castShadow = true;
      VM.spotLight2 = spotLight2;
      VM.scene.add(spotLight2);

      if (VM.LCD === 0) {//PC多打一盏灯
        var spotLight3 = new THREE.SpotLight(color, intensity, distance, angle, exponent, decay);
        spotLight3.position.set(1000, -1000, 1000);
        spotLight3.shadow.camera.near = 2;
        spotLight3.shadow.camera.far = 1000;
        spotLight3.shadow.camera.fov = 30;
        // spotLight3.distance = 10000;
        spotLight3.shadowDarkness = 1;
        spotLight3.target.position.set(0, 0, 0);
        // spotLight3.shadow.mapSize.width = 1024;
        // spotLight3.shadow.mapSize.height = 1024;
        spotLight3.castShadow = true;
        VM.spotLight3 = spotLight3;
        VM.scene.add(spotLight3);
      }

      //这里不能用循环，液晶屏性能有问题
      // VM.spotLight_list.forEach((light, index) => {
      //   var spotLight = new THREE.SpotLight(color, intensity, distance, angle, exponent, decay);
      //   spotLight.position.set(light.x, light.y, light.z);
      //   spotLight.shadow.camera.near = 2;
      //   spotLight.shadow.camera.far = 1000;
      //   spotLight.shadow.camera.fov = 30;
      //   // spotLight.distance = 10000;
      //   spotLight.shadowDarkness = 1;
      //   spotLight.target.position.set(0, 0, 0);
      //   // spotLight.shadow.mapSize.width = 1024;
      //   // spotLight.shadow.mapSize.height = 1024;
      //   spotLight.castShadow = true;
      //   VM['spotLight' + index] = spotLight;
      //   VM.scene.add(spotLight);
      // });
    },
    initStats: function () {
      var VM = this;
      var stats = new Stats();
      //设置统计模式
      stats.setMode(0); // 0: fps, 1: ms
      //统计信息显示在左上角
      stats.domElement.style.position = 'absolute';
      stats.domElement.style.left = '0px';
      stats.domElement.style.top = '0px';
      //将统计对象添加到对应的<div>元素中
      if (document.getElementById("Stats_output")) {
        document.getElementById("Stats_output").appendChild(stats.domElement);
        VM.STATS = stats;
      }
    },
    render_render: function (flag) {
      // console.log(flag);
      var VM = this;
      if (VM.STATS) {
        VM.STATS.update();
      }
      // VM.renderRaycasterObj();
      if (VM.renderer) {
        VM.renderer.render(VM.scene, VM.CAMERA);
      }
      this.isControlsChange = false;
    },
    cal_model_length_unit: function (data) {
      var VM = this;
      var width = data.width;
      var airL = 34, cabL = 64, half_L = 0;//空调柜宽度  机柜宽度
      if (width == 1) { //0 全柜  1 半柜
        half_L = airL / 2;
      } else {
        half_L = cabL / 2;
      }
      return half_L;
    },
    cal_model_length: function (i) {
      var VM = this;
      var half_L = 0;
      if (i >= 2) {//计算当前位置，机柜距左边的距离，从0开始，0距左边的距离是0
        half_L += VM.cal_model_length_unit(VM.cubeArry[i - 2]);//0 2
        half_L += VM.cal_model_length_unit(VM.cubeArry[i]);//2 4
      }
      return half_L;
    },
    initModel: function () {//导入模型
      var VM = this;
      VM.objGroup = new THREE.Group();//成组
      VM.half_ll = VM.cal_model_length_unit(VM.cubeArry[0]);//前门
      VM.half_rr = VM.cal_model_length_unit(VM.cubeArry[VM.cubeArry.length - 1]);//后门
      VM.loadOtherView(true);// 先计算一次温度云图，不然位置会有重叠错位
      // VM.loadNormalCabinet();
      // VM.loadDoorFront();
      // VM.loadDoorBack();
      // VM.loadCabinetAir();
      VM.preLoadNormalCabinet();
      VM.preLoadDoorFront();
      VM.preLoadDoorBack();
      VM.preLoadCabinetAir();
    },
    /*
      * 在透明视图下针对不同的模型显示透明都不同
      * */
    changeMaterial(oo) {
      var VM = this;
      if (!VM.isTransparent) {
        return
      }
      let setAttr = function (material) {
        material.transparent = true
        material.opacity = (VM.viewFlag === 1 ? 0.5 : 0.1)
        material.blendDstAlpha = (VM.viewFlag === 1 ? 0.5 : 0.1)
        material.side = THREE.DoubleSide
        material.color.setHex(VM.viewFlag === 1 ? 0x8c9bbd : 0x9397bb)
      }
      let opacity = 0.1
      let blendDstAlpha = 0.1
      let color = 0x9397bb
      if (VM.viewFlag === 1) {
        opacity = 0.1
        blendDstAlpha = 0.1
        color = 0x8c9bbd
      }
      if (VM.LCD === 1) {
        opacity = 0.1
        blendDstAlpha = 0.1
        color = 0x2b4e66
        if (VM.viewFlag === 1) {
          opacity = 0.1
          blendDstAlpha = 0.1
          color = 0x2b4e66
        }
      }
      oo.traverse(function (child) {
        if (child instanceof THREE.Mesh) {//给模型设置一部分材质，加透明度
          // if (Array.isArray(child.material)){
          //   child.material.forEach(function (item,index) {
          //     setAttr(item);
          //   });
          // } else{
          //   setAttr(child.material);
          // }

          child.material = new THREE.MeshPhongMaterial({
            transparent: true,
            opacity: opacity,
            blendDstAlpha: blendDstAlpha,
            side: THREE.DoubleSide,
            color: color
          })
          // child.material.visible = false
          // child.material.color.setHex(VM.viewFlag === 1 ? 0x8c9bbd :0x9397bb);
        }
      });
    },
    /*
    * 安防设备的透明度处理，给告警颜色
    * */
    changeDevMaterial(oo) {
      var VM = this;
      if (!VM.isTransparent) {
        return
      }
      let setAttr = function (material) {
        material.opacity = 1;
        material.side = THREE.DoubleSide;
        material.color.setHex(0x9D0000);
      };
      oo.traverse(function (child) {
        if (child instanceof THREE.Mesh) {//给模型设置一部分材质，加透明度
          // if (Array.isArray(child.material)){
          //   child.material.forEach(function (item,index) {
          //     setAttr(item);
          //   });
          // } else{
          //   setAttr(child.material);
          // }
          child.material = new THREE.MeshPhongMaterial({
            //transparent:true,
            opacity: 1,
            side: THREE.DoubleSide,
            color: 0x9D0000
          });
          // child.material.color.setHex(0x9D0000);
        }
      });
    },
    /*
    * 设备材料显示处理，一些logo，前门后门门框
    * */
    changeDevMaterialOpacity(oo, name, condition_obj) {
      var VM = this;
      var flag = true;
      var name_material = oo.getObjectByName(name);
      $.each(condition_obj, (key, value) => {
        if (VM[key] !== value) {
          flag = false;
          return false
        }
      });
      if (name_material && flag) {
        // name_material.material.opacity = 0
        name_material.visible = false
      }
    },
    /*
    * 设置加载模型的mesh对象属性
    * oo:目标对象
    * attr_arr: 需要设置的属性列表
    * val_arr: 需要设置的值列表
    * */
    setObjMeshAttr(oo, attr_arr, val_arr) {
      var mesh_arr = oo.children;
      $.each(mesh_arr, (index, mesh) => {
        $.each(attr_arr, (key, attr) => {
          mesh[attr] = val_arr[key];
        })
      })
    },
    /*计算十个位置 ，单个机柜长度按照比例计算，单个机柜宽度为64（已固定的值），单个机柜比例为三等分，前中后，单边长度为120，总长就为360,这是固定值
    * 规则
    * x：1-5 在最左边，6-10 在最右边
    * y：全部一个高度,为280,这是固定值 this.objHeight
    * z: 1,6 负的一半单对机柜长度；5，10 一半单对机柜长度；2，7，负的单对机柜长度的6分之一；4，9，单对机柜长度的6分之一，3，8，位置为0，根据实际情况会对位置进行微调
    * */
    cal_dev_camera_position: function (objLengh, half_rr, position) {
      var pos_obj = {x: 0, y: 0, z: 0};
      var half_length = objLengh / 2 + half_rr - 9;
      var sigle_length = this.objSingleLength * 3;//单个机柜的长度
      //一个一个计算，
      /*x*/
      if (position <= 5) {
        pos_obj.x = -half_length;
      } else {
        pos_obj.x = half_length;
      }
      /*y*/
      pos_obj.y = this.objHeight - 5;
      /*z*/
      if (position == 1 || position == 6) {
        pos_obj.z = -sigle_length / 2 - 5;
      } else if (position == 5 || position == 10) {
        pos_obj.z = sigle_length / 2 + 5;
      } else if (position == 2 || position == 7) {
        pos_obj.z = -sigle_length / 6 + 5;
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
    cal_heatmap_position: function (position) {
      var VM = this;
      var width = VM.objLength + VM.objSingleWidth;//机柜的整体长度 // + VM.half_ll //这里删除了半个门的宽度，因为没加门
      var height = VM.objHeight + VM.objSmallHeight;//机柜的整体高度
      var littleWidth = -1;//z轴微调，防止贴太近闪烁, 现在只针对与 第一第三面
      var allWidth = VM.objSingleLength * 3;//乘3是因为左右各一排加上中间通道，宽度都是一样的
      var position_obj = {x: 0, y: height / 2, z: 0};
      switch (position) {
        case 1:
          position_obj.z = allWidth / 2 + littleWidth;
          break;
        case 2:
          // position_obj.z = allWidth / 6 + littleWidth;
          position_obj.z = allWidth / 6;
          break;
        case 3:
          // position_obj.z = -(allWidth / 6 + littleWidth);
          position_obj.z = -(allWidth / 6);
          break;
        case 4:
          position_obj.z = -(allWidth / 2 + littleWidth);
          break;
        case 5:
          // position_obj.x = -(width / 2) + littleWidth;
          position_obj.x = -(width / 2);
          position_obj.z = allWidth / 3;
          break;
        case 6:
          position_obj.y = height;
          position_obj.z = allWidth / 3;
          break;
        case 7:
          // position_obj.x = width / 2  - littleWidth;
          position_obj.x = width / 2;
          position_obj.z = allWidth / 3;
          break;
        case 8:
          // position_obj.x = -(width / 2) + littleWidth;
          position_obj.x = -(width / 2);
          break;
        case 9:
          position_obj.y = height;
          break;
        case 10:
          // position_obj.x = width / 2 - littleWidth;
          position_obj.x = width / 2;
          break;
        case 11:
          // position_obj.x = -(width / 2) + littleWidth;
          position_obj.x = -(width / 2);
          position_obj.z = -(allWidth / 3);
          break;
        case 12:
          position_obj.y = height;
          position_obj.z = -(allWidth / 3);
          break;
        case 13:
          // position_obj.x = width / 2 - littleWidth;
          position_obj.x = width / 2;
          position_obj.z = -(allWidth / 3);
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
    cal_heatmap_nine_position: function (mesh, position) {
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
    * height: 画布的高度，在1-4中为机柜的高度，三个平面为机柜的宽度 360
    * cabinet_num: 机柜的数量
    * position: 温湿度所处的位置，1上，2上中，3中，4中下，5下
    * index: 机柜在列表中的下标
    * k: 当前位置的下标
    * cur_index: 当前机柜下标在有数据的数组中的下标
    * */
    cal_heatmap_data_position(length, height, cabinet_num, data, index, k, cur_index) {
      var smile_per = 0;//微调
      if (index % 2 === 0) {//背面
        smile_per += 1
      }
      var all_data = {};
      data.temp = Number(data.temp);
      var position_obj = {
        x: 0,
        y: 0,
        value: data.temp,
        root: true,
        baseroot: data.baseroot,
        way: data.way,
        numb: data.numb
      };//root 代表他是中心点数据 baseroot 表示是最原始的数据，后台返回的
      var splitNum = 5;//y轴被分割的数量，即上下位置
      position_obj.x = Number(Number(length / cabinet_num * (index + smile_per)).toFixed(2));
      position_obj.y = Number(Number(height / splitNum * (data.position - 1 / 2)).toFixed(2));

      var limit_width = this.calc_cabinet_width(this.cubeArry[index]);
      var limit_height = Number(Number(height / splitNum).toFixed(2));//分成五分的单个高度

      /*随机数据
      * 每个测点的为一小格，一个机柜为5个小格，每个面1000个随机点进行计算显示，然后根据机柜数量来限制每一小格的数量  计算方式，每一小格的数据限制 = 1000 / (机柜的数量 / 2) / 5
      * */
      var pointss = [];
      var max = data.temp;
      // var dataLimit = Math.ceil(1000 / (this.cubeArry.length / 2) / 5);
      var dataLimit = this.randomNum;//先限制为40个
      // if(data.baseroot || data.temp > (this.temp_default[data.type] || 18)) {//只有是真实数据或者温度超过当前设定的默认值才需要创建随机点
      for (let i = 0; i < dataLimit; i++) {
        var val = Math.floor(this.randomCoe * data.temp);
        max = Math.max(max, val);
        var point = {
          x: Math.floor(Math.random() * limit_width + (limit_width * cur_index)),//x轴要根据当前机柜下标计算X轴位置
          y: Math.floor(Math.random() * limit_height + (limit_height * k)),//Y轴要根据当前位置的下标进行计算y轴位置
          // x:0,
          // y:0,
          value: val,
          way: data.way,
          numb: data.numb,
        };
        pointss.push(point);
      }
      // }
      all_data.max = max;
      all_data.position_arr = [position_obj, ...pointss];
      return all_data
    },

    /*
    * 计算热力图数值剩下九个的位置,坐标系定点为正面看位置 7、10、13为左上角，剩下的都为右上角 ，x轴箭头右，y轴箭头向下,注意，这里的x y 轴的值需要为数字，最好限制数字长度，不然渲染会有问题
    * x轴：单个总长度（固定值 120）/ 2
    * y轴：机柜的高度 (固定值 290,或者是整体机柜的长度 ) / 5（固定5个位置）* (position - 1/2)（添加设备时所选的位置，有1上，2上中，3中，4中下，5下,），得到中间位置
    * length: 单个总长度
    * height: 机柜的高度
    * position: 温湿度所处的位置，1上，2上中，3中，4中下，5下
    * arr_length: 数据的长度，用作Y轴分割
    * m: 当前第几面
    * k: 当前循环的下标
    * */
    cal_heatmap_nine_data_position(length, height, data, arr_length, m, k) {
      var all_data = {};
      var cal_width = 0;
      data.temp = Number(data.temp);
      var position_obj = {
        x: 0,
        y: 0,
        value: data.temp,
        root: true,
        baseroot: data.baseroot,
        way: data.way,
        numb: data.numb
      };//root 代表他是中心点数据 baseroot 表示是最原始的数据，后台返回的
      var limit_width = this.objSingleLength / 2;//固定宽度 120
      var limit_height = Number(Number(height / 5).toFixed(2));//分成五分的单个高度

      // position_obj.x = Number(Number(length / 2).toFixed(2));
      position_obj.y = Number(Number(height / (arr_length / 2) * (data.position - 1 / 2)).toFixed(2));//(arr_length / 2)是因为分别有冷热通道两组数据
      if ((m === 6 || m === 11 || m === 13) && data.type === this.key_hot) {//这三个原点与机柜冷热通道排列不同
        position_obj.x = Number(length);
        cal_width = limit_width; //如果是热通道，那把他们的x轴都往右挪一半的宽度
      }
      if ((m === 5 || m === 7 || m === 12) && data.type === this.key_cold) {//这三个的冷通道原始数据也需要挪位置
        position_obj.x = Number(length);
      }
      if ((m === 5 || m === 7 || m === 9 || m === 10 || m === 12) && data.type === this.key_cold) {
        cal_width = limit_width; //如果是冷通道，那把他们的x轴都往右挪一半的宽度
      }
      /*随机数据
      * 每个测点的为一小格，一排机柜为机柜的数量一半个小格，注意要根据机柜的宽度（半柜和全柜）来限制每一小格的高度，
      * 限制高度计算 当前data中的position为 第几排机柜，找到对应机柜的宽度就是限制，要根据下标来，
      * 然后根据机柜数量来限制每一小格的数量  计算方式，每一小格的数据限制为 40 个、
      * 机柜下标的计算 处理，因为两排机柜对应一定为同样的单双柜
      * m=6、9、12的时候整个高度为机柜的长度，当前的循环下标为机柜的下标，单个限制高度就为当前机柜的高度，区分全柜与半柜
      * 剩下的页面高度限制高度为机柜高度，直接等分成5份
      * 宽度计算 不同位置计算不同，冷热通道
      * */
      if (m === 6 || m === 9 || m === 12) {
        limit_height = this.calc_cabinet_width(this.cubeArry[data.position]);//根据每个机柜的全柜还是半柜来限制每一小格高度
      }
      var pointss = [];
      var max = data.temp;
      var dataLimit = this.randomNum;//如果点很多的话，其他几个面随机点减半
      // if(data.baseroot || data.temp > (this.temp_default[data.type] || 18)) {//只有是真实数据或者温度超过当前设定的默认值才需要创建随机点
      for (let i = 0; i < dataLimit; i++) {
        var val = Math.floor(this.randomCoe * data.temp);
        max = Math.max(max, val);
        var point = {
          x: Math.floor(Math.random() * limit_width + cal_width),
          y: Math.floor(Math.random() * limit_height + (limit_height * (data.position - 1))),
          // x:0,
          // y:0,
          value: val,
          way: data.way,
          numb: data.numb,
        };
        pointss.push(point);
      }
      // }
      var demo_point = {x: 0, y: 0, value: '900'}
      all_data.max = data.temp;
      all_data.position_arr = [position_obj, ...pointss];
      return all_data
    },
    /*
    * 计算获取指定的温度值
    * data_arr:需要筛选位置的数组
    * position:指定的位置
    * */
    cal_heatmap_one_position: function (data_arr, position) {
      return data_arr.filter((item, index) => {
        return item.position === position
      });
    },/*
    * 计算两个点的平均的温度值，要求两个数组长度一致，所筛选的位置一致
    * hot_arr:热通道数组
    * cold_arr:冷通道数组
    * flag: 是否需要特殊处理位置，针对于顶部三个位置，这三个位置初始position都为1，所以要处理一下数据
    * */
    cal_heatmap_ave_position: function (hot_arr, cold_arr, flag) {
      if (hot_arr.length !== cold_arr.length) {
        return cold_arr
      }
      var ave_data = [];
      for (let i = 0; i < hot_arr.length; i++) {
        var new_item = JSON.parse(JSON.stringify(hot_arr[i]));
        if (flag) {
          new_item.position = i + 1
        }
        new_item.temp = Number(new_item.temp + cold_arr[i].temp) / 2;
        ave_data.push(new_item);
      }
      ave_data.sort(function (a, b) {
        return a.position - b.position
      });
      return ave_data
    },
    /* 获取机柜单通道的数据
    * even: 奇数还是偶数 奇数：1, 偶数：0
    * way: 冷通道还是热通道 属性名字
    * flag: 是否需要特殊处理位置，针对于顶部三个位置
    * */
    cal_heatmap_one_way_data: function (even, way) {
      var VM = this;
      var one_way_data = [];
      for (var n = 0; n < VM.cubeArry.length; n++) {
        if (n % 2 === even) {
          one_way_data = [...one_way_data, ...VM.cubeArry[n][way]];
        }
      }
      return one_way_data;
    },
    /*
    * 设置当前是冷通道还是热通道的数据
    * data: 位置数据数组
    * type: 当前类型,冷通道或者热通道
    * */
    set_temp_data_type: function (data, type) {
      return data.map((item, index) => {
        item.type = type;
        return item
      })
    },
    initObject: function (movL) {
      var VM = this;
      var cube_maxH = 250, z_y = 120, cube_y, text_y, text_r, new_text_y, new_text_y2, new_text_y3;
      var localPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.8);//切割面
      var array_length = VM.cubeArry.length;
      for (var iNum = 0; iNum < array_length; iNum++) {
        var cubeMaterial = new THREE.MeshPhongMaterial({//正面及背面材质
          vertexColors: THREE.FaceColors,
          transparent: VM.isTransparent,//是否使用透明度，通过玻璃所看的柜子是否显示透明
          side: THREE.FrontSide,
          polygonOffset: true,//开启偏移
          polygonOffsetFactor: -0.2,//与相机距离减0.2
          clippingPlanes: [localPlane],//切割面
          ambient: 0xffffff,//材质的环境色
          emissive: 0x333333,//材质发光的颜色 ,缺省黑色
          specular: 0xffffff,//材质的光亮程度及其高光部分的颜色
          shininess: 30,//高光部分亮度 缺省30
          opacity: 0.1,
        });
        VM.cube[iNum].name = VM.cabinet_ + iNum;//根据这个名字计算了点击事件
        VM.cube[iNum].geometry = new THREE.Geometry().fromBufferGeometry(VM.cube[iNum].geometry);//BufferGeometry 装换为 Geometry
        VM.cube[iNum].material = cubeMaterial;
        VM.cube[iNum].is_alarm = VM.cubeArry[iNum].is_alarm;
        VM.cube[iNum].castShadow = true;
        VM.cube[iNum].receiveShadow = true;
        if (iNum % 2 == 0) {//偶数
          cube_y = 0 - z_y;
          text_y = cube_y - (113.3 / 2 + 5);
          text_r = Math.PI;
          new_text_y = text_y - 1;
          new_text_y2 = text_y - 2;
          new_text_y3 = text_y;
        } else {
          cube_y = z_y;
          text_y = cube_y + (113.3 / 2 + 5);
          text_r = 0;
          new_text_y = text_y + 1;
          new_text_y2 = text_y + 2;
          new_text_y3 = text_y;
        }
        //文字 设备名，当前只有感叹号
        VM.initTextName(VM.cubeArry[iNum].name, VM.cubeArry[iNum].is_alarm, iNum, 0, VM.cubeArry[iNum].alarm);
        var materialText = new THREE.MeshBasicMaterial({
          map: VM.Nameobj[iNum],//文字贴图
          side: THREE.DoubleSide,
          // side:THREE.FrontSide,
          fog: false
        });
        // var geometryText = new THREE.PlaneGeometry( 22, 22, 1, 1 );
        var geometryText = new THREE.CircleGeometry(20, 22);
        VM.mesh[iNum] = new THREE.Mesh(geometryText, materialText);
        VM.mesh[iNum].position.set(VM.cubeArry[iNum].x - movL, 330, text_y);
        VM.mesh[iNum].rotation.y = text_r;
        if (VM.cubeArry[iNum].is_alarm && (!VM.isTransparent && VM.viewFlag !== 1)) {//有告警才显示
          VM.scene.add(VM.mesh[iNum]);
        }
        // if(VM.LCD === 0){
        //处理一下机柜上面的文字信息
        VM.initCabinetName(VM.cubeArry[iNum].name, iNum);
        var materialText1 = new THREE.MeshBasicMaterial({
          map: VM.NewNameobj[iNum],//文字贴图
          // side:THREE.DoubleSide,
          side: THREE.FrontSide,
          transparent: true,//是否使用透明度
          fog: false,
        });
        var geometryText1 = new THREE.PlaneGeometry(VM.calc_cabinet_width(VM.cubeArry[iNum]), VM.objCabinetTopHeight);//这里的画布大小与  initCabinetName 中大小设置一致，取画布的中间部分
        VM.mesh1[iNum] = new THREE.Mesh(geometryText1, materialText1);
        VM.mesh1[iNum].name = VM.cabinetName_ + iNum;//根据这个名字计算了点击事件，不然事件无法响应
        VM.mesh1[iNum].position.set(VM.cubeArry[iNum].x - movL, VM.objHeight - 5, text_y);
        VM.mesh1[iNum].rotation.y = text_r;
        VM.mesh1[iNum].is_alarm = VM.cubeArry[iNum].is_alarm;
        VM.mesh1[iNum].renderOrder = 1000;//显示层级
        VM.mesh1[iNum].material.depthTest = false;
        // if (!VM.isTransparent && VM.viewFlag !== 1) {
        VM.scene.add(VM.mesh1[iNum]);
        // }

        // }
        if (VM.isTransparent && VM.viewFlag === 2) {
          //处理一下机柜下面的容量数值 ,与温度值,在温度柱图中显示温度值
          var cur_per = VM.cubeArry[iNum][VM.get_current_capacity_key()];
          var materialText2 = new THREE.MeshBasicMaterial({
            map: VM.initCabinetPercent(cur_per, VM.calc_cabinet_width(VM.cubeArry[iNum]), 0, iNum),//文字贴图
            side: THREE.FrontSide,
            transparent: true,//是否使用透明度
            fog: false,
          });
          var geometryText2 = new THREE.PlaneGeometry(VM.calc_cabinet_width(VM.cubeArry[iNum]), VM.objCabinetBottomHeight);
          VM.mesh2[iNum] = new THREE.Mesh(geometryText2, materialText2);
          VM.mesh2[iNum].name = VM.cabinetCapacity + iNum;//根据这个名字计算了点击事件，不然事件无法响应
          VM.mesh2[iNum].userData = {per: cur_per};//记录一下当前的温度值
          VM.mesh2[iNum].position.set(VM.cubeArry[iNum].x - movL - 2, VM.objCabinetBottomHeight - 12, new_text_y2);
          VM.mesh2[iNum].rotation.y = text_r;
          VM.scene.add(VM.mesh2[iNum]);
        }

        // //处理一下机柜上面的温度数值
        var setMaterial = function (key, iNum, new_text_y3, text_r) {
          var side = THREE.FrontSide
          // if (key === 'temp_cold'){//冷通道
          //   side = THREE.BackSide;
          // }
          let cur_per = VM.cubeArry[iNum][key]
          var materialText3 = new THREE.MeshBasicMaterial({
            map: VM.initCabinetPercent(cur_per, VM.calc_cabinet_width(VM.cubeArry[iNum])),//文字贴图
            side: side,
            transparent: true,//是否使用透明度
            fog: false
          })

          // var geometryText3 = new THREE.PlaneGeometry(VM.calc_cabinet_width(VM.cubeArry[iNum]), VM.objHeight - VM.objCabinetBottomHeight / 2);
          var geometryText3 = new THREE.PlaneGeometry(VM.calc_cabinet_width(VM.cubeArry[iNum]), VM.objCabinetBottomHeight)
          VM.mesh3[iNum + key] = new THREE.Mesh(geometryText3, materialText3)
          VM.mesh3[iNum + key].name = VM.capacityTemp + iNum
          VM.mesh3[iNum + key].userData = {per: cur_per}//记录一下当前的温度值
          // VM.mesh3[iNum + key].position.set(VM.cubeArry[iNum].x - movL - 2, VM.objHeight / 2 + VM.objCabinetBottomHeight / 2, new_text_y3);
          VM.mesh3[iNum + key].position.set(VM.cubeArry[iNum].x - movL - 2, VM.objCabinetBottomHeight - 12, new_text_y3)
          VM.mesh3[iNum + key].rotation.y = text_r
          // if (key === 'temp_cold') {
          VM.mesh3[iNum + key].renderOrder = 1000
          VM.mesh3[iNum + key].material.depthTest = false
          // }
          VM.scene.add(VM.mesh3[iNum + key])
        }
        if (VM.isTransparent && VM.viewFlag === 6) {
          var hot_text_y = new_text_y3 + VM.objSingleLength / 4
          var cold_text_y = new_text_y3 + VM.objSingleWidth + VM.objSingleLength / 2
          if (iNum % 2 === 1) {
            hot_text_y = new_text_y3 - VM.objSingleLength / 4
            cold_text_y = new_text_y3 - VM.objSingleWidth - VM.objSingleLength / 2
          }
          // setMaterial('temp_hot',iNum,new_text_y3,text_r);
          setMaterial("temp_hot", iNum, new_text_y3, iNum % 2 === 1 ? text_r : Math.PI)
          // setMaterial('temp_cold',iNum,cold_text_y,text_r);
          setMaterial("temp_cold", iNum, cold_text_y, iNum % 2 === 1 ? Math.PI : 0)
        }
      }
      if (VM.isTransparent && (VM.viewFlag === 6 || VM.viewFlag === 1) && (!VM.sphereMesh || !VM.latheMesh)) {//温度柱图和温度云图需要加载菜单切换
        // VM.clearCache(VM.sphereMesh);
        console.time("initObjecttime")
        let color = "#72ff90"
        if (VM.viewFlag === 1) {//因为温度云图下的灯光比较强，所以颜色需要加深一点
          color = "#42ff68"
        }
        const material = new THREE.MeshLambertMaterial({
          // map:VM.threeD_chose_menu_texture,
          transparent: true,//是否使用透明度
          color: color,
          fog: false,
          opacity: 1
        })
        let sphere = new THREE.Mesh(new THREE.SphereGeometry(30, 15, 15), material)//球体
        sphere.position.set(0, VM.objHeight + 45, 0)
        sphere.renderOrder = 1000//渲染级别，有点像z-index
        sphere.material.depthTest = false//是否深度测试
        sphere.name = VM.cabinetChoseMenu
        VM.sphereMesh = sphere
        var points = []
        for (var i = 0; i < 10; i++) {
          points.push(new THREE.Vector2(Math.sin(i * 0.4) * 16 + 10, (i - 5.2) * 8))
          // points.push(new THREE.Vector2(Math.sin(i * 0.4) * 20 + 8, (i - 10) * 8))
          // Math.sin(i * 0.4) * 底部圆锥的半径 + 底部尖突出的处理, (i - 5.2) * 底部圆锥的高度)
        }
        let geometry1 = new THREE.LatheGeometry(points, 15, 0 ,2 * Math.PI)//车削几何体，点，要分多少段，起始角度，车削部分的弧度
        var lathe = new THREE.Mesh(geometry1, material)
        lathe.position.set(0, VM.objHeight + 30, 0)
        lathe.renderOrder = 1000//渲染级别，有点像z-index
        lathe.material.depthTest = false//是否深度测试
        lathe.rotateZ(Math.PI);
        lathe.name = VM.cabinetChoseMenu
        VM.latheMesh = lathe
        VM.scene.add(sphere)
        VM.scene.add(lathe)
        console.timeEnd("initObjecttime")
      }
    },
    initCubeData: function (cubeData, i) {//数据 贴图
      var VM = this;
      var canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 64;
      var data_context = canvas.getContext("2d");
      data_context.fillStyle = 'rgba(192, 80, 77, 0.0)';
      data_context.fillRect(0, 0, 128, 64);
      data_context.font = "34px Arial";
      data_context.fillStyle = "#ffffff";
      cubeData = Number(cubeData).toFixed(1) + '%';
      data_context.fillText(cubeData, 5, 40);
      VM.Dataobj[i] = new THREE.CanvasTexture(canvas);
      if (document.getElementById("CanvasHide")) {
        document.getElementById("CanvasHide").appendChild(canvas);/*放入垃圾桶*/
        document.getElementById("CanvasHide").innerHTML = '';//将a从页面上删除 /*清除垃圾桶*/
      }
      canvas = null;
      data_context = null;
    },
    roundedRect: function (ctx, x, y, width, height, radius) {  //形状
      var VM = this;
      ctx.moveTo(x, y + radius);
      ctx.lineTo(x, y + height - radius);
      ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
      ctx.lineTo(x + width - radius, y + height);
      ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
      ctx.lineTo(x + width, y + radius);
      ctx.quadraticCurveTo(x + width, y, x + width - radius, y);

      ctx.lineTo(x + width / 2 + radius / 2, y);
      ctx.quadraticCurveTo(x + width / 2 + radius / 2, y, x + width / 2, y - radius / 2);
      ctx.quadraticCurveTo(x + width / 2, 0 - radius / 2, x + width / 2 - radius / 2, y);

      ctx.lineTo(x + radius, y);
      ctx.quadraticCurveTo(x, y, x, y + radius);
    },
    Three_shape: function (iNum) {//创建浮动是显示的文字冒泡
      var VM = this;
      var z_y = 120, cube_y, text_y, text_r, text_mov;
      if (iNum % 2 == 0) {
        cube_y = 0 - z_y;
        text_y = cube_y - (113.3 / 2 + 25);
        text_r = Math.PI;
        text_mov = -VM.MmovL + 50;
      } else {
        cube_y = z_y;
        text_y = cube_y + (113.3 / 2 + 25);
        text_r = 0;
        text_mov = -VM.MmovL - 50;
      }
      var roundedRectShape = new THREE.Shape();
      VM.roundedRect(roundedRectShape, 0, 0, 100, 50, 20);//创建冒泡形状
      VM.initTextName(VM.cubeArry[iNum].name, VM.cubeArry[iNum].is_alarm, iNum, 1);//填入机柜名称
      var geometry = new THREE.ShapeBufferGeometry(roundedRectShape);
      var maxAnisotropy = VM.renderer.getMaxAnisotropy();
      VM.Nameobj[iNum].wrapS = VM.Nameobj[iNum].wrapT = THREE.RepeatWrapping;
      VM.Nameobj[iNum].repeat.set(0.01, 0.01);
      VM.Nameobj[iNum].anisotropy = maxAnisotropy;//提高贴图清晰度
      var materialText = new THREE.MeshBasicMaterial({
        map: VM.Nameobj[iNum],//文字贴图
        // side:THREE.DoubleSide,
        side: THREE.FrontSide,
        transparent: VM.isTransparent,//是否使用透明度，通过玻璃所看的柜子是否显示透明
        opacity: 0.9,
        fog: false
      });
      VM.shapeMess = new THREE.Mesh(geometry, materialText);
      VM.shapeMess.position.set(VM.cubeArry[iNum].x + text_mov, 300, text_y);
      VM.shapeMess.rotation.y = text_r;
      VM.scene.add(VM.shapeMess);
    },
    initTextName: function (Name, is_alarm, i, flag, alarm_level) {//设备名称 顶部小提醒 ,现在只显示顶部告警小提示
      var VM = this;
      var canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      var context = canvas.getContext("2d");
      context.arc(32, 32, 32, 0, 2 * Math.PI);
      // if(is_alarm!=0&&!ifNullData(is_alarm)){
      //   context.fillStyle = "#e7251b";//背景色 异常 红
      // }else{
      //   context.fillStyle = "#004e90";//背景色 正常 蓝色
      //   //context.fillStyle = "#00c5cc";//背景色 正常 蓝色
      // }
      context.fillStyle = VM.alarmL_color[alarm_level] || '#ffffff';//背景颜色
      context.fill();
      // context.fillRect( 0, 0, 128, 64);
      if (flag == 1) {
        context.scale(0.65, 0.65);
      }
      context.fillStyle = VM.alarmL_color[alarm_level] ? "#ffffff" : "#000000";//字色 白
      context.textAlign = "center";
      if (flag == 1) {
        context.font = "25px Arial";
        context.fillText(Name, 100, 85);
      } else {
        context.font = "bold 46px Arial,sans-serif";
        context.fillText("i", 32, 45);
      }
      VM.Nameobj[i] = new THREE.CanvasTexture(canvas);
      if (document.getElementById("CanvasHide")) {
        document.getElementById("CanvasHide").appendChild(canvas);/*放入垃圾桶*/
        document.getElementById("CanvasHide").innerHTML = '';//将a从页面上删除 /*清除垃圾桶*/
      }
      canvas = null;
      context = null;
    },
    initCabinetName: function (Name, i) {//设备名称 机柜贴图，文字缩放在 initObject 中,文字放大原理，把画布画大一点，接收的部分显示内容
      var VM = this
      let shadowColor = "#ffffff"
      let fillStyle = "#ffffff"
      // if (VM.viewFlag === 1 && VM.heatmap_type === 1){
      //   shadowColor = '#666666';
      //   fillStyle = '#666666';
      // }else
      if (VM.LCD === 1 && VM.isTransparent) {
        shadowColor = "rgba(0,0,0,0.65)"
        // fillStyle = '#666666';
      }
      var canvas = document.createElement("canvas")
      // var dpr = window.devicePixelRatio || 1;
      var per = VM.cubeArry[i].width === 0 ? 1 : 2//0是全柜 1是半柜
      var limit = VM.cubeArry[i].width === 0 ? 5 : 2//0是全柜 1是半柜
      var dpr = 3//这边乘3是将整个画布放大一些，然后取部分内容显示
      var width = (VM.objSingleWidth / per) * dpr
      // var height = 250 * dpr;
      var height = VM.objCabinetTopHeight * dpr
      canvas.width = width
      canvas.height = height
      // if (!VM.isTransparent) {
      var context = canvas.getContext("2d")
      context.arc(32, 32, 32, 0, 2 * Math.PI)
      context.fillStyle = "transparent"
      context.fill()
      context.shadowBlur = 0.8//阴影模糊级数
      if (VM.LCD === 1) {
        context.shadowBlur = 2//阴影模糊级数
        context.shadowOffsetX = 1//x轴偏移
        context.shadowOffsetY = 3//y轴偏移
      }
      context.shadowColor = shadowColor
      context.fillStyle = fillStyle//字色 白
      context.textAlign = "center"
      // context.font = "60px Microsoft YaHei";//竖排文字大小
      context.font = "38px Microsoft YaHei"
      // let x = width / 2, y = 0.256 * height; // 文字开始的坐标
      let x = width / 2, y = height / 1.5 // 文字开始的坐标
      let letterSpacing = 3 // 设置字间距
      //注释循环部分为文字竖排排版
      // for (let i = 0; i < Name.length; i++) {
      //   const str = Name.slice(i, i + 1).toString();
      //   if (str.match(/[A-Z0-9]/)) {//大写和数字
      //     letterSpacing = 18
      //   } else if (str.match(/[a-z]/)) {//小写字母
      //     letterSpacing = 36;
      //   } else {
      //     letterSpacing = 3;
      //   }
      //   context.save();
      //   context.textBaseline = 'Middle';
      //   context.fillText(str, x, y);
      //   context.scale(dpr, dpr);
      //   context.restore();
      //   y += context.measureText(str).width + letterSpacing; // 计算文字宽度
      // }
      context.fillText(Name.substr(0, limit), x, y)
      context.scale(dpr, dpr)
      // if (dev_index) {
      //   context.font = "20px Microsoft YaHei";
      // context.fillText("#" + dev_index, 32, 30);
      // context.scale(0.5, 0.5);
      // }
      // }
      VM.NewNameobj[i] = new THREE.CanvasTexture(canvas)
      if (document.getElementById("CanvasHide")) {
        document.getElementById("CanvasHide").appendChild(canvas)/*放入垃圾桶*/
        document.getElementById("CanvasHide").innerHTML = ""//将a从页面上删除 /*清除垃圾桶*/
      }
      canvas = null;
      context = null;
    },
    /*
    * 容量云图的使用百分比
    * */
    initCabinetPercent: function (per, w, h, index) {
      let shadowColor = "#ffffff"
      let fillStyle = "#ffffff"
      if (this.LCD === 1 && !this.is_qt && this.isTransparent) {
        // if (this.LCD === 1 && this.isTransparent){
        shadowColor = "#464c5b"
        fillStyle = "#464c5b"
      }
      var canvas = document.createElement("canvas")
      var dpr = 3
      var fontSize = "45px "
      var width = (w || this.objSingleWidth) * dpr
      var height = (h || this.objHeight) * dpr
      var fillText = per
      let x = width / 2
      let y = height // 文字开始的坐标
      fillStyle = this.deal_capacity_color(null, per, fillStyle)
      if (this.viewFlag !== 2) {
        // fillText += '℃';
        // height = Math.floor(((h || this.objHeight) - this.objCabinetBottomHeight / 2) * dpr);
        // y = height - (this.check_value(per) * this.objCabinetHeight / 100 + 16) * dpr; //显示在上面 目前未用
        var height_1 = this.check_value(per) * this.objCabinetHeight / 100//需要减去的高度
        if (per < 16) {
          height_1 = 0
        }
        // y = height - Math.abs((height_1 + 16) * dpr);// 显示在柱子最上面]
        height = this.objCabinetBottomHeight * dpr
        y = this.objCabinetBottomHeight + 26//放在最下面
        // if (per >= 90) {
        //   fillStyle = '#ff0000';
        // }
      } else {
        var limit = this.cubeArry[index].width === 0 ? 6 : 3//0是全柜 1是半柜
        // height = VM.objBottomHeight * dpr;
        if (!fillText) {
          fillText = ""
        } else {
          // fillText += '%';
          fillText = fillText.toString()
            .substr(0, limit)
        }
        height = this.objCabinetBottomHeight * dpr
        y = this.objCabinetBottomHeight + 26
        fontSize = "38px "
      }
      canvas.width = width
      canvas.height = height
      var context = canvas.getContext("2d")
      context.arc(32, 32, 32, 0, 2 * Math.PI)
      context.fillStyle = "transparent"
      context.fill()
      context.shadowBlur = 0.8//阴影模糊级数
      context.shadowColor = shadowColor
      context.fillStyle = fillStyle//字色 白
      context.textAlign = "center"
      context.font = fontSize + "Microsoft YaHei"
      context.textBaseline = "Middle"
      if (per && per != 0) {//这里用一个等于，因为后台返回可能存在0.0
        context.fillText(fillText, x, y)
      }
      //这里做超时回收是因为 new Image()的onload 是一个异步的加载过程，如果直接回收，会导致前面异步记载回来之后context的内容为空，drawImage报错，图片就画不出来了
      setTimeout(function () {
        //回收
        if (document.getElementById("CanvasHide")) {
          document.getElementById("CanvasHide").appendChild(canvas)/*放入垃圾桶*/
          document.getElementById("CanvasHide").innerHTML = ""//将a从页面上删除 /*清除垃圾桶*/
        }
        canvas = null;
        context = null;
      }, 1000);
      // return drawImage;
      return new THREE.CanvasTexture(canvas);
    },
    textArray: function (nn) {//柱状体--贴图
      var VM = this;
      var cube_maxH = 250;
      var texture;
      var CabinetType = VM.cubeArry[nn].type;//机柜类型
      var myopacity = 1;
      var cube_pY = cube_maxH / 2;
      // var mycolor = VM.equip_color[CabinetType];
      var color_item = {color: 0xc0ff00};//默认给绿色
      VM.equip_content.forEach(function (item, index) {
        if (item.keys.indexOf(CabinetType) !== -1) {
          color_item = item;
        }
      });
      if (VM.cubeArry[nn].width == 1) {//半柜
        texture = VM.texture1;
      } else {
        texture = VM.texture0;
      }
      if (CabinetType == 105) {//空调
        // texture=VM.texture1;//空调贴图，2019年10月12日13:58:00 删除空调贴图 zjz
      } else if (CabinetType == 100) {//无效柜
        if (VM.cubeArry[nn].width == 1) {//半柜
          texture = VM.texture_disabled_small;
        } else {
          texture = VM.texture_disabled_big;
        }
      } else {//用户机柜
        // texture=null;
        // mycolor=0x35f521;//绿色
        myopacity = 0.95;
        cube_pY = 0 - cube_maxH / 2;
      }
      return {"texture": texture, "mycolor": color_item.color, "myopacity": myopacity, "cube_pY": cube_pY};
    },
    no_animation: function () {//没有动画时，删除更新属性
      var VM = this;
      for (var i = 0; i < VM.cubeArry.length; i++) {
        VM.cube[i].material.needsUpdate = false;//使纹理不更新
        VM.cube[i].geometry.colorsNeedUpdate = false;//使颜色不更新
      }
    },
    normal_animation: function () {//所有设备正常
      var VM = this;
      var cube_maxH = 250;
      for (var i = 0; i < VM.cubeArry.length; i++) {
        var maxH = cube_maxH * (VM.cubeArry[i].z - 100) / 100;
        if (VM.cube[i].material.map != null) {
          VM.cube[i].material.map.dispose();
        }
        VM.cube[i].material.needsUpdate = true;//使纹理可以更新
        VM.cube[i].geometry.colorsNeedUpdate = true;//使颜色可以更新
        VM.cube[i].material.opacity = VM.textArray(i).myopacity;
        VM.cube[i].material.map = VM.textArray(i).texture;
        VM.cube[i].material.color.setHex(VM.textArray(i).mycolor);
        if (VM.textArray(i).texture == null) {//没有贴图的柱状体
          for (var k = 0; k < 4; k++) {
            VM.cube[i].geometry.faces[k].color.setHex(0x1aa81f);
          }
          VM.meshData[i].material.opacity = 1;
        }
        if (ifNullData(VM.vH[i])) {
          VM.vH[i] = (maxH - VM.cube[i].position.y) / 5;//速度列表
          VM.mesh[i].material.map.dispose();
          VM.initTextName(VM.cubeArry[i].name, VM.cubeArry[i].is_alarm, i, 0, 0, VM.cubeArry[i].alarm);//设备名
          VM.mesh[i].material.map = VM.Nameobj[i];//设备名
        }
        if (VM.cube[i].position.y != maxH) {
          VM.cube[i].position.y = VM.cube[i].position.y + VM.vH[i];
        }
        if (VM.cube[i].position.y <= 0 - cube_maxH) {// 0~-cube_maxH
          VM.cube[i].position.y = 0 - cube_maxH;
        }
        if (VM.cube[i].position.y >= 0) {
          VM.cube[i].position.y = 0;
        }
        if (VM.meshData[i] != null) {
          VM.meshData[i].material.map.dispose();
          VM.initCubeData((1 + VM.cube[i].position.y / cube_maxH) * 100, i);//数值
          VM.meshData[i].material.map = VM.Dataobj[i];
        }
        if (VM.meshData[i] != null) {
          VM.meshData[i].position.y = (VM.cube[i].position.y + 250) > 0 ? (VM.cube[i].position.y + 250) : 20;
        }
        if (VM.cube[i].position.y != maxH) {
          VM.Allmax_flag[i] = 1;
        } else {
          VM.Allmax_flag[i] = 0;
        }
        if (VM.Allmax_flag.join("") == VM.Allmax_over.join("") && VM.Loadover == 0) {
          VM.stop_animation();
        }
      }
    },
    abnormal_animation: function () {//设备有异常
      var VM = this;
      for (var i = 0; i < VM.cubeArry.length; i++) {
        VM.cube[i].position.y = 0;
        VM.cube[i].material.transparent = true;//材料透明
        VM.cube[i].material.needsUpdate = true;//使纹理可以更新
        VM.cube[i].geometry.colorsNeedUpdate = true;//使颜色可以更新
        VM.cube[i].material.precision = 'mediump';//重写材质精度 可以是"highp", "mediump" 或 "lowp"。默认值为null。
        VM.cube[i].material.opacity = VM.isTransparent ? 0.2 : 0.8;
        if (VM.cube[i].material.map != null) {
          VM.cube[i].material.map.dispose();
        }
        if (VM.cubeArry[i].is_alarm != 0 && !ifNullData(VM.cubeArry[i].is_alarm) && (!VM.isTransparent && VM.viewFlag !== 1)) {//异常  根据数据判断是否告警
          VM.cube[i].material.color.setHex(0xe60000);//柱状体 材质 红  e60000 ff3000
          VM.cube[i].material.map = null;//去除贴图
          VM.cube[i].material.transparent = false;//材料透明
          VM.cube[i].material.opacity = 1;
        } else if (VM.isTransparent && VM.viewFlag === 2) {//容量云图
          // VM.cube[i].material.color.set(this.deal_capacity_color(i));//柱状体 材质 红  e60000 ff3000
          // VM.cube[i].material.map = null;//去除贴图
          // VM.cube[i].material.side = 1;
          // VM.cube[i].material.map = VM.textArray(i).texture || VM.texture0;//机柜上面的门贴图
          // VM.cube[i].material.transparent = false;//材料透明
          // VM.cube[i].material.opacity = 1;
          VM.cube[i].material.visible = false;
          VM.deal_capacity_type(i);
        } else if (VM.isTransparent && VM.viewFlag === 6) {//温度柱图
          // VM.cube[i].material.transparent = true;//材料透明
          // VM.cube[i].material.opacity = 0.1;
          // VM.cube[i].material.visible = false;
          VM.cube[i].visible = false;
          VM.deal_capacity_temp_column(i, 'temp_hot');
          VM.deal_capacity_temp_column(i, 'temp_cold');
        } else {
          // VM.textArray(i).mycolor 0x9397bb
          VM.cube[i].material.color.setHex(VM.isTransparent ? 0x9397bb : VM.textArray(i).mycolor);//柱状体 材质 白
          //2019年10月10日11:50:55 删除贴图，根据机柜显示对应颜色 zjz
          for (var k = 0; k < 6; k++) {//柱状体 面颜色 白
            // VM.cube[i] && VM.cube[i].geometry && VM.cube[i].geometry.faces[ k ].color.setHex(VM.isTransparent ?  0x9397bb : VM.textArray(i).mycolor);
          }
          // if (!VM.isTransparent) {
          // if (VM.viewFlag !== 1)
          VM.cube[i].material.map = VM.textArray(i).texture || VM.texture0;//机柜上面的门贴图
          // }
        }
        if (VM.meshData[i] != null) {//去除数值
          VM.meshData[i].material.opacity = 0;
        }
        if (!ifNullData(VM.cubeArry_old)) {
          VM.mesh1[i].material.map.dispose();
          VM.initCabinetName(VM.cubeArry[i].name, i);//设备名设备名
          VM.mesh1[i].material.map = VM.NewNameobj[i];
          if (!VM.isTransparent && VM.viewFlag !== 1) {
            VM.mesh[i].material.transparent = true;//材料透明
            VM.mesh[i].material.needsUpdate = true;//使纹理可以更新
            VM.mesh[i].geometry.colorsNeedUpdate = true;//使颜色可以更新
            VM.mesh[i].material.map.dispose();
            VM.cube[i].is_alarm = VM.cubeArry[i].is_alarm;//更新告警状态，不然新的告警来的时候无法执行点击事件
            VM.mesh[i].is_alarm = VM.cubeArry[i].is_alarm;//更新告警状态，不然新的告警来的时候无法执行点击事件
            if (VM.cubeArry[i].is_alarm === 1) {
              VM.mesh[i].material.visible = true;
              VM.initTextName(VM.cubeArry[i].name, VM.cubeArry[i].is_alarm, i, 0, VM.cubeArry[i].alarm);//设备名设备名，感叹号
              VM.mesh[i].material.map = VM.Nameobj[i];
              VM.scene.add(VM.mesh[i]);//这里要加上，不然新告警来的时候不会显示上面的图表
            } else {
              VM.mesh[i].material.visible = false;
              VM.scene.remove(VM.mesh[i]);
            }
          }
          // if(!(VM.cubeArry_old[i].name==VM.cubeArry[i].name && VM.cubeArry_old[i].alarm==VM.cubeArry[i].alarm)){
          if (VM.viewFlag === 2) {//容量
            // VM.cube[i].material.color.set(this.deal_capacity_color(i));//柱状体 材质 红  e60000 ff3000
            VM.deal_capacity_type(i);
          } else if (VM.viewFlag === 6) {//温度柱图
            VM.deal_capacity_temp_column(i, 'temp_hot');
            VM.deal_capacity_temp_column(i, 'temp_cold');
          }
        }
      }
      VM.MyisRender = false;//这边添加置否是因为容量三个试图切换
      if (VM.Loadover <= 0) {
        VM.loadOtherView();
        VM.stop_animation();
      }
    },
    stop_animation: function () {
      var VM = this;
      VM.vH = [];
      VM.Dataobj = [];
      VM.Nameobj = [];
      VM.NewNameobj = [];
      VM.Allmax_flag = [];
      VM.cubeArry_old = [].concat(VM.cubeArry);
      clearTimeout(VM.Timeinterval_3d);
      VM.animationFlag = 1;
      VM.Timeinterval_3d = null;
      THREE.Cache.clear();
      ie_CollectGarbage();
    },
    animation: function (flag) {
      // console.log(flag);
      var VM = this;
      if (VM.renderer) {
        VM.renderer.clear();//清除场景
      }
      // requestAnimationFrame(VM.animation);
      // VM.requestAnimationFrameID = requestAnimationFrame(VM.myAnimation);
      if (VM.CONTROLS) {
        VM.CONTROLS.update();
      }
      /*if(VM.IS_Alarm==0) {//所有设备正常
       VM.normal_animation();
       }else{//设备有异常*/
      VM.abnormal_animation();
      /* }*/
      // VM.Timeinterval_3d = setTimeout(function () {
      //   if (VM.animationFlag === 0) {
      //     VM.animation('Timeinterval_3d');//动画
      //   }
      // }, 3000);
      VM.LCDScale();
      VM.render_render('animation');
    },
    myAnimation(time) {
      time *= 0.0005;
      var VM = this;
      if (VM.CAMERA && VM.renderer) {
        VM.CAMERA.updateProjectionMatrix();
        VM.scene.rotation.y = time;
        VM.renderer.render(VM.scene, VM.CAMERA);
        VM.requestAnimationFrameID = requestAnimationFrame(VM.myAnimation)
      }
    },
    render_dispose: function () {//解绑三维场景中的机柜 释放内存
      var VM = this;
      if (!VM.renderer) {
        return;
      }
      VM.MyisRender = true//这个添加一下清楚的控制
      VM.renderer.clear()//清除场景
      VM.clearMesh(VM.objGroup)
      VM.clearMesh(VM.cubeArry)
      VM.clearMesh(VM.meshData)
      VM.clearMesh(VM.mesh)
      VM.clearMesh(VM.mesh1)
      VM.clearMesh(VM.mesh2)
      VM.clearMesh(VM.mesh3)
      VM.clearMesh(VM.mesh4)
      // VM.clearMesh(VM.mesh5);
      VM.clearMesh(VM.sphereMesh)
      VM.clearMesh(VM.coneMesh)
      VM.clearMesh(VM.latheMesh)
      VM.clearMesh(VM.capacityMesh)
      VM.clearMesh(VM.heatmap_Mesh)
      VM.clearMesh(VM.scene)
      if (VM.CONTROLS) {
        VM.CONTROLS.dispose()
      }
      VM.scene = null
      VM.renderer.context = null
      //document.getElementById('main_model') && document.getElementById('main_model').removeChild(VM.renderer.domElement);
      $("#main_model").find('.my_heatmap').remove();//这里有清除一下渲染的canvas画布和云图内容
      VM.renderer.domElement = null;
      VM.renderer = null;
      VM.CAMERA = null;
      clearTimeout(VM.Timeinterval_3d);
      VM.Timeinterval_3d = null;
      VM.spotLight_list.forEach((light, index) => {
        VM["spotLight" + index] = null
      })
      VM.spotLight = null
      VM.shapeMess = null
      VM.shapeMessFlag = 0
      VM.meshData = []
      VM.mesh = []
      VM.mesh1 = []
      VM.mesh2 = []
      VM.mesh3 = {}
      VM.mesh4 = {}
      // VM.mesh5 = {};
      VM.sphereMesh = null
      VM.coneMesh = null
      VM.latheMesh = null
      VM.capacityMesh = []
      VM.heatmap_Mesh = []
      VM.heatmap_map = []
      VM.heatmap_Mesh_three = []
      VM.heatmap_map_three = []
      VM.camera_dev_group = {}
      VM.all_passageway_data = {}
      VM.old_temp_camera_Obj = {}
      VM.temp_camera_list = []
      VM.old_temp_camera_list = []
      VM.cube = []
      VM.cubeArry = []
      VM.cubeArry_old = []
      VM.vH = []
      VM.Dataobj = []
      VM.Nameobj = []
      VM.NewNameobj = []
      VM.Allmax_flag = []
      VM.Allmax_over = []
      VM.objGroup = null
      VM.Loadover = 3
      THREE.Cache.clear()
    },
    render_setSize1: function () {
      var VM = this;
      var ww = $("#main_model").width();
      var dd = $("#main_model").height();
      if (VM.LCD === 1) {//液晶屏上展示pc端代码--大屏展示:放大2倍，缩小0.5倍
        VM.canvasScal = 2;
      }
      VM.Dwidth = VM.canvasScal * ww;
      VM.Dheight = VM.canvasScal * dd;
      if (VM.CAMERA) {
        if (VM.CONTROLS) {
          VM.CONTROLS.reset();
        }
        VM.CAMERA.aspect = VM.Dwidth / VM.Dheight;//视窗的宽高比
        VM.CAMERA.setFocalLength(VM.FocalLength);
        VM.CAMERA.updateProjectionMatrix();
      }
      if (VM.renderer) {
        VM.renderer.clear();//清除场景
        VM.renderer.setSize(VM.Dwidth, VM.Dheight);
        VM.render_render('render_setSize1');
      }
      VM.isLoading = false;//进度gif
    },
    obj_action: function () {
      var VM = this;
      $("#circeRight").unbind("mousedown").bind("mousedown", function () {
        VM.circle_action(-1, VM.tag_left);
      });
      $("#circeLeft").unbind("mousedown").bind("mousedown", function () {
        VM.circle_action(1, VM.tag_left);
      });
      $("#circeReset").unbind("mousedown").bind("mousedown", function () {
        // VM.render_setSize();
        VM.circle_action(1, VM.tag_reset);
        // if (VM.LCD === 0){
        //   VM.render_setSize();
        // } else{
        //   VM.circle_action(1,VM.tag_reset);
        // }
      });
    },
    circle_action: function (flag, tag) {
      var VM = this;
      // if (VM.LCD === 0){
      //   return
      // }
      if (!VM.isWebGl || VM.isRoateing) {
        return
      }
      VM.isRoateing = true;
      // VM.spotLight_list.forEach((light, index) => {
      //   var spotLight = VM['spotLight' + index];
      //   if (spotLight) {
      //     /*灯光一起旋转导致重置的时候灯光映射的地方会出现问题*/
      //     // VM.myCameraTween(spotLight,Math.PI*flag/16,1,0,tag,0);
      //   }
      // });
      VM.myCameraTween(VM.CAMERA, Math.PI * flag / 8, 1, 0, tag, 1);
      VM.anaglePI = VM.anaglePI + flag;
      if (VM.anaglePI == 32 * flag) {
        VM.anaglePI = 0;
      }
    },
    onDocumentMove_clear: function () {//清除上一个机柜名提示
      var VM = this;
      // if (!VM.nowItme.is3d){
      VM.devShow = false;
      // }
      //if(VM.old_Move!=null && !ifNullData(VM.cube[VM.old_Move])){
      //  VM.cube[VM.old_Move].position.z=0;
      //  VM.old_Move=null;
      //}
      //if(VM.shapeMess){
      //  VM.shapeMess.material.map.dispose();
      //}
      //VM.scene.remove(VM.shapeMess);
    },
    onDocumentMove: function (event) {
      var VM = this;
      var Mouse = {};
      var INTERSECTED;//三维射线
      if (!VM.scene) {
        return
      }
      var raycaster = new THREE.Raycaster();
      event.preventDefault();
      Mouse.x = (event.offsetX / VM.Dwidth) * 2 - 1;
      Mouse.y = -(event.offsetY / VM.Dheight) * 2 + 1;
      raycaster.setFromCamera(Mouse, VM.CAMERA); //新建一条从相机的位置到vector向量的一道光线
      var intersects = raycaster.intersectObjects(VM.scene.children, true);
      //VM.shapeMessFlag=1;
      if (intersects.length > 0) {//产生碰撞
        INTERSECTED = intersects[0].object//获取碰撞对象
        let the_one
        // if (VM.viewFlag === 6) {//温度柱图需要显示冷通道,会很卡
        //   the_one = intersects.find((item, index) => {
        //     return item.object.name.indexOf(VM.capacityTemp) >= 0
        //   });
        //   INTERSECTED = the_one ? the_one.object : null
        // }
        if (!INTERSECTED) {
          return
        }
        if (INTERSECTED.name.indexOf(VM.cabinetName_) >= 0) {//判断碰撞对象是否机柜
          var i = Number(INTERSECTED.name.split("_")[1]);
          if (i != VM.old_Move) {//判断碰撞对象是否是上一次存储碰撞对象---避免重复渲染统
            var x = VM.LCD === 1 ? event.offsetX / 2 : event.offsetX
            var y = VM.LCD === 1 ? event.offsetY / 2 : event.offsetY
            VM.nowItme = {
              name: VM.cubeArry[i].name,
              x: x,
              y: y + 100
            }
            if ((VM.cubeArry[i].name && VM.cubeArry[i].name != "")) {
              VM.devShow = true
            } else {
              VM.devShow = false
            }
          } else {

            //VM.shapeMessFlag=0;//不进行渲染
          }
        } else if (INTERSECTED.name.indexOf(VM.cabinetCapacity) >= 0) {//判断碰撞对象是否是容量管理底部的数值
          var i = Number(INTERSECTED.name.split("_")[1])
          var cur_per = INTERSECTED.userData.per
          if (i != VM.old_Move) {//判断碰撞对象是否是上一次存储碰撞对象---避免重复渲染统
            VM.nowItme = {
              name: cur_per + "%",
              x: event.offsetX,
              y: event.offsetY + 100
            }
            VM.devShow = !!cur_per
          } else {

            //VM.shapeMessFlag=0;//不进行渲染
          }
        } else if (INTERSECTED.name.indexOf(VM.capacityTemp) >= 0) {//判断碰撞对象是否是温度柱图底部的温度
          var i = Number(INTERSECTED.name.split("_")[1])
          var cur_per = INTERSECTED.userData.per
          if (i != VM.old_Move) {//判断碰撞对象是否是上一次存储碰撞对象---避免重复渲染统
            VM.nowItme = {
              name: cur_per + "℃",
              x: event.offsetX,
              y: event.offsetY + 100
            }
            VM.devShow = !!cur_per
          } else {

            //VM.shapeMessFlag=0;//不进行渲染
          }
        } else {
          VM.onDocumentMove_clear();//清除上一个机柜名提示
        }
      } else {
        VM.onDocumentMove_clear();//清除上一个机柜名提示
      }
      if (VM.shapeMessFlag == 1) {//只渲染一次
        VM.shapeMessFlag = 0;
        VM.renderer.clear();//清除场景
        VM.render_render('onDocumentMove');

      }
    },
    getTimeNow: function () {
      let now = new Date();
      return now.getTime();
    },
    onDocumentMouseDown: function (event) {
      var VM = this;
      //获取鼠标按下时的时间
      // if (VM.LCD === 1){
      //   return
      // }
      VM.mouseClickStartTime = VM.getTimeNow()

      //setInterval会每100毫秒执行一次，也就是每100毫秒获取一次时间
      // VM.mouseClickTimeInterval = setInterval(function () {
      //   VM.mouseClickEndTime = VM.getTimeNow()
      //
      //   //如果此时检测到的时间与第一次获取的时间差有500毫秒
      //   VM.mouseClickDuringTime = VM.mouseClickEndTime - VM.mouseClickStartTime//持续时间
      //   if (VM.mouseClickDuringTime > 500) {
      //     //便不再继续重复此函数 （clearInterval取消周期性执行）
      //     clearInterval(VM.mouseClickTimeInterval);
      //     VM.mouseClickTimeInterval = null
      //   }
      //   if (VM.mouseClickDuringTime > 200) {
      //     if (VM.requestAnimationFrameID) {//在这里取消自动动画
      //       cancelAnimationFrame(VM.requestAnimationFrameID)
      //     }
      //   }
      // }, 100)
    },
    onDocumentMouseup: function (event) {
      var VM = this
      // if (VM.LCD === 1){
      //   return
      // }
      VM.mouseClickEndTime = VM.getTimeNow();
      VM.mouseClickDuringTime = VM.mouseClickEndTime - VM.mouseClickStartTime//持续时间
      // clearInterval(VM.mouseClickTimeInterval);
      if (VM.mouseClickDuringTime <= 500 && !VM.isControlsChange) {
        VM.onDocumentMouseDownFun(event)
      }
    },
    onDocumentMouseDownFun: function (event) {
      var VM = this
      VM.devShow = false;
      var Mouse = new THREE.Vector2()
      var INTERSECTED//三维射线
      var the_one//三维射线对应的对象
      event.preventDefault();
      let offsetTop = $('#main_model').offset().top;
      let offsetX = event.offsetX || VM.getScreenClickPoint(event, 'pageX') - 8;
      let offsetY = event.offsetY || VM.getScreenClickPoint(event, 'pageY') - offsetTop;// 减去顶部的高度
      if (VM.LCD === 1) {
        // LCD有对3D内容进行放大位置，所以对点击的位置要相应的放大，1.84来源于多次测试
        offsetX = VM.getScreenClickPoint(event, 'pageX') * 1.84 - 60; // 位置偏移
        offsetY = VM.getScreenClickPoint(event, 'pageY') * 1.84 - offsetTop - 60; // 减去顶部的高度
      }

      Mouse.x = (offsetX / VM.Dwidth) * 2 - 1;
      Mouse.y = -(offsetY / VM.Dheight) * 2 + 1;
      var raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(Mouse, VM.CAMERA); //新建一条从相机的位置到vector向量的一道光线
      var intersects = raycaster.intersectObjects(VM.scene.children, true);

      if (intersects.length > 0) {
        INTERSECTED = intersects[0].object//把选中的对象放到全局变量SELECTED中
        the_one = intersects[0]
        if ((VM.viewFlag === 1 || VM.viewFlag === 6) && INTERSECTED.name.indexOf(VM.cabinetChoseMenu) >= 0) {//点击的是3D菜单

        } else {
          let theOneObj = VM.findClickTheOne(the_one, intersects, INTERSECTED)
          the_one = theOneObj.theOne
          INTERSECTED = theOneObj.INTERSECTED
        }
        if (!INTERSECTED) {
          return
        }
        var NewArray
        if (ifNullData(VM.cubeArry)) {
          NewArray = VM.cubeArry_old
        } else {
          NewArray = VM.cubeArry
        }
        clearInterval(VM.mainD_cabinet_timer)
        if (INTERSECTED.name.indexOf(VM.cabinet_) >= 0) {
          var i = Number(INTERSECTED.name.split("_")[1])
          VM.box_index = (i + 1)
          VM.cab_type = NewArray[i].type
          VM.dev_index = NewArray[i].index
          if (INTERSECTED.is_alarm) {//自定义告警属性
            loadingPage(true)
            VM.showFlag = true//机柜告警弹窗
          } else {
            if (NewArray[i].type == 106 && !VM.isTransparent) {//机柜
              loadingPage(true)
              popWin("main_cabinet_message")
              VM.mainD_cabinet_Message()
              VM.mainD_cabinet_timer = setInterval(function () {
                VM.mainD_cabinet_Message()
              }, 5000)
            }
          }
        } else if (INTERSECTED.name.indexOf(VM.cabinetName_) >= 0) {//判断点击是不是名字
          // var i = Number(INTERSECTED.name.split("_")[1]);
          // VM.nowItme = {
          //   name: VM.cubeArry[i].name,
          //   x: event.offsetX,
          //   y: event.offsetY + 100
          // };
          // VM.devShow = !!(VM.cubeArry[i].name && VM.cubeArry[i].name != "");
        } else if (INTERSECTED.name.indexOf(VM.cameraDev_) >= 0) {//判断是不是点击了安防设备
          VM.pop_camera_dev = INTERSECTED.userData || {}
          if (!ifNullData(VM.pop_camera_dev)
            && VM.is_camera(VM.pop_camera_dev.dev_type)
            && VM.pop_camera_dev.is_alarm === 0
            && !VM.is_qt) {//摄像头直接弹出
            VM.camera_dev_message_message()
          } else {
            popWin("camera_dev_message")
          }
        } else if (INTERSECTED.name.indexOf(VM.cabinetTemp_) >= 0) {//判断是不是点击了温度云图
          if (the_one) {
            VM.main_ico_3d.stop()
            VM.devShow = false
            VM.nowItme = {}

            var page = Number(INTERSECTED.name.split(VM.cabinetTemp_)[1]);//当前点击的哪一面

            // console.log(page);
            var width = VM.objLength + (VM.cubeArry[VM.cubeArry.length - 1].width === 0 ? VM.objSingleWidth : 49) // 这里加的宽度要根据最后一个排机柜的宽度加
            var height = VM.objHeight + VM.objSmallHeight
            if (VM.heatmap_type === -1) {
              height = VM.objAllCabinetWidth
            }
            // console.log(the_one.point);
            /*
            * 向量装换为2D，获取当前点击的点坐标系，整个机柜模型的世界坐标轴的原点在机柜的底部中心
            * 前4面：原点在左上角，在面上的x轴 = 点击的x轴 + 机柜整个长度的一半，y轴 = 整个机柜的高度 - 点击的y轴
            * 第5个面、第7个面：原点在右上角，此时点击的z轴大于0，面上的x轴 = 机柜整个宽度的一半 - 点击的z轴 ，y轴 = 整个机柜的高度 - 点击的y轴
            * 第11个面、第13个面：原点在右上角，此时点击的z轴小于0，面上的x轴 = 单排机柜的宽度 - （机柜整个宽度的一半 + 点击的z轴），y轴 = 整个机柜的高度 - 点击的y轴
            * 第6个面：原点在右上角，此时点击的z轴大于0，面上的x轴 = 单排机柜的宽度 - （机柜整个宽度的一半 - 点击的z轴），y轴 = 整个机柜的长度的一半 + 点击的x轴
            * 第12个面：原点在右上角，此时点击的z轴小于0，面上的x轴 = 机柜整个宽度的一半 + 点击的z轴 ，y轴 = 整个机柜的长度的一半 + 点击的x轴
            * 三个面的计算，只需要计算一次就好了 原点都在左上角
            * x：点击的不管x轴为正负，x轴为整个机柜长度的一半加上x轴的值，就像把时间轴坐标的原点往x轴的负轴左拉了机柜长度的一半
            * y：点击的不管z轴为正负，z轴为整个机柜宽度（360）的一半加上z轴的值，就像把时间轴坐标的原点往z轴的负轴拉了机柜宽度的一半
            * */
            var currHeatMap = VM.HeatMapInstance_Arr[page - 1]
            let clickPageWith = 0//所点击面的宽度
            let clickPageHeight = 0//所点击面的高度
            if (currHeatMap && page > 0) {
              var clickPoint = {}//当前点击的点
              var max_value//当前点击显示最大值控制
              var min_value//当前点击显示最小值控制
              if (Math.abs(the_one.point.z) >= VM.objSingleLength) {//表示点击的热通道
                max_value = VM.all_max_hot
                min_value = VM.temp_default[VM.key_hot]
              } else {//表示点击的冷通道
                max_value = VM.all_max_cold
                min_value = VM.temp_default[VM.key_cold]
              }
              if (VM.heatmap_type === -1) {
                clickPoint = {
                  x: width / 2 + the_one.point.x,
                  y: height / 2 + the_one.point.z
                }
              } else {
                var showPoint = {}//当前展示的点，展示出有温度值的点
                clickPoint.y = height - the_one.point.y
                var index = -1
                var position = VM.calc_show_point_y(clickPoint.y)
                if (page <= 4) {
                  clickPoint.x = the_one.point.x + width / 2
                  index = VM.calc_show_point_x(clickPoint.x, page)
                  if (page === 1 || page === 4) {
                    max_value = VM.all_max_hot
                    min_value = VM.temp_default[VM.key_hot]
                  } else if (page === 2 || page === 3) {
                    max_value = VM.all_max_cold
                    min_value = VM.temp_default[VM.key_cold]
                  }
                  clickPageWith = VM.objLength//机柜的总长度
                  clickPageHeight = VM.objHeight//机柜的总高度
                } else if (page === 5 || page === 7) {
                  clickPoint.x = VM.objAllCabinetWidth / 2 - the_one.point.z
                  clickPageWith = VM.objSingleLength//单排机柜的宽度
                  clickPageHeight = VM.objHeight//机柜的总高度
                } else if (page === 6 || page === 12) {
                  clickPoint.x = VM.objAllCabinetWidth / 2 + the_one.point.z
                  if (page === 6) {
                    clickPoint.x = VM.objSingleLength - (VM.objAllCabinetWidth / 2 - the_one.point.z)
                  }
                  clickPoint.y = width / 2 + the_one.point.x
                  position = VM.calc_show_point_y(clickPoint.y)
                  clickPageWith = VM.objSingleLength//单排机柜的宽度
                  clickPageHeight = VM.objLength//机柜的总长度
                } else if (page === 11 || page === 13) {
                  clickPoint.x = VM.objSingleLength - (VM.objAllCabinetWidth / 2 + the_one.point.z)
                  clickPageWith = VM.objSingleLength//单排机柜的宽度
                  clickPageHeight = VM.objHeight//机柜的总高度
                }
              }
              clickPoint.x = Number(clickPoint.x.toFixed(2))
              clickPoint.y = Number(clickPoint.y.toFixed(2))
              let currentData = currHeatMap.getData().data;
              currentData.sort(function (a, b) {
                return b.value - a.value
              });
              var clickVal = currHeatMap.getValueAt(clickPoint) + VM.defaultDataMin - 2;
              if (currentData[0] && clickVal > currentData[0].value) {
                clickVal = currentData[0].value
              }
              // if (clickVal > max_value){//控制显示最大值
              //   clickVal = Number((clickVal - max_value) * VM.max_coe + max_value).toFixed(2);
              // }else if (clickVal < min_value){//控制显示最小值
              //   clickVal = Number(min_value - (min_value - clickVal) * VM.min_coe).toFixed(2);
              // }
              // console.log(clickPoint);
              // console.log(currHeatMap.getValueAt(clickPoint) + 16);//如果最低值不是设置了0，这里返回的是插值，所以需要加上最低值
              //一些近点计算
              /**
               * 前四个面：先计算所点击的是哪一列机柜，在计算所点击的位置是在5个位置的哪一个
               */
                // function deal_position() {
                //
                // }
                // if(page <= 4){
                //   clickPoint.x - VM.cubeArry
                // }
              let offsetX = event.offsetX || VM.getScreenClickPoint(event, 'clientX');
              let offsetY = event.offsetY ? event.offsetY + 100 : VM.getScreenClickPoint(event, 'clientY');
              VM.nowItme = {
                name: "当前温度：" + clickVal + "℃",
                x: offsetX,
                y: offsetY,
                is3d: true
              }
              VM.devShow = true
              // setTimeout(()=>{
              //   VM.main_ico_3d.fadeOut(200,()=>{
              //     VM.devShow = false;
              //     VM.nowItme = {};
              //   });
              // },1500)
            }
          }
        } else if (INTERSECTED.name.indexOf(VM.cabinetChoseMenu) >= 0) {//判断碰撞对象是否是3D的切换菜单
          VM.show_threeD_chose_menu(event)
        } else {
          // VM.onDocumentMove_clear();//清除上一个机柜名提示
        }
      } else {
        if (INTERSECTED) {
          INTERSECTED.material.color.set(INTERSECTED.currentHex)
        }
        INTERSECTED = null
        // VM.onDocumentMove_clear();//清除上一个机柜名提示
      }
    },
    /*
    * 计算是第几个机柜，
    * x：当前点击的x轴；
    * page：当前第几面
    * */
    calc_show_point_x(x, page) {
      var VM = this;
      var current_x = -1;//找到当前选中的x是第几列机柜
      if (!!x) {
        return current_x
      }
      $.each(VM.cubeArry, (key, value) => {
        if (page <= 2 && key % 2 === 0) {//第一第二面，只需要遍历单数
          return true
        } else if (page > 2 && key % 2 === 1) {//第三第四面，只需要遍历双数
          return true
        }
        var cabinet_width = VM.calc_cabinet_width(value);
        if (x < cabinet_width) {
          current_x = key;
          return false
        }
        x = x - cabinet_width;
      });
      return current_x;
    },
    /*
    * 计算当前是第几个位置
    * y,当前的y轴
    * */
    calc_show_point_y(y) {
      return Math.floor(y / (this.objHeight / 5)) + 1;
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
    myCameraTween: function (cameraObj, angle, segs, during, tag, type) {
      var VM = this;
      var x = cameraObj.position.x, y = cameraObj.position.y, z = cameraObj.position.z;
      var endPosArray = [];
      var perAngle = angle / segs;//计算得到每次转的角度
      for (var i = 1; i <= segs; i++) {
        var endPos = {
          "x": z * Math.sin(i * perAngle) + x * Math.cos(i * perAngle),
          "y": y,
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
      if (!VM.renderer) {
        return;
      }
      cameraObj.position.set(endPosArray[0].x, endPosArray[0].y, endPosArray[0].z);
      VM.CAMERA.lookAt(new THREE.Vector3(VM.reset_camera.x, VM.reset_camera.y, VM.reset_camera.z));//VM.scene.position
      VM.isRoateing = false;
      VM.renderer.clear();//清除场景
      VM.render_render('myCameraTween');
      return
      var id = setInterval(function () {
        if (!VM.renderer) {
          return;
        }
        VM.renderer.clear();//清除场景
        VM.render_render('myCameraTween');
        if (flag == segs) {
          VM.mouseClickEndTime = VM.getTimeNow();
          VM.mouseClickDuringTime = VM.mouseClickEndTime - VM.mouseClickStartTime;//持续时间
          clearInterval(id);
          id = null;
        } else {
          cameraObj.position.set(endPosArray[flag].x, endPosArray[flag].y, endPosArray[flag].z);
          VM.CAMERA.lookAt(new THREE.Vector3(VM.reset_camera.x, VM.reset_camera.y, VM.reset_camera.z));//VM.scene.position
          flag++;
        }
      }, during / segs);
    },
    /************************************机柜详细信息弹窗*********************************/
    mainD_cabinet_Message: function () {//获取机柜详细信息
      var VM = this;
      if (!VM.activatedBoo) {
        return
      }
      VM.$axios({
        method: 'post',
        timeout: 5000,
        data: {
          //"index":VM.dev_index
          "box_index": VM.box_index
        },
        url: "/home.cgi/get_cabinet_info"
      }).then(function (data) {
        VM.cabinet_pop_title = data.box_name;
        VM.AveEnable = data.AveEnable;
        VM.main_cabinet_th(data.Tem_Humi);//创建机柜详细信息--温湿度
        //VM.main_cabinet_pd(data.pd);//创建机柜详细信息--配电柜
        loadingPage(false);
      });
    },
    /**
     * 文字颜色
     * 1正常，2异常，0 NA, -1 该数据无正常异常之说不标颜色
     */
    air_state_rule: function (getData, fixNumber) {
      var VM = this;
      var arrayData = [0, 0], DataValue = getData[0];
      if (!ifNullData(getData)) {
        if (arguments.length == 3 && !ifNullData(DataValue)) {//有传参数fix 且 不为空
          DataValue = Number(getData[0]).toFixed(fixNumber);//精确值
        }
        if ($.isArray(getData)) {//数据是数组形式
          arrayData = [DataValue, getData[1]]
        }
      } else {//数据为空
        arrayData = [0, 0]
      }
      return getTextColor(arrayData[0], arrayData[1], fixNumber).html;
    },
    main_cabinet_th: function (returnData) {//创建机柜详细信息--温湿度
      var VM = this;
      var cold_hot = {
        cold: [],
        hot: []
      };
      if (!ifNullData(returnData)) {
        if (!ifNullData(returnData.cold)) {
          cold_hot.cold = returnData.cold;
        }
        if (!ifNullData(returnData.hot)) {
          cold_hot.hot = returnData.hot;
        }
      }
      VM.cold_hot = cold_hot;
      return;
      var cold_hot = {cold: [], hot: []};
      if (!ifNullData(returnData)) {
        $.each(returnData, function (kl, vl) {
          if (kl == 'cold' || kl == 'hot') {
            if (ifNullData(vl)) {
              return;
            }
            var newArr = [];
            $.each(vl, function (key, value) {
              if (key != 'ave_temp' && key != 'ave_humi') {
                newArr.push({
                  title: value.dev_name,
                  temp: VM.air_state_rule(($.isArray(value.temp)) ? value.temp : [0, 0], 2),
                  humi: VM.air_state_rule(($.isArray(value.humi)) ? value.humi : [0, 0], 2)
                })
              }
            });
            if (!ifNullData(vl.ave_temp)) {
              newArr.push({
                title: '平均值',
                temp: VM.air_state_rule(vl.ave_temp, 2),
                humi: VM.air_state_rule(vl.ave_humi, 2)
              });
            }
            cold_hot[kl] = newArr;
          }
        })
      }
      VM.cold_hot = cold_hot;
    },
    main_cabinet_pd: function (returnData) {//创建机柜详细信息--配电柜
      var VM = this;
      var pc_data = [];
      var pc_data_rule = function (data) {
        var newArr = '';
        if (!ifNullData(data)) {
          newArr = VM.air_state_rule($('<span></span>'), data['a'], 2);
          if (!ifNullData(data['b'])) {//三相
            newArr += '/' + VM.air_state_rule($('<span></span>'), data['b'], 2);
            newArr += '/' + VM.air_state_rule($('<span></span>'), data['c'], 2);
          }
        } else {
          newArr = VM.air_state_rule($('<span></span>'), [0, 0], 2);
        }
        return newArr;
      };
      if (!ifNullData(returnData)) {
        $.each(returnData, function (key, value) {
          pc_data.push({
            title: value["dev_name"] + '—' + value["branch_name"],
            vol: pc_data_rule(value.vol),
            cur: pc_data_rule(value.cur),
            power: pc_data_rule(value.power)
          });
        });
      }
      VM.pc_data = pc_data;
    },
    main_event_action: function (urlF, dev_type, dev_index, sub_type) {//触发二级弹窗
      var VM = this;
      $("#event_more").unbind("mousedown").bind("mousedown", function (event) {//跳转事件详细信息
        event.preventDefault();
        $("#main_event_message,.maskLayer[pid=main_event_message]").remove();
        $pub.go_page_rule('PC', 'RecordsearchHistory', function () {
          var st = 'all', sN = 'all';
          if (!ifNullData(dev_type)) {
            st = dev_type;
            sN = dev_index;
          }
          $("#RH_devType").val(st);
          $("#RH_devName").val(sN);
          $("#RH_Recovery").val('true').data('func', function () {
            if (!ifNullData(sub_type)) {//返回开关量`
              $pub.go_page_rule('PC', urlF, function () {
                $("#Env_Eguard").find("input[name='devType']").val(dev_type);
                $("#Env_Eguard").find("input[name='swType']").val(sub_type);
              }, sub_type);
            } else {
              $pub.go_page_rule('PC', urlF);
            }
          });
          $("#RH_devType").trigger("click");
        });
      });

    },
    goto_login: function () {
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
    changeViewFun: function (flag, type) {
      var VM = this;
      if (VM.isLoading) {//正在渲染
        return
      }
      // clearTimeout(VM.lockTimeout);
      // VM.MyisRender = true;
      // VM.lockTimeout = setTimeout(()=>{
      //   VM.MyisRender = false;
      // },3000);
      VM.all_passageway_data = {};//切换视图的时候要重置一下旧数据
      VM.old_temp_camera_Obj = {};//切换视图的时候要重置一下旧数据
      VM.old_temp_camera_list = [];//切换视图的时候要重置一下旧数据
      VM.has_door = false;//重置一下是否加载了门
      VM.devShow = false;
      if (flag === 2) {
        VM.heatmap_type = 0;
        VM.heatmap_view = -1;
        if (VM.current_capacity_type === type) {//容量云图切换的时候点了当前类型
          return
        } else {
          VM.current_capacity_type = type
        }
        if (VM.viewFlag === 2) {//容量云图之间的切换
          this.$nextTick(() => {
            this.animation('changeView');
          });
          return
        } else {//切换到容量云图
          VM.threeD_rerender(flag);
          return
        }
      }
      VM.current_capacity_type = this.is_show_u ? 0 : 1;//重置一下，防止第一次点击不生效
      if (VM.viewFlag === flag) {
        return
      }
      this.threeD_chose_menu.map(item => {//重置一下
        item.showChildren = false
      })
      VM.heatmap_type = 0
      VM.cap_temp_type = -1
      VM.heatmap_view = -1
      VM.heatmap_view1 = -1
      VM.heatmap_view2 = -1
      VM.cap_temp_view = -1
      VM.threeD_rerender(flag)
    },
    threeD_rerender: function (flag) {
      var VM = this;
      VM.viewFlag = flag;
      VM.isTransparent = flag !== 4;
      VM.main_normal_close();
      VM.render_dispose();//清除缓存
      clearInterval(this.mainThreeI);
      // VM.$nextTick(() => {
      VM.ThreeDinterval();//设置定时器，实时刷新数据
      // });
    },
    clearFun: function () {
      var VM = this
      this.main_normal_close()
      clearInterval(this.mainThreeI)
      clearTimeout(this.Timeinterval_3d)
      clearInterval(this.heatmap_four_mesh_Timer)
      VM.webglcontextlost()
      VM.webglcontextrestored(0)
      VM.clearMesh(VM.scene)
      VM.clearMesh(VM.objGroup)
      VM.clearMesh(VM.cubeArry)
      VM.clearRenderer();
      VM.clearMtl(VM.jg_02);
      VM.clearMtl(VM.men_01);
      VM.clearMtl(VM.men_02);
      VM.clearMtl(VM.jg_03);
      VM.loadJPG.forEach((MTL, index) => {
        VM[MTL.data_name] = null
      })
      VM.scene = null
      VM.objGroup = null
      this.mainThreeI = null
      this.Timeinterval_3d = null
      // window.removeEventListener( 'click', VM.dev_click_fun(), false );
      window.removeEventListener("resize", VM.onWindowResize, false)
    },
    clearMesh(obj) {
      var VM = this;
      if (obj) {
        var tange = obj.children || obj;
        var key = 'mesh';
        for (var i = tange.length - 1; i >= 0; i--) {
          VM.clearCache(tange[i] ? tange[i][key] : tange[i]);
        }
      }
    },

    /*
    * 创建四个温度云图mesh
    * */
    init_heatmap_four_mesh: function () {
      var VM = this;
      if (VM.isTransparent && VM.viewFlag === 1) {//云图视图
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
        console.time('heatmap_three');
        for (let m = 1; m <= 13; m++) {
          var cubeArrL = VM.cubeArry.length;
          var width = VM.objLength + VM.objSingleWidth; // + VM.half_ll //这里删除了半个门的宽度，因为没加门
          // var width = VM.objLength + (VM.cubeArry[cubeArrL -1 ].width === 0 ? VM.objSingleWidth : 49); // 这里加的宽度要根据最后一个排机柜的宽度加
          var height = VM.objHeight + VM.objSmallHeight;
          var data_arr = [];//位置与数据对象数组
          var data_max = 0;//一组数据的最大值
          var opacity = 0.9;
          if (ifNullData(VM.all_passageway_data[m])) {
            VM.all_passageway_data[m] = {};
          }
          if (m <= 4) {
            var is_the_same = true;//是否和旧数据一样,默认需要渲染
            var n_arr = [];//有数据的下标数组
            for (var n = 0; n < cubeArrL; n++) {
              var passageway_data = [];//
              if ((m === 1 && n % 2 === 1) || (m === 4 && n % 2 === 0)) {//位置1: 单数,热通道 //位置4: 双数,热通道
                passageway_data = VM.set_temp_data_type(VM.cubeArry[n].hot_passageway, VM.key_hot);
              } else if ((m === 2 && n % 2 === 1) || (m === 3 && n % 2 === 0)) {//位置2: 单数,冷通道 //位置3: 双数,冷通道
                passageway_data = VM.set_temp_data_type(VM.cubeArry[n].cold_passageway, VM.key_cold);
              }
              if (!ifNullData(passageway_data)) {
                n_arr.push(n);
                if (!isEqual(VM.all_passageway_data[m][n], passageway_data)) {
                  // if (!VM.Is_the_same_with_old_data(m, n, passageway_data)){
                  is_the_same = false;
                }
                VM.all_passageway_data[m][n] = passageway_data;
                for (let k = 0; k < passageway_data.length; k++) {
                  var all_data = VM.cal_heatmap_data_position(width, height, cubeArrL, passageway_data[k], n, k, n_arr.indexOf(n));
                  // data_position.value = passageway_data[k].temp;
                  data_max = Math.max(data_max, all_data.max);
                  data_arr = [...data_arr, ...all_data.position_arr];
                  if (m === 2 && k === 1) {
                    VM.demo_point = {x: data_arr[0].x + data_arr[1].x, y: data_arr[0].y + data_arr[1].y}
                  }
                }

              }
            }
            if (is_the_same) {//如果和旧数据一样，那就别渲染了
              continue
            }
          } else {
            opacity = 0.95;
            width = VM.objSingleLength;
            height = VM.objHeight + VM.objSmallHeight;
            if (m === 6 || m === 9 || m === 12) {
              // continue
              height = VM.objLength + VM.objSingleWidth;// + VM.half_ll //这里删除了半个门的宽度，因为没加门
            }
          }
          if (m === 8 || m === 9 || m === 10) {//中间通道
            continue
          }
          // if (m === 5 || m === 7 || m === 11 || m === 13){//前门后门
          //   continue
          // }
          // if ( m === 6 || m === 12){//顶部内容
          //   continue
          // }
          var new_passageway_data = [];
          if (m === 5) {//位置5

            new_passageway_data = [...VM.set_temp_data_type(VM.cubeArry[1].hot_passageway, VM.key_hot),
              ...VM.set_temp_data_type(VM.cubeArry[1].cold_passageway, VM.key_cold)];

            // new_passageway_data = VM.cal_heatmap_ave_position(VM.cubeArry[1].hot_passageway, VM.cubeArry[1].cold_passageway);
          } else if (m === 6) {//位置6

            var new_all_hot1 = VM.cal_heatmap_one_position(VM.cal_heatmap_one_way_data(1, VM.key_way_hot), 1);
            var new_all_cold1 = VM.cal_heatmap_one_position(VM.cal_heatmap_one_way_data(1, VM.key_way_cold), 1);

            new_passageway_data = [...VM.set_temp_data_type(VM.cal_heatmap_ave_position(new_all_hot1, new_all_hot1, true), VM.key_hot),
              ...VM.set_temp_data_type(VM.cal_heatmap_ave_position(new_all_cold1, new_all_cold1, true), VM.key_cold)];

            // new_passageway_data = VM.cal_heatmap_ave_position(new_all_hot1, new_all_hot1, true);
          } else if (m === 7) {//位置7

            new_passageway_data = [...VM.set_temp_data_type(VM.cubeArry[cubeArrL - 1].hot_passageway, VM.key_hot),
              ...VM.set_temp_data_type(VM.cubeArry[cubeArrL - 1].cold_passageway, VM.key_cold)];

            // new_passageway_data = VM.cal_heatmap_ave_position(VM.cubeArry[cubeArrL - 1].hot_passageway, VM.cubeArry[cubeArrL - 1].cold_passageway);
          } else if (m === 8) {//位置8 //暂时不需要

            //奇数排冷通道当做热通道位置处理 偶数排冷通道当做冷通道位置处理
            new_passageway_data = [...VM.set_temp_data_type(VM.cubeArry[0].cold_passageway, VM.key_cold),
              ...VM.set_temp_data_type(VM.cubeArry[1].cold_passageway, VM.key_hot)];

            // new_passageway_data = VM.cal_heatmap_ave_position(VM.cubeArry[0].cold_passageway, VM.cubeArry[1].cold_passageway);
          } else if (m === 9) {//位置9

            var new_all_hot2 = VM.cal_heatmap_one_position(VM.cal_heatmap_one_way_data(1, VM.key_way_cold), 1);//奇数排冷通道
            var new_all_cold2 = VM.cal_heatmap_one_position(VM.cal_heatmap_one_way_data(0, VM.key_way_cold), 1);//偶数排冷通道

            //奇数排冷通道当做热通道位置处理 偶数排冷通道当做冷通道位置处理
            new_passageway_data = [...VM.set_temp_data_type(VM.cal_heatmap_ave_position(new_all_hot2, new_all_hot2, true), VM.key_hot),
              ...VM.set_temp_data_type(VM.cal_heatmap_ave_position(new_all_cold2, new_all_cold2, true), VM.key_cold)];

            // new_passageway_data = VM.cal_heatmap_ave_position(new_all_hot2, new_all_hot2, true);
          } else if (m === 10) {//位置10  //暂时不需要

            //奇数排冷通道当做热通道位置处理 偶数排冷通道当做冷通道位置处理
            new_passageway_data = [...VM.set_temp_data_type(VM.cubeArry[cubeArrL - 1].cold_passageway, VM.key_hot),
              ...VM.set_temp_data_type(VM.cubeArry[cubeArrL - 2].cold_passageway, VM.key_cold)];

            // new_passageway_data = VM.cal_heatmap_ave_position(VM.cubeArry[cubeArrL - 1].cold_passageway, VM.cubeArry[cubeArrL - 2].cold_passageway);
          } else if (m === 11) {//位置11

            new_passageway_data = [...VM.set_temp_data_type(VM.cubeArry[0].hot_passageway, VM.key_hot),
              ...VM.set_temp_data_type(VM.cubeArry[0].cold_passageway, VM.key_cold)];

            // new_passageway_data = [...VM.cubeArry[0].hot_passageway,...VM.cubeArry[0].cold_passageway];
            // new_passageway_data = VM.cal_heatmap_ave_position(VM.cubeArry[0].hot_passageway, VM.cubeArry[0].cold_passageway);
          } else if (m === 12) {//位置12

            var new_all_hot3 = VM.cal_heatmap_one_position(VM.cal_heatmap_one_way_data(0, VM.key_way_hot), 1);
            var new_all_cold3 = VM.cal_heatmap_one_position(VM.cal_heatmap_one_way_data(0, VM.key_way_cold), 1);

            new_passageway_data = [...VM.set_temp_data_type(VM.cal_heatmap_ave_position(new_all_hot3, new_all_hot3, true), VM.key_hot),
              ...VM.set_temp_data_type(VM.cal_heatmap_ave_position(new_all_cold3, new_all_cold3, true), VM.key_cold)];

            // new_passageway_data = VM.cal_heatmap_ave_position(new_all_hot3, new_all_hot3, true);
            // new_passageway_data = [...new_all_hot3,...new_all_cold3];
          } else if (m === 13) {//位置13

            new_passageway_data = [...VM.set_temp_data_type(VM.cubeArry[cubeArrL - 2].hot_passageway, VM.key_hot),
              ...VM.set_temp_data_type(VM.cubeArry[cubeArrL - 2].cold_passageway, VM.key_cold)];

            // new_passageway_data = [...VM.cubeArry[cubeArrL - 2].hot_passageway,...VM.cubeArry[cubeArrL - 2].cold_passageway];
            // new_passageway_data = VM.cal_heatmap_ave_position(VM.cubeArry[cubeArrL - 2].hot_passageway, VM.cubeArry[cubeArrL - 2].cold_passageway);

          }
          if (m > 4) {
            if (isEqual(VM.all_passageway_data[m], new_passageway_data)) {
              // if (VM.Is_the_same_with_old_data(m,null,new_passageway_data)){
              continue
            }
            VM.all_passageway_data[m] = new_passageway_data;
          }
          // console.log(m + ':' + JSON.stringify(new_passageway_data));
          if (!ifNullData(new_passageway_data)) {
            for (let k = 0; k < new_passageway_data.length; k++) {
              var all_data1 = VM.cal_heatmap_nine_data_position(width, height, new_passageway_data[k], new_passageway_data.length, m, k);
              // data_position.value = new_passageway_data[k].temp;
              data_max = Math.max(data_max, all_data1.max);
              data_arr = [...data_arr, ...all_data1.position_arr];
            }
          }
          VM.filter_repeat_point(data_arr);
          var heatmapBase64 = VM.init_heatmap(width, height, data_arr, data_max, m, VM.defaultRadius);//拿到base64的图片资源
          VM.heatmap_map[m - 1] = VM.init_heatmap_canvas(width, height, heatmapBase64);
          if (VM.heatmap_Mesh.length < 13) {//说明是第一次加载
            VM.init_heatmap_mesh(width, height, VM.heatmap_map[m - 1], m, opacity);
          } else {
            //注意这里减一是因为之前的设定就是m是从1开始的，方便位置计算
            new Promise((resolve,rejected)=>{
              VM.heatmap_Mesh[m - 1].material.needsUpdate = true;//使纹理可以更新
              VM.heatmap_Mesh[m - 1].geometry.colorsNeedUpdate = true;//使颜色可以更新
              VM.heatmap_Mesh[m - 1].material.map.dispose();
              resolve()
            }).then(()=>{
              VM.heatmap_Mesh[m - 1].material.map = VM.heatmap_map[m - 1];
              VM.render_render();//注意，这里是云图刷新数据后不更新的主要问题，主动render一次
            });
          }
        }
        console.timeEnd('heatmap_three');
      }
    },
    /*
    * 创建heatmap对象
    * 创建heatmap对象
    * */
    init_heatmap_mesh: function (width, height, heatmap, m, opacity) {
      var VM = this;
      $('.my_heatmap').remove();//删掉创建的dom
      var material = new THREE.MeshBasicMaterial({
        map: heatmap,//热力图贴图
        side: THREE.DoubleSide,
        // side:THREE.FrontSide,
        transparent: true,//是否使用透明度
        fog: false,
        opacity: opacity
      });
      var geometry = new THREE.PlaneGeometry(width, height);
      var heatmap_mesh = new THREE.Mesh(geometry, material);
      if (m >= 5) {//位置5以后的旋转
        VM.cal_heatmap_nine_position(heatmap_mesh, m);
      }
      var position = VM.cal_heatmap_position(m);
      heatmap_mesh.name = VM.cabinetTemp_ + m;
      heatmap_mesh.position.set(position.x, position.y, position.z);
      heatmap_mesh.material.needsUpdate = true;//材质可以更新
      heatmap_mesh.geometry.colorsNeedUpdate = true;//使颜色可以更新
      // heatmap_mesh.renderOrder = 1000;
      // heatmap_mesh.material.depthTest = false;
      VM.heatmap_Mesh[m - 1] = heatmap_mesh;//注意这里减一是因为之前的设定就是m是从1开始的，方便位置计算
      VM.scene.add(heatmap_mesh);
    },
    init_heatmap_canvas: function (width, height, heatmapBase64) {
      var heatmapImg = new Image();
      heatmapImg.src = heatmapBase64;
      heatmapImg.width = width;
      heatmapImg.height = height;
      return new THREE.CanvasTexture(heatmapImg)
    },
    init_heatmap: function (width, height, points, data_max, m, radius) {
      var VM = this
      // console.log(JSON.stringify(points));
      let new_data_max = VM.defaultDataMax//默认最大值
      let new_defaultRadius = VM.defaultRadius//默认渲染半径
      let per = new_data_max / new_defaultRadius//圈大小的系数
      if (data_max > VM.defaultDataMax) {
        // new_defaultRadius = data_max / per;
        new_data_max = data_max
      }
      if (m > 4) {
        // return VM.init_heatmap_mine(width, height, points, data_max, m);
      }
      if (m === 6 || m === 12) {//中间两个渲染大小大一点
        new_defaultRadius = 90
      }
      var heatmap_dom = document.createElement("div")//创建一个dom节点来渲染热力图
      // heatmap_dom.id = 'heatmap';
      heatmap_dom.setAttribute("class", "my_heatmap")
      //这里图片大小设置要和canvas一致，这边宽度需要加一个机柜，还不找到为什么
      $(heatmap_dom).css({width: width || "600px", height: height, display: "none"})
      $("#main_model").append(heatmap_dom)
      var HeatMapInstance = Heatmap.create({
        container: heatmap_dom,
        backgroundColor: 0xffff0a,//背景颜色
        // backgroundColor: '#ffffff',//背景颜色
        radius: radius || new_defaultRadius,//每个数据点的半径,
        // radius: (m > 4 ? 10 : 16),//每个数据点的半径,
        // maxOpacity: 1,//最大不透明度，如果设置了不透明度，就会给覆盖
        // minOpacity: 0,//最小不透明度，如果设置了不透明度，就会给覆盖
        blur: 0.99,//模糊因子，越高，渐变就越平滑，缺省0.85
        // opacity: 0.8,
        useGradientOpacity: true,//热力图渲染是否使用gradient渐变色的透明度
        gradient: VM.deal_heatmap_color_data(m)
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
      })
      /*假数据*/
      var pointss = [];
      var max = 0;
      var dataLimit = 1000;
      var flag = 0;
      for (let i = 0; i < dataLimit; i++) {
        if (i >= dataLimit / 2) {
          flag = 30
        }
        var val = Math.floor(Math.random() * flag);
        max = Math.max(max, val);
        var point = {
          x: Math.floor(Math.random() * width),
          y: Math.floor(Math.random() * height),
          value: val
        };
        pointss.push(point);
      }
      var data = {
        min: VM.defaultDataMin,//最小值默认设为0
        max: new_data_max,//最大值默认设为37
        data: points,
        // data: [...points,...pointss],
      };
      HeatMapInstance.setData(data);//从热图实例中删除所有先前存在的点，然后重新初始化数据存储。
      HeatMapInstance.repaint();//重绘
      VM.HeatMapInstance_Arr[m - 1] = HeatMapInstance;
      setTimeout(function () {
        $('.my_heatmap').remove();
      }, 1000);
      return HeatMapInstance.getDataURL();//返回的值是热图实例的base64编码的dataURL。
    },
    /*
    * 自定义处理渐变
    * */
    init_heatmap_mine: function (width, height, points, data_max, m) {
      var VM = this;
      var canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      var context = canvas.getContext("2d");
      var offset1 = 1;
      var offset2 = 0;
      if (m === 6 || m === 11 || m === 13) {
        offset1 = 0;
        offset2 = 1;
      }
      var Gradient = context.createLinearGradient(0, 0, width, 0);
      Gradient.addColorStop(offset1, '#14dcff');
      Gradient.addColorStop(offset2, '#96ff14');
      context.fillStyle = Gradient;
      context.fillRect(0, 0, width, height);
      //这里做超时回收是因为 new Image()的onload 是一个异步的加载过程，如果直接回收，会导致前面异步记载回来之后context的内容为空，drawImage报错，图片就画不出来了
      setTimeout(function () {
        //回收
        if (document.getElementById("CanvasHide")) {
          document.getElementById("CanvasHide").appendChild(canvas);/*放入垃圾桶*/
          document.getElementById("CanvasHide").innerHTML = '';//将a从页面上删除 /*清除垃圾桶*/
        }
        canvas = null;
        context = null;
      }, 1000);
      return canvas.toDataURL()
    },
    /*
    * 处理温度值与颜色对应的方法
    * */
    deal_heatmap_color_data: function (m) {
      var VM = this;
      var gradient = {};
      var subIndex = 0;
      if (m === 1 || m === 4) {
        subIndex = 1;
      }
      VM.heatmap_data_list.forEach((coe, index) => {
        // if (index === 0 || index === 1){
        //   return
        // }
        if (index >= subIndex) {
          gradient[coe] = VM.color_list[index]
        }
      });
      return gradient
    },
    /*
    * 处理一下色值参考
    * */
    deal_color_list: function () {
      //这里显示需要剔除一个为0的底色值
      var new_color_list = this.color_list.filter((color, index) => {
        // return index !== 0 && index !== 1
        return color
      });
      $('#color_temp').css('background-image', 'linear-gradient(to right,' + new_color_list.join(',') + ')');
      this.calc_color_position('temp_16', 17);
      this.calc_color_position('temp_22', 23);
      this.calc_color_position('temp_28', 29);
      this.calc_color_position('temp_34', 36);
    },
    calc_color_position: function (Idn, temp) {
      var dom = $('#' + Idn);
      dom.css('left', `${((temp - 16) / (37 - 16)) * $('#color_temp').width() - dom.width() / 2}px`);
    },
    deal_cap_color_list: function () {
      var VM = this;
      var key_arr = [];
      var new_color_list = VM.capacity_color_list.map((color, index) => {
        // return index !== 0 && index !== 1
        key_arr.push(color.key);
        return color.color
      });
      // $('#color_cap').css('background-image', 'linear-gradient(to right,' + new_color_list.join(',') + ')');
      for (let i = 0; i < key_arr.length; i++) {
        var value = key_arr[i];
        if (value !== 0) {
          value -= 10
        }
        var id = 'cap_' + value;
        var span_html = `<span id="${id}">${value}</span>`;
        if (i === key_arr.length - 1) {
          span_html = `<span id="${id}">${value}</span><span id="cap_100">100</span>`
        }
        $('#color_cap').append(`<div id="${id} + '_div'" style="background: ${new_color_list[i]}" class="cap_color_div">${span_html}</div>`)
        // $('#cap_num').append(`<span id="${id}">${value}</span>`)
        // VM.calc_cap_color_position(id, value);
      }
    },
    calc_cap_color_position: function (Idn, val) {
      var dom = $('#' + Idn);
      dom.css('left', `${(val / 100) * $('#color_cap').width() - dom.width() / 3}px`);
    },

    /**
     *  容量云图
     */
    /*
    * 抛弃
    * 原理，将机柜的y轴进行偏移达到显示效果内容，底部有做隐藏，因为Y轴在 initObject 中拉伸了0.2，所以这里要考虑进去
    * per 机柜使用数，后台返回没有百分比，但表示的是百分数,只取正数
    * 5 微调
    * */
    new_calc_capacity_position: function (per) {
      return -(this.objCabinetHeight + this.objCabinetBottomHeight) / 100 * (100 - Math.abs(per)) - this.objCabinetBottomHeight - 5;
    },
    /*
    * 处理容量云图模式，
    * 1：使用率
    * 2：制冷率
    * 3：U位
    * */
    deal_capacity_type: function (i) {
      var current_key = this.get_current_capacity_key();
      var current_per = this.cubeArry[i][current_key];
      var old_current_per = this.cubeArry[i]['old_' + current_key];
      // if (current_per == old_current_per){//如果值不变而且已经设置过一次了，那不需要重新渲染
      //   if (this['has_old_' + current_key]) {
      //     return
      //   }
      // }
      // this['has_old_' + current_key] = true;
      this.clearCache(this.cubeArry[i].mesh);
      this.cubeArry[i]['old_' + current_key] = current_per;
      this.mesh2[i].userData = {per: current_per};//记录一下当前的温度值
      this.mesh2[i].material.map = this.initCabinetPercent(current_per, this.calc_cabinet_width(this.cubeArry[i]), 0, i);//设备容量数值
      current_per = this.check_value(current_per);
      this.creat_capacity_Mesh(this.new_calc_capacity_position1(current_per), i);//创建立体模型
      // this.cube[i].position.setY(this.new_calc_capacity_position(current_per));// 容量云图实现依据，将机柜的Y轴进行偏移达到效果
    },
    /*
    * 处理容量云图颜色，找接近的颜色值，以差值10为分界
    * capacity_color_list
    * */
    deal_capacity_color: function (i, value, defaultColor) {
      var VM = this
      var color = defaultColor || VM.capacity_color_list[0]
      var flag = false
      var current_per = ifNullData(i) ? value : VM.cubeArry[i][VM.get_current_capacity_key(i)]
      $.each(VM.capacity_color_list, (index, item) => {
        if (flag) {
          return
        }
        if (current_per < item.key) {
          flag = true;
          if (index !== 0 && (item.key - current_per > 10)) {
            color = VM.capacity_color_list[index - 1].color
          } else {
            color = item.color
          }
        } else if (current_per == item.key) {
          color = item.color
        } else if (current_per > 100) {
          flag = true;
          color = VM.capacity_color_list[VM.capacity_color_list.length - 1].color
        }
      });
      return color
    },
    /*
    * 获取当前容量类型
    * */
    get_current_capacity_key: function (i) {
      var VM = this
      var new_key = "pdc_rate"
      $.each(VM.capacity_type_list, (index, value) => {
        if (VM.current_capacity_type === value.index) {
          new_key = value.key
        }
      })
      return new_key
    },
    /*
    * 创建容量云图的模型
    * 根据位置计算偏移量，
    *
    * */
    creat_capacity_Mesh: function (height, i) {
      if (height === 0) {//如果是0 就不画了
        return
      }
      var VM = this
      var x = VM.cubeArry[i].x
      var z = VM.objSingleLength
      var singleWidth = VM.calc_cabinet_width(VM.cubeArry[i])
      var cur_capacity = VM.capacity_type_list.find(item => item.index === VM.current_capacity_type)
      var color = cur_capacity ? cur_capacity.colors[0] : "#4cbcff"//柱体颜色
      if (i % 2 === 0) {//偶数，后面一排
        z = -z
        color = cur_capacity ? cur_capacity.colors[1] : "#3cebff"
      }
      var geometry = new THREE.BoxGeometry(singleWidth - 4, height, VM.objSingleLength - 10)//盒子模型 减 4是因为有间隙 4
      var material = new THREE.MeshPhysicalMaterial({
        // color:VM.deal_capacity_color(i),
        color: color,
        emissive: "#000000",//底色
        roughness: 0.4,//光滑程度
        metalness: 0.1,//金属性贴图亮度
        reflectivity: 0.68,//发亮点大小
        transparent: false,
        opacity: 0.85
      })//材料
      var mesh = new THREE.Mesh(geometry, material)
      mesh.position.x = x - VM.MmovL - 2//这里减去自己的2分之一参考initObject中的位置设置 搜关键字  VM.cubeArry[iNum].x - movL  MmovL是个累加值
      mesh.position.y = height / 2 + this.objCabinetBottomHeight
      mesh.position.z = z
      // mesh.renderOrder = 1000;
      // mesh.material.depthTest = false;
      VM.cubeArry[i].mesh = mesh
      // VM.mesh5[i] = mesh;
      VM.scene.add(mesh)
    },
    /**
     *  温度柱图
     */
    deal_capacity_temp_column: function (i, key) {
      var temp_hot = this.cubeArry[i][key]
      // var old_temp_hot = this.cubeArry_old[i][key]//旧值
      // if (temp_hot === old_temp_hot){
      //   return
      // }
      this.mesh3[i + key].material.map = this.initCabinetPercent(temp_hot, this.calc_cabinet_width(this.cubeArry[i]))//设备容量数值
      temp_hot = this.check_value(temp_hot)
      this.creat_capacity_temp_Mesh(this.new_calc_capacity_position1(temp_hot), i, temp_hot, key)//创建立体模型
    },
    /*
    * 创建温度柱图的模型
    * 根据位置计算偏移量，
    *
    * */
    creat_capacity_temp_Mesh: function (height, i, value, key) {
      var VM = this
      if (height === 0 && VM.mesh4[i + key + "_mesh"]) {//如果是0 就不画了，再去清理一下之前创建过的
        VM.clearCache(VM.mesh4[i + key + "_mesh"])
        return
      }
      var visible//这里处理显示是因为若是选了某个通道情况下，机柜数值发生变化，会全部显示出来
      if (VM.cap_temp_type < 0) {//显示全部
        visible = true
      } else {
        // if (VM.cap_temp_type === 0){//显示前排
        //   visible = i % 2 === 1
        //   if (VM.cap_temp_view > 0 ){//选了某个通道
        //     if (key === 'temp_hot'){//热通道
        //       visible = i % 2 === 1 && VM.cap_temp_view === 1
        //     }else{
        //       visible = i % 2 === 1 && VM.cap_temp_view === 0
        //     }
        //   }
        // }else{//显示后排
        //   visible = i % 2 === 0
        //   if (VM.cap_temp_view > 0 ){//选了某个通道
        //     if (key === 'temp_hot'){//热通道
        //       visible = i % 2 === 0 && VM.cap_temp_view === 1
        //     }else{
        //       visible = i % 2 === 0 && VM.cap_temp_view === 0
        //     }
        //   }
        // }
        if (VM.cap_temp_type === 0) {//热通道1
          visible = i % 2 === 1 && key === "temp_hot"
        } else if (VM.cap_temp_type === 1) {//冷通道1
          visible = i % 2 === 1 && key === "temp_cold"
        } else if (VM.cap_temp_type === 2) {//热通道2
          visible = i % 2 === 0 && key === "temp_hot"
        } else if (VM.cap_temp_type === 3) {//冷通道2
          visible = i % 2 === 0 && key === "temp_cold"
        }
      }

      var x = VM.cubeArry[i].x
      var z = VM.objSingleLength / 2
      var singleWidth = VM.calc_cabinet_width(VM.cubeArry[i])
      var color
      if (i % 2 === 0) {//偶数，后面一排
        z = -z
        if (key === "temp_hot") {//热通道
          color = "#83ff62"
        } else {
          color = "#4cbcff"
        }
      } else {
        if (key === "temp_hot") {//热通道
          color = "#ff8e52"
        } else {
          color = "#3cebff"
        }
      }
      // if (value >= 90){//超过90设置为红色
      //   color = "#e54545";
      // }
      var geometry = new THREE.BoxGeometry(singleWidth - 4, height, VM.objSingleLength / 2 - 10)//盒子模型 减 4是因为有间隙 4
      var material = new THREE.MeshPhysicalMaterial({
        // color: VM.deal_capacity_color(null,value),
        color: color,
        emissive: "#000000",//底色
        roughness: 0.4,//光滑程度
        metalness: 0.1,//金属性贴图亮度
        reflectivity: 0.68,//发亮点大小
        transparent: false,
        opacity: 0.85,
        blendDstAlpha: 0.5
      })//材料
      var mesh = new THREE.Mesh(geometry, material)
      mesh.position.x = x - VM.MmovL - 2//这里减去自己的2分之一参考initObject中的位置设置 搜关键字  VM.cubeArry[iNum].x - movL  MmovL是个累加值
      mesh.position.y = height / 2 + this.objCabinetBottomHeight
      mesh.position.z = z * (key === "temp_hot" ? 2.5 : 1.5)
      mesh.visible = visible
      // mesh.renderOrder = 1000;
      // mesh.material.depthTest = false;
      // VM.clearCache(VM.cubeArry[i][key + '_mesh']);
      VM.clearCache(VM.mesh4[i + key + "_mesh"])
      // VM.cubeArry[i][key + '_mesh'] = mesh;
      VM.mesh4[i + key + "_mesh"] = mesh
      if (height !== 0) {
        VM.scene.add(mesh)
      }
    },

    /*3个横切面测试使用*/
    init_three_heat_map() {
      var VM = this
      if (VM.isTransparent && VM.viewFlag === 1) {//云图视图
        var cubeArrL = VM.cubeArry.length
        var width = VM.objLength + (VM.cubeArry[VM.cubeArry.length - 1].width === 0 ? VM.objSingleWidth : 49) // 这里加的宽度要根据最后一个排机柜的宽度加
        var height = VM.objAllCabinetWidth//机柜两排，以及中间通道各为120

        for (let i = 0; i < 3; i++) {
          VM.all_passageway_data[i + 101] = {};
          var data_max = 0;
          var data_arr = [];//位置与数据对象数组
          var j_arr = [];//有数据的下标数组
          var is_the_same = true;//是否和旧数据一样
          $('.my_heatmap').remove();//删掉创建的dom
          /*
          * 温度位置计算：原点在左上角
          * 上：所有机柜中位置为1的数据；
          * 中：所有机柜中位置为3的数据；
          * 下：所有机柜中位置为5的数据；
          * position计算为 俯视图，从上往下 5个点
          * 位置1：机柜下标为偶数的热通道温度值；
          * 位置2：机柜下标为偶数的冷通道温度值；
          * 位置3：（机柜下标为偶数的冷通道温度值 + 机柜下标为奇数的冷通道温度值） / 2；
          * 位置4：机柜下标为奇数的冷通道温度值；
          * 位置5：机柜下标为奇数的热通道温度值；
          * */
          var need_position = 1;
          if (i === 0) {//上
            need_position = 1
          } else if (i === 1) {//中
            need_position = 3
          } else if (i === 2) {//下
            need_position = 5
          }
          var all_hot_odd = VM.set_temp_data_type(VM.cal_heatmap_one_way_data(0, VM.key_way_hot), VM.key_hot);
          var all_cold_odd = VM.set_temp_data_type(VM.cal_heatmap_one_way_data(0, VM.key_way_cold), VM.key_cold);
          var all_cold_even = VM.set_temp_data_type(VM.cal_heatmap_one_way_data(1, VM.key_way_cold), VM.key_cold);
          var all_hot_even = VM.set_temp_data_type(VM.cal_heatmap_one_way_data(1, VM.key_way_hot), VM.key_hot);
          var pos_data = {
            pos_1: VM.cal_heatmap_one_position(all_hot_odd, need_position),//用作位置1的数据
            pos_2: VM.cal_heatmap_one_position(all_cold_odd, need_position),//用作位置2的数据
            pos_4: VM.cal_heatmap_one_position(all_cold_even, need_position),//用作位置4的数据
            pos_5: VM.cal_heatmap_one_position(all_hot_even, need_position),//用作位置5的数据
          };
          pos_data.pos_3 = VM.cal_heatmap_ave_position(pos_data.pos_2, pos_data.pos_4);
          for (let j = 0; j < cubeArrL / 2; j++) {
            var passageway_data = [];//俯视一列机柜的5个位置图
            for (let pos = 1; pos <= 5; pos++) {//五个位置的数据设置 组成第几排机柜的位置为pos的值
              var current_data = JSON.parse(JSON.stringify(pos_data['pos_' + pos][j]));//这里要深拷贝不然会影响原来的值
              current_data.position = pos;
              passageway_data.push(current_data);
            }
            if (!ifNullData(passageway_data)) {
              var jj = j * 2;//这里* 2 是为了保证计算机柜宽度的时候是以某一排为准，当前以偶数排为基准
              j_arr.push(jj);
              if (!isEqual(VM.all_passageway_data[i + 101][jj], passageway_data)) {
                // if (!VM.Is_the_same_with_old_data(i + 101,jj,passageway_data)){
                is_the_same = false
              }
              VM.all_passageway_data[i + 101][jj] = passageway_data;
              for (let k = 0; k < passageway_data.length; k++) {
                var all_data = VM.cal_heatmap_data_position(width, height, cubeArrL, passageway_data[k], jj, k, j_arr.indexOf(jj));
                data_max = Math.max(data_max, all_data.max);
                data_arr = [...data_arr, ...all_data.position_arr];
              }
            }
          }
          if (is_the_same) {//如果和旧数据一样，那就别渲染了
            continue
          }
          VM.filter_repeat_point(data_arr);
          VM.init_three_mesh(width, height, data_arr, data_max, i);
        }
      }
    },
    init_three_mesh(width, height, data_arr, data_max, i) {
      var VM = this;
      var heatmapBase64 = VM.init_heatmap(width, height, data_arr, data_max, i + 101);//拿到base64的图片资源
      // VM.clearCache(VM.heatmap_map_three[i]);//对之前存在的对象也最好清除一下，待测试
      VM.heatmap_map_three[i] = VM.init_heatmap_canvas(width, height, heatmapBase64);
      if (VM.heatmap_Mesh_three.length >= 3) {//说明加载过了
        new Promise((resolve,rejected)=>{
          VM.heatmap_Mesh_three[i].material.needsUpdate = true;//使纹理可以更新
          VM.heatmap_Mesh_three[i].geometry.colorsNeedUpdate = true;//使颜色可以更新
          VM.heatmap_Mesh_three[i].material.map.dispose();
          resolve()
        }).then(()=>{
          VM.heatmap_Mesh_three[i].material.map = VM.heatmap_map_three[i];
          VM.render_render();//注意，这里是云图刷新数据后不更新的主要问题，主动render一次
        });
        return
      }
      var material = new THREE.MeshBasicMaterial({
        map: VM.heatmap_map_three[i],//热力图贴图
        side: THREE.DoubleSide,
        // side:THREE.FrontSide,
        transparent: true,//是否使用透明度
        fog: false,
        opacity: 0.7
      });
      var geometry = new THREE.PlaneGeometry(width, height);
      var heatmap_mesh = new THREE.Mesh(geometry, material);
      heatmap_mesh.rotateX(-Math.PI / 2);//右手世界坐标定理
      // heatmap_mesh.rotateZ(Math.PI / 2);
      var position = VM.calc_three_position(i);
      heatmap_mesh.position.set(position.x, position.y + 2, position.z);
      // heatmap_mesh.position.set(0, 300 , 0);
      heatmap_mesh.name = VM.cabinetTemp_ + (i + 101);//注册名字
      heatmap_mesh.material.needsUpdate = true;//材质可以更新
      heatmap_mesh.material.precision = 'mediump';//重写材质精度 可以是"highp", "mediump" 或 "lowp"。默认值为null。
      heatmap_mesh.geometry.colorsNeedUpdate = true;//使颜色可以更新

      // heatmap_mesh.renderOrder = 1000;
      // heatmap_mesh.material.depthTest = false;
      VM.clearCache(VM.heatmap_Mesh_three[i]);
      heatmap_mesh.visible = false;
      VM.heatmap_Mesh_three[i] = heatmap_mesh;//注意这里减一是因为之前的设定就是m是从1开始的，方便位置计算
      VM.scene.add(heatmap_mesh);
    },
    change_heatmap_view(event, flag, key) {
      event.stopPropagation()//事件阻止
      var VM = this
      // var flag = $(event.target).val() || value;
      this[key] = flag
      flag = Number(flag)
      if (this.viewFlag === 1) {
        if (this.heatmap_type < 0) {//三个平面
          for (let i = 0; i < 3; i++) {
            this.heatmap_Mesh_three[i].visible = flag < 0 || i === flag
          }
        } else if (this.heatmap_type === 0) {//全景视图
          let hide_position_list = []//需要隐藏的位置
          if (flag >= 0) {//选了具体的哪一排
            if (flag === 0) {//选了显示前排
              hide_position_list = [3, 4, 11, 12, 13]//需要改动的mesh对象相对位置
            } else {
              hide_position_list = [1, 2, 5, 6, 7]//需要改动的mesh对象相对位置
            }
          }
          this.heatmap_Mesh.forEach((item, index) => {
            item.visible = hide_position_list.indexOf(index + 1) < 0
          })
        } else {//立面视图
          const four_list = [1, 2, 3, 4]
          this.heatmap_Mesh.forEach((item, index) => {
            item.visible = (flag < 0 && four_list.indexOf(index + 1) >= 0) || index === flag
          })
        }
      } else if (this.viewFlag === 6) {
        //暂时无用
        let keys = Object.keys(this.mesh4)
        keys.forEach((item, index) => {//温度柱图
          if (index >= keys.length / 2) {
            return false
          }
          if (flag === 1) {//热通道
            if ((VM.cap_temp_type === 0 && index % 2 === 1) || (VM.cap_temp_type === 1 && index % 2 === 0)) {//前排机柜 后排机柜
              VM.meshVisibleChange(VM.mesh3[index + "temp_hot"], true)
              VM.meshVisibleChange(VM.mesh4[index + "temp_hot_mesh"], true)
            } else {
              VM.meshVisibleChange(VM.mesh3[index + "temp_hot"], false)
              VM.meshVisibleChange(VM.mesh4[index + "temp_hot_mesh"], false)
            }
            VM.meshVisibleChange(VM.mesh3[index + "temp_cold"], false)
            VM.meshVisibleChange(VM.mesh4[index + "temp_cold_mesh"], false)
          } else {//冷通道
            if ((VM.cap_temp_type === 0 && index % 2 === 1) || (VM.cap_temp_type === 1 && index % 2 === 0)) {//前排机柜 后排机柜
              VM.meshVisibleChange(VM.mesh3[index + "temp_cold"], true)
              VM.meshVisibleChange(VM.mesh4[index + "temp_cold_mesh"], true)
            } else {
              VM.meshVisibleChange(VM.mesh3[index + "temp_cold"], false)
              VM.meshVisibleChange(VM.mesh4[index + "temp_cold_mesh"], false)
            }
            VM.meshVisibleChange(VM.mesh3[index + "temp_hot"], false)
            VM.meshVisibleChange(VM.mesh4[index + "temp_hot_mesh"], false)
          }
        })
      }
      this.$nextTick(() => {
        VM.render_render()
      })
    },
    change_heatmap_view1(flag, key) {
      // var flag = $(event.target).val();
      var VM = this
      var threeD_show = true//是否显示3D
      this.threeD_chose_menu.map(item => {
        if (item.value === flag && item.children) {
          item.showChildren = !item.showChildren
        } else {
          item.showChildren = false
        }
      })
      this[key] = flag
      this.heatmap_view = -1//这里重置一下上中下选项问题
      this.heatmap_view1 = -1//这里重置一下上中下选项问题
      this.heatmap_view2 = -1//这里重置一下上中下选项问题
      this.cap_temp_view = -1//这里重置一下冷热通道选项问题
      threeD_show = flag < 0
      if (this.viewFlag === 1) {//温度云图菜单切换
        for (let i = 0; i < 3; i++) {
          if (this.heatmap_Mesh_three[i]) {
            this.heatmap_Mesh_three[i].visible = threeD_show
          }
        }
        this.heatmap_Mesh.forEach((item, index) => {
          if (flag === 1) {//立面视图,前面四个面
            item.visible = index < 4
          } else {
            item.visible = !threeD_show
          }
        })
      } else if (this.viewFlag === 6) {//温度柱图菜单切换
        let keys = Object.keys(this.mesh4)
        keys.forEach((item, index) => {//温度柱图
          if (index >= keys.length / 2) {
            return false
          }
          if (flag < 0) {
            VM.meshVisibleChange(VM.mesh3[index + "temp_hot"], true)
            VM.meshVisibleChange(VM.mesh3[index + "temp_cold"], true)
            VM.meshVisibleChange(VM.mesh4[index + "temp_hot_mesh"], true)
            VM.meshVisibleChange(VM.mesh4[index + "temp_cold_mesh"], true)
          } else {
            if (flag === 0) {//热通道1
              VM.meshVisibleChange(VM.mesh3[index + "temp_hot"], index % 2 === 1)
              VM.meshVisibleChange(VM.mesh3[index + "temp_cold"], false)
              VM.meshVisibleChange(VM.mesh4[index + "temp_hot_mesh"], index % 2 === 1)
              VM.meshVisibleChange(VM.mesh4[index + "temp_cold_mesh"], false)
            } else if (flag === 1) {//冷通道1
              VM.meshVisibleChange(VM.mesh3[index + "temp_hot"], false)
              VM.meshVisibleChange(VM.mesh3[index + "temp_cold"], index % 2 === 1)
              VM.meshVisibleChange(VM.mesh4[index + "temp_hot_mesh"], false)
              VM.meshVisibleChange(VM.mesh4[index + "temp_cold_mesh"], index % 2 === 1)
            } else if (flag === 2) {//热通道2
              VM.meshVisibleChange(VM.mesh3[index + "temp_hot"], index % 2 === 0)
              VM.meshVisibleChange(VM.mesh3[index + "temp_cold"], false)
              VM.meshVisibleChange(VM.mesh4[index + "temp_hot_mesh"], index % 2 === 0)
              VM.meshVisibleChange(VM.mesh4[index + "temp_cold_mesh"], false)
            } else if (flag === 3) {//冷通道2
              VM.meshVisibleChange(VM.mesh3[index + "temp_hot"], false)
              VM.meshVisibleChange(VM.mesh3[index + "temp_cold"], index % 2 === 0)
              VM.meshVisibleChange(VM.mesh4[index + "temp_hot_mesh"], false)
              VM.meshVisibleChange(VM.mesh4[index + "temp_cold_mesh"], index % 2 === 0)
            }
          }
          // if ((flag === 0 && index % 2 === 1) || (flag === 1 && index % 2 === 0)){//前面一排，后面一排
          //   VM.mesh3[index + 'temp_hot'].visible = true;
          //   VM.mesh3[index + 'temp_cold'].visible = true;
          //   VM.mesh4[index + 'temp_hot_mesh'].visible = true;
          //   VM.mesh4[index + 'temp_cold_mesh'].visible = true;
          // }else{
          //   VM.mesh3[index + 'temp_hot'].visible = false;
          //   VM.mesh3[index + 'temp_cold'].visible = false;
          //   VM.mesh4[index + 'temp_hot_mesh'].visible = false;
          //   VM.mesh4[index + 'temp_cold_mesh'].visible = false;
          // }
        })
      }
      this.$nextTick(() => {
        VM.render_render()
      })
    },
    /*
    * 3个平面位置计算
    * 1：顶部，x:0，y机柜的高度，z:0
    * 2：顶部，x:0，y机柜的高度一半，z:0
    * 3：顶部，x:0，y：0，z:0
    * */
    calc_three_position(i) {
      var height = this.objHeight + this.objSmallHeight;//机柜的整体高度
      var position_obj = {x: 0, y: height / 2, z: 0};
      switch (Number(i)) {
        case 0:
          position_obj.y = height;
          break;
        case 1:
          break;
        case 2:
          position_obj.y = 0;
          break
      }
      return position_obj
    },


    check_value(value) {
      if (ifNullData(value)) {
        return 0;
      } else if (value > 100) {
        return 100
      } else {
        return value
      }
    },
    /*
    * 计算柱状图高度
    * */
    new_calc_capacity_position1: function (per) {
      // return this.objCabinetHeight / 100 * Math.abs(per);
      return this.objCabinetHeight / 100 * per
    },
    calc_cabinet_width(data) {
      var width = data.width;
      if (width == 1) { //0 全柜  1 半柜
        return this.objSingleHalfWidth;
      } else {
        return this.objSingleWidth;
      }
    },
    initMouseClick: function () {
      var VM = this;
      // document.addEventListener('mousemove', function(){
      //   event.preventDefault();
      //   VM.MOUSE.x = (event.clientX / window.innerWidth) * 2 - 1;
      //   VM.MOUSE.y = -(event.clientY / window.innerHeight) * 2 + 1;
      // }, false);
      window.addEventListener('click', VM.dev_click_fun(), false);
    },
    /*
        添加光投射器 及 鼠标二维向量 用于捕获鼠标移入物体
        下次渲染时，通过mouse对于的二维向量判断是否经过指定物体
    */
    renderRaycasterObj: function () {
      var VM = this;
      VM.RAYCASTER = new THREE.Raycaster();//光线投射器
      VM.MOUSE = new THREE.Vector2();//二维向量
      VM.RAYCASTER.setFromCamera(VM.MOUSE, VM.CAMERA);
      var intersects = VM.RAYCASTER.intersectObjects(VM.scene.children);
      if (intersects.length > 0) {
        var currentProjectiveObjT = intersects[0].object;
        if (VM.projectiveObj != currentProjectiveObjT) {

          if ((currentProjectiveObjT instanceof THREE.AxesHelper)) {
            //穿过的是坐标轴线和网格线
            return;
          }

          VM.projectiveObj = intersects[0].object;
          VM.projectiveObj.material.color.setHex(VM.projectiveObj.currentHex);
        }
      } else {
        VM.projectiveObj = null;
      }
    },
    dev_click_fun: function () {
      var VM = this;
      if (VM.projectiveObj) {
        console.log(VM.projectiveObj);
        if (VM.projectiveObj.hasChecked) {
          VM.projectiveObj.hasChecked = false;
          VM.projectiveObj.material.color.set("gray");
        } else {
          VM.projectiveObj.hasChecked = true;
          VM.projectiveObj.material.color.set("#dd830d");
        }
      }
    },
    // 提前加载一些材料 贴图使用
    loadMaterial(loadList) {
      var VM = this;
      var basePath = '/static/models/';
      var Loader = {
        MTLLoader: new MTLLoader(),
        OBJLoader: new OBJLoader(),
        TextureLoader: new THREE.TextureLoader(),
      };
      loadList.forEach((MTL, index) => {
        Loader[MTL.loader].setPath(basePath);
        if (MTL.mtl && VM[MTL.mtl]) {
          Loader[MTL.loader].setMaterials(VM[MTL.mtl]);
        }
        Loader[MTL.loader].load(MTL.name, (material) => {
          if (MTL.children) {// 有子集
            material.preload();
          }
          VM[MTL.data_name] = material;
          if (MTL.children) {
            VM.loadMaterial(MTL.children)
          }
          VM.Loadover--;
        }, VM.onProgress, VM.onError);
      })
    },
    // 加载材质
    loadMaterialNew(loader) {
      const VM = this;
      var mtlLoader = new MTLLoader();
      mtlLoader.setPath(VM.basicURL);
      return new Promise((resolve, reject) => {
        mtlLoader.load(loader.name, (materials) => {//普通机柜
          materials.preload();
          VM[loader.data_name] = materials;
          resolve()
        });
        mtlLoader = null;
      })
    },
    // 加载对象
    loadObjectNew(loader) {
      const VM = this;
      var objLoader = new OBJLoader();
      objLoader.setMaterials(VM[loader.data_name]);
      objLoader.setPath(VM.basicURL);
      return new Promise((resolve, reject) => {
        objLoader.load(loader.children.name, (oo) => {
          VM[loader.children.data_name] = oo;
          resolve()
        }, VM.onProgress, VM.onError);
        objLoader = null;
      })
    },
    onProgress(xhr) {
    },
    onError(xhr) {
    },
    set_line_geometry(group, vector = {x: 0, y: 0, z: 0}, color = 0x0096FF) {
      var VM = this
      if (group instanceof THREE.Group && !ifNullData(group.children)) {
        for (let i = 0; i < group.children.length; i++) {
          // var edges = new THREE.EdgesHelper( group.children[i], 0x0096FF );
          var line = new THREE.LineSegments(new THREE.EdgesGeometry(group.children[i].geometry), new THREE.LineBasicMaterial({color: color}))
          line.position.set(vector.x, vector.y, vector.z)
          VM.scene.add(line)
        }
      }
    },
    //筛选特别相近的点
    filter_repeat_point(data_arr) {
      var VM = this;
      var per = VM.limit_per;
      var need_splice = new Set();//需要删掉的
      for (let i = data_arr.length - 1; i >= 0; i--) {
        for (let j = data_arr.length - 1; j >= 0; j--) {
          //两个点如果x轴与y轴 都过近,就删掉这个点
          if (i === j) {//屏蔽自己
            continue
          }
          if (Math.abs(data_arr[i].x - data_arr[j].x) <= per && Math.abs(data_arr[i].y - data_arr[j].y) <= per
            && !data_arr[j].root && !data_arr[j].baseroot // 针对与原始数据不能删除
          ) {
            need_splice.add(j)
          }
        }
      }
      need_splice.forEach((item, index) => {
        data_arr.splice(item, 1);
      })
    },
    //对比旧数据，如果没变化，就不用重新渲染了 ,true 不需要重新渲染，false 需要渲染
    /**
     * @return {boolean}
     */
    Is_the_same_with_old_data(m, n, data) {
      var VM = this;
      var is_the_same = true;
      var compare_data = VM.all_passageway_data[m];
      if (!ifNullData(n)) {
        compare_data = compare_data[n];
      }
      if (ifNullData(compare_data)) {//表示第一次渲染
        return !is_the_same
      }
      VM.sort_fun(data, 'position');
      VM.sort_fun(compare_data, 'position');
      $.each(compare_data, (key, value) => {
        if (value.temp !== data[key].temp) {//只要有一个不一样的值，就去重新渲染
          is_the_same = false;
          return false
        }
      })
      return is_the_same
    },
    sort_fun(data, key) {
      data.sort(function (a, b) {
        return a[key] - b[key]
      });
    },
    get_min_max_data(data, key1, key2, isMax) {
      var min;
      $.each(data, (key, value) => {
        $.each(value[key2], (kk, vv) => {
          if (!min) {
            min = vv.temp;
          }
          if (isMax) {//取最大值
            min = Math.max(min, vv.temp);
          } else {
            min = Math.min(min, vv.temp);
          }
        })
      })
      return min
    },
    initCameraDev() {
      var VM = this;
      if (VM.isTransparent && VM.viewFlag === 3) {//安防视图
        var pos_list = Object.keys(VM.camera_dev_group);//之前已经加载过的位置
        //根据设备类型判断所要载入的模型
        //old_temp_camera_Obj
        if (isEqual(VM.temp_camera_list, VM.old_temp_camera_list)) {//新旧数据一样，不重新刷新
          return
        }
        if (ifNullData(VM.old_temp_camera_list)) {//首次加载的数据，保存一下旧数据
          VM.old_temp_camera_list = VM.temp_camera_list;
        }
        if (VM.temp_camera_list.length === 0) {//全部删除或者没有数据的时候
          for (let j = 0; j < pos_list.length; j++) {
            VM.clearCache(VM.camera_dev_group[pos_list[j]]);//删除已经删除的摄像头位置
          }
        }
        VM.temp_camera_list.forEach((item, index) => {
          var type_f = item.type_f;
          var isRotate = false;
          if (VM.is_camera(item.dev_type) && type_f) {//枪型摄像头，在数组中特殊设置为2，不能影响传值
            type_f = 2;
            isRotate = item.pos_id <= 5;
          }
          var dev_model_name = VM.temp_camera_obj[type_f];//设备类型对应模型的名字
          if (!dev_model_name) {//如果在预设的类型中没有对应类型，不加载
            return
          }
          if (!isEqual(VM.old_temp_camera_Obj[item.pos_id], item)) {//若是数据不一样
            VM.clearCache(VM.camera_dev_group[item.pos_id]);//删掉之前已经加载的模型，重新创建
            var half_rr = VM.cal_model_length_unit(VM.cubeArry[VM.cubeArry.length - 1]);//机柜一半的宽度
            var oo_position = VM.cal_dev_camera_position(VM.objLength, half_rr, item.pos_id);
            var mtlLoader = new MTLLoader();
            mtlLoader.setPath(VM.basicURL);
            mtlLoader.load(dev_model_name + '.mtl', function (materials) {
              materials.preload();
              var objLoader = new OBJLoader();
              objLoader.setMaterials(materials);
              objLoader.setPath(VM.basicURL);
              objLoader.load(dev_model_name + '.obj', function (oo) {
                VM.setObjMeshAttr(oo, ['userData', 'name'], [item, VM.cameraDev_ + item.pos_id]);//遍历每一个mesh对象加上一些属性
                // oo.userData.data = item;
                if (item.is_alarm !== 0) {//如果设备告警了
                  VM.changeDevMaterial(oo);
                }
                if (isRotate) {//枪型摄像头需要旋转,旋转要用π
                  // oo.rotation.x = 0;
                  oo.rotation.y = Math.PI;
                  // oo.rotation.z = 0;
                }
                oo.scale.x = VM.devScale;//调整放大倍数
                oo.scale.y = VM.devScale;
                oo.scale.z = VM.devScale;
                oo.position.set(oo_position.x, oo_position.y, oo_position.z);
                VM.camera_dev_group[item.pos_id] = oo
                VM.scene.add(oo);
                VM.render_render();
                VM.Loadover--;
              }, VM.onProgress, VM.onError);
              materials = null;
              objLoader = null;
            });
            mtlLoader = null;
          }
          VM.old_temp_camera_Obj[item.pos_id] = item;//设置一下旧值
          pos_list.splice(pos_list.indexOf(item.pos_id.toString()), 1)//删掉当前在的设备
          if (index === VM.temp_camera_list.length - 1) {//最后一个了
            for (let j = 0; j < pos_list.length; j++) {
              VM.clearCache(VM.camera_dev_group[pos_list[j]]);//删除已经删除的摄像头位置
            }
          }
        })
      }
    },
    deal_dev_status(status) {
      return status === 0 ? "正常" : "异常"
    },
    is_camera(dev_type) {
      return dev_type === 15 || dev_type === 26
    },
    //关闭弹窗，请勿删除
    close_event1() {
      if (this.$refs.myVideo) {
        this.$refs.myVideo.close_videomap()
      }
    },
    /**
     * 旋转事件的监听
     * @param event
     * @constructor
     * @author zhoujinzong
     * 相机视角监听，分3个部分做监听，正面：背面通道模型颜色透明度降低,背面：正面通道模型颜色透明度降低，其他：通道颜色透明度不变
     */
    OrbitControlsChange(event) {
      //this.reset_position ,初始位置
      let camera = (event && event.target) ? event.target.object : {}
      let position = camera.position
      if (this.viewFlag === 1) {//温度云图
        if (this.heatmap_type === 0) {//机柜云图
          // this.temp_position_change(position,this.heatmap_Mesh);
        } else {//3个平面
        }
      } else if (this.viewFlag === 2) {//容量云图
        //VM.cubeArry[i].mesh
        // this.capacity_position_change(position,this.cubeArry);
      } else if (this.viewFlag === 6) {//温度柱图
        //VM.cubeArry[i][key + '_mesh']
        // this.capacity_position_change(position,this.mesh4,true);
      }
      this.isControlsChange = true;
      this.devShow = false;
      this.render_render()
    },
    /**
     * 视角变化的判断函数之温度云图
     * @param position 当前相机位置
     * @param mesh_list 需要调整的mesh对象
     * @author zhoujinzong
     */
    temp_position_change(position, mesh_list) {
      let position_list = [1, 2, 3, 4, 5, 6, 7, 11, 12, 13]//当前是哪几个面
      let opacity = this.hide_opacity
      if (position && position.z > 0 && position.z > this.reset_position.z / 2 && position.y > this.reset_position.y / 2) {//正面 超过正z轴的一半 超过正y轴的一半
        position_list = [3, 4, 11, 12, 13]//需要改动的mesh对象为相对位置的
      } else if (position && position.z < 0 && position.z < this.reset_position.z / 2 && position.y > this.reset_position.y / 2) {//背面 超过负z轴的一半  超过正y轴的一半
        position_list = [1, 2, 5, 6, 7]//需要改动的mesh对象为相对位置的
      } else {//其他转向
        opacity = this.show_opacity
      }
      position_list.forEach((pos, index) => {
        if (mesh_list[pos - 1] && mesh_list[pos - 1].material) {
          mesh_list[pos - 1].material.opacity = opacity
        }
      })
    },
    /**
     * 视角变化的判断函数之容量云图与容量柱图  透明度或许不适用于这俩模型
     * @param position 当前相机位置
     * @param mesh_list 需要调整的mesh对象
     * @param is_ca_per 是否是容量柱图
     * @author zhoujinzong
     */
    capacity_position_change(position, mesh_list, is_ca_per) {
      let index_list = Object.keys(this.cubeArry)//下标列表
      let visible = false
      if (position && position.z > 0 && position.z > this.reset_position.z / 2 && position.y > this.reset_position.y / 2) {//正面 超过正z轴的一半 超过正y轴的一半
        index_list = index_list.filter(item => item % 2 === 1)//去掉正面 单数
      } else if (position && position.z < 0 && position.z < this.reset_position.z / 2 && position.y > this.reset_position.y / 2) {//背面 超过负z轴的一半  超过正y轴的一半
        index_list = index_list.filter(item => item % 2 === 0)//去掉背面 双数
      } else {//其他面
        visible = true
      }
      if (is_ca_per) {
        let hot = "temp_hot_mesh"
        let cold = "temp_cold_mesh"
        index_list.forEach((i, index) => {
          if (mesh_list[i + hot] && mesh_list[i + hot].material) {
            mesh_list[i + hot].material.visible = visible
          }
          if (mesh_list[i + cold] && mesh_list[i + cold].material) {
            mesh_list[i + cold].material.visible = visible
          }
        })
      } else {
        index_list.forEach((i, index) => {
          if (mesh_list[i] && mesh_list[i].mesh && mesh_list[i].mesh.material) {
            mesh_list[i].mesh.material.visible = visible
          }
        })
      }
    },
    /**
     * 防抖函数
     * @param fn 超时结束之后需要执行的函数
     * @param wait 超时时间 毫秒
     * @returns {function(...[*]=)}
     * @author zhoujinzong
     */
    debounce(fn, wait) {
      let timeout = null
      return function () {
        if (timeout !== null) {
          clearTimeout(timeout)
        }
        timeout = setTimeout(fn, wait)
      }
    },
    changeView(flag, type) {
      let VM = this

      function change() {
        VM.changeViewFun(VM.curr_view, VM.curr_type)
      }

      if (!VM.func) {
        VM.func = VM.debounce(change, 500)
      }
      VM.curr_view = flag
      VM.curr_type = type
      VM.func()
    },
    show_threeD_chose_menu(event) {
      let offsetTop = $('#main_model').offset().top;
      this.threeD_chose_menu_position = {
        x: event.offsetX + 30 || this.getScreenClickPoint(event, 'pageX') + 30,
        y: event.offsetY + offsetTop || this.getScreenClickPoint(event, 'pageY')
      }
      this.threeD_chose_menu_show = true
    },
    show_false() {
      this.threeD_chose_menu_show = false
    },
    threeD_chose_menu_chose_judge(key, value) {
      return this[key] === value
    },
    /* 窗口变动触发的方法 */
    onWindowResize() {
      if (this.CAMERA) {
        // 重新设置相机的宽高比
        this.CAMERA.aspect = $("#main_model")
          .width() / $("#main_model")
          .height()
        // 更新相机投影矩阵
        this.CAMERA.updateProjectionMatrix()
      }
      if (this.renderer) {
        // 更新渲染器大小
        this.renderer.setSize($("#main_model")
          .width(), $("#main_model")
          .height())
      }
      this.render_render()
    },
    meshVisibleChange(mesh, boo) {
      if (mesh) {
        mesh.visible = boo
      }
    },
    setNormalTemp(new_passageway_data) {
      for (let j = 0; j < new_passageway_data.length; j++) {
        new_passageway_data[j].temp = 18
      }
    },
    /**
     * 找到那个唯一的模型
     * @param theOne
     * @param intersects
     * @param INTERSECTED
     */
    findClickTheOne(theOne, intersects, INTERSECTED) {
      let newTheOne = intersects.find((item, index) => {
        return item.object.name.indexOf(this.theOneObj) >= 0
      })
      if (newTheOne) {// 有找到就替换一下
        INTERSECTED = newTheOne.object
        theOne = newTheOne
      }
      return {theOne: theOne, INTERSECTED: INTERSECTED}
    },
    /**
     * 获取屏幕点击的位置信息
     * @param event 当前的点击事件
     * @param key 要取的属性值，比如pageX clientX
     */
    getScreenClickPoint(event, key) {
      return event.changedTouches[0] && event.changedTouches[0][key]
    },
    //加载普通机柜
    loadNormalCabinet() {
      const VM = this;
      console.time("modeltime");
      var mtlLoader = new MTLLoader();
      mtlLoader.setPath(VM.basicURL);
      mtlLoader.load('jg_02.mtl', function (materials) {//普通机柜
        materials.preload();
        var objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath(VM.basicURL);
        objLoader.load('jg_02.obj', function (oo) {
          if (!VM.is_qt) {
            VM.changeMaterial(oo);
          }
          var objLengh = 0;
          for (var i = 0; i < VM.cubeArry.length; i++) {
            objLengh = objLengh + VM.cal_model_length(i);

            VM.cubeArry[i]['x'] = objLengh;
            VM.cubeArry[i + 1]['x'] = objLengh;
            if (VM.cubeArry[i].width !== 1) {
              var obj_clone_normal = oo.clone();
              var Jigui_01_normal = obj_clone_normal.getObjectByName('Jigui_01');
              var Jigui_02_normal = obj_clone_normal.getObjectByName('Jigui_02');
              VM.cube[i] = Jigui_01_normal;
              VM.cube[i + 1] = Jigui_02_normal;
              obj_clone_normal.position.set(objLengh, 0, 0);
              VM.objGroup.add(obj_clone_normal);
              // VM.set_line_geometry(obj_clone,{x:objLengh - VM.half_ll - VM.objSingleWidth ,y:0,z:0})
            }
            i++;//这个很重要，不然会重读计算
          }
          VM.objLength = objLengh;
          oo = null;
          VM.loadDoorFront();
        }, VM.onProgress, VM.onError);
        materials = null;
        objLoader = null;
      });
      mtlLoader = null;
    },
    //加载前门
    loadDoorFront() {
      const VM = this;
      //前门
      //找一下logo  Kehua_logo_02
      var mtlLoader_door0 = new MTLLoader();
      mtlLoader_door0.setPath(VM.basicURL);
      mtlLoader_door0.load('men_01.mtl', function (materials) {
        materials.preload();
        var objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath(VM.basicURL);
        objLoader.load('men_01.obj', function (oo) {
          let obj_clone_front = oo.clone();
          if (!VM.is_qt) {
            VM.changeMaterial(obj_clone_front);
            VM.changeDevMaterialOpacity(obj_clone_front, 'Kehua_logo_02', {isTransparent: true});//logo
            VM.changeDevMaterialOpacity(obj_clone_front, 'boli_01', {isTransparent: true, viewFlag: 1});//玻璃
            VM.changeDevMaterialOpacity(obj_clone_front, 'boli_02', {isTransparent: true, viewFlag: 1});//玻璃
            VM.changeDevMaterialOpacity(obj_clone_front, 'Rectangle058', {isTransparent: true, viewFlag: 1});//门框四周
            VM.changeDevMaterialOpacity(obj_clone_front, 'Box314', {isTransparent: true, viewFlag: 1});//门框上面
            VM.changeDevMaterialOpacity(obj_clone_front, 'Box345', {isTransparent: true, viewFlag: 1});//门框底部
            VM.changeDevMaterialOpacity(obj_clone_front, 'Box342', {isTransparent: true, viewFlag: 1});//门框上面靠里
          }
          obj_clone_front.position.set(0 - VM.objLength / 2 - VM.half_ll - 9, 0, 0);
          // if (VM.viewFlag !== 1 && VM.viewFlag !== 2) {
          // if (VM.viewFlag !== 1) {
          VM.scene.add(obj_clone_front);
          // VM.set_line_geometry(oo,{x:0 - objLengh / 2 - VM.half_ll - 9,y:0,z:0});
          // }
          VM.Loadover--;
          oo = null;
          VM.loadDoorBack();
        }, VM.onProgress, VM.onError);
        materials = null;
        objLoader = null
      });
      mtlLoader_door0 = null
    },
    //加载后门
    loadDoorBack() {
      const VM = this;
      //后门
      //找一下logo  Kehua_logo_01
      var mtlLoader_door1 = new MTLLoader();
      mtlLoader_door1.setPath(VM.basicURL);
      mtlLoader_door1.load('men_02.mtl', function (materials) {
        materials.preload();
        var objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath(VM.basicURL);
        objLoader.load('men_02.obj', function (oo) {
          let obj_clone_back = oo.clone();
          if (!VM.is_qt) {
            VM.changeMaterial(obj_clone_back);
            VM.changeDevMaterialOpacity(obj_clone_back, 'Kehua_logo_01', {isTransparent: true});
            VM.changeDevMaterialOpacity(obj_clone_back, 'boli_01', {isTransparent: true, viewFlag: 1});//玻璃
            VM.changeDevMaterialOpacity(obj_clone_back, 'boli_02', {isTransparent: true, viewFlag: 1});//玻璃
            VM.changeDevMaterialOpacity(obj_clone_back, 'Rectangle028', {isTransparent: true, viewFlag: 1});//门框四周
            VM.changeDevMaterialOpacity(obj_clone_back, 'Box021', {isTransparent: true, viewFlag: 1});//门框上面
            VM.changeDevMaterialOpacity(obj_clone_back, 'Box280', {isTransparent: true, viewFlag: 1});//门框底部
            VM.changeDevMaterialOpacity(obj_clone_back, 'Box066', {isTransparent: true, viewFlag: 1});//门框上面靠里
          }
          obj_clone_back.position.set(VM.objLength / 2 + VM.half_rr + 9, 0, 0);
          // if (VM.viewFlag !== 1 && VM.viewFlag !== 2) {
          // if (VM.viewFlag !== 1) {
          VM.scene.add(obj_clone_back);
          // VM.set_line_geometry(oo,{x:objLengh / 2 + VM.half_rr + 9,y:0,z:0});
          // }
          VM.Loadover--;
          oo = null;
          VM.loadCabinetAir();
        }, VM.onProgress, VM.onError);
        materials = null;
        objLoader = null
      });
      mtlLoader_door1 = null
    },
    // 加载空调
    loadCabinetAir() {
      const VM = this;
      //空调
      var mtlLoader_air = new MTLLoader();
      mtlLoader_air.setPath(VM.basicURL);
      mtlLoader_air.load('jg_03.mtl', function (materials) {
        materials.preload();
        var objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath(VM.basicURL);
        objLoader.load('jg_03.obj', function (oo) {
          let obj_jg_03 = oo.clone();
          var objLengh_air = 0;
          if (!VM.is_qt) {
            VM.changeMaterial(obj_jg_03);
          }
          for (var i = 0; i < VM.cubeArry.length; i++) {
            objLengh_air = objLengh_air + VM.cal_model_length(i);
            if (VM.cubeArry[i].width === 1) {//两排只要有一个是空调柜,另一个一定是空调柜
              var obj_clone_air = obj_jg_03.clone();

              var Jigui_01_air = obj_clone_air.getObjectByName('Jigui_01');
              var Jigui_02_air = obj_clone_air.getObjectByName('Jigui_02');
              if (VM.viewFlag === 2) {
                // Jigui_01.scale.set(1,VM.objCabinetHeightCoe,1);//将模型进行一个拉伸
                // Jigui_02.scale.set(1,VM.objCabinetHeightCoe,1);//将模型进行一个拉伸
                // VM.changeDevMaterialOpacity(obj_clone,'Box001');//机柜底座
              }
              VM.cube[i] = Jigui_01_air;
              VM.cube[i + 1] = Jigui_02_air;
              obj_clone_air.position.set(objLengh_air, 0, 0);
              VM.objGroup.add(obj_clone_air);
              // VM.set_line_geometry(obj_clone,{x:objLengh_air,y:0,z:0});
            }
            i++;
          }
          VM.objLengh_air = objLengh_air;
          VM.objGroup.position.set(0 - objLengh_air / 2, 0, 0);
          VM.scene.add(VM.objGroup);
          VM.Loadover--;
          oo = null;
          VM.MmovL = VM.objLength / 2;
          VM.isLoading = false;//进度gif
          console.timeEnd("modeltime")
          VM.initObject(VM.objLength / 2);//机柜位置排列参考，在容量云图中所创建的立体模型位置排列
          console.time("animationtime")
          VM.animation('initModel');//动画
          console.timeEnd("animationtime")
          console.timeEnd("alltime")
        }, VM.onProgress, VM.onError);
        materials = null;
        objLoader = null;
      });
      mtlLoader_air = null;
    },
    preLoadNormalCabinet() {
      const VM = this;
      console.time("jg_02");
      if (VM.obj_jg_02) {
        const oo = VM.obj_jg_02.clone();
        if (!VM.is_qt) {
          VM.changeMaterial(oo);
        }
        var objLengh = 0;
        for (var i = 0; i < VM.cubeArry.length; i++) {
          objLengh = objLengh + VM.cal_model_length(i);

          VM.cubeArry[i]['x'] = objLengh;
          VM.cubeArry[i + 1]['x'] = objLengh;
          if (VM.cubeArry[i].width !== 1) {
            var obj_clone_normal = oo.clone();
            var Jigui_01_normal = obj_clone_normal.getObjectByName('Jigui_01');
            var Jigui_02_normal = obj_clone_normal.getObjectByName('Jigui_02');
            VM.cube[i] = Jigui_01_normal;
            VM.cube[i + 1] = Jigui_02_normal;
            obj_clone_normal.position.set(objLengh, 0, 0);
            VM.objGroup.add(obj_clone_normal);
            // VM.set_line_geometry(obj_clone,{x:objLengh - VM.half_ll - VM.objSingleWidth ,y:0,z:0})
          }
          i++;//这个很重要，不然会重读计算
        }
        VM.objLength = objLengh;
      }
      console.timeEnd("jg_02");
    },
    //预加载前门
    preLoadDoorFront() {
      const VM = this;
      if (VM.obj_men_01) {
        console.time("men_01");
        const oo = VM.obj_men_01;
        let obj_clone_front = oo.clone();
        if (!VM.is_qt) {
          VM.changeMaterial(obj_clone_front);
          VM.changeDevMaterialOpacity(obj_clone_front, 'Kehua_logo_02', {isTransparent: true});//logo
          VM.changeDevMaterialOpacity(obj_clone_front, 'boli_01', {isTransparent: true, viewFlag: 1});//玻璃
          VM.changeDevMaterialOpacity(obj_clone_front, 'boli_02', {isTransparent: true, viewFlag: 1});//玻璃
          VM.changeDevMaterialOpacity(obj_clone_front, 'Rectangle058', {isTransparent: true, viewFlag: 1});//门框四周
          VM.changeDevMaterialOpacity(obj_clone_front, 'Box314', {isTransparent: true, viewFlag: 1});//门框上面
          VM.changeDevMaterialOpacity(obj_clone_front, 'Box345', {isTransparent: true, viewFlag: 1});//门框底部
          VM.changeDevMaterialOpacity(obj_clone_front, 'Box342', {isTransparent: true, viewFlag: 1});//门框上面靠里
        }
        obj_clone_front.position.set(0 - VM.objLength / 2 - VM.half_ll - 9, 0, 0);
        // if (VM.viewFlag !== 1 && VM.viewFlag !== 2) {
        // if (VM.viewFlag !== 1) {
        VM.scene.add(obj_clone_front);
        // VM.set_line_geometry(oo,{x:0 - objLengh / 2 - VM.half_ll - 9,y:0,z:0});
        // }
        VM.Loadover--;
        console.timeEnd("men_01");
      }
    },
    //预加载后门
    preLoadDoorBack() {
      const VM = this;
      if (VM.obj_men_02) {
        console.time("men_02");
        const oo = VM.obj_men_02;
        let obj_clone_back = oo.clone();
        if (!VM.is_qt) {
          VM.changeMaterial(obj_clone_back);
          VM.changeDevMaterialOpacity(obj_clone_back, 'Kehua_logo_01', {isTransparent: true});
          VM.changeDevMaterialOpacity(obj_clone_back, 'boli_01', {isTransparent: true, viewFlag: 1});//玻璃
          VM.changeDevMaterialOpacity(obj_clone_back, 'boli_02', {isTransparent: true, viewFlag: 1});//玻璃
          VM.changeDevMaterialOpacity(obj_clone_back, 'Rectangle028', {isTransparent: true, viewFlag: 1});//门框四周
          VM.changeDevMaterialOpacity(obj_clone_back, 'Box021', {isTransparent: true, viewFlag: 1});//门框上面
          VM.changeDevMaterialOpacity(obj_clone_back, 'Box280', {isTransparent: true, viewFlag: 1});//门框底部
          VM.changeDevMaterialOpacity(obj_clone_back, 'Box066', {isTransparent: true, viewFlag: 1});//门框上面靠里
        }
        obj_clone_back.position.set(VM.objLength / 2 + VM.half_rr + 9, 0, 0);
        // if (VM.viewFlag !== 1 && VM.viewFlag !== 2) {
        // if (VM.viewFlag !== 1) {
        VM.scene.add(obj_clone_back);
        // VM.set_line_geometry(oo,{x:objLengh / 2 + VM.half_rr + 9,y:0,z:0});
        // }
        VM.Loadover--;
        console.timeEnd("men_02");
      }
    },
    // 预加载空调
    preLoadCabinetAir() {
      const VM = this;
      if (VM.obj_jg_03) {
        console.time("jg_03");
        const oo = VM.obj_jg_03;
        let obj_jg_03 = oo.clone();
        var objLengh_air = 0;
        if (!VM.is_qt) {
          VM.changeMaterial(obj_jg_03);
        }
        for (var i = 0; i < VM.cubeArry.length; i++) {
          objLengh_air = objLengh_air + VM.cal_model_length(i);
          if (VM.cubeArry[i].width === 1) {//两排只要有一个是空调柜,另一个一定是空调柜
            var obj_clone_air = obj_jg_03.clone();

            var Jigui_01_air = obj_clone_air.getObjectByName('Jigui_01');
            var Jigui_02_air = obj_clone_air.getObjectByName('Jigui_02');
            if (VM.viewFlag === 2) {
              // Jigui_01.scale.set(1,VM.objCabinetHeightCoe,1);//将模型进行一个拉伸
              // Jigui_02.scale.set(1,VM.objCabinetHeightCoe,1);//将模型进行一个拉伸
              // VM.changeDevMaterialOpacity(obj_clone,'Box001');//机柜底座
            }
            VM.cube[i] = Jigui_01_air;
            VM.cube[i + 1] = Jigui_02_air;
            obj_clone_air.position.set(objLengh_air, 0, 0);
            VM.objGroup.add(obj_clone_air);
            // VM.set_line_geometry(obj_clone,{x:objLengh_air,y:0,z:0});
          }
          i++;
        }
        VM.objLengh_air = objLengh_air;
        VM.objGroup.position.set(0 - objLengh_air / 2, 0, 0);
        VM.scene.add(VM.objGroup);
        VM.Loadover--;
        VM.MmovL = VM.objLength / 2;
        console.timeEnd("jg_03");
        VM.isLoading = false;//进度gif
        VM.initObject(VM.objLength / 2);//机柜位置排列参考，在容量云图中所创建的立体模型位置排列
        VM.MmovL = VM.objLength / 2;
        console.time("animationtime");
        VM.animation('initModel');//动画
        console.timeEnd("animationtime");
        console.timeEnd("alltime");
      }
    },
    // 地板
    loadCabinetFloor() {
      const VM = this;
      var newobjLengh = 0;
      for (let mm = 0; mm < VM.cubeArry.length; mm++) {
        const arrLength = VM.cubeArry.length;
        newobjLengh += VM.objBottomWidth;
        for (let kk = -4; kk <= 7; kk++) {//每一个循环12次，负值开始是因为要设置负值
          var num = 1;
          if (mm === arrLength - 2) {//最后一个多添加机柜数量一半小格
            num = arrLength / 2;
          }
          for (let jj = 0; jj < num; jj++) {
            // var geometry = new THREE.BoxBufferGeometry( VM.objBottomWidth, VM.objBottomHeight, VM.objBottomLength);// 体
            var geometry = new THREE.PlaneBufferGeometry(VM.objBottomWidth, VM.objBottomHeight, VM.objBottomLength);
            var material = new THREE.MeshBasicMaterial({
              color: 0x377e8a,
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0.3,
              // blendDstAlpha: 0.3,
            });
            var plane = new THREE.Mesh(geometry, material);
            var line = new THREE.LineSegments(
              new THREE.EdgesGeometry(geometry),
              new THREE.LineBasicMaterial({
                  color: 0x3f4763,
                  // transparent: VM.isTransparent,
                  // opacity: (VM.isTransparent ? 0.3 : 1),
                  // blendDstAlpha: (VM.isTransparent ? 0.3 : 1),
                }
              ));
            line.position.set(
              newobjLengh - VM.objBottomWidth * (arrLength / 2 - jj),
              // - VM.objBottomHeight / 2, // 体的高度
              0,
              (kk - 1.5) * VM.objBottomHeight
            );
            plane.position.set(
              newobjLengh - VM.objBottomWidth * (arrLength / 2 - jj),
              // - VM.objBottomHeight / 2, // 体的高度
              0,
              (kk - 1.5) * VM.objBottomHeight
            );
            plane.rotateX(Math.PI / 2);
            line.rotateX(Math.PI / 2);
            VM.scene.add(plane);
            VM.scene.add(line);
          }
        }
        mm++;
      }
    },
    // 加载其他视图
    loadOtherView(boo) {
      // console.log('loadOtherView:' + boo);
      if (!this.is_qt) {
        this.initCameraDev();
        this.init_heatmap_four_mesh();
        this.init_three_heat_map();
      }
    },
    // 液晶屏缩放
    LCDScale() {
      if (this.LCD === 1) {//液晶屏上展示pc端代码--大屏展示:放大2倍，缩小0.5倍
        $("#main_model canvas").css({
          'transform-origin': 'left top',
          'transform': 'scale(0.5,0.5)',
          '-moz-transform': 'scale(0.5,0.5)',
          '-webkit-transform': 'scale(0.5,0.5)',
          '-ms-transform': 'scale(0.5,0.5)',
          '-o-transform': 'scale(0.5,0.5)'
        });
      }
    },
    // 清楚一些材质
    clearMtl(loader) {
      this[loader.data_name] = null;
      this[loader.children.data_name] = null;
    },
    // 材质加载的调用方法
    webGlLoadPromise(){
      const VM = this;
      VM.loadMaterial(VM.loadJPG);
      VM.loadMaterialNew(VM.jg_02).then(() => {
        return VM.loadObjectNew(VM.jg_02)
      }).then(() => {
        return VM.loadMaterialNew(VM.men_01);
      }).then(() => {
        return VM.loadObjectNew(VM.men_01);
      }).then(() => {
        return VM.loadMaterialNew(VM.men_02);
      }).then(() => {
        return VM.loadObjectNew(VM.men_02);
      }).then(() => {
        return VM.loadMaterialNew(VM.jg_03);
      }).then(() => {
        return VM.loadObjectNew(VM.jg_03);
      }).then(() => {
        VM.ThreeDinterval();//设置定时器，实时刷新数据
        VM.deal_color_list();
        VM.deal_cap_color_list();
      });
    }
  },
  created() {
    var VM = this;
    alarmLevel_get_ajax(VM).then(function (data) {
      $.each(data, function (key, value) {
        VM.alarmL_color[value.level] = value.color || defaultAlarmLevelColorList(value.level)
      });
    });
  },
  mounted: function () {
    var VM = this;
    var idn = $("#main_model");
    VM.Dwidth = idn.width();
    VM.Dheight = idn.height();
    VM.isWebGl = WEBGL.isWebGLAvailable();//是否支持webgl
    if (VM.isWebGl) {
      VM.webGlLoadPromise();
    }
    //若是判定未不支持添加1秒之后再次验证
    setTimeout(() => {
      if (!VM.isWebGl) {
        VM.isWebGl = WEBGL.isWebGLAvailable();//是否支持webgl
        VM.webGlLoadPromise();
      }
    }, 1000);
    VM.main_ico_3d = $('#main_ico_3d');
    VM.hasEnterMounted = true;
  },
  activated: function () {
    this.activatedBoo = true;
    if (!this.hasEnterMounted) {//防止第一次进入的时候没有loading 提示
      this.render_setSize()
    }
  },
  deactivated: function () {
    this.activatedBoo = false;
    this.devShow = false;
  },
  beforeDestroy: function () {
    this.clearFun();
  }
};

