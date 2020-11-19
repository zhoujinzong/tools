import Vue from 'vue';
// JavaScript Document
import {popWin} from "../../plugin/tc.all.js"

import * as THREE from "three"
import {MTLLoader, OBJLoader} from "three-obj-mtl-loader" // 这个引用不能删除,不然会报错
// import {MTLLoader, OBJLoader} from 'three-obj-mtl-loader'; // 这个引用不能删除,不然会报错
import {WEBGL} from "../../plugin/WebGL"
import popWindow from "../../components/popWindow"
import myVideoPlay from "../../components/myVideoPlay"
import mainPopWin from "../../pages/main/mainPopWin" // 机柜告警弹窗
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
  record_wait,
  record_wait_close
} from "../../libs/public"
import QWebChannel from "../qwebchannel"
import OrbitControls from "three/examples/js/controls/OrbitControls"
import Stats from "stats.js/src/Stats"
import Heatmap from "heatmap.js"
import clickOutSide from "../../libs/clickOutSide"// 外部点击方法
// import Heatmap from  '../../plugin/heatmap.js';
import i18n from '../../i18n/index'
import {findBrothersComponents} from "@/plugin/assist";

export default {
  name: "mainThreeD",
  data() {
    return {
      mainThreeI: null,
      isWebGl: false,// 判断是否兼容three.js

      Loadover: 3,// loadMTL + loadJPG + 3
      isLoading: 1,
      hasEnterMounted: false,// 是否已经进过mounted
      isControlsChange: false,// 是否正在旋转
      isRoateing: false,// 表示正在旋转，左右点击的旋转
      cube: [],
      cubeArry: [],// 机柜信息
      meshData: [],
      mesh: [],// 机柜顶上的小圆
      mesh1: [],// 机柜贴图上的名字
      mesh2: [],// 机柜的容量数值
      mesh3: {},// 机柜的温度柱图上的数, 注意这里用了对象存
      mesh4: {},// 机柜的温度柱图的mesh, 注意这里用了对象存
      sphereMesh: null,// 切换菜单的模型对象
      latheMesh: null,// 切换菜单的模型对象
      cubeArry_old: [],// 机柜上一次信息，对比使用
      vH: [],
      Dataobj: [],// 存储机柜数据对象
      Nameobj: [],// 存储机柜名称对象
      NewNameobj: [],// 存储机柜名称新对象，用于机柜贴图
      Allmax_flag: [],
      Allmax_over: [],
      MmovL: null,

      texture0: this.$store.state.texture0,// 贴图
      texture1: this.$store.state.texture1,// 贴图
      texture_disabled_big: this.$store.state.texture_disabled_big,// 贴图
      texture_disabled_small: this.$store.state.texture_disabled_small,// 贴图
      obj_jg_02: this.$store.state.obj_jg_02,// 加载普通机柜
      obj_jg_03: this.$store.state.obj_jg_03,// 加载空调机柜
      obj_men_01: this.$store.state.obj_men_01,// 加载前门
      obj_men_02: this.$store.state.obj_men_02,// 加载后门
      obj_af_smoke: this.$store.state.obj_af_smoke,// 加载烟雾
      obj_af_sp_qiang: this.$store.state.obj_af_sp_qiang,// 加载枪型
      obj_af_sp_qiu: this.$store.state.obj_af_sp_qiu,// 加载球形

      animationFlag: 0,
      refreshF: 0,
      anaglePI: 0,
      IS_Alarm: 0,
      shapeMessFlag: 0,
      Dwidth: 0,// 容器宽度
      Dheight: 0,// 容器高度
      canvasScal: 1,// 缩放比例
      CAMERA: null,
      CONTROLS: null,
      STATS: null,// 帧率
      scene: null,
      renderer: null,
      spotLight: null,
      objGroup: null,
      shapeMess: null,
      Timeinterval_3d: null,
      mainD_cabinet_timer: null,// 正常机柜弹窗循环
      cabinet_pop_title: "",// 机柜详细信息名字
      box_index: "",
      cab_type: "",
      dev_index: "",
      showFlag: false,
      devShow: false,
      nowItme: {// 鼠标浮动机柜
        name: "",
        x: 0,
        y: 0,
        is3d: false
      },
      cold_hot: {}, // 机柜温湿度数据
      pc_data: [], // 机柜配电柜数据
      TD_sure_demo: null,
      old_Move: null,
      isRender: true,
      activatedBoo: true,
      AveEnable: 0,// 是否是微模块，如果是微模块显示的内容是平均问题，表头就不要显示设备名称
      equip_color_old: {
        100: 0xffffff,// 无效柜不显示贴图
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
        117: 0xffffff// 综合柜不显示贴图
        // 117: 0x555555,
        // 117: 0x8aff00,
      },/*机柜颜色颜色列表，与pub_set.css中的机柜颜色设置一致*/
      // 配色规则， 无效柜，无；用户柜：无；空调：#01e8ff；动力：#ffc800；其他：#c0ff00
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
        // 无效柜
        {
          keys: [100],
          color: 0xffffff
        },
        // 用户柜
        {
          keys: [106],
          color: 0x17ffdc
        },
        // 空调
        {
          keys: [105, 113],
          color: 0x07beff
        },
        // 动力
        {
          keys: [102, 103, 104],
          color: 0xffc800
        }
        // 其他，直接写颜色
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
      oldFocalLength: 70,// 初始值，设置模型大小
      FocalLength: 70,// 初始值，设置模型大小
      cabinetMax: 18,// 初始值，设置模型大小单排最大长度
      FocalPer: 2,// 模型缩小系数
      // reset_position: {x: -2185, y: 939, z: 2443},// 初始位置
      reset_position: {x: -800, y: 800, z: 2700},// 初始位置
      reset_camera: {x: 0, y: 130, z: 0},// 初始位置
      mouseClickStartTime: 0,// 鼠标点击开始时间
      mouseClickEndTime: 0,// 鼠标点击结束时间
      mouseClickDuringTime: 0,// 鼠标长按持续时间
      mouseClickTimeInterval: null,// 鼠标长按定时器
      devScale: 2,// 设备模型放大倍数，只针对于顶部邠设备
      temp_camera_obj: {// 顶部设备类型对应的设备模型
        0: "af_sp_qiu",// 球形摄像头
        2: "af_sp_qiang",// 枪型摄像头，原来是1，因为会和开关量的烟雾重复，所以设置了2
        1: "af_smoke",// 烟雾
        7: "af_smoke"// 温感
      },
      temp_camera_list: [
        // {
        // "pos_id": 1,
        // "dev_id": 1,
        // "sub_index": 1,
        // "dev_type": 15,
        // "type_f": 1,
        // "dev_status": 0,
        // "name_f": "枪形摄像头"
        // },
      ],// 摄像头与温感烟感列表
      old_temp_camera_list: [],
      old_temp_camera_Obj: {},// 旧数据
      viewFlag: 4,// 当前显示的是哪个视图 (1,温度云图；2：容量云图；3：安防视图；4:普通3D视图；6:温度柱图)
      isTransparent: false,// 机柜是否透明
      HeatMapInstance_Arr: [],// 热点图
      objLength: 0,// 机柜的总长度
      objLengh_air: 0,// 空调机柜的总长度
      objHeight: 290,// 机柜的高度
      objSingleLength: 120,// 单边机柜的长度
      objAllCabinetWidth: 360,// 机柜的宽度，后面一排+中间通道+正面一排
      objSingleWidth: 64,// 单边机柜的宽度
      objSingleHalfWidth: 34,// 单边机柜的宽度 半柜
      objSmallHeight: 8,// 微调的高度
      objCabinetHeight: 250,// 单个机柜内部的高度
      objCabinetBottomHeight: 23.29,// 单个机柜底座的高度
      objCabinetTopHeight: 22,// 单个机柜底座的高度
      objBottomWidth: 45,// 底部线框模型宽度
      objBottomLength: 45,// 底部线框模型长度
      // objBottomHeight: 32.5,// 底部线框模型高度
      objBottomHeight: 45,// 底部线框模型高度
      half_ll: 0,// 前门
      half_rr: 0,// 后门
      current_flag: 0,
      heatmap_Mesh: [],// 温度云图mesh对象
      heatmap_map: [],// 温度云图mesh对象
      heatmap_Mesh_three: [],// 温度云图mesh对象
      heatmap_map_three: [],// 温度云图mesh对象
      camera_dev_group: {},// 安防设备group对象
      heatmap_four_mesh_Timer: null,
      clock: null,
      delta: 0,
      heatmap_data_list: [
        // 0,
        // 0.457,
        0.432,// 16
        0.595,// 22
        0.757,// 28
        0.838,// 31
        0.919,// 34
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
      current_capacity_type: 0,// 当前容量类型
      capacity_type_list: [
        {
          index: 1,
          key: "u_rate",// 字段后台还未定义
          name: 'U位云图',
          colors: ["#83ff62", "#9fffcf"]
        },
        {
          index: 2,
          key: "pdc_rate",
          name: '配电云图',
          colors: ["#ff8e52", "#fff640"]
        },
        {
          index: 3,
          key: "cooling_rate",
          name: '制冷云图',
          colors: ["#03adff", "#3cebff"]
        }
      ],// 容量类型对应属性名字
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
      ],// 容量云图对应颜色
      projectiveObj: null,// 当前点击的对象
      RAYCASTER: null,// 光线投射器
      MOUSE: null,
      has_old_pdc_rate_set: false,// 是否已经设置了旧值
      has_old_cooling_rate_set: false,// 是否已经设置了旧值
      has_old_u_rate: false,// 是否已经设置了旧值
      three_map_type: {0: '机柜云图', 1: '3个平面云图'},
      three_map_chose: {"-1": '全部', 0: '上', 1: '中', 2: '下'},
      heatmap_type: 0,// 温度云图类型，0：全景，1：立面 , -1：三个平面
      cap_temp_type: -1,// 温度柱图类型，-1：全部机柜：0：热通道1，1：冷通道1：，2：热通道2，3；冷通道2
      heatmap_view: -1,// 温度云图三个平面上中下类型 -1：全部 ，0:上，1：中；2:下
      heatmap_view1: -1,// 温度云图全景中的前排后排类型 -1：全部 ，0:前排，1：后排
      heatmap_view2: -1,// 温度云图立面视图中的四个面类型 -1：全部 ，0:第一面，1:第二面，2:第三面，3:第四面，
      cap_temp_view: -1,// 温度云图三个平面冷热通道类型 0:冷，1：热，暂时不用
      requestAnimationFrameID: null,// 自动动画的ID

      // 用作判断是否是点击对象的名字
      cabinet_: "cabinet_",
      cabinetName_: "cabinetName_",
      cameraDev_: "cameraDev_",
      cabinetTemp_: "cabinetTemp_",
      cabinetCapacity: "cabinetCapacity_",
      cabinetChoseMenu: "cabinetChoseMenu_",// 3D菜单
      capacityTemp: "capacityTemp_",// 温度柱图

      key_hot: "hot",// 热的key
      key_cold: "cold",// 冷的key
      key_way_hot: "hot_passageway",// 冷通道的key
      key_way_cold: "cold_passageway",// 冷通道的key

      temp_default: {
        hot: 20,// 热通道给的默认温度值
        cold: 18// 冷通道给的默认温度值
      },
      all_max_hot: 20,// 当前所有的最大值
      all_max_cold: 18,// 当前所有的最大值
      randomNum: 1,// 补充随机点个数
      randomCoe: 1,// 随机数系数
      all_passageway_data: {},// 所有的原来通道的数据
      limit_per: 3,// 临近距离多少需要删除这个点
      defaultRadius: 80,// 默认大小
      defaultDataMax: 37,// 默认最大值
      defaultDataMin: 18,// 默认最小值
      max_coe: 0.3,// 点击值的最高系数
      min_coe: 0.2,// 点击值的最低系数

      basicURL: "/static/models/",// 模型、贴图根路径
      pop_camera_dev: {},// 弹窗摄像头设备

      video_dev_type: 0,// 弹出框摄像头设备类型
      video_dev_index: 0,// 弹出框摄像头设备编号
      main_ico_3d: null,

      MyisRender: false,// 当前切换view的控制

      hide_opacity: 0.4,// 淡化的透明度
      show_opacity: 0.9,// 显示的透明度

      threeD_chose_menu_show: false,// 图上切换的菜单显示
      threeD_chose_menu_position: {
        x: 500,
        y: 500
      },// 温度云图切换菜单
      heatmap_dev_menu: [
        {
          name: '全景视图',
          value: 0,
          showChildren: false,
          key: "heatmap_type",
          children: [
            {
              name: '全部',
              value: -1,
              key: "heatmap_view1"
            },
            {
              name: '前排',
              value: 0,
              key: "heatmap_view1"
            }, {
              name: '后排',
              value: 1,
              key: "heatmap_view1"
            }
          ]
        },
        {
          name: '立面视图',
          value: 1,
          showChildren: false,
          key: "heatmap_type",
          children: [
            {
              name: '全部机柜',
              value: -1,
              key: "heatmap_view2"
            }, {
              name: '热通道1',
              value: 0,
              key: "heatmap_view2"
            }, {
              name: '冷通道1',
              value: 1,
              key: "heatmap_view2"
            }, {
              name: '热通道2',
              value: 3,
              key: "heatmap_view2"
            }, {
              name: '冷通道2',
              value: 2,
              key: "heatmap_view2"
            }
          ]
        }, {
          name: '平面视图',
          value: -1,
          showChildren: false,
          key: "heatmap_type",
          children: [
            {
              name: '全部',
              value: -1,
              key: "heatmap_view"
            },
            {
              name: '上层',
              value: 0,
              key: "heatmap_view"
            }, {
              name: '中层',
              value: 1,
              key: "heatmap_view"
            }, {
              name: '下层',
              value: 2,
              key: "heatmap_view"
            }
          ]
        }
      ],
      temp_menu: [
        {
          name: '全部机柜',
          value: -1,
          showChildren: false,
          key: "cap_temp_type"
        },
        {
          name: '热通道1',
          value: 0,
          showChildren: false,
          key: "cap_temp_type"
        },
        {
          name: '冷通道1',
          value: 1,
          showChildren: false,
          key: "cap_temp_type"
        }, {
          name: '热通道2',
          value: 2,
          showChildren: false,
          key: "cap_temp_type"
        }, {
          name: '冷通道2',
          value: 3,
          showChildren: false,
          key: "cap_temp_type"
        }
      ],
      textCold: '冷通道',
      textHot: '热通道',
      textDetail: '详细信息',
      textDevType: '设备名称',
      textNodata: '暂无数据',
      hasLoadOtherView: false,// 是否已经加载过其他视图了，避免出现重复动画

      popCabinetDevData: {},// 机柜绑定设备弹窗数据
      typeObj: {
        102: {// 配电柜，对应设备配电柜
          dev: [12],
          class: 'cabinet_elec_ver',
        },
        105: {// 空调柜，对应设备普通空调，精密空调，房级空调
          dev: [3, 4, 31],
          class: 'cabinet_air_ver',
        },
        106: { // 用户柜，对应温湿度
          dev: [7],
          class: 'cabinet_user_ver',
        },
      },

      recordWait: '请稍后...',
    }
  },
  directives: {// 自定义指令 ，v-
    clickOutSide
  },
  components: {
    popWindow: popWindow,
    mainPopWin: mainPopWin,
    myVideoPlay: myVideoPlay
  },
  watch: {
    isLoading(val, oldVal) {
      this.$store.commit("setIsLoading3D", val);// 及时更新3D更新状态
      if (!val) {
        if (this.viewFlag !== 1) {
          console.timeEnd('record_wait_modelEnd');
          this.testTime('record_wait_modelEnd');
          record_wait_close();
        }
        this.MyisRender = false;
        this.hasEnterMounted = false// 重置一下
      } else {
        console.time('record_wait_modelEnd');
        this.record_wait_modelEnd = this.getTimeNow();
        record_wait(this.recordWait)
      }
    }
  },
  computed: {
    // 加载普通机柜
    jg_02() {
      return {
        name: "jg_02.mtl",// 需要加载的文件名字
        data_name: "mtl_jg_02",// 在data对象中对应的属性名字
        loader: "MTLLoader",// 需要的加载器，暂时无用
        children: {
          name: "jg_02.obj",// 需要加载的文件名字
          data_name: "obj_jg_02",// 在data对象中对应的属性名字
          loader: "OBJLoader",// 需要的加载器，暂时无用
          mtl: "mtl_jg_02" // 需要使用的描述文件属性名字
        }
      }
    },
    // 加载前门
    men_01() {
      return {
        name: "men_01.mtl",// 需要加载的文件名字
        data_name: "mtl_men_01",// 在data对象中对应的属性名字
        loader: "MTLLoader",// 需要的加载器，暂时无用
        children: {
          name: "men_01.obj",// 需要加载的文件名字
          data_name: "obj_men_01",// 在data对象中对应的属性名字
          loader: "OBJLoader",// 需要的加载器，暂时无用
          mtl: "mtl_men_01" // 需要使用的描述文件属性名字
        }
      }
    },
    // 加载后门
    men_02() {
      return {
        name: "men_02.mtl",// 需要加载的文件名字
        data_name: "mtl_men_02",// 在data对象中对应的属性名字
        loader: "MTLLoader",// 需要的加载器，暂时无用
        children: {
          name: "men_02.obj",// 需要加载的文件名字
          data_name: "obj_men_02",// 在data对象中对应的属性名字
          loader: "OBJLoader",// 需要的加载器，暂时无用
          mtl: "mtl_men_02" // 需要使用的描述文件属性名字
        }
      }
    },
    // 加载空调柜
    jg_03() {
      return {
        name: "jg_03.mtl",// 需要加载的文件名字
        data_name: "mtl_jg_03",// 在data对象中对应的属性名字
        loader: "MTLLoader",// 需要的加载器，暂时无用
        children: {
          name: "jg_03.obj",// 需要加载的文件名字
          data_name: "obj_jg_03",// 在data对象中对应的属性名字
          loader: "OBJLoader",// 需要的加载器，暂时无用
          mtl: "mtl_jg_03" // 需要使用的描述文件属性名字
        }

      }
    },
    // 加载烟雾
    af_smoke() {
      return {
        name: "af_smoke.mtl",// 需要加载的文件名字
        data_name: "mtl_af_smoke",// 在data对象中对应的属性名字
        loader: "MTLLoader",// 需要的加载器，暂时无用
        children: {
          name: "af_smoke.obj",// 需要加载的文件名字
          data_name: "obj_af_smoke",// 在data对象中对应的属性名字
          loader: "OBJLoader",// 需要的加载器，暂时无用
          mtl: "mtl_af_smoke" // 需要使用的描述文件属性名字
        }

      }
    },
    // 加载枪摄像头
    af_sp_qiang() {
      return {
        name: "af_sp_qiang.mtl",// 需要加载的文件名字
        data_name: "mtl_af_sp_qiang",// 在data对象中对应的属性名字
        loader: "MTLLoader",// 需要的加载器，暂时无用
        children: {
          name: "af_sp_qiang.obj",// 需要加载的文件名字
          data_name: "obj_af_sp_qiang",// 在data对象中对应的属性名字
          loader: "OBJLoader",// 需要的加载器，暂时无用
          mtl: "mtl_af_sp_qiang" // 需要使用的描述文件属性名字
        }

      }
    },
    // 加载球型摄像头
    af_sp_qiu() {
      return {
        name: "af_sp_qiu.mtl",// 需要加载的文件名字
        data_name: "mtl_af_sp_qiu",// 在data对象中对应的属性名字
        loader: "MTLLoader",// 需要的加载器，暂时无用
        children: {
          name: "af_sp_qiu.obj",// 需要加载的文件名字
          data_name: "obj_af_sp_qiu",// 在data对象中对应的属性名字
          loader: "OBJLoader",// 需要的加载器，暂时无用
          mtl: "mtl_af_sp_qiu" // 需要使用的描述文件属性名字
        }

      }
    },
    // 需要提前加载的材质 , name: 材质名字，data_name: vue对象中对应要创建的属性名字，loader：使用什么加载器，
    loadJPG() {
      return [
        {
          name: "cabinet_60.jpg",// 普通机柜贴图
          data_name: "texture0",// 在data对象中对应的属性名字
          loader: "TextureLoader" // 需要的加载器，暂时无用
        },
        {
          name: "fair.jpg",// 空调贴图
          data_name: "texture1",// 在data对象中对应的属性名字
          loader: "TextureLoader" // 需要的加载器，暂时无用
        },
        {
          name: "fgrey_big.jpg",// 灰色贴图 大
          data_name: "texture_disabled_big",// 在data对象中对应的属性名字
          loader: "TextureLoader" // 需要的加载器，暂时无用
        },
        {
          name: "fgrey_small.jpg",// 灰色贴图 小
          data_name: "texture_disabled_small",// 在data对象中对应的属性名字
          loader: "TextureLoader" // 需要的加载器，暂时无用
        },
        {
          name: "heatmap_view_type.png",// 灰色贴图 小
          data_name: "threeD_chose_menu_texture",// 在data对象中对应的属性名字
          loader: "TextureLoader" // 需要的加载器，暂时无用
        }
      ]
    },
    loadTexture0() {
      return {
        name: "cabinet_60.jpg",//普通机柜贴图
        data_name: "texture0",// 在data对象中对应的属性名字
        loader: "TextureLoader" // 需要的加载器，暂时无用
      }
    },
    loadTexture1() {
      return {
        name: "fair.jpg",//空调贴图
        data_name: "texture1",// 在data对象中对应的属性名字
        loader: "TextureLoader" // 需要的加载器，暂时无用
      }
    },
    loadTextureDisabledBig() {
      return {
        name: "fgrey_big.jpg",//灰色贴图 大
        data_name: "texture_disabled_big",// 在data对象中对应的属性名字
        loader: "TextureLoader" // 需要的加载器，暂时无用
      }
    },
    textureDisabledSmall() {
      return {
        name: "fgrey_small.jpg",// 灰色贴图 小
        data_name: "texture_disabled_small",// 在data对象中对应的属性名字
        loader: "TextureLoader" // 需要的加载器，暂时无用
      }
    },
    loadThreeDChoseMenuTexture() {
      return {
        name: "heatmap_view_type.png",//灰色贴图 小
        data_name: "threeD_chose_menu_texture",// 在data对象中对应的属性名字
        loader: "TextureLoader" // 需要的加载器，暂时无用
      }
    },
    // 是否显示安防视图
    is_show_safe() {
      return this.$store.state.DoubleRowCabinet && this.$store.state.DoubleRowCabinet.SecurityView
    },
    // 是否显示温度云图
    is_show_temp() {
      return this.$store.state.DoubleRowCabinet && this.$store.state.DoubleRowCabinet.TempCloudChart
    },
    // 是否显示温度柱图
    is_show_temp_column() {
      return this.$store.state.DoubleRowCabinet && this.$store.state.DoubleRowCabinet.TempColumnChart
    },
    // 是否显示U位
    is_show_u() {
      return this.$store.state.DoubleRowCabinet && this.$store.state.DoubleRowCabinet.CapacityManage
    },
    // 是否显示配电
    is_show_pd() {
      return this.$store.state.DoubleRowCabinet && this.$store.state.DoubleRowCabinet.CapacityManage
    },
    // 是否显示制冷
    is_show_cold() {
      return this.$store.state.DoubleRowCabinet && this.$store.state.DoubleRowCabinet.CapacityManage
    },
    // 3D可切换的菜单
    threeD_switch_menu() {
      return [
        {id: "cabinet_3d", isShow: true, viewFlag: 4, selectClass: "cabinet_3d_select", title: '3D视图'},
        {id: "cabinet_safe", isShow: this.is_show_safe, viewFlag: 3, selectClass: "cabinet_safe_select", title: '安防视图'},
        {id: "cabinet_temp", isShow: this.is_show_temp, viewFlag: 1, selectClass: "cabinet_temp_select", title: '温度云图'},
        {
          id: "cabinet_temp_column",
          isShow: this.is_show_temp_column,
          viewFlag: 6,
          selectClass: "cabinet_temp_column_select",
          title: '温度柱图'
        },
        {id: "cabinet_u", isShow: this.is_show_u, viewFlag: 2, type: 1, selectClass: "cabinet_u_select", title: 'U位云图'},
        {
          id: "cabinet_pd",
          isShow: this.is_show_pd,
          viewFlag: 2,
          type: 2,
          selectClass: "cabinet_pd_select",
          title: '配电视图'
        },
        {
          id: "cabinet_cold",
          isShow: this.is_show_cold,
          viewFlag: 2,
          type: 3,
          selectClass: "cabinet_cold_select",
          title: '制冷视图'
        }
      ]
    },
    // 是否是QT浏览器
    is_qt() {
      return typeof qt != "undefined"
    },
    // 当前可选的3D菜单
    threeD_chose_menu() {
      if (this.isTempCloud) {
        return this.heatmap_dev_menu
      } else if (this.viewFlag === 6) {
        return this.temp_menu
      } else {
        return []
      }
    },
    // 是否显示3D切换菜单
    isShowSwitchMenu() {
      return this.LCD === 0 || !this.is_qt
      // return true
    },
    // 有点击的视图
    viewFlagAndModelName() {
      return {
        1: this.cabinetTemp_,
        3: this.cameraDev_,
        // 4: this.cabinet_
      }
    },
    // 当前需要判断所点击的模型名字
    theOneObj() {
      return this.viewFlagAndModelName[this.viewFlag]
    },
    // 机柜容量类型
    capTypeText() {
      return this.viewFlag === 6 ? '温度（℃）' : '容量（%）'
    },
    // 是否是温度云图
    isTempCloud() {
      return this.viewFlag === 1
    },
    // 机柜类型图片，如果没有默认使用用户柜
    cabinetTypeImg() {
      return this.typeObj[this.cab_type] ? this.typeObj[this.cab_type].class : this.typeObj['106'].class
    }
  },
  methods: {
    // 子组件调用 修改父组件showFlag
    showChange(data) {
      this.showFlag = data
    },
    // 关闭详细信息弹窗
    main_normal_close() {
      clearInterval(this.mainD_cabinet_timer);
      this.mainD_cabinet_timer = null;
      this.popCabinetDevData = {};
    },
    // 摄像头设备详细信息
    camera_dev_message_message() {
      const param = this.pop_camera_dev;
      this.video_dev_type = param.dev_type;
      this.video_dev_index = param.dev_index;
      if (this.$refs.myVideo) {
        this.$refs.myVideo.get_specific_map_info(param.dev_type, param.dev_index);// 调用视频播放组件的方法
      }
      popWin("showVideo")
    },
    // 缩放
    render_setSize() {
      const VM = this;
      this.$nextTick(() => {
        VM.render_setSize1()
      })
    },
    // 清除场景
    clearRenderer() {
      if (this.renderer) {
        this.renderer.dispose();
        this.renderer.forceContextLoss();
        this.renderer.context = null;
        this.renderer.domElement = null;
        this.renderer.clear();
        this.renderer = null
      }
    },
    // 清空当前obj对象的缓存
    clearCache(group) {
      if (!group || !group.traverse) {
        return
      }
      // 删除掉所有的模型组内的mesh
      group.traverse((item) => {
        if (item instanceof THREE.Mesh) {
          item.geometry.dispose(); // 删除几何体
          if (Array.isArray(item.material)) {
            item.material.forEach((item) => {
              item.dispose()
            })
          } else {
            item.material.dispose() // 删除材质
          }

        }
      });
      this.scene.remove(group)
    },
    // 新的清楚方法
    mineDispose(parent, child) {
      if (!child) {
        return
      }
      const VM = this;
      if (child.children && child.children.length) {// 子类对象循环递归
        let arr = child.children.filter(x => x);// 这里是为了保证这些子类每个对象都存在，因为会有null的情况
        arr.forEach(a => {
          VM.mineDispose(child, a)
        })
      }
      if (child instanceof THREE.Mesh || child instanceof THREE.Line) {// 清除mesh对象，以及line对象
        if (child.material) {
          if (Array.isArray(child.material)) {// 如果材质是数组，需要循环清除
            child.material.forEach(function (item) {
              if (item.map) {
                item.map.dispose();
              }
              item.dispose();
            })
          } else {
            if (child.material.map) {// 材质的贴图对象也需要清除
              child.material.map.dispose();
            }
            child.material.dispose();// 最后在清除自己
          }
        }
        child.geometry.dispose();// 清除几何体
      } else if (child.material) {
        child.material.dispose();
      }
      if (child.remove) {// 清除自己
        child.remove();
      }
      parent.remove(child);// 从父类型中清除当前子类
    },
    // 原来写在外面的方法
    threeD_alarm_ajax() {// 模型数据交互
      const VM = this;
      if (!VM.activatedBoo || !isUpdate) {// 需要先判断一些isUpdate是不是存在 activatedBoo 当前页面在keep-alive下是否是激活状态
        return
      }
      VM.threeD_alarm_ajax_time = VM.getTimeNow();
      VM.$axios({
        method: "post",
        data: {type: VM.viewFlag},// 接口优化，针对不同模块传入不同的值，/*1:温度云图2：容量云图3：安防视图4：3D视图5：微型，小型模块 6: 容量柱图*/
        timeout: 4000,
        url: "/home.cgi/get_cabinet_list"
      })
        .then((data) => {
          VM.testTime('threeD_alarm_ajax_time')
          // data.diff = 1;
          if (Object.prototype.toString.call(data) !== "[object Object]") {// timeout也会进这里，如果不处理这个，出现超时，会清空掉当前创建的机柜，显示无机柜数据
            return
          }
          VM.current_flag++;// 请求次数的统计
          VM.hasLoadOtherView = VM.current_flag < 1;// 当前是否已经加载过其他视图了，每次切换都需要重置一下
          VM.Dataobj = [];
          VM.Nameobj = [];
          VM.NewNameobj = [];
          if (VM.Timeinterval_3d) {
            clearTimeout(VM.Timeinterval_3d)
          }
          VM.Timeinterval_3d = null;
          VM.animationFlag = 0;
          if (!ifNullData(data) && !ifNullData(data.data) && !ifNullData(data.data.list)) {// 机柜数据不为空
            // data.diff = 0;
            if (!VM.isRender) {// 渲染中
              return
            }
            // 以单排16为最低值，初始视角70，增加机柜之后相应比例减小视角
            if (VM.viewFlag !== 5 && data.data.list.length / 2 > VM.cabinetMax) {// 剔除 微型，小型模块 单排超过16个需要重新设置视觉大小 3D模型中这个长度一定为双数
              VM.FocalLength = VM.oldFocalLength - (VM.FocalPer * ((data.data.list.length / 2) - VM.cabinetMax))
            }
            if (VM.cube.length === 0) {// 机柜没有创建
              VM.isRender = false;
              VM.vH = [];
              VM.cubeArry = [];
              VM.render_dispose();// 清除缓存
              VM.threeD_alarm_ajaxData(data.data);// 处理数据
              VM.threeD_main();// 三维模型初始化
              VM.cubeArry_old = data.data.list;// 保存一下旧的原始数据
              setTimeout(() => {
                // if(VM.renderer){
                // VM.renderer.clear();// 清除场景
                // VM.render_render();
                // VM.isRender = true;
                // }
                VM.isRender = true
              }, 2000);
              VM.isRender = true
            } else if (data.data.list.length === VM.cubeArry_old.length) {// 机柜数量不变
              if (data.diff === 1) {// 数值不同时
                VM.threeD_alarm_ajaxData(data.data);// 处理数据
                VM.animation("threeD_alarm_ajax")// 动画
              } else if (data.diff === 0 && VM.Loadover === 0) {// 数值不变动+加载结束
                // if(VM.cube[0].material.needsUpdate==true){
                // VM.no_animation();// 不更新材质
                // }
              }
            } else {// 机柜数量变动--重新渲染
              if (VM.LCD === 1 && VM.is_qt) {// 这个只在自研屏上才需要重新登录
                clearInterval(VM.mainThreeI);
                save_popready(0, '机柜数量发生变化，需重新登录', () => {
                  VM.goto_login();// 调回登录页
                });
                return
              }
              VM.webglcontextlost();// 上下文丢失处理
              VM.webglcontextrestored() // 上下文恢复
            }
          } else {// 没有机柜
            if (VM.cubeArry_old.length !== 0) {// 之前存在机柜
              VM.webglcontextlost();
              VM.webglcontextrestored(0)
            }
            VM.isLoading = false
          }
          VM.refreshF = 0
        }).catch((err)=>{
          console.log(err);
          VM.isLoading = false;// 这里做个异常捕捉
      })
    },
    threeD_alarm_ajaxData(returnData) {// 处理机柜数据，渲染顺序，根据返回机柜list顺序，单数在后面，双数在前面，一前一后
      const VM = this;
      VM.IS_Alarm = 0;
      VM.threeD_alarm_ajaxData_time = VM.getTimeNow();
      const position_limit = 5;
      VM.temp_camera_list = returnData.pos_list || [];
      // const min_hot = VM.get_min_max_data(returnData.list, VM.key_hot, VM.key_way_hot)
      // const min_cold = VM.get_min_max_data(returnData.list, VM.key_cold, VM.key_way_cold)
      // const max_hot = VM.get_min_max_data(returnData.list, VM.key_hot, VM.key_way_hot, true)// 获取当前所有数据的最大值
      // const max_cold = VM.get_min_max_data(returnData.list, VM.key_cold, VM.key_way_cold, true)// 获取当前所有数据的最大值

      // VM.temp_default[VM.key_hot] = !ifNullData(min_hot) ? min_hot : 22;// 根据返回值设置最小值，如果没有返回值，需要重新设置为默认的
      // VM.temp_default[VM.key_cold] = !ifNullData(min_cold) ? min_cold : 18;// 根据返回值设置最小值，如果没有返回值，需要重新设置为默认的
      // VM.all_max_hot = !ifNullData(max_hot) && max_hot > 22 ? max_hot : 22;// 根据返回值设置最小值，如果没有返回值，需要重新设置为默认的
      // VM.all_max_cold = !ifNullData(max_cold) && max_cold > 18 ? max_cold : 18;// 根据返回值设置最小值，如果没有返回值，需要重新设置为默认的

      let is_width_change = false;

      $.each(returnData.list, (key, value) => {
        const numb = Number(value.box_index) - 1;// 顺序
        if (is_width_change) {
          return false
        }
        if (!ifNullData(VM.cubeArry_old) && VM.cubeArry_old[numb].width !== value.width) {// 判断某个机柜宽度是否发生了变化
          is_width_change = true;
          VM.webglcontextlost();
          VM.webglcontextrestored();
          return false
        }
        if (!VM.cubeArry[numb]) {
          VM.cubeArry[numb] = {}
        }
        VM.cubeArry[numb]["is_alarm"] = value.is_alarm;// 告警等级--判断机柜是否异常,1告警，0正常
        VM.cubeArry[numb]["alarm"] = value.alarm_level;// 告警等级--判断机柜是否异常
        VM.cubeArry[numb]["name"] = dataValidation(value.name_f);// 名称
        VM.cubeArry[numb]["type"] = value.type_f;// 类型
        VM.cubeArry[numb]["width"] = value.width;// 宽度
        VM.cubeArry[numb]["index"] = value.dev_index;// id
        VM.cubeArry[numb]["box_index"] = value.box_index;// id
        VM.cubeArry[numb]["dev_info"] = value.dev_info;// 机柜所绑定的设备信息

        if (!VM.is_qt) {
          VM.cubeArry[numb][VM.key_way_cold] = VM.complete_tem_data(value.cold_passageway, position_limit, VM.key_cold, numb);// 冷通道
          VM.cubeArry[numb][VM.key_way_hot] = VM.complete_tem_data(value.hot_passageway, position_limit, VM.key_hot, numb);// 热通道
          // VM.cubeArry[numb][VM.key_way_cold] = value.cold_passageway || [];// 冷通道
          // VM.cubeArry[numb][VM.key_way_hot] = value.hot_passageway|| [];// 热通道

          // VM.cubeArry[numb]['pdc_rate'] = value.pdc_rate || (Math.random() * 100).toFixed(0);// 使用率
          // VM.cubeArry[numb]['cooling_rate'] = value.cooling_rate || (Math.random() * 100).toFixed(0);// 使用率
          // VM.cubeArry[numb]['u_rate'] = value.u_rate || (Math.random() * 100).toFixed(0);// U位
          VM.cubeArry[numb]['pdc_rate'] = value.pdc_rate;// 配电
          VM.cubeArry[numb]['cooling_rate'] = value.cooling_rate;// 制冷
          VM.cubeArry[numb]['u_rate'] = value.u_rate;// u位

          // VM.cubeArry[numb]['temp_cold'] = value.temp_cold || (Math.random() * 100).toFixed(0);// 温度柱图的冷通道温度
          // VM.cubeArry[numb]['temp_hot'] = value.temp_hot || (Math.random() * 100).toFixed(0);// 温度柱图的冷通道温度
          VM.cubeArry[numb]['temp_cold'] = value.temp_cold;// 温度柱图的热通道温度
          VM.cubeArry[numb]['temp_hot'] = value.temp_hot;// 温度柱图的热通道温度
          // VM.cubeArry[numb]['temp_hot'] = 100;// 温度柱图的热通道温度
          // VM.cubeArry[numb]['temp_hot'] = 3;// 温度柱图的热通道温度

          if (!VM.cubeArry[numb]['old_pdc_rate']) {// 注意 此处的命名要使用 old_ 加上原来属性名字，否则下面第二次渲染时值的判断会出错
            VM.cubeArry[numb]['old_pdc_rate'] = value.pdc_rate;// 使用率
            VM.has_old_pdc_rate_set = true;
          }
          if (!VM.cubeArry[numb]['old_cooling_rate']) {
            VM.cubeArry[numb]['old_cooling_rate'] = value.cooling_rate;// 使用率
            VM.has_old_cooling_rate_set = true;
          }
          if (!VM.cubeArry[numb]['old_u_rate']) {
            VM.cubeArry[numb]['old_u_rate'] = value.u_rate;// U位
            VM.has_old_u_rate = true;
          }
        }
        // 处理一下数据,如果没有冷热通道数据的话自动补全, 当前5个位置
        if (value.type_f === 106) {// 机柜
          if (/^(-)?\d+(\.\d+)?$/.test(value.it_load)) {
            const data_load = Number(value.it_load);
            if (data_load >= 0 && data_load <= 100) {
              VM.cubeArry[numb]['z'] = data_load;// it负载率
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
        if (value.alarm_level !== -1 && !ifNullData(value.alarm_level)) {// 异常
          VM.IS_Alarm++;
        }
        if (VM.Allmax_over.length !== returnData.length) {
          VM.Allmax_over.push(0)
        }
      });
      VM.testTime('threeD_alarm_ajaxData_time')
    },
    complete_tem_data(passageway, position_limit, way, numb) {
      const VM = this;
      const per = VM.temp_default[way];
      const posi_obj_demo = {"position": 1, "temp": per};
      let position_arr = [];// 位置列表
      const postion_judge_obj = {
        1: [2],
        2: [1, 3],
        3: [2, 4],
        4: [3, 5],
        5: [4],
      };// 需要判断的位置相应对象
      for (let i = 1; i <= position_limit; i++) {
        position_arr.push(i)
      }
      // if (VM.viewFlag === 1) {
      //   passageway = [
      //     {
      //       position: 1,
      //       temp: 23.6
      //     },
      //     {
      //       position: 3,
      //       temp: 25.6
      //     },
      //     {
      //       position: 5,
      //       temp: 24.5
      //     },
      //   ];
      //   // if (numb === 1) {
      //   //   passageway[2].temp = 50
      //   // }
      // }
      if (ifNullData(passageway)) {// 如果没有通道温度数据
        passageway = [];
        for (let j = 1; j <= position_limit; j++) {
          const new_posi_obj = JSON.parse(JSON.stringify(posi_obj_demo));
          new_posi_obj.position = j;
          passageway.push(new_posi_obj)
        }
      } else if (passageway.length < position_limit) {// 如果只有一部分通道温度数据
        let flag = true;// 是否需要计算平均值
        if (passageway.length === 1 && passageway[0].temp >= 30) {// 整个机柜只有一个且超过30度，整列机柜都变红
          flag = false;
          posi_obj_demo.temp = passageway[0].temp;
        }
        for (let k = passageway.length - 1; k >= 0; k--) {
          // if (passageway[k].temp_alarm === 1) {// 温湿度异常就不用这条数据了，当前后台状态判断有问题
          //   passageway.splice(k, 1);
          //   continue
          // }
          const pos_index = position_arr.indexOf(passageway[k].position);
          passageway[k].baseroot = true;// 代表最原始的数据
          if (pos_index !== -1) {
            position_arr.splice(pos_index, 1)
          }
        }
        for (let m = 0; m < position_arr.length; m++) {
          const new_posi_obj1 = JSON.parse(JSON.stringify(posi_obj_demo));
          const myPosition = position_arr[m];
          const pos_arr = postion_judge_obj[myPosition];// 需要对比的位置
          if (flag) {
            VM.filter_temp_data_fun(new_posi_obj1, per, passageway, pos_arr);
          }
          new_posi_obj1.position = myPosition;
          passageway.push(new_posi_obj1)
        }
      }
      // 存入一些机柜信息
      passageway.forEach((item) => {
        item.numb = numb;
        item.way = way
      });
      VM.sort_fun(passageway, "position");
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
      const the_twins = passageway.filter(item => pos_arr.indexOf(item.position) >= 0);
      if (the_twins.length === 1) {
        new_posi_obj.temp = (Number(the_twins[0].temp) + per) / 2
      } else if (the_twins.length >= 2) {// 防止后台出现位置重复问题，导致处理不生效，例如有两个位置1的
        new_posi_obj.temp = (Number(the_twins[0].temp) + Number(the_twins[1].temp)) / 2
      }
    },
    ThreeDinterval() {// 设置定时器，实时刷新数据
      const VM = this;
      VM.isLoading = true;// 进度gif
      VM.TD_sure_demo = null;
      console.time("alltime");
      this.alltime = this.getTimeNow();
      if (VM.isWebGl) {// 非-B液晶屏  判断是否兼容three.js
        clearInterval(this.mainThreeI);// 先清除一下之前的定时器
        VM.current_flag = 0;// 重置一下当前获取接口的次数
        this.threeD_alarm_ajax();// 先调用一次
        VM.mainThreeI = setInterval(() => {
          if (VM.refreshF === 0) {// 当前没有再渲染再去取
            VM.threeD_alarm_ajax()
          }
        }, 5000);
      }
    },
    threeD_main() {// 三维模型初始化
      const VM = this;
      VM.threeD_main_time = VM.getTimeNow();
      if (VM.LCD === 1) {// 1液晶屏,0是PC端// 液晶屏上展示pc端代码--大屏展示:放大2倍，缩小0.5倍
        VM.canvasScal = 2;
        VM.Dwidth = VM.canvasScal * $("#main_model").width();
        VM.Dheight = VM.canvasScal * $("#main_model").height();
      }
      VM.initThree();// 渲染器
      VM.initScene();// 场景
      VM.initCamera();// 摄像机
      VM.initLight();// 光源
      VM.initModel();// 导入模型
      // VM.initMouseClick();// 监听鼠标点击事件
      VM.testTime('threeD_main_time')
      if (VM.LCD === 0) {
        // VM.initStats();// 显示帧率
      }
      // window.addEventListener("resize", VM.onWindowResize, false)// 这里暂时不加变化监听，存在问题
    },
    initThree() {// 渲染器
      const VM = this;
      VM.initThreeTime = VM.getTimeNow()
      VM.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,// 抗锯齿效果 底色透明
        shadowMap: true,// 它包含阴影贴图的引用
        setPixelRatio: window.devicePixelRatio// 设置设备像素比。通常用于避免HiDPI设备上绘图模糊
      });
      VM.renderer.setSize(VM.Dwidth, VM.Dheight);// 设置渲染器大小
      VM.renderer.sortObjects = false;// // 是否排列对象 默认是true
      VM.renderer.shadowMap.enabled = true;// 阴影是否启用
      VM.renderer.shadowMapSoft = true;// 阴影柔化
      VM.renderer.shadowMap.type = THREE.PCFSoftShadowMap;// 阴影类型
      $("#main_model").find("canvas").remove();// 清空canvas对象
      document.getElementById("main_model") && document.getElementById("main_model").appendChild(VM.renderer.domElement);// 添加canvas对象
      VM.renderer.setClearColor(0xFFFFFF, 0.0);// 设置清除样色
      VM.renderer.localClippingEnabled = true;// 剪裁平面是否启用 空间中与平面的符号距离为负的点被剪裁（未渲染）
      VM.renderer.domElement.addEventListener("mousedown", VM.onDocumentMouseDown, false);
      VM.renderer.domElement.addEventListener("mouseup", VM.onDocumentMouseup, false);
      VM.renderer.domElement.addEventListener("touchstart", VM.onDocumentMouseDown, false);
      VM.renderer.domElement.addEventListener("touchend", VM.onDocumentMouseup, false);
      VM.renderer.domElement.addEventListener("mousemove", VM.onDocumentMove, false);
      VM.renderer.domElement.addEventListener("webglcontextlost", VM.webglcontextlost, false);// 上下文丢失--停止循环，等待恢复
      VM.renderer.domElement.addEventListener("webglcontextrestored", VM.webglcontextrestored, false)// 上下文恢复--重新渲染
      VM.testTime('initThreeTime')
    },
    webglcontextlost() {// 上下文丢失--停止循环，等待恢复
      const VM = this;
      clearTimeout(VM.Timeinterval_3d);
      VM.refreshF = 1;
    },
    webglcontextrestored(flag) {// 上下文恢复--重新渲染
      const VM = this;
      if (VM.renderer) {
        VM.renderer.domElement.removeEventListener("mousedown", VM.onDocumentMouseDown, false);
        VM.renderer.domElement.removeEventListener("mouseup", VM.onDocumentMouseup, false);
        VM.renderer.domElement.removeEventListener("touchstart", VM.onDocumentMouseDown, false);
        VM.renderer.domElement.removeEventListener("touchend", VM.onDocumentMouseup, false);
        VM.renderer.domElement.removeEventListener("mousemove", VM.onDocumentMove, false);
        VM.renderer.domElement.removeEventListener("mousemove", VM.onDocumentMove, false);
        VM.renderer.domElement.removeEventListener("webglcontextlost", VM.webglcontextlost, false);
        VM.renderer.domElement.removeEventListener("webglcontextrestored", VM.webglcontextrestored, false);
        VM.render_dispose()// 解除绑定
      }
      ie_CollectGarbage();
      VM.isLoading = true;
      if (flag !== 0) {
        this.threeD_alarm_ajax();
      }
    },
    initScene() {
      const VM = this;
      VM.initSceneTime = VM.getTimeNow();
      if (ifNullData(VM.scene)) {
        VM.scene = new THREE.Scene();
        // VM.scene.fog=new THREE.Fog(0xffffff,1,10000)
      }
      // 坐标辅助线
      const axes = new THREE.AxesHelper(800);
      // VM.scene.add(axes);
      // VM.clock = new THREE.Clock();
      VM.testTime('initSceneTime')
    },
    initCamera() {// 摄像机
      const VM = this;
      VM.initCameraTime = VM.getTimeNow();
      VM.CAMERA = new THREE.PerspectiveCamera(45, VM.Dwidth / VM.Dheight, 1, 10000);
      VM.CAMERA.position.set(VM.reset_position.x, VM.reset_position.y, VM.reset_position.z);
      if (VM.LCD === 0 || !VM.is_qt) {// 不是QT
        VM.CONTROLS = new OrbitControls(VM.CAMERA, VM.renderer.domElement);
        VM.CONTROLS.addEventListener("change", VM.OrbitControlsChange);
        VM.CONTROLS.maxPolarAngle = Math.PI * 0.5;// 半圆
        VM.CONTROLS.target = new THREE.Vector3(VM.reset_camera.x, VM.reset_camera.y, VM.reset_camera.z);// 视角，与相机视角一致，必须先设置视角在相机设置视角之前
        VM.CONTROLS.minDistance = 1000;// 相机向内移动多少
        VM.CONTROLS.maxDistance = 3500;// 相机向外移动多少
        VM.CONTROLS.autoRotate = false;// 自动旋转开关，以自动围绕目标旋转
        // VM.CONTROLS.autoRotateSpeed = 4;// 自动旋转开关，以自动围绕目标旋转
        VM.CONTROLS.rotateSpeed = 0.15;// 旋转速度，鼠标左键
        VM.CONTROLS.enableDamping = true;// 使动画循环使用时阻尼或自转 意思是否有惯性
        VM.CONTROLS.dampingFactor = 0.2;// 阻尼惯性有多大 意思是鼠标拖拽旋转灵敏度
        VM.CONTROLS.enableKeys = false;// 是否打开支持键盘方向键操作
        VM.CONTROLS.enablePan = false;// 启用或禁用摄像机平移，默认为true。防止键盘ctrl控制
        VM.CONTROLS.update();
        VM.CONTROLS.saveState();// 保存初始状态，不然reset()会回不到之前的位置;
        VM.CONTROLS.mouseButtons = {
          LEFT: THREE.MOUSE.LEFT,
          MIDDLE: THREE.MOUSE.MIDDLE,
          // RIGHT: VM.LCD === 0 ? THREE.MOUSE.RIGHT : null,// 液晶屏禁用右键0
          RIGHT: null// 禁用右键
        }
      }
      VM.CAMERA.lookAt(new THREE.Vector3(VM.reset_camera.x, VM.reset_camera.y, VM.reset_camera.z));// VM.scene.position
      VM.CAMERA.setFocalLength(VM.FocalLength);
      VM.CAMERA.updateMatrixWorld(true);
      VM.testTime('initCameraTime')
    },
    initLight() {// 光源
      const VM = this;
      VM.initLightTime = VM.getTimeNow();
      let viewFlag2_6 = VM.viewFlag === 2 || VM.viewFlag === 6;
      // VM.scene.add(new THREE.AmbientLight((VM.viewFlag === 2 || VM.viewFlag === 6 ? 0x555555: 0x808080), VM.LCD === 0 ? (VM.isTempCloud ? (VM.viewFlag === 2 ? 3: 3): 3) : 3)); // 环境光
      VM.scene.add(new THREE.AmbientLight((viewFlag2_6 ? 0x555555 : 0x808080), viewFlag2_6 ? 2 : 3)); // 环境光

      const color = 0xffffff;
      const intensity = (viewFlag2_6 ? 0.2 : 0.3);
      const distance = 8000;
      const angle = Math.PI / 2;
      const exponent = 0.75;
      const decay = 1;

      const spotLight = new THREE.SpotLight(color, intensity, distance, angle, exponent, decay);
      let spotLight1 = spotLight.clone();
      spotLight1.position.set(0, 1000, -1000);
      spotLight1.shadow.camera.near = 2;
      spotLight1.shadow.camera.far = 1000;
      spotLight1.shadow.camera.fov = 30;
      // spotLight1.distance = 10000;
      // spotLight1.shadowDarkness = 1;
      spotLight1.target.position.set(0, 0, 0);
      // spotLight1.shadow.mapSize.width = 1024;
      // spotLight1.shadow.mapSize.height = 1024;
      spotLight1.castShadow = true;
      VM.spotLight1 = spotLight1;
      VM.scene.add(spotLight1);

      let spotLight2 = spotLight.clone();
      spotLight2.position.set(0, 1000, 1000);
      spotLight2.shadow.camera.near = 2;
      spotLight2.shadow.camera.far = 1000;
      spotLight2.shadow.camera.fov = 30;
      // spotLight2.distance = 10000;
      // spotLight2.shadowDarkness = 1;
      spotLight2.target.position.set(0, 0, 0);
      // spotLight2.shadow.mapSize.width = 1024;
      // spotLight2.shadow.mapSize.height = 1024;
      spotLight2.castShadow = true;
      VM.spotLight2 = spotLight2;
      VM.scene.add(spotLight2);

      if (VM.LCD === 0) {// PC多打一盏灯
        let spotLight3 = spotLight.clone();
        spotLight3.position.set(1000, -1000, 1000);
        spotLight3.shadow.camera.near = 2;
        spotLight3.shadow.camera.far = 1000;
        spotLight3.shadow.camera.fov = 30;
        // spotLight3.distance = 10000;
        // spotLight3.shadowDarkness = 1;
        spotLight3.target.position.set(0, 0, 0);
        // spotLight3.shadow.mapSize.width = 1024;
        // spotLight3.shadow.mapSize.height = 1024;
        spotLight3.castShadow = true;
        VM.spotLight3 = spotLight3;
        VM.scene.add(spotLight3);
      }

      // 这里不能用循环，液晶屏性能有问题
      // VM.spotLight_list.forEach((light, index) => {
      // const spotLight = new THREE.SpotLight(color, intensity, distance, angle, exponent, decay);
      // spotLight.position.set(light.x, light.y, light.z);
      // spotLight.shadow.camera.near = 2;
      // spotLight.shadow.camera.far = 1000;
      // spotLight.shadow.camera.fov = 30;
      // // spotLight.distance = 10000;
      // spotLight.shadowDarkness = 1;
      // spotLight.target.position.set(0, 0, 0);
      // // spotLight.shadow.mapSize.width = 1024;
      // // spotLight.shadow.mapSize.height = 1024;
      // spotLight.castShadow = true;
      // VM['spotLight' + index] = spotLight;
      // VM.scene.add(spotLight);
      // });
      VM.testTime('initLightTime')
    },
    initStats() {
      const VM = this;
      const stats = new Stats();
      // 设置统计模式
      stats.setMode(0); // 0: fps, 1: ms
      // 统计信息显示在左上角
      stats.domElement.style.position = 'absolute';
      stats.domElement.style.left = '0px';
      stats.domElement.style.top = '0px';
      // 将统计对象添加到对应的<div>元素中
      if (document.getElementById("Stats_output")) {
        document.getElementById("Stats_output").appendChild(stats.domElement);
        VM.STATS = stats;
      }
    },
    render_render(flag) {
      // console.log(flag);
      const VM = this;
      if (VM.STATS) {
        VM.STATS.update();
      }
      // VM.renderRaycasterObj();
      // console.time(flag)
      VM.renderTime = this.getTimeNow();
      if (VM.renderer) {
        VM.renderer.render(VM.scene, VM.CAMERA);
        VM.isRoateing = false;
      }
      VM.testTime('renderTime')
      // console.timeEnd(flag)
      this.isControlsChange = false;
    },
    cal_model_length_unit(data) {
      const width = data.width;
      let airL = 34, cabL = 64, half_L = 0;// 空调柜宽度  机柜宽度
      if (width === 1) { // 0 全柜  1 半柜
        half_L = airL / 2;
      } else {
        half_L = cabL / 2;
      }
      return half_L;
    },
    cal_model_length(i) {
      const VM = this;
      let half_L = 0;
      if (i >= 2) {// 计算当前位置，机柜距左边的距离，从0开始，0距左边的距离是0
        half_L += VM.cal_model_length_unit(VM.cubeArry[i - 2]);// 0 2
        half_L += VM.cal_model_length_unit(VM.cubeArry[i]);// 2 4
      }
      return half_L;
    },
    initModel() {// 导入模型
      const VM = this;
      VM.initModelTime = VM.getTimeNow();
      VM.objGroup = new THREE.Group();// 成组
      VM.half_ll = VM.cal_model_length_unit(VM.cubeArry[0]);// 前门
      VM.half_rr = VM.cal_model_length_unit(VM.cubeArry[VM.cubeArry.length - 1]);// 后门
      VM.init_heatmap_four_mesh(true);// 先计算一次温度云图，不然位置会有重叠错位
      VM.preLoadNormalCabinet();// 加载普通普通机柜模型
      VM.preLoadDoorFront();// 加载前门模型
      VM.preLoadDoorBack();// 加载后门模型
      VM.preLoadCabinetAir();// 加载空调机柜模型
      if (VM.isTempCloud) {// 温度云图再提示这个吧
        new Promise((resolve, rejected) => {
          if ($("#successMsg").length !== 0) {
            $("#successMsg").find(".load_pop").find("p").html('数据正在加载中，请稍后');
          } else {
            record_wait('数据正在加载中，请稍后')
          }
          setTimeout(() => {
            VM.init_three_heat_map();// 0.5秒之后再加载3面视图
            resolve()
          }, 500)
        }).then(() => {
          record_wait_close();
          VM.render_render('init_three_heat_map') // 重新渲染一次
        })
      }
      VM.testTime('initModelTime')
    },
    /*
      * 在透明视图下针对不同的模型显示透明都不同
      * */
    changeMaterial(oo) {
      const VM = this;
      if (!VM.isTransparent) {
        return
      }
      let setAttr = (material) => {
        material.transparent = true;
        material.opacity = (VM.isTempCloud ? 0.5 : 0.1);
        material.blendDstAlpha = (VM.isTempCloud ? 0.5 : 0.1);
        material.side = THREE.DoubleSide;
        material.color.setHex(VM.isTempCloud ? 0x8c9bbd : 0x9397bb)
      };
      let opacity = 0.1;
      let blendDstAlpha = 0.1;
      let color = 0x9397bb;
      if (VM.isTempCloud) {
        opacity = 0.1;
        blendDstAlpha = 0.1;
        color = 0x8c9bbd
      }
      if (VM.LCD === 1) {
        opacity = 0.1;
        blendDstAlpha = 0.1;
        color = 0x2b4e66;
        if (VM.isTempCloud) {
          opacity = 0.1;
          blendDstAlpha = 0.1;
          color = 0x2b4e66
        }
      }
      oo.traverse((child) => {
        if (child instanceof THREE.Mesh) {// 给模型设置一部分材质，加透明度
          // if (Array.isArray(child.material)){
          // child.material.forEach( (item,index) =>{
          // setAttr(item);
          // });
          // } else{
          // setAttr(child.material);
          // }

          child.material = new THREE.MeshPhongMaterial({
            transparent: true,
            opacity: opacity,
            blendDstAlpha: blendDstAlpha,
            side: THREE.DoubleSide,
            color: color
          })
          // child.material.visible = false
          // child.material.color.setHex(VM.isTempCloud ? 0x8c9bbd :0x9397bb);
        }
      });
    },
    /*
    * 安防设备的透明度处理，给告警颜色
    * */
    changeDevMaterial(oo) {
      const VM = this;
      if (!VM.isTransparent) {
        return
      }
      let setAttr = (material) => {
        material.opacity = 1;
        material.side = THREE.DoubleSide;
        material.color.setHex(0x9D0000);
      };
      oo.traverse((child) => {
        if (child instanceof THREE.Mesh) {// 给模型设置一部分材质，加透明度
          // if (Array.isArray(child.material)){
          // child.material.forEach( (item,index) =>{
          // setAttr(item);
          // });
          // } else{
          // setAttr(child.material);
          // }
          child.material = new THREE.MeshPhongMaterial({
            // transparent:true,
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
      const VM = this;
      let flag = true;
      const name_material = oo.getObjectByName(name);
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
      const mesh_arr = oo.children;
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
    cal_dev_camera_position(objLengh, half_rr, position) {
      const pos_obj = {x: 0, y: 0, z: 0};
      const half_length = objLengh / 2 + half_rr - 9;
      const sigle_length = this.objSingleLength * 3;// 单个机柜的长度
      // 一个一个计算，
      /*x*/
      if (position <= 5) {
        pos_obj.x = -half_length;
      } else {
        pos_obj.x = half_length;
      }
      /*y*/
      pos_obj.y = this.objHeight - 5;
      /*z*/
      if (position === 1 || position === 6) {
        pos_obj.z = -sigle_length / 2 - 5;
      } else if (position === 5 || position === 10) {
        pos_obj.z = sigle_length / 2 + 5;
      } else if (position === 2 || position === 7) {
        pos_obj.z = -sigle_length / 6 + 5;
      } else if (position === 4 || position === 9) {
        pos_obj.z = sigle_length / 6 - 5;
      } else if (position === 3 || position === 8) {
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
    * 位置7，x轴为0，y轴为正的机柜的高度一半，z轴为负的整个机柜宽度的一半// Y轴高度存在疑问
    * 位置8，x轴为负的整个机柜长度的一半，y轴为正的机柜的高度一半，z轴为0; // Y轴高度存在疑问
    * 位置9，x轴为0，y轴为整个机柜的高度，z轴为0
    * 位置10，x轴为0，y轴为正的机柜的高度一半，z轴为0// Y轴高度存在疑问
    * 位置11，x轴为正的整个机柜长度的一半，y轴为正的机柜的高度一半，z轴为正的整个机柜宽度的三分之一// Y轴高度存在疑问
    * 位置12，x轴为0，y轴为正的整个机柜的高度一半，z轴为负的整个机柜宽度三分之一
    * 位置13，x轴为正的整个机柜长度的一半，y轴为正的机柜的高度一半，z轴为负的整个机柜宽度的一半// Y轴高度存在疑问
    * position：位置 1 ，2， 3， 4...13
    * */
    cal_heatmap_position(position) {
      const VM = this;
      const width = VM.objLength + VM.objSingleWidth;// 机柜的整体长度 // + VM.half_ll // 这里删除了半个门的宽度，因为没加门
      const height = VM.objHeight + VM.objSmallHeight;// 机柜的整体高度
      const littleWidth = -1;// z轴微调，防止贴太近闪烁, 现在只针对与 第一第三面
      const allWidth = VM.objSingleLength * 3;// 乘3是因为左右各一排加上中间通道，宽度都是一样的
      const position_obj = {x: 0, y: height / 2, z: 0};
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
    cal_heatmap_nine_position(mesh, position) {
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
    * data: 当前的温度数据
    * index: 机柜在列表中的下标
    * k: 当前位置的下标
    * cur_index: 当前机柜下标在有数据的数组中的下标
    * */
    cal_heatmap_data_position(length, height, cabinet_num, data, index, k, cur_index) {
      let smile_per = 0;// 微调
      if (index % 2 === 0) {// 背面
        smile_per += 1
      }
      const all_data = {};
      data.temp = Number(data.temp);
      const position_obj = {
        x: 0,
        y: 0,
        value: data.temp,// 当前点的温度值
        root: true,// 是否是complete_tem_data得到的数据
        baseroot: data.baseroot,// 是否是后台传过来的原始数据
        way: data.way,// 冷热通道
        numb: data.numb // 当前数据所属机柜的下标
      };// root 代表他是中心点数据 baseroot 表示是最原始的数据，后台返回的
      const splitNum = 5;// y轴被分割的数量，即上下位置
      position_obj.x = Number(Number(length / cabinet_num * (index + smile_per)).toFixed(2));
      position_obj.y = Number(Number(height / splitNum * (data.position - 1 / 2)).toFixed(2));

      const limit_width = this.calc_cabinet_width(this.cubeArry[index]);
      const limit_height = Number(Number(height / splitNum).toFixed(2));// 分成五分的单个高度

      /*随机数据
      * 每个测点的为一小格，一个机柜为5个小格，每个面1000个随机点进行计算显示，然后根据机柜数量来限制每一小格的数量  计算方式，每一小格的数据限制 = 1000 / (机柜的数量 / 2) / 5
      * */
      const pointss = [];
      let max = data.temp;
      // const dataLimit = Math.ceil(1000 / (this.cubeArry.length / 2) / 5);
      const dataLimit = this.randomNum;// 先限制为40个
      // if(data.baseroot || data.temp > (this.temp_default[data.type] || 18)) {// 只有是真实数据或者温度超过当前设定的默认值才需要创建随机点
      for (let i = 0; i < dataLimit; i++) {
        const val = Math.floor(this.randomCoe * data.temp);
        max = Math.max(max, val);
        const point = {
          x: Math.floor(Math.random() * limit_width + (limit_width * cur_index)),// x轴要根据当前机柜下标计算X轴位置
          y: Math.floor(Math.random() * limit_height + (limit_height * k)),// Y轴要根据当前位置的下标进行计算y轴位置
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
    * data: 当前的温度数据
    * arr_length: 数据的长度，用作Y轴分割
    * m: 当前第几面
    * k: 当前循环的下标
    * */
    cal_heatmap_nine_data_position(length, height, data, arr_length, m, k) {
      const all_data = {};
      let cal_width = 0;
      data.temp = Number(data.temp);
      const position_obj = {
        x: 0,
        y: 0,
        value: data.temp,
        root: true,
        baseroot: data.baseroot,
        way: data.way,
        numb: data.numb
      };// root 代表他是中心点数据 baseroot 表示是最原始的数据，后台返回的
      const limit_width = this.objSingleLength / 2;// 固定宽度 120
      let limit_height = Number(Number(height / 5).toFixed(2));// 分成五分的单个高度

      // position_obj.x = Number(Number(length / 2).toFixed(2));
      position_obj.y = Number(Number(height / (arr_length / 2) * (data.position - 1 / 2)).toFixed(2));// (arr_length / 2)是因为分别有冷热通道两组数据
      if ((m === 6 || m === 11 || m === 13) && data.type === this.key_hot) {// 这三个原点与机柜冷热通道排列不同
        position_obj.x = Number(length);
        cal_width = limit_width; // 如果是热通道，那把他们的x轴都往右挪一半的宽度
      }
      if ((m === 5 || m === 7 || m === 12) && data.type === this.key_cold) {// 这三个的冷通道原始数据也需要挪位置
        position_obj.x = Number(length);
      }
      if ((m === 5 || m === 7 || m === 9 || m === 10 || m === 12) && data.type === this.key_cold) {
        cal_width = limit_width; // 如果是冷通道，那把他们的x轴都往右挪一半的宽度
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
        limit_height = this.calc_cabinet_width(this.cubeArry[data.position]);// 根据每个机柜的全柜还是半柜来限制每一小格高度
      }
      const pointss = [];
      let max = data.temp;
      const dataLimit = this.randomNum;// 如果点很多的话，其他几个面随机点减半
      // if(data.baseroot || data.temp > (this.temp_default[data.type] || 18)) {// 只有是真实数据或者温度超过当前设定的默认值才需要创建随机点
      for (let i = 0; i < dataLimit; i++) {
        const val = Math.floor(this.randomCoe * data.temp);
        max = Math.max(max, val);
        const point = {
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
      const demo_point = {x: 0, y: 0, value: '900'};
      all_data.max = data.temp;
      all_data.position_arr = [position_obj, ...pointss];
      return all_data
    },
    /*
    * 计算获取指定的温度值
    * data_arr:需要筛选位置的数组
    * position:指定的位置
    * */
    cal_heatmap_one_position(data_arr, position) {
      return data_arr.filter((item, index) => {
        return item.position === position
      });
    },/*
    * 计算两个点的平均的温度值，要求两个数组长度一致，所筛选的位置一致
    * hot_arr:热通道数组
    * cold_arr:冷通道数组
    * flag: 是否需要特殊处理位置，针对于顶部三个位置，这三个位置初始position都为1，所以要处理一下数据
    * */
    cal_heatmap_ave_position(hot_arr, cold_arr, flag) {
      if (hot_arr.length !== cold_arr.length) {
        return cold_arr
      }
      const ave_data = [];
      for (let i = 0; i < hot_arr.length; i++) {
        const new_item = JSON.parse(JSON.stringify(hot_arr[i]));
        if (flag) {
          new_item.position = i + 1
        }
        new_item.temp = Number(new_item.temp + cold_arr[i].temp) / 2;
        ave_data.push(new_item);
      }
      ave_data.sort((a, b) => {
        return a.position - b.position
      });
      return ave_data
    },
    /* 获取机柜单通道的数据
    * even: 奇数还是偶数 奇数：1, 偶数：0
    * way: 冷通道还是热通道 属性名字
    * flag: 是否需要特殊处理位置，针对于顶部三个位置
    * */
    cal_heatmap_one_way_data(even, way) {
      const VM = this;
      let one_way_data = [];
      for (let n = 0; n < VM.cubeArry.length; n++) {
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
    set_temp_data_type(data, type) {
      return data.map((item, index) => {
        item.type = type;
        return item
      })
    },
    initObject(movL) {
      const VM = this;
      console.time('initObject');
      VM.initObjectTime = VM.getTimeNow();
      let cube_maxH = 250, z_y = 120, cube_y, text_y, text_r, new_text_y, new_text_y2, new_text_y3;
      const localPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.8);// 切割面
      const array_length = VM.cubeArry.length;
      const cubeMaterial = new THREE.MeshPhongMaterial({// 正面及背面材质
        vertexColors: THREE.FaceColors,
        transparent: VM.isTransparent,// 是否使用透明度，通过玻璃所看的柜子是否显示透明
        side: THREE.FrontSide,
        polygonOffset: true,// 开启偏移
        polygonOffsetFactor: -0.2,// 与相机距离减0.2
        clippingPlanes: [localPlane],// 切割面
        // ambient: 0xffffff,// 材质的环境色
        emissive: 0x333333,// 材质发光的颜色 ,缺省黑色
        specular: 0xffffff,// 材质的光亮程度及其高光部分的颜色
        shininess: 30,// 高光部分亮度 缺省30
        opacity: 0.1,
      });
      // 感叹号的使用
      const materialText = new THREE.MeshBasicMaterial({// 基础网格材质
        // map: VM.Nameobj[iNum],// 文字贴图
        side: THREE.DoubleSide,// 选择哪面显示
        fog: false // 材质是否受雾影响。默认为true。
      });
      const geometryText = new THREE.CircleGeometry(20, 22);// 创建一个圆形几何体
      const newMesh = new THREE.Mesh();
      // 机柜上面的文字信息
      const materialTextCab = new THREE.MeshBasicMaterial({// 基础网格材质
        // map: VM.NewNameobj[iNum],// 文字贴图
        side: THREE.FrontSide,// 选择哪面显示
        transparent: true,// 是否使用透明度
        fog: false //材质是否受雾影响。默认为true。
      });
      let MaterialTextTemp;
      // 容量云图才显示需要处理显示当前底部的容量值
      if (VM.isTransparent && VM.viewFlag === 2) {
        // 处理一下机柜下面的容量数值 ,与温度值,在温度柱图中显示温度值
        MaterialTextTemp = new THREE.MeshBasicMaterial({// 基本网格材质
          side: THREE.FrontSide,// 选择哪面显示
          transparent: true,// 是否使用透明度
          fog: false //材质是否受雾影响。默认为true。
        });
      }
      let materialTextColumn;
      // 温度柱图才显示
      if (VM.isTransparent && VM.viewFlag === 6) {
        materialTextColumn = new THREE.MeshBasicMaterial({// 基本网格材质
          side: THREE.FrontSide,// 选择哪面显示
          transparent: true,// 是否使用透明度
          fog: false //材质是否受雾影响。默认为true。
        });
      }

      for (let iNum = 0; iNum < array_length; iNum++) {
        VM.cube[iNum].name = VM.cabinet_ + iNum;// 根据这个名字计算了点击事件
        VM.cube[iNum].geometry = new THREE.Geometry().fromBufferGeometry(VM.cube[iNum].geometry);// BufferGeometry 装换为 Geometry
        VM.cube[iNum].material = cubeMaterial.clone();
        VM.cube[iNum].is_alarm = VM.cubeArry[iNum].is_alarm;
        VM.cube[iNum].castShadow = true;
        VM.cube[iNum].receiveShadow = true;
        if (iNum % 2 === 0) {// 偶数,正面的一排机柜
          cube_y = 0 - z_y;// 机柜的位置，与反面的相反
          text_y = cube_y - (113.3 / 2 + 5);// 当前做一个位置微调
          text_r = Math.PI;// 文字翻转180
          new_text_y = text_y - 1;
          new_text_y2 = text_y - 2;// 容量视图底部百分值显示的位置调整
          new_text_y3 = text_y;// 温度柱图底部温度值的位置调整显示
        } else {
          cube_y = z_y;
          text_y = cube_y + (113.3 / 2 + 5);
          text_r = 0;
          new_text_y = text_y + 1;
          new_text_y2 = text_y + 2;
          new_text_y3 = text_y;
        }
        // 文字 设备名，当前只有感叹号
        VM.initTextName(VM.cubeArry[iNum].name, VM.cubeArry[iNum].is_alarm, iNum, 0, VM.cubeArry[iNum].alarm);
        let innerMaterialText = materialText.clone();// 克隆一下，以防影响之前的
        let innerGeometryText = geometryText.clone();// 克隆一下，以防影响之前的
        let innerNewMesh = newMesh.clone();// 克隆一下，以防影响之前的
        innerMaterialText.map = VM.Nameobj[iNum];
        innerNewMesh.material = innerMaterialText;
        innerNewMesh.geometry = innerGeometryText;
        VM.mesh[iNum] = innerNewMesh;
        VM.mesh[iNum].position.set(VM.cubeArry[iNum].x - movL, 330, text_y);
        VM.mesh[iNum].rotation.y = text_r;
        if (VM.cubeArry[iNum].is_alarm && (!VM.isTransparent && !VM.isTempCloud)) {// 有告警才显示
          VM.scene.add(VM.mesh[iNum]);
        }
        // if(VM.LCD === 0
        // 处理一下机柜上面的文字信息
        VM.initCabinetName(VM.cubeArry[iNum].name, iNum);
        const cabMaterialText = materialTextCab.clone();// 克隆一下，以防影响之前的
        const cabNameNewMesh = newMesh.clone();// 克隆一下，以防影响之前的
        // 这里的画布大小与  initCabinetName 中大小设置一致，取画布的中间部分 创建平面几何体
        const cabGeometryText = new THREE.PlaneGeometry(VM.calc_cabinet_width(VM.cubeArry[iNum]), VM.objCabinetTopHeight);
        cabMaterialText.map = VM.NewNameobj[iNum];
        cabNameNewMesh.material = cabMaterialText;
        cabNameNewMesh.geometry = cabGeometryText;
        VM.mesh1[iNum] = cabNameNewMesh;
        VM.mesh1[iNum].name = VM.cabinetName_ + iNum;// 根据这个名字计算了点击事件，不然事件无法响应
        VM.mesh1[iNum].position.set(VM.cubeArry[iNum].x - movL, VM.objHeight - 5, text_y);
        VM.mesh1[iNum].rotation.y = text_r;// 设置一下y轴的旋转
        VM.mesh1[iNum].is_alarm = VM.cubeArry[iNum].is_alarm;// 存一下当前的是否告警
        VM.mesh1[iNum].renderOrder = 1000;
        VM.mesh1[iNum].material.depthTest = false;
        // if (!VM.isTransparent && !VM.isTempCloud) {
        VM.scene.add(VM.mesh1[iNum]);
        // }

        // }
        if (VM.isTransparent && VM.viewFlag === 2) {// 容量云图才显示需要处理显示当前底部的容量值
          // 处理一下机柜下面的容量数值 ,与温度值,在温度柱图中显示温度值
          const cur_per = VM.cubeArry[iNum][VM.get_current_capacity_key()];
          let tempMaterialText = MaterialTextTemp.clone();// 克隆一下，以防影响之前的
          let tempNewMesh = newMesh.clone();// 克隆一下，以防影响之前的
          // 创建平面几何体
          const tempGeometryText = new THREE.PlaneGeometry(VM.calc_cabinet_width(VM.cubeArry[iNum]), VM.objCabinetBottomHeight);
          tempMaterialText.map = VM.initCabinetPercent(cur_per, VM.calc_cabinet_width(VM.cubeArry[iNum]), 0, iNum);// 文字贴图
          tempNewMesh.material = tempMaterialText;
          tempNewMesh.geometry = tempGeometryText;

          VM.mesh2[iNum] = tempNewMesh;
          VM.mesh2[iNum].name = VM.cabinetCapacity + iNum;// 根据这个名字计算了点击事件，不然事件无法响应
          VM.mesh2[iNum].userData = {per: cur_per};// 记录一下当前的温度值
          VM.mesh2[iNum].position.set(VM.cubeArry[iNum].x - movL - 2, VM.objCabinetBottomHeight - 12, new_text_y2);// 这里 - 12是做了部分微调
          VM.mesh2[iNum].rotation.y = text_r;
          VM.scene.add(VM.mesh2[iNum]);
        }

        if (VM.isTransparent && VM.viewFlag === 6) {// 温度柱图才显示
          // // 处理一下机柜上面的温度数值
          const setMaterial = (key, iNum, new_text_y3, text_r) => {
            const side = THREE.FrontSide;
            // if (key === 'temp_cold'){// 冷通道
            // side = THREE.BackSide;
            // }
            let cur_per = VM.cubeArry[iNum][key];
            let ColumnMaterialText = materialTextColumn.clone();
            let tempNewMesh = newMesh.clone();// 克隆一下，以防影响之前的
            // 创建平面几何体
            // const geometryText3 = new THREE.PlaneGeometry(VM.calc_cabinet_width(VM.cubeArry[iNum]), VM.objHeight - VM.objCabinetBottomHeight / 2);
            const ColumnGeometryText3 = new THREE.PlaneGeometry(VM.calc_cabinet_width(VM.cubeArry[iNum]), VM.objCabinetBottomHeight);
            ColumnMaterialText.map = VM.initCabinetPercent(cur_per, VM.calc_cabinet_width(VM.cubeArry[iNum]));// 文字贴图
            tempNewMesh.material = ColumnMaterialText;
            tempNewMesh.geometry = ColumnGeometryText3;
            VM.mesh3[iNum + key] = tempNewMesh;
            VM.mesh3[iNum + key].name = VM.capacityTemp + iNum;// 给材质加上名字标识，用来做点击事件的识别
            VM.mesh3[iNum + key].userData = {per: cur_per};// 记录一下当前的温度值
            // VM.mesh3[iNum + key].position.set(VM.cubeArry[iNum].x - movL - 2, VM.objHeight / 2 + VM.objCabinetBottomHeight / 2, new_text_y3);
            VM.mesh3[iNum + key].position.set(VM.cubeArry[iNum].x - movL - 2, VM.objCabinetBottomHeight - 12, new_text_y3);
            VM.mesh3[iNum + key].rotation.y = text_r;
            VM.mesh3[iNum + key].renderOrder = 1000;
            VM.mesh3[iNum + key].material.depthTest = false;
            VM.scene.add(VM.mesh3[iNum + key])
          };
          let hot_text_y = new_text_y3 + VM.objSingleLength / 4;
          let cold_text_y = new_text_y3 + VM.objSingleWidth + VM.objSingleLength / 2;
          if (iNum % 2 === 1) {
            hot_text_y = new_text_y3 - VM.objSingleLength / 4;
            cold_text_y = new_text_y3 - VM.objSingleWidth - VM.objSingleLength / 2
          }
          // setMaterial('temp_hot',iNum,new_text_y3,text_r);
          setMaterial("temp_hot", iNum, new_text_y3, iNum % 2 === 1 ? text_r : Math.PI);
          // setMaterial('temp_cold',iNum,cold_text_y,text_r);
          setMaterial("temp_cold", iNum, cold_text_y, iNum % 2 === 1 ? Math.PI : 0)
        }
      }
      if (VM.isTransparent && (VM.viewFlag === 6 || VM.isTempCloud) && (!VM.sphereMesh || !VM.latheMesh)) {// 温度柱图和温度云图需要加载菜单切换
        // VM.clearCache(VM.sphereMesh);
        // console.time("initObjecttime")
        VM.latheTime = VM.getTimeNow();
        let color = "#72ff90";
        if (VM.isTempCloud) {// 因为温度云图下的灯光比较强，所以颜色需要加深一点
          color = "#42ff68"
        }
        let lathe = newMesh.clone();
        let sphere = newMesh.clone();
        const material = new THREE.MeshLambertMaterial({
          // map:VM.threeD_chose_menu_texture,
          transparent: true,// 是否使用透明度
          color: color,
          fog: false,
          opacity: 1
        });
        sphere.material = material;
        sphere.name = VM.cabinetChoseMenu;
        sphere.renderOrder = 1000;// 渲染级别，有点像z-index
        sphere.material.depthTest = false;// 是否深度测试
        lathe.material = material;
        lathe.name = VM.cabinetChoseMenu;
        lathe.renderOrder = 1000;// 渲染级别，有点像z-index
        lathe.material.depthTest = false;// 是否深度测试
        lathe.position.set(0, VM.objHeight + 30, 0);
        lathe.rotateZ(Math.PI);
        let latheGeometry;
        let points = [];
        if (VM.LCD === 1) {
          sphere.geometry = new THREE.SphereGeometry(30, 15, 15);
          sphere.position.set(0, VM.objHeight + 45, 0);
          for (let i = 0; i < 10; i++) {
            points.push(new THREE.Vector2(Math.sin(i * 0.4) * 16 + 10, (i - 5.2) * 8))
            // Math.sin(i * 0.4) * 底部圆锥的半径 + 底部尖突出的处理, (i - 5.2) * 底部圆锥的高度)
          }
        } else {
          sphere.geometry = new THREE.SphereGeometry(20, 35, 35);
          sphere.position.set(0, VM.objHeight + 43, 0);
          for (let i = 0; i < 10; i++) {
            points.push(new THREE.Vector2(Math.sin(i * 0.4) * 11.5 + 5, (i - 5.2) * 4.5))
            // Math.sin(i * 0.4) * 底部圆锥的半径 + 底部尖突出的处理, (i - 5.2) * 底部圆锥的高度)
          }
        }
        latheGeometry = new THREE.LatheGeometry(points, 15, 0, 2 * Math.PI);// 车削几何体，点，要分多少段，起始角度，车削部分的弧度
        lathe.geometry = latheGeometry;
        VM.sphereMesh = sphere;
        VM.latheMesh = lathe;
        VM.scene.add(sphere);
        VM.scene.add(lathe)
        // console.timeEnd("initObjecttime")
        VM.testTime('latheTime');
      }
      console.timeEnd('initObject');
      VM.testTime('initObjectTime');
    },
    initCubeData(cubeData, i) {// 数据 贴图
      const VM = this;
      let canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 64;
      let data_context = canvas.getContext("2d");
      data_context.fillStyle = 'rgba(192, 80, 77, 0.0)';
      data_context.fillRect(0, 0, 128, 64);
      data_context.font = "34px Arial";
      data_context.fillStyle = "#ffffff";
      cubeData = Number(cubeData).toFixed(1) + '%';
      data_context.fillText(cubeData, 5, 40);
      VM.Dataobj[i] = new THREE.CanvasTexture(canvas);
      if (document.getElementById("CanvasHide")) {
        document.getElementById("CanvasHide").appendChild(canvas);/*放入垃圾桶*/
        document.getElementById("CanvasHide").innerHTML = '';// 将a从页面上删除 /*清除垃圾桶*/
      }
      canvas = null;
      data_context = null;
    },
    roundedRect(ctx, x, y, width, height, radius) {  // 形状
      const VM = this;
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
    Three_shape(iNum) {// 创建浮动是显示的文字冒泡
      const VM = this;
      let z_y = 120, cube_y, text_y, text_r, text_mov;
      if (iNum % 2 === 0) {
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
      const roundedRectShape = new THREE.Shape();
      VM.roundedRect(roundedRectShape, 0, 0, 100, 50, 20);// 创建冒泡形状
      VM.initTextName(VM.cubeArry[iNum].name, VM.cubeArry[iNum].is_alarm, iNum, 1);// 填入机柜名称
      const geometry = new THREE.ShapeBufferGeometry(roundedRectShape);
      const maxAnisotropy = VM.renderer.getMaxAnisotropy();
      VM.Nameobj[iNum].wrapS = VM.Nameobj[iNum].wrapT = THREE.RepeatWrapping;
      VM.Nameobj[iNum].repeat.set(0.01, 0.01);
      VM.Nameobj[iNum].anisotropy = maxAnisotropy;// 提高贴图清晰度
      const materialText = new THREE.MeshBasicMaterial({
        map: VM.Nameobj[iNum],// 文字贴图
        // side:THREE.DoubleSide,
        side: THREE.FrontSide,
        transparent: VM.isTransparent,// 是否使用透明度，通过玻璃所看的柜子是否显示透明
        opacity: 0.9,
        fog: false
      });
      VM.shapeMess = new THREE.Mesh(geometry, materialText);
      VM.shapeMess.position.set(VM.cubeArry[iNum].x + text_mov, 300, text_y);
      VM.shapeMess.rotation.y = text_r;
      VM.scene.add(VM.shapeMess);
    },
    initTextName(Name, is_alarm, i, flag, alarm_level) {// 设备名称 顶部小提醒 ,现在只显示顶部告警小提示
      const VM = this;
      let canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      let context = canvas.getContext("2d");
      context.arc(32, 32, 32, 0, 2 * Math.PI);
      // if(is_alarm!=0&&!ifNullData(is_alarm)){
      // context.fillStyle = "#e7251b";// 背景色 异常 红
      // }else{
      // context.fillStyle = "#004e90";// 背景色 正常 蓝色
      // // context.fillStyle = "#00c5cc";// 背景色 正常 蓝色
      // }
      context.fillStyle = VM.alarmL_color[alarm_level] || '#ffffff';// 背景颜色
      context.fill();
      // context.fillRect( 0, 0, 128, 64);
      if (flag === 1) {
        context.scale(0.65, 0.65);
      }
      context.fillStyle = VM.alarmL_color[alarm_level] ? "#ffffff" : "#000000";// 字色 白
      context.textAlign = "center";
      if (flag === 1) {
        context.font = "25px Arial";
        context.fillText(Name, 100, 85);
      } else {
        context.font = "bold 46px Arial,sans-serif";
        context.fillText("i", 32, 45);
      }
      VM.Nameobj[i] = new THREE.CanvasTexture(canvas);
      if (document.getElementById("CanvasHide")) {
        document.getElementById("CanvasHide").appendChild(canvas);/*放入垃圾桶*/
        document.getElementById("CanvasHide").innerHTML = '';// 将a从页面上删除 /*清除垃圾桶*/
      }
      canvas = null;
      context = null;
    },
    initCabinetName(Name, i) {// 设备名称 机柜贴图，文字缩放在 initObject 中,文字放大原理，把画布画大一点，接收的部分显示内容
      const VM = this;
      let shadowColor = "#ffffff";
      let fillStyle = "#ffffff";
      let fillStyleBg = "rgba(0,0,0,0.5)";
      // if (VM.isTempCloud && VM.heatmap_type === 1){
      // shadowColor = '#666666';
      // fillStyle = '#666666';
      // }else
      if (VM.LCD === 1 && VM.isTransparent) {
        shadowColor = "rgba(0,0,0,0.65)";
        // fillStyle = '#666666';
        fillStyleBg = "rgba(0,0,0,0.4)";
      }
      let canvas = document.createElement("canvas");
      // const dpr = window.devicePixelRatio || 1;
      const per = VM.cubeArry[i].width === 0 ? 1 : 2;// 0是全柜 1是半柜
      const limit = VM.cubeArry[i].width === 0 ? 5 : 2;// 0是全柜 1是半柜
      const dpr = 2.6;// 这边乘3是将整个画布放大一些，然后取部分内容显示
      const width = (VM.objSingleWidth / per) * dpr;
      // const height = 250 * dpr;
      const height = VM.objCabinetTopHeight * dpr;
      canvas.width = width;
      canvas.height = height;
      // if (!VM.isTransparent) {
      let context = canvas.getContext("2d");
      context.arc(32, 32, 32 * dpr * 2, 0, 2 * Math.PI);
      context.fillStyle = fillStyleBg;
      context.fill();
      context.shadowBlur = 1;// 阴影模糊级数
      if (VM.LCD === 1) {
        context.shadowBlur = 2;// 阴影模糊级数
        context.shadowOffsetX = 1;// x轴偏移
        context.shadowOffsetY = 3// y轴偏移
      }
      context.shadowColor = shadowColor;
      context.fillStyle = fillStyle;// 字色 白
      context.textAlign = "center";
      // context.font = "60px Microsoft YaHei";// 竖排文字大小
      context.font = "42px Microsoft YaHei";
      // let x = width / 2, y = 0.256 * height; // 文字开始的坐标
      let x = width / 2, y = height / 1.3;// 文字开始的坐标
      let letterSpacing = 3; // 设置字间距
      // 注释循环部分为文字竖排排版
      // for (let i = 0; i < Name.length; i++) {
      // const str = Name.slice(i, i + 1).toString();
      // if (str.match(/[A-Z0-9]/)) {// 大写和数字
      // letterSpacing = 18
      // } else if (str.match(/[a-z]/)) {// 小写字母
      // letterSpacing = 36;
      // } else {
      // letterSpacing = 3;
      // }
      // context.save();
      // context.textBaseline = 'Middle';
      // context.fillText(str, x, y);
      // context.scale(dpr, dpr);
      // context.restore();
      // y += context.measureText(str).width + letterSpacing; // 计算文字宽度
      // }
      context.fillText(Name.substr(0, limit), x, y);
      context.scale(dpr, dpr);
      // if (dev_index) {
      // context.font = "20px Microsoft YaHei";
      // context.fillText("#" + dev_index, 32, 30);
      // context.scale(0.5, 0.5);
      // }
      // }
      VM.NewNameobj[i] = new THREE.CanvasTexture(canvas);
      if (document.getElementById("CanvasHide")) {
        document.getElementById("CanvasHide").appendChild(canvas);/*放入垃圾桶*/
        document.getElementById("CanvasHide").innerHTML = ""// 将a从页面上删除 /*清除垃圾桶*/
      }
      canvas = null;
      context = null;
    },
    // 容量云图的使用百分比，以及温度柱图底部的温度值
    initCabinetPercent(per, w, h, index) {
      let shadowColor = "#ffffff";
      let fillStyle = "#ffffff";
      if (this.LCD === 1 && !this.is_qt && this.isTransparent) {
        // if (this.LCD === 1 && this.isTransparent){
        shadowColor = "#464c5b";
        fillStyle = "#464c5b"
      }
      let canvas = document.createElement("canvas");
      const dpr = 3;
      let fontSize = "45px ";
      const width = (w || this.objSingleWidth) * dpr;
      let height = (h || this.objHeight) * dpr;
      let fillText = per;
      let x = width / 2;
      let y = height;// 文字开始的坐标
      fillStyle = this.deal_capacity_color(null, per, fillStyle);
      if (this.viewFlag !== 2) {
        // fillText += '℃';
        // height = Math.floor(((h || this.objHeight) - this.objCabinetBottomHeight / 2) * dpr);
        // y = height - (this.check_value(per) * this.objCabinetHeight / 100 + 16) * dpr; // 显示在上面 目前未用
        let height_1 = this.check_value(per) * this.objCabinetHeight / 100;// 需要减去的高度
        if (per < 16) {
          height_1 = 0
        }
        // y = height - Math.abs((height_1 + 16) * dpr);// 显示在柱子最上面]
        height = this.objCabinetBottomHeight * dpr;
        y = this.objCabinetBottomHeight + 26// 放在最下面
        // if (per >= 90) {
        // fillStyle = '#ff0000';
        // }
      } else {
        const limit = this.cubeArry[index].width === 0 ? 6 : 3;// 0是全柜 1是半柜
        // height = VM.objBottomHeight * dpr;
        if (!fillText) {
          fillText = ""
        } else {
          // fillText += '%';
          fillText = fillText.toString()
            .substr(0, limit)
        }
        height = this.objCabinetBottomHeight * dpr;
        y = this.objCabinetBottomHeight + 26;
        fontSize = "38px "
      }
      canvas.width = width;
      canvas.height = height;
      let context = canvas.getContext("2d");
      context.arc(32, 32, 32, 0, 2 * Math.PI);
      context.fillStyle = "transparent";
      context.fill();
      context.shadowBlur = 0.8;// 阴影模糊级数
      context.shadowColor = shadowColor;
      context.fillStyle = fillStyle;// 字色 白
      context.textAlign = "center";
      context.font = fontSize + "Microsoft YaHei";
      context.textBaseline = "Middle";
      if (per && per != 0) {// 这里用一个等于，因为后台返回可能存在0.0
        context.fillText(fillText, x, y)
      }
      // 这里做超时回收是因为如果直接回收会出现无法加载得到内容的情况
      setTimeout(() => {
        // 回收
        if (document.getElementById("CanvasHide")) {
          document.getElementById("CanvasHide").appendChild(canvas);/*放入垃圾桶*/
          document.getElementById("CanvasHide").innerHTML = ""// 将a从页面上删除 /*清除垃圾桶*/
        }
        canvas = null;
        context = null;
      }, 1000);
      return new THREE.CanvasTexture(canvas);
    },
    textArray(nn) {// 柱状体--贴图
      const VM = this;
      const cube_maxH = 250;
      let texture;
      const CabinetType = VM.cubeArry[nn].type;// 机柜类型
      let myopacity = 1;
      let cube_pY = cube_maxH / 2;
      // const mycolor = VM.equip_color[CabinetType];
      let color_item = {color: 0xc0ff00};// 默认给绿色
      VM.equip_content.forEach((item, index) => {// 获取当前机柜类型所对应的颜色
        if (item.keys.indexOf(CabinetType) !== -1) {
          color_item = item;
        }
      });
      if (VM.cubeArry[nn].width === 1) {// 半柜
        texture = VM.texture1;
      } else {
        texture = VM.texture0;
      }
      if (CabinetType === 105) {// 空调
        // texture=VM.texture1;// 空调贴图，2019年10月12日13:58:00 删除空调贴图 zjz
      } else if (CabinetType === 100) {// 无效柜
        if (VM.cubeArry[nn].width === 1) {// 半柜
          texture = VM.texture_disabled_small;
        } else {
          texture = VM.texture_disabled_big;
        }
      } else {// 用户机柜
        // texture=null;
        // mycolor=0x35f521;// 绿色
        myopacity = 0.95;
        cube_pY = 0 - cube_maxH / 2;
      }
      return {"texture": texture, "mycolor": color_item.color, "myopacity": myopacity, "cube_pY": cube_pY};
    },
    no_animation() {// 没有动画时，删除更新属性
      const VM = this;
      for (let i = 0; i < VM.cubeArry.length; i++) {
        VM.cube[i].material.needsUpdate = false;// 使纹理不更新
        VM.cube[i].geometry.colorsNeedUpdate = false;// 使颜色不更新
      }
    },
    normal_animation() {// 所有设备正常
      const VM = this;
      const cube_maxH = 250;
      for (let i = 0; i < VM.cubeArry.length; i++) {
        const maxH = cube_maxH * (VM.cubeArry[i].z - 100) / 100;
        if (VM.cube[i].material.map != null) {
          VM.cube[i].material.map.dispose();
        }
        VM.cube[i].material.needsUpdate = true;// 使纹理可以更新
        VM.cube[i].geometry.colorsNeedUpdate = true;// 使颜色可以更新
        VM.cube[i].material.opacity = VM.textArray(i).myopacity;
        VM.cube[i].material.map = VM.textArray(i).texture;
        VM.cube[i].material.color.setHex(VM.textArray(i).mycolor);
        if (VM.textArray(i).texture == null) {// 没有贴图的柱状体
          for (let k = 0; k < 4; k++) {
            VM.cube[i].geometry.faces[k].color.setHex(0x1aa81f);
          }
          VM.meshData[i].material.opacity = 1;
        }
        if (ifNullData(VM.vH[i])) {
          VM.vH[i] = (maxH - VM.cube[i].position.y) / 5;// 速度列表
          VM.mesh[i].material.map.dispose();
          VM.initTextName(VM.cubeArry[i].name, VM.cubeArry[i].is_alarm, i, 0, 0, VM.cubeArry[i].alarm);// 设备名
          VM.mesh[i].material.map = VM.Nameobj[i];// 设备名
        }
        if (VM.cube[i].position.y !== maxH) {
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
          VM.initCubeData((1 + VM.cube[i].position.y / cube_maxH) * 100, i);// 数值
          VM.meshData[i].material.map = VM.Dataobj[i];
        }
        if (VM.meshData[i] != null) {
          VM.meshData[i].position.y = (VM.cube[i].position.y + 250) > 0 ? (VM.cube[i].position.y + 250) : 20;
        }
        if (VM.cube[i].position.y !== maxH) {
          VM.Allmax_flag[i] = 1;
        } else {
          VM.Allmax_flag[i] = 0;
        }
        if (VM.Allmax_flag.join("") === VM.Allmax_over.join("") && VM.Loadover === 0) {
          VM.stop_animation();
        }
      }
    },
    abnormal_animation() {// 设备有异常
      const VM = this;
      VM.animationTime = this.getTimeNow();
      VM.animationTimeFor = this.getTimeNow();
      for (let i = 0; i < VM.cubeArry.length; i++) {
        VM.cube[i].position.y = 0;
        VM.cube[i].material.transparent = true;// 材料透明
        VM.cube[i].material.needsUpdate = true;// 使纹理可以更新
        VM.cube[i].geometry.colorsNeedUpdate = true;// 使颜色可以更新
        VM.cube[i].material.precision = 'mediump';// 重写材质精度 可以是"highp", "mediump" 或 "lowp"。默认值为null。
        VM.cube[i].material.opacity = VM.isTransparent ? 0.2 : 0.8;
        if (VM.cube[i].material.map != null) {
          VM.cube[i].material.map.dispose();
        }
        if (VM.cubeArry[i].is_alarm !== 0 && !ifNullData(VM.cubeArry[i].is_alarm) && (!VM.isTransparent && !VM.isTempCloud)) {// 异常  根据数据判断是否告警
          VM.cube[i].material.color.setHex(0xe60000);// 柱状体 材质 红  e60000 ff3000
          VM.cube[i].material.map = null;// 去除贴图
          VM.cube[i].material.transparent = false;// 材料透明
          VM.cube[i].material.opacity = 1;
        } else if (VM.isTransparent && VM.viewFlag === 2) {// 容量云图
          // VM.cube[i].material.color.set(this.deal_capacity_color(i));// 柱状体 材质 红  e60000 ff3000
          // VM.cube[i].material.map = null;// 去除贴图
          // VM.cube[i].material.side = 1;
          // VM.cube[i].material.map = VM.textArray(i).texture || VM.texture0;// 机柜上面的门贴图
          // VM.cube[i].material.transparent = false;// 材料透明
          // VM.cube[i].material.opacity = 1;
          VM.cube[i].material.visible = false;
          VM.deal_capacity_type(i);
        } else if (VM.isTransparent && VM.viewFlag === 6) {// 温度柱图
          // VM.cube[i].material.transparent = true;// 材料透明
          // VM.cube[i].material.opacity = 0.1;
          // VM.cube[i].material.visible = false;
          VM.cube[i].visible = false;// 隐藏当前机柜体
          VM.deal_capacity_temp_column(i, 'temp_hot');// 处理热通道的柱图
          VM.deal_capacity_temp_column(i, 'temp_cold');// 处理冷通道的柱图
        } else {
          // VM.textArray(i).mycolor 0x9397bb
          VM.cube[i].material.color.setHex(VM.isTransparent ? 0x9397bb : VM.textArray(i).mycolor);// 柱状体 材质 白
          // 2019年10月10日11:50:55 删除贴图，根据机柜显示对应颜色 zjz
          for (let k = 0; k < 6; k++) {// 柱状体 面颜色 白
            // VM.cube[i] && VM.cube[i].geometry && VM.cube[i].geometry.faces[ k ].color.setHex(VM.isTransparent ?  0x9397bb : VM.textArray(i).mycolor);
          }
          // if (!VM.isTransparent) {
          // if (!VM.isTempCloud)
          // VM.cube[i].renderOrder = VM.isTempCloud ? 2 : 0;
          // VM.cube[i].material.depthTest = !VM.isTempCloud;
          VM.cube[i].material.map = VM.textArray(i).texture || VM.texture0;// 机柜上面的门贴图
          // }
        }
        if (VM.meshData[i] != null) {// 去除数值
          VM.meshData[i].material.opacity = 0;
        }
        if (!ifNullData(VM.cubeArry_old)) {
          VM.mesh1[i].material.map.dispose();
          VM.initCabinetName(VM.cubeArry[i].name, i);// 更新一下设备名
          VM.mesh1[i].material.map = VM.NewNameobj[i];// 更新一下贴图
          if (!VM.isTransparent && !VM.isTempCloud) {// 非温度云图下更新机柜的告警状态
            VM.mesh[i].material.transparent = true;// 材料透明
            VM.mesh[i].material.needsUpdate = true;// 使纹理可以更新
            VM.mesh[i].geometry.colorsNeedUpdate = true;// 使颜色可以更新
            VM.mesh[i].material.map.dispose();
            VM.cube[i].is_alarm = VM.cubeArry[i].is_alarm;// 更新告警状态，不然新的告警来的时候无法执行点击事件
            VM.mesh[i].is_alarm = VM.cubeArry[i].is_alarm;// 更新告警状态，不然新的告警来的时候无法执行点击事件
            if (VM.cubeArry[i].is_alarm === 1) {// 如果产生了新的告警
              VM.mesh[i].material.visible = true;
              VM.initTextName(VM.cubeArry[i].name, VM.cubeArry[i].is_alarm, i, 0, VM.cubeArry[i].alarm);// 设备名，感叹号
              VM.mesh[i].material.map = VM.Nameobj[i];// 更新一下贴图
              VM.scene.add(VM.mesh[i]);// 这里要加上，不然新告警来的时候不会显示上面的图表
            } else {// 告警取消了，就得删掉这个mesh
              VM.mesh[i].material.visible = false;
              VM.scene.remove(VM.mesh[i]);
            }
          }
          // if(!(VM.cubeArry_old[i].name==VM.cubeArry[i].name && VM.cubeArry_old[i].alarm==VM.cubeArry[i].alarm)){
          if (VM.viewFlag === 2) {// 容量
            // VM.cube[i].material.color.set(this.deal_capacity_color(i));// 柱状体 材质 红  e60000 ff3000
            VM.deal_capacity_type(i);// 更新一下当前容量柱图
          } else if (VM.viewFlag === 6) {// 温度柱图
            VM.deal_capacity_temp_column(i, 'temp_hot');// 热通道容量柱图的更新
            VM.deal_capacity_temp_column(i, 'temp_cold');// 冷通道容量柱图的更新
          }
        }
      }
      VM.testTime('animationTimeFor')
      VM.MyisRender = false;// 这边添加置否是因为容量三个试图切换3
      if (VM.Loadover <= 0) {// 模型加载完成
        if (VM.viewFlag === 1) {// 是否已经加载了其他视图（温度云图9面、3面云图以及安防视图中的摄像头），针对于温度云图优化
          if (!VM.hasLoadOtherView) {
            VM.loadOtherView();
          }
        } else {
          VM.loadOtherView();
        }
        VM.stop_animation();// 停止当前的动画
      }
      VM.testTime('animationTime')
    },
    stop_animation() {
      const VM = this;
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
    animation(flag) {
      // console.log(flag);
      const VM = this;
      if (VM.renderer) {
        VM.renderer.clear();// 清除场景
      }
      // requestAnimationFrame(VM.animation);
      // VM.requestAnimationFrameID = requestAnimationFrame(VM.myAnimation);
      if (VM.CONTROLS) {
        VM.CONTROLS.update();// 更新一下控制器的视角
      }
      /*if(VM.IS_Alarm==0) {// 所有设备正常
       VM.normal_animation();
       }else{// 设备有异常*/
      VM.abnormal_animation();// 渲染机柜贴图内容
      /* }*/
      // VM.Timeinterval_3d = setTimeout( () =>{
      // if (VM.animationFlag === 0) {
      // VM.animation('Timeinterval_3d');// 动画
      // }
      VM.LCDScale();// 液晶屏下放大一倍
      // }, 3000);
      VM.render_render('animation');
    },
    myAnimation(time) {
      time *= 0.0005;
      const VM = this;
      if (VM.CAMERA && VM.renderer) {
        VM.CAMERA.updateProjectionMatrix();
        VM.scene.rotation.y = time;
        VM.renderer.render(VM.scene, VM.CAMERA);
        VM.requestAnimationFrameID = requestAnimationFrame(VM.myAnimation)
      }
    },
    render_dispose() {// 解绑三维场景中的机柜 释放内存
      const VM = this;
      if (!VM.renderer) {
        return;
      }
      VM.render_dispose_time = VM.getTimeNow();
      VM.MyisRender = true;// 这个添加一下清楚的控制
      VM.clearMesh(VM.objGroup);// 清除组
      VM.clearMesh(VM.cubeArry);// 清除机柜数据中创建的mesh对象
      VM.clearMesh(VM.meshData);// 设备正常时存在的mesh数据
      VM.clearMesh(VM.mesh);// 机柜告警时顶部的感叹号
      VM.clearMesh(VM.mesh1);// 机柜贴图上的名字    mesh2: [],// 机柜的容量数值
      VM.clearMesh(VM.mesh2);// 机柜的容量数值
      VM.clearMesh(VM.mesh3);// 机柜的温度柱图上的数, 注意这里用了对象存
      VM.clearMesh(VM.mesh4);// 机柜的温度柱图的mesh, 注意这里用了对象存
      VM.clearMesh(VM.sphereMesh);// 菜单切换的冰淇淋
      VM.clearMesh(VM.latheMesh);// 菜单切换的冰淇淋
      VM.clearMesh(VM.heatmap_Mesh);// 温度云图的mesh对象
      VM.clearMesh(VM.heatmap_Mesh_three);// 温度云图的平面三面的对象
      VM.clearMesh(VM.scene);// 清除场景
      VM.clearRenderer();// 清除场景
      if (VM.CONTROLS) {
        VM.CONTROLS.dispose() // 清除控制器
      }
      VM.scene = null;
      $("#main_model").find('.my_heatmap').remove();// 这里有清除一下渲染的canvas画布和云图内容
      $("#main_model").find('canvas').remove();//这里有清除一下渲染的canvas画布和云图内容
      VM.CAMERA = null;// 清除相机
      clearTimeout(VM.Timeinterval_3d);
      VM.Timeinterval_3d = null;
      VM.spotLight_list.forEach((light, index) => {// 循环清除灯光
        VM["spotLight" + index] = null
      });
      // 对当前一些用过的对象内容添加重置
      VM.spotLight = null;
      VM.shapeMess = null;
      VM.shapeMessFlag = 0;
      VM.meshData = [];
      VM.mesh = [];
      VM.mesh1 = [];
      VM.mesh2 = [];
      VM.mesh3 = {};
      VM.mesh4 = {};
      VM.sphereMesh = null;
      VM.latheMesh = null;
      VM.heatmap_Mesh = [];
      VM.heatmap_map = [];
      VM.heatmap_Mesh_three = [];
      VM.heatmap_map_three = [];
      VM.camera_dev_group = {};
      VM.all_passageway_data = {};
      VM.old_temp_camera_Obj = {};
      VM.temp_camera_list = [];
      VM.old_temp_camera_list = [];
      VM.cube = [];
      VM.cubeArry = [];
      VM.cubeArry_old = [];
      VM.vH = [];
      VM.Dataobj = [];
      VM.Nameobj = [];
      VM.NewNameobj = [];
      VM.Allmax_flag = [];
      VM.Allmax_over = [];
      VM.objGroup = null;
      VM.Loadover = 3;
      THREE.Cache.clear();
      VM.testTime('render_dispose_time')
    },
    render_setSize1() {
      const VM = this;
      const ww = $("#main_model").width();
      const dd = $("#main_model").height();
      if (VM.LCD === 1) {// 液晶屏上展示pc端代码--大屏展示:放大2倍，缩小0.5倍
        VM.canvasScal = 2;
      }
      VM.Dwidth = VM.canvasScal * ww;
      VM.Dheight = VM.canvasScal * dd;
      if (VM.CAMERA) {
        if (VM.CONTROLS) {
          VM.CONTROLS.reset();
        }
        VM.CAMERA.aspect = VM.Dwidth / VM.Dheight;// 视窗的宽高比
        VM.CAMERA.setFocalLength(VM.FocalLength);
        VM.CAMERA.updateProjectionMatrix();
      }
      if (VM.renderer) {
        VM.renderer.clear();// 清除场景
        VM.renderer.setSize(VM.Dwidth, VM.Dheight);
        VM.render_render('render_setSize1');
      }
      VM.isLoading = false;// 进度gif
    },
    // 旋转的防抖
    circleActionDebounce(flag, tag) {
      let VM = this;

      // 最后要执行的函数
      function change() {
        VM.circle_action(VM.curr_flag, VM.curr_tag)
      }

      if (!VM.funcAction) {
        VM.funcAction = VM.debounce(change, 200);// 开启防抖
      }
      VM.curr_flag = flag;
      VM.curr_tag = tag;
      VM.funcAction();// 执行一下200毫秒之前点击的事件
    },
    circle_action(flag, tag) {
      const VM = this;
      // if (VM.LCD === 0){
      // return
      // }
      if (!VM.isWebGl || VM.isRoateing) {
        return
      }
      VM.isRoateing = true;
      // VM.spotLight_list.forEach((light, index) => {
      // const spotLight = VM['spotLight' + index];
      // if (spotLight) {
      // /*灯光一起旋转导致重置的时候灯光映射的地方会出现问题*/
      // // VM.myCameraTween(spotLight,Math.PI*flag/16,1,0,tag,0);
      // }
      // });
      VM.myCameraTween(VM.CAMERA, Math.PI * flag / 8, 1, 200, tag, 1);
      VM.anaglePI = VM.anaglePI + flag;
      if (VM.anaglePI === 32 * flag) {
        VM.anaglePI = 0;
      }
    },
    onDocumentMove_clear() {// 清除上一个机柜名提示
      const VM = this;
      // if (!VM.nowItme.is3d){
      VM.devShow = false;
      // }
      // if(VM.old_Move!=null && !ifNullData(VM.cube[VM.old_Move])){
      // VM.cube[VM.old_Move].position.z=0;
      // VM.old_Move=null;
      // }
      // if(VM.shapeMess){
      // VM.shapeMess.material.map.dispose();
      // }
      // VM.scene.remove(VM.shapeMess);
    },
    onDocumentMove(event) {
      const VM = this;
      const Mouse = {};
      let INTERSECTED;// 三维射线
      if (!VM.scene) {
        return
      }
      const raycaster = new THREE.Raycaster();
      event.preventDefault();
      Mouse.x = (event.offsetX / VM.Dwidth) * 2 - 1;
      Mouse.y = -(event.offsetY / VM.Dheight) * 2 + 1;
      raycaster.setFromCamera(Mouse, VM.CAMERA); // 新建一条从相机的位置到vector向量的一道光线
      const intersects = raycaster.intersectObjects(VM.scene.children, true);
      // VM.shapeMessFlag=1;
      if (intersects.length > 0) {// 产生碰撞
        INTERSECTED = intersects[0].object// 获取碰撞对象
        let the_one
        // if (VM.viewFlag === 6) {// 温度柱图需要显示冷通道,会很卡
        // the_one = intersects.find((item, index) => {
        // return item.object.name.indexOf(VM.capacityTemp) >= 0
        // });
        // INTERSECTED = the_one ? the_one.object : null
        // }
        if (!INTERSECTED) {
          return
        }
        if (INTERSECTED.name.indexOf(VM.cabinetName_) >= 0) {//判断碰撞对象是否机柜
          const iNum = Number(INTERSECTED.name.split("_")[1]);
          if (iNum !== VM.old_Move) {//判断碰撞对象是否是上一次存储碰撞对象---避免重复渲染统
            const x = VM.LCD === 1 ? event.offsetX / 2 : event.offsetX;
            const y = VM.LCD === 1 ? event.offsetY / 2 : event.offsetY;
            VM.nowItme = {
              name: VM.cubeArry[iNum].name,
              x: x,
              y: y + 100
            };
            VM.devShow = !!(VM.cubeArry[iNum].name && VM.cubeArry[iNum].name !== "");
          } else {

            // VM.shapeMessFlag=0;// 不进行渲染
          }
        } else if (INTERSECTED.name.indexOf(VM.cabinetCapacity) >= 0) {//判断碰撞对象是否是容量管理底部的数值
          const iNum = Number(INTERSECTED.name.split("_")[1]);
          const cur_per = INTERSECTED.userData.per;
          if (iNum !== VM.old_Move) {//判断碰撞对象是否是上一次存储碰撞对象---避免重复渲染统
            VM.nowItme = {
              name: cur_per + "%",
              x: event.offsetX,
              y: event.offsetY + 100
            };
            VM.devShow = !!cur_per
          } else {

            // VM.shapeMessFlag=0;// 不进行渲染
          }
        } else if (INTERSECTED.name.indexOf(VM.capacityTemp) >= 0) {//判断碰撞对象是否是温度柱图底部的温度
          const iNum = Number(INTERSECTED.name.split("_")[1]);
          const cur_per = INTERSECTED.userData.per;
          if (iNum !== VM.old_Move) {//判断碰撞对象是否是上一次存储碰撞对象---避免重复渲染统
            VM.nowItme = {
              name: cur_per + "℃",
              x: event.offsetX,
              y: event.offsetY + 100
            };
            VM.devShow = !!cur_per
          } else {

            // VM.shapeMessFlag=0;// 不进行渲染
          }
        } else {
          VM.onDocumentMove_clear();// 清除上一个机柜名提示
        }
      } else {
        VM.onDocumentMove_clear();// 清除上一个机柜名提示
      }
      if (VM.shapeMessFlag === 1) {// 只渲染一次
        VM.shapeMessFlag = 0;
        VM.renderer.clear();// 清除场景
        VM.render_render('onDocumentMove');

      }
    },
    getTimeNow() {
      let now = new Date();
      return now.getTime();
    },
    onDocumentMouseDown(event) {
      this.mouseClickStartTime = this.getTimeNow()
    },
    onDocumentMouseup(event) {
      this.mouseClickEndTime = this.getTimeNow();
      this.mouseClickDuringTime = this.mouseClickEndTime - this.mouseClickStartTime;// 持续时间
      if (this.mouseClickDuringTime <= 500 && !this.isControlsChange) {// 小于500毫秒才识别为点击，并且不是在旋转的时候才可识别这个事件
        this.onDocumentMouseDownFun(event)
      }
    },
    onDocumentMouseDownFun(event) {
      const VM = this;
      VM.devShow = false;
      const Mouse = new THREE.Vector2();
      let INTERSECTED;// 三维射线
      let the_one;// 三维射线对应的对象
      event.preventDefault();
      const modelDom = $('#main_model');
      const offsetTop = modelDom.offset().top;
      const DomWPer = (modelDom.width() - 1000) / 1000;// 根据当前的dom宽度设置x轴的系数，以1280*800为标准
      const DomHeight = modelDom.height();
      let offsetX = event.offsetX || VM.getScreenClickPoint(event, 'pageX') - 8;
      let offsetY = event.offsetY || VM.getScreenClickPoint(event, 'pageY') - offsetTop;// 减去顶部的高度
      // 弹窗的显示位置
      let popOffsetX = event.offsetX || VM.getScreenClickPoint(event, 'pageX');
      let popOffsetY = event.offsetY ? event.offsetY + 100 : VM.getScreenClickPoint(event, 'pageY');

      if (VM.LCD === 1) {
        // LCD有对3D内容进行放大位置，所以对点击的位置要相应的放大，1.33 * 60 约等于80， 60为单列机柜的宽度，以1280*800为基准算该值
        offsetX = (VM.getScreenClickPoint(event, 'pageX') - ((DomWPer + 1.33) * 60)) * 2; // 位置偏移，根据上面的宽度系数乘单列机柜宽度算出位置
        offsetY = (VM.getScreenClickPoint(event, 'pageY') - offsetTop) * 2; // 减去顶部的高度
      }

      Mouse.x = (offsetX / VM.Dwidth) * 2 - 1;
      Mouse.y = -(offsetY / VM.Dheight) * 2 + 1;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(Mouse, VM.CAMERA); // 新建一条从相机的位置到vector向量的一道光线
      const intersects = raycaster.intersectObjects(VM.scene.children, true);// 拿到当前射线经过的内容

      if (intersects.length > 0) {
        INTERSECTED = intersects[0].object;// 把选中的对象放到全局变量SELECTED中
        the_one = intersects[0];
        if ((VM.isTempCloud || VM.viewFlag === 6) && INTERSECTED.name.indexOf(VM.cabinetChoseMenu) >= 0) {// 点击的是3D菜单

        } else {
          let theOneObj = VM.findClickTheOne(the_one, intersects, INTERSECTED);// 找到当前视图的第一个对象
          the_one = theOneObj.theOne;
          INTERSECTED = theOneObj.INTERSECTED
        }
        if (!INTERSECTED) {
          return
        }
        let NewArray;
        if (ifNullData(VM.cubeArry)) {
          NewArray = VM.cubeArry_old
        } else {
          NewArray = VM.cubeArry
        }
        clearInterval(VM.mainD_cabinet_timer);
        if (INTERSECTED.name.indexOf(VM.cabinet_) >= 0) {// 点击的是机柜，这里处理告警
          const i = Number(INTERSECTED.name.split("_")[1]);
          const typeObj = VM.typeObj[NewArray[i].type];
          VM.box_index = (i + 1);
          VM.cab_type = NewArray[i].type;
          VM.dev_index = NewArray[i].index;
          if (INTERSECTED.is_alarm) {// 自定义告警属性
            loadingPage(true);
            VM.showFlag = true// 机柜告警弹窗
          } else {
            if (typeObj && !VM.isTransparent) {// 机柜
              loadingPage(true);
              VM.getCabinetDevInfo(i, typeObj.dev);
              popWin("main_cabinet_message");
              VM.mainD_cabinet_timer = setInterval(() => {
                VM.getCabinetDevInfo(i, typeObj.dev)
              }, 5000)
            }
          }
        } else if (INTERSECTED.name.indexOf(VM.cabinetName_) >= 0) {//判断点击是不是名字

          const iNum = Number(INTERSECTED.name.split("_")[1]);
          VM.nowItme = {
            name: VM.cubeArry[iNum].name,
            x: popOffsetX,
            y: popOffsetY
          };
          VM.devShow = !!(VM.cubeArry[iNum].name && VM.cubeArry[iNum].name !== "");
        } else if (INTERSECTED.name.indexOf(VM.cameraDev_) >= 0) {//判断是不是点击了安防设备
          VM.pop_camera_dev = INTERSECTED.userData || {};
          if (!ifNullData(VM.pop_camera_dev)
            && VM.is_camera(VM.pop_camera_dev.dev_type)
            && VM.pop_camera_dev.is_alarm === 0
            && !VM.is_qt) {// 摄像头直接弹出
            VM.camera_dev_message_message()
          } else {
            popWin("camera_dev_message")
          }
        } else if (INTERSECTED.name.indexOf(VM.cabinetTemp_) >= 0) {// 判断是不是点击了温度云图
          if (the_one) {
            if (VM.fadeOutTimeOut) {// 定时器清除一下
              clearTimeout(VM.fadeOutTimeOut);
            }
            VM.main_ico_3d.stop();
            VM.devShow = false;
            VM.nowItme = {};

            const page = Number(INTERSECTED.name.split(VM.cabinetTemp_)[1]);// 当前点击的哪一面

            // console.log(page);
            const width = VM.objLength + (VM.cubeArry[VM.cubeArry.length - 1].width === 0 ? VM.objSingleWidth : 49); // 这里加的宽度要根据最后一个排机柜的宽度加
            let height = VM.objHeight + VM.objSmallHeight;
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
            const currHeatMap = VM.HeatMapInstance_Arr[page - 1];
            let clickPageWith = 0;// 所点击面的宽度
            let clickPageHeight = 0;// 所点击面的高度
            if (currHeatMap && page > 0) {
              let clickPoint = {};// 当前点击的点
              let max_value;// 当前点击显示最大值控制
              let min_value;// 当前点击显示最小值控制
              if (Math.abs(the_one.point.z) >= VM.objSingleLength) {// 表示点击的热通道
                max_value = VM.all_max_hot;
                min_value = VM.temp_default[VM.key_hot]
              } else {// 表示点击的冷通道
                max_value = VM.all_max_cold;
                min_value = VM.temp_default[VM.key_cold]
              }
              if (VM.heatmap_type === -1) {
                clickPoint = {
                  x: width / 2 + the_one.point.x,
                  y: height / 2 + the_one.point.z
                }
              } else {
                const showPoint = {};// 当前展示的点，展示出有温度值的点
                clickPoint.y = height - the_one.point.y;
                let index = -1;
                let position = VM.calc_show_point_y(clickPoint.y);
                if (page <= 4) {
                  clickPoint.x = the_one.point.x + width / 2;
                  index = VM.calc_show_point_x(clickPoint.x, page);
                  if (page === 1 || page === 4) {
                    max_value = VM.all_max_hot;
                    min_value = VM.temp_default[VM.key_hot]
                  } else if (page === 2 || page === 3) {
                    max_value = VM.all_max_cold;
                    min_value = VM.temp_default[VM.key_cold]
                  }
                  clickPageWith = VM.objLength;// 机柜的总长度
                  clickPageHeight = VM.objHeight// 机柜的总高度
                } else if (page === 5 || page === 7) {
                  clickPoint.x = VM.objAllCabinetWidth / 2 - the_one.point.z;
                  clickPageWith = VM.objSingleLength;// 单排机柜的宽度
                  clickPageHeight = VM.objHeight// 机柜的总高度
                } else if (page === 6 || page === 12) {
                  clickPoint.x = VM.objAllCabinetWidth / 2 + the_one.point.z;
                  if (page === 6) {
                    clickPoint.x = VM.objSingleLength - (VM.objAllCabinetWidth / 2 - the_one.point.z)
                  }
                  clickPoint.y = width / 2 + the_one.point.x;
                  position = VM.calc_show_point_y(clickPoint.y);
                  clickPageWith = VM.objSingleLength;// 单排机柜的宽度
                  clickPageHeight = VM.objLength// 机柜的总长度
                } else if (page === 11 || page === 13) {
                  clickPoint.x = VM.objSingleLength - (VM.objAllCabinetWidth / 2 + the_one.point.z);
                  clickPageWith = VM.objSingleLength;// 单排机柜的宽度
                  clickPageHeight = VM.objHeight// 机柜的总高度
                }
              }
              clickPoint.x = Number(clickPoint.x.toFixed(2));
              clickPoint.y = Number(clickPoint.y.toFixed(2));
              let currentData = currHeatMap.getData().data;// 拿到当前页所有的温度数据值
              currentData.sort((a, b) => {
                return b.value - a.value
              });
              let clickVal = currHeatMap.getValueAt(clickPoint) + VM.defaultDataMin - 2;// 这里加上一个默认最低温度
              if (currentData[0] && clickVal > currentData[0].value) {// 如果当前温度值超过了当前所有数据的最大温度值，那就用当前所有温度值中的最大
                clickVal = currentData[0].value
              }
              // 使用自己获取点击的值，heatmap的getValueAt方法实现，可以自己更改内部实现
              const img = currHeatMap._renderer.shadowCanvas.getContext('2d').getImageData(clickPoint.x, clickPoint.y, 1, 1);
              const newClickValue = (Math.abs(VM.defaultDataMax - VM.defaultDataMin) * (img.data[3] / 255) + VM.defaultDataMin) >> 0;
              VM.nowItme = {
                name: '当前温度：' + clickVal + "℃",
                x: popOffsetX,
                y: popOffsetY,
                is3d: true
              };
              VM.devShow = true;
              VM.fadeOutTimeOut = setTimeout(() => {
                VM.main_ico_3d.fadeOut(200, () => {
                  VM.devShow = false;
                  VM.nowItme = {};
                });
              }, 1500)
            }
          }
        } else if (INTERSECTED.name.indexOf(VM.cabinetChoseMenu) >= 0) {// 判断碰撞对象是否是3D的切换菜单
          VM.show_threeD_chose_menu(event)
        } else if (INTERSECTED.name.indexOf(VM.cabinetCapacity) >= 0) {//判断碰撞对象是否是容量管理底部的数值
          const iNum = Number(INTERSECTED.name.split("_")[1]);
          const cur_per = INTERSECTED.userData.per;
          if (iNum !== VM.old_Move) {//判断碰撞对象是否是上一次存储碰撞对象---避免重复渲染统
            VM.nowItme = {
              name: cur_per + "%",
              x: popOffsetX,
              y: popOffsetY
            };
            VM.devShow = !!cur_per
          } else {

            //VM.shapeMessFlag=0;//不进行渲染
          }
        } else if (INTERSECTED.name.indexOf(VM.capacityTemp) >= 0) {//判断碰撞对象是否是温度柱图底部的温度
          const iNum = Number(INTERSECTED.name.split("_")[1]);
          const cur_per = INTERSECTED.userData.per;
          if (iNum !== VM.old_Move) {//判断碰撞对象是否是上一次存储碰撞对象---避免重复渲染统
            VM.nowItme = {
              name: cur_per + "℃",
              x: popOffsetX,
              y: popOffsetY
            };
            VM.devShow = !!cur_per
          } else {

            //VM.shapeMessFlag=0;//不进行渲染
          }
        } else {
          // VM.onDocumentMove_clear();// 清除上一个机柜名提示
        }
      } else {
        if (INTERSECTED) {
          INTERSECTED.material.color.set(INTERSECTED.currentHex)
        }
        INTERSECTED = null
        // VM.onDocumentMove_clear();// 清除上一个机柜名提示
      }
    },
    /*
    * 计算是第几个机柜，
    * x：当前点击的x轴；
    * page：当前第几面
    * */
    calc_show_point_x(x, page) {
      const VM = this;
      let current_x = -1;// 找到当前选中的x是第几列机柜
      if (!!x) {
        return current_x
      }
      $.each(VM.cubeArry, (key, value) => {
        if (page <= 2 && key % 2 === 0) {// 第一第二面，只需要遍历单数
          return true
        } else if (page > 2 && key % 2 === 1) {// 第三第四面，只需要遍历双数
          return true
        }
        const cabinet_width = VM.calc_cabinet_width(value);
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
     *tag：左或右
     *type：是相机还是灯光
     * 相机视角所转的角度与机柜运动的方向相反，实际上机柜并没有动，只是相机视角在动。
     */
    myCameraTween(cameraObj, angle, segs, during, tag, type) {
      const VM = this;
      const x = cameraObj.position.x, y = cameraObj.position.y, z = cameraObj.position.z;
      let endPosArray = [];
      const perAngle = angle / segs;// 计算得到每次转的角度
      for (let i = 1; i <= segs; i++) {
        const endPos = {
          "x": z * Math.sin(i * perAngle) + x * Math.cos(i * perAngle),
          "y": y,
          "z": z * Math.cos(i * perAngle) - x * Math.sin(i * perAngle)
        };
        endPosArray.push(endPos);
      }
      if (tag === VM.tag_reset) {// 如果是重置
        endPosArray = [];
        endPosArray.push(VM.reset_position);
        segs = 1;// 重置只转一次
      }
      if (!VM.renderer) {
        return;
      }
      // VM.testInfo(endPosArray);
      cameraObj.position.set(endPosArray[0].x, endPosArray[0].y, endPosArray[0].z);
      VM.CAMERA.lookAt(new THREE.Vector3(VM.reset_camera.x, VM.reset_camera.y, VM.reset_camera.z));// VM.scene.position
      VM.isRoateing = false;
      VM.renderer.clear();// 清除场景
      VM.render_render('myCameraTween');
    },
    /************************************机柜详细信息弹窗*********************************/
    mainD_cabinet_Message() {// 获取机柜详细信息
      const VM = this;
      if (!VM.activatedBoo) {
        return
      }
      VM.$axios({
        method: 'post',
        timeout: 5000,
        data: {
          // "index":VM.dev_index
          "box_index": VM.box_index
        },
        url: "/home.cgi/get_cabinet_info"
      }).then((data) => {
        VM.cabinet_pop_title = data.box_name;
        VM.AveEnable = data.AveEnable;
        VM.main_cabinet_th(data.Tem_Humi);// 创建机柜详细信息--温湿度
        // VM.main_cabinet_pd(data.pd);// 创建机柜详细信息--配电柜
        loadingPage(false);
      });
    },
    getCabinetDevInfo(i, DTList) {// 获取机柜所绑定的设备信息
      const VM = this;
      if (!VM.activatedBoo) {
        return
      }
      let NewArray;
      if (ifNullData(VM.cubeArry)) {
        NewArray = VM.cubeArry_old
      } else {
        NewArray = VM.cubeArry
      }
      let dev_list = NewArray[i].dev_info || [];
      dev_list = dev_list.filter((item) => DTList.includes(item.dev_type));
      VM.$axios({
        method: 'post',
        timeout: 5000,
        data: {
          param: dev_list
        },
        url: "/home.cgi/get_dev_simple_info"
      }).then((data) => {
        loadingPage(false);
        if (!ifNullData(data)) {
          $.each(data, (kkl, data) => { //循环设备
            let New_mapDataDev = { //设备表格信息
              title: ['设备名称', '组别'],
              value: [],
              tips: []
            };
            $.each(data, (kk, vv) => { //单个设备内的多个组
              let values = [];
              let tips = [];// 用作title 显示
              values.push(vv.name_f);// 设备名字
              values.push(vv.group_name);// 组别名字
              tips.push(vv.name_f);// 提示
              tips.push(vv.group_name);// 提示
              $.each(vv.list, (key, val) => {
                let hh;
                let tip;
                if ($.isArray(val.values) && val.values.length >= 0) { // 例如：‘11/22/ N/A’
                  hh = '';
                  tip = '';
                  for (var i = 0; i < val.values.length; i++) {
                    val.values[i] = $.trim(val.values[i]);
                    if (val.values[i] === 'NA') { //数据N/A
                      val.values[i] = 'N/A';
                    }
                    if (i !== 0) {// 除了第一条，值都用分割线处理一下
                      hh += " / ";
                      tip += " / ";
                    }
                    hh += getTextColor(val.values[i], 0).html;// 一些带颜色的文字显示
                    tip += val.values[i];
                  }
                } else { // 例如：‘N/A’ ，‘正常’，‘异常’
                  hh = getTextColor(val.values[0], 0).html;// 一些带颜色的文字显示
                  tip = val.values[0];
                }
                if (kk === 0) {// 只需要第一次处理表头
                  New_mapDataDev.title.push(val.name);
                }
                values.push(hh);// 放到数组中
                tips.push(tip);// 放到提示中
              });
              const new_values = values.filter((item, index) => {// 去除一下空值
                if (!ifNullData(item)) {
                  return item
                } else {
                  New_mapDataDev.title.splice(index, 1);
                }
              });
              const new_tips = tips.filter((item, index) => {// 去除一下空值
                return !ifNullData(item)
              });
              New_mapDataDev.value.push(new_values);
              New_mapDataDev.tips.push(new_tips);
            });
            VM.$set(VM.popCabinetDevData, kkl, New_mapDataDev);
          });
        } else {
          VM.main_normal_close();// 关掉定时器
          save_popready(0, '暂无数据', () => {
          })
        }
      });
    },
    // 文字颜色
    // * 1正常，2异常，0 NA, -1 该数据无正常异常之说不标颜色
    air_state_rule(getData, fixNumber) {
      const VM = this;
      let arrayData = [0, 0], DataValue = getData[0];
      if (!ifNullData(getData)) {
        if (arguments.length === 3 && !ifNullData(DataValue)) {// 有传参数fix 且 不为空
          DataValue = Number(getData[0]).toFixed(fixNumber);// 精确值
        }
        if ($.isArray(getData)) {// 数据是数组形式
          arrayData = [DataValue, getData[1]]
        }
      } else {// 数据为空
        arrayData = [0, 0]
      }
      return getTextColor(arrayData[0], arrayData[1], fixNumber).html;
    },
    main_cabinet_th(returnData) {// 创建机柜详细信息--温湿度
      const VM = this;
      let cold_hot = {
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
    },
    main_cabinet_pd(returnData) {// 创建机柜详细信息--配电柜
      const VM = this;
      const pc_data = [];
      const pc_data_rule = (data) => {
        let newArr = '';
        if (!ifNullData(data)) {
          newArr = VM.air_state_rule($('<span></span>'), data['a'], 2);
          if (!ifNullData(data['b'])) {// 三相
            newArr += '/' + VM.air_state_rule($('<span></span>'), data['b'], 2);
            newArr += '/' + VM.air_state_rule($('<span></span>'), data['c'], 2);
          }
        } else {
          newArr = VM.air_state_rule($('<span></span>'), [0, 0], 2);
        }
        return newArr;
      };
      if (!ifNullData(returnData)) {
        $.each(returnData, (key, value) => {
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
    goto_login() {
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
      const comHeader = findBrothersComponents(this.$parent, "headerTop");
      if (!ifNullData(comHeader)) {
        comHeader[0].return_login_page();
      }
      // $Cookie.delCookie('CGISID');//清楚cookie
      // VM.$store.commit('setLoginSate',false);
      // this.$router.options.routes[2].children = [];//清空一下之前的路由
      // this.$router.push({path: '/login'});
    },
    changeViewFun(flag, type) {
      const VM = this;
      if (VM.isLoading) {// 正在渲染
        return
      }
      // clearTimeout(VM.lockTimeout);
      // VM.MyisRender = true;
      // VM.lockTimeout = setTimeout(()=>{
      // VM.MyisRender = false;
      // },3000);
      VM.all_passageway_data = {};// 切换视图的时候要重置一下旧数据
      VM.old_temp_camera_Obj = {};// 切换视图的时候要重置一下旧数据
      VM.temp_camera_list = [];// 切换视图的时候要重置一下
      VM.old_temp_camera_list = [];// 切换视图的时候要重置一下旧数据
      VM.has_door = false;// 重置一下是否加载了门
      VM.devShow = false;
      VM.current_flag = 0;
      VM.hasLoadOtherView = false;
      if (flag === 2) {
        VM.heatmap_type = 0;
        VM.heatmap_view = -1;
        if (VM.current_capacity_type === type) {// 容量云图切换的时候点了当前类型
          return
        } else {
          VM.isLoading = true;
          VM.current_capacity_type = type
        }
        if (VM.viewFlag === 2) {// 容量云图之间的切换
          // 这里做超时有两个原因，1、超时用于等待页面渲染完成之后再做一次动画 2、超时为了显示等待提示，与其他视图一致
          setTimeout(() => {
            VM.animation('changeView');
            VM.isLoading = false;
          }, 100);
          // VM.$nextTick(() => {
          //   VM.animation('changeView');
          // });
          return
        } else {// 切换到容量云图
          VM.threeD_rerender(flag);
          return
        }
      }
      VM.current_capacity_type = this.is_show_u ? 0 : 1;// 重置一下，防止第一次点击不生效
      if (VM.viewFlag === flag) {
        return
      }
      this.threeD_chose_menu.map(item => {// 重置一下
        item.showChildren = false
      });
      VM.heatmap_type = 0;
      VM.cap_temp_type = -1;
      VM.heatmap_view = -1;
      VM.heatmap_view1 = -1;
      VM.heatmap_view2 = -1;
      VM.cap_temp_view = -1;
      VM.threeD_rerender(flag) // 最后调起重新渲染的函数，重新开始加载之前已经预加载的模型进行不同的视图渲染
    },
    threeD_rerender(flag) {
      const VM = this;
      VM.viewFlag = flag;
      VM.isTransparent = flag !== 4;
      VM.main_normal_close();
      VM.render_dispose();// 清除缓存
      clearInterval(this.mainThreeI);
      // VM.$nextTick(() => {
      VM.ThreeDinterval();// 设置定时器，实时刷新数据
      // });
    },
    clearFun() {
      const VM = this;
      this.main_normal_close();
      clearInterval(this.mainThreeI);
      clearTimeout(this.Timeinterval_3d);
      clearInterval(this.heatmap_four_mesh_Timer);
      VM.webglcontextlost();
      VM.webglcontextrestored(0);
      // VM.clearMesh(VM.scene)
      // VM.clearMesh(VM.objGroup)
      // VM.clearMesh(VM.cubeArry)
      VM.render_dispose();
      // VM.clearRenderer();
      VM.clearMtl(VM.jg_02);
      VM.clearMtl(VM.men_01);
      VM.clearMtl(VM.men_02);
      VM.clearMtl(VM.jg_03);
      VM.clearMtl(VM.af_smoke);
      VM.clearMtl(VM.af_sp_qiang);
      VM.clearMtl(VM.af_sp_qiu);
      VM.loadJPG.forEach((MTL, index) => {
        VM[MTL.data_name] = null
      });
      VM.scene = null;
      VM.objGroup = null;
      this.mainThreeI = null;
      this.Timeinterval_3d = null;
      // window.removeEventListener( 'click', VM.dev_click_fun(), false );
      window.removeEventListener("resize", VM.onWindowResize, false)
    },
    // 清除mesh
    clearMesh(obj) {
      var VM = this;
      if (obj) {
        if (Array.isArray(obj)) {// 传入的若是数组
          for (var i = obj.length - 1; i >= 0; i--) {
            if (obj[i]) {
              // VM.clearCache(obj[i].mesh || obj[i]);
              VM.mineDispose(VM.scene, obj[i]);
            }
          }
        } else {// 传入的是对象
          // VM.clearCache(obj);
          VM.mineDispose(VM.scene, obj)
        }
      }
    },

    /*
    * 创建四个温度云图mesh
    * */
    init_heatmap_four_mesh(boo) {
      const VM = this;
      // console.time('heatmap_four');
      VM.hasLoadOtherView = boo;
      if (VM.isTransparent && VM.isTempCloud) {// 云图视图
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
        // const m = 2;
        for (let m = 1; m <= 13; m++) {
          const cubeArrL = VM.cubeArry.length;
          let width = VM.objLength + VM.objSingleWidth; // + VM.half_ll // 这里删除了半个门的宽度，因为没加门
          // const width = VM.objLength + (VM.cubeArry[cubeArrL -1 ].width === 0 ? VM.objSingleWidth : 49); // 这里加的宽度要根据最后一个排机柜的宽度加
          let height = VM.objHeight + VM.objSmallHeight;
          let data_arr = [];// 位置与数据对象数组
          let data_max = 0;// 一组数据的最大值
          let opacity = 0.9;
          if (ifNullData(VM.all_passageway_data[m])) {// 创建一下旧数据对象
            VM.all_passageway_data[m] = {};
          }
          if (m <= 4) {
            let is_the_same = true;// 是否和旧数据一样,默认需要渲染
            const n_arr = [];// 有数据的下标数组
            for (let n = 0; n < cubeArrL; n++) {
              let passageway_data = [];//
              if ((m === 1 && n % 2 === 1) || (m === 4 && n % 2 === 0)) {// 位置1: 单数,热通道 // 位置4: 双数,热通道
                passageway_data = VM.set_temp_data_type(VM.cubeArry[n].hot_passageway, VM.key_hot);
              } else if ((m === 2 && n % 2 === 1) || (m === 3 && n % 2 === 0)) {// 位置2: 单数,冷通道 // 位置3: 双数,冷通道
                passageway_data = VM.set_temp_data_type(VM.cubeArry[n].cold_passageway, VM.key_cold);
              }
              if (!ifNullData(passageway_data)) {
                n_arr.push(n);
                if (!isEqual(VM.all_passageway_data[m][n], passageway_data)) {// 判断新旧数据是否一致，如果一致，当前面就不再重新画过
                  // if (!VM.Is_the_same_with_old_data(m, n, passageway_data)){
                  is_the_same = false;
                }
                VM.all_passageway_data[m][n] = passageway_data;// 这里保存一下旧数据，用来判断新旧数据变化
                for (let k = 0; k < passageway_data.length; k++) {
                  const all_data = VM.cal_heatmap_data_position(width, height, cubeArrL, passageway_data[k], n, k, n_arr.indexOf(n));
                  // data_position.value = passageway_data[k].temp;
                  data_max = Math.max(data_max, all_data.max);// 找到当前数据中最大的值
                  data_arr = [...data_arr, ...all_data.position_arr];
                  if (m === 2 && k === 1) {
                    VM.demo_point = {x: data_arr[0].x + data_arr[1].x, y: data_arr[0].y + data_arr[1].y}
                  }
                }

              }
            }
            if (is_the_same) {// 如果和旧数据一样，那就别渲染了
              continue
            }
          } else {// 第四面之后的内容宽高都不一样需要重新设置
            opacity = 0.95;
            width = VM.objSingleLength;
            height = VM.objHeight + VM.objSmallHeight;
            if (m === 6 || m === 9 || m === 12) {
              // continue
              height = VM.objLength + VM.objSingleWidth;// + VM.half_ll // 这里删除了半个门的宽度，因为没加门
            }
          }
          if (m === 8 || m === 9 || m === 10) {// 中间通道
            continue
          }
          // if (m === 5 || m === 7 || m === 11 || m === 13){// 前门后门
          // continue
          // }
          // if ( m === 6 || m === 12){// 顶部内容
          // continue
          // }
          let new_passageway_data = [];
          if (m === 5) {// 位置5，温度数据使用机柜数据中第二条数据的热通道数据与冷通道数据

            new_passageway_data = [...VM.set_temp_data_type(VM.cubeArry[1].hot_passageway, VM.key_hot),
              ...VM.set_temp_data_type(VM.cubeArry[1].cold_passageway, VM.key_cold)];

            // new_passageway_data = VM.cal_heatmap_ave_position(VM.cubeArry[1].hot_passageway, VM.cubeArry[1].cold_passageway);
          } else if (m === 6) {
            // 位置6，温度数据使用机柜下标为单数冷热通道位置都为1的数据，调用cal_heatmap_ave_position当前方法只是为了加上不用的position，
            // 当前position并不是，上、上中、中、中下、下位置的position，只是用来计算横线位置 _(:з」∠)_

            const new_all_hot1 = VM.cal_heatmap_one_position(VM.cal_heatmap_one_way_data(1, VM.key_way_hot), 1);
            const new_all_cold1 = VM.cal_heatmap_one_position(VM.cal_heatmap_one_way_data(1, VM.key_way_cold), 1);

            new_passageway_data = [...VM.set_temp_data_type(VM.cal_heatmap_ave_position(new_all_hot1, new_all_hot1, true), VM.key_hot),
              ...VM.set_temp_data_type(VM.cal_heatmap_ave_position(new_all_cold1, new_all_cold1, true), VM.key_cold)];

            // new_passageway_data = VM.cal_heatmap_ave_position(new_all_hot1, new_all_hot1, true);
          } else if (m === 7) {// 位置7,，温度数据使用机柜数据中最后一条数据的热通道数据与冷通道数据

            new_passageway_data = [...VM.set_temp_data_type(VM.cubeArry[cubeArrL - 1].hot_passageway, VM.key_hot),
              ...VM.set_temp_data_type(VM.cubeArry[cubeArrL - 1].cold_passageway, VM.key_cold)];

            // new_passageway_data = VM.cal_heatmap_ave_position(VM.cubeArry[cubeArrL - 1].hot_passageway, VM.cubeArry[cubeArrL - 1].cold_passageway);
          } else if (m === 8) {// 位置8 // 暂时不需要

            // 奇数排冷通道当做热通道位置处理 偶数排冷通道当做冷通道位置处理
            new_passageway_data = [...VM.set_temp_data_type(VM.cubeArry[0].cold_passageway, VM.key_cold),
              ...VM.set_temp_data_type(VM.cubeArry[1].cold_passageway, VM.key_hot)];

            // new_passageway_data = VM.cal_heatmap_ave_position(VM.cubeArry[0].cold_passageway, VM.cubeArry[1].cold_passageway);
          } else if (m === 9) {// 位置9 // 暂时不需要

            const new_all_hot2 = VM.cal_heatmap_one_position(VM.cal_heatmap_one_way_data(1, VM.key_way_cold), 1);// 奇数排冷通道
            const new_all_cold2 = VM.cal_heatmap_one_position(VM.cal_heatmap_one_way_data(0, VM.key_way_cold), 1);// 偶数排冷通道

            // 奇数排冷通道当做热通道位置处理 偶数排冷通道当做冷通道位置处理
            new_passageway_data = [...VM.set_temp_data_type(VM.cal_heatmap_ave_position(new_all_hot2, new_all_hot2, true), VM.key_hot),
              ...VM.set_temp_data_type(VM.cal_heatmap_ave_position(new_all_cold2, new_all_cold2, true), VM.key_cold)];

            // new_passageway_data = VM.cal_heatmap_ave_position(new_all_hot2, new_all_hot2, true);
          } else if (m === 10) {// 位置10  // 暂时不需要

            // 奇数排冷通道当做热通道位置处理 偶数排冷通道当做冷通道位置处理
            new_passageway_data = [...VM.set_temp_data_type(VM.cubeArry[cubeArrL - 1].cold_passageway, VM.key_hot),
              ...VM.set_temp_data_type(VM.cubeArry[cubeArrL - 2].cold_passageway, VM.key_cold)];

            // new_passageway_data = VM.cal_heatmap_ave_position(VM.cubeArry[cubeArrL - 1].cold_passageway, VM.cubeArry[cubeArrL - 2].cold_passageway);
          } else if (m === 11) {// 位置11 温度数据使用机柜数据中第一条数据的热通道数据与冷通道数据

            new_passageway_data = [...VM.set_temp_data_type(VM.cubeArry[0].hot_passageway, VM.key_hot),
              ...VM.set_temp_data_type(VM.cubeArry[0].cold_passageway, VM.key_cold)];

            // new_passageway_data = [...VM.cubeArry[0].hot_passageway,...VM.cubeArry[0].cold_passageway];
            // new_passageway_data = VM.cal_heatmap_ave_position(VM.cubeArry[0].hot_passageway, VM.cubeArry[0].cold_passageway);
          } else if (m === 12) {
            // 位置12 温度数据使用机柜下标为双数冷热通道位置都为1的数据，调用cal_heatmap_ave_position当前方法只是为了加上不用的position，
            // 当前position并不是，上、上中、中、中下、下位置的position，只是用来计算横线位置 _(:з」∠)_

            const new_all_hot3 = VM.cal_heatmap_one_position(VM.cal_heatmap_one_way_data(0, VM.key_way_hot), 1);
            const new_all_cold3 = VM.cal_heatmap_one_position(VM.cal_heatmap_one_way_data(0, VM.key_way_cold), 1);

            new_passageway_data = [...VM.set_temp_data_type(VM.cal_heatmap_ave_position(new_all_hot3, new_all_hot3, true), VM.key_hot),
              ...VM.set_temp_data_type(VM.cal_heatmap_ave_position(new_all_cold3, new_all_cold3, true), VM.key_cold)];

            // new_passageway_data = VM.cal_heatmap_ave_position(new_all_hot3, new_all_hot3, true);
            // new_passageway_data = [...new_all_hot3,...new_all_cold3];
          } else if (m === 13) {// 位置13 温度数据使用机柜数据中倒数第二条数据的热通道数据与冷通道数据

            new_passageway_data = [...VM.set_temp_data_type(VM.cubeArry[cubeArrL - 2].hot_passageway, VM.key_hot),
              ...VM.set_temp_data_type(VM.cubeArry[cubeArrL - 2].cold_passageway, VM.key_cold)];

            // new_passageway_data = [...VM.cubeArry[cubeArrL - 2].hot_passageway,...VM.cubeArry[cubeArrL - 2].cold_passageway];
            // new_passageway_data = VM.cal_heatmap_ave_position(VM.cubeArry[cubeArrL - 2].hot_passageway, VM.cubeArry[cubeArrL - 2].cold_passageway);

          }
          if (m > 4) {
            if (isEqual(VM.all_passageway_data[m], new_passageway_data)) {// 判断新旧数据是否一致，如果一致，当前面就不再重新画过
              // if (VM.Is_the_same_with_old_data(m,null,new_passageway_data)){
              continue
            }
            VM.all_passageway_data[m] = new_passageway_data;// 这里保存一下旧数据，用来判断新旧数据变化
          }
          // console.log(m + ':' + JSON.stringify(new_passageway_data));
          if (!ifNullData(new_passageway_data)) {
            for (let k = 0; k < new_passageway_data.length; k++) {
              const all_data1 = VM.cal_heatmap_nine_data_position(width, height, new_passageway_data[k], new_passageway_data.length, m, k);
              // data_position.value = new_passageway_data[k].temp;
              data_max = Math.max(data_max, all_data1.max);// 找到当前数据中最大的值
              data_arr = [...data_arr, ...all_data1.position_arr];
            }
          }
          VM.filter_repeat_point(data_arr);// 过滤掉一些点过近的数据
          // console.time('heatmap_four1');
          const heatmapBase64 = VM.init_heatmap(width, height, data_arr, data_max, m);// 拿到base64的图片资源
          // console.timeEnd('heatmap_four1');
          VM.heatmap_map[m - 1] = VM.init_heatmap_canvas(width, height, heatmapBase64);
          if (VM.heatmap_Mesh.length < 13) {// 说明是第一次加载
            VM.init_heatmap_mesh(width, height, VM.heatmap_map[m - 1], m, opacity);
            // } else if(!VM.hasLoadOtherView){
          } else {
            //注意这里减一是因为之前的设定就是m是从1开始的，方便位置计算
            VM.heatmap_Mesh[m - 1].material.map.dispose();
            setTimeout(() => {
              VM.heatmap_Mesh[m - 1].material.map = VM.heatmap_map[m - 1];
              // VM.render_render('heatmap_four');//注意，这里是云图刷新数据后不更新的主要问题，主动render一次
            }, 0)
          }
        }
        VM.render_render('heatmap_four');//注意，这里是云图刷新数据后不更新的主要问题，主动render一次
      }
      // console.timeEnd('heatmap_four');
    },
    // 创建heatmap对象，传入参数：
    // * width：指定宽
    // * height：指定高
    // * heatmap：通过init_heatmap_canvas 生成的 CanvasTexture对象
    // * m：第几面
    // * opacity：可指定当前的透明度
    init_heatmap_mesh(width, height, heatmap, m, opacity) {
      const VM = this;
      $('.my_heatmap').remove();// 删掉创建的dom
      const material = new THREE.MeshBasicMaterial({// 基本材质
        map: heatmap,// 热力图贴图
        side: THREE.DoubleSide,
        // side:THREE.FrontSide,
        transparent: true,// 是否使用透明度
        fog: false,
        opacity: opacity
      });
      const geometry = new THREE.PlaneGeometry(width, height);// 创建一个平板几何体
      const heatmap_mesh = new THREE.Mesh(geometry, material);
      if (m >= 5) {// 位置5以后的旋转
        VM.cal_heatmap_nine_position(heatmap_mesh, m);
      }
      const position = VM.cal_heatmap_position(m);
      heatmap_mesh.name = VM.cabinetTemp_ + m;// 设定特定面的名字，用来做温度云图的点击，m：可用于区分当前所点击位置是第几面
      heatmap_mesh.position.set(position.x, position.y, position.z);// 设置一下当前的位置
      heatmap_mesh.material.needsUpdate = true;// 材质可以更新
      heatmap_mesh.geometry.colorsNeedUpdate = true;// 使颜色可以更新
      // heatmap_mesh.renderOrder = 1;
      // heatmap_mesh.material.depthTest = false;
      // heatmap_mesh.material.depthWrite = false;
      VM.heatmap_Mesh[m - 1] = heatmap_mesh;// 注意这里减一是因为之前的设定就是m是从1开始的，方便位置计算
      VM.scene.add(heatmap_mesh);
    },
    // 通过heatmap生成得到的Base64图片资源，传入参数：
    // * width：指定宽度
    // * height：指定高度
    // * heatmapBase64：当前的Base64资源
    init_heatmap_canvas(width, height, heatmapBase64) {
      const heatmapImg = new Image();
      heatmapImg.src = heatmapBase64;
      heatmapImg.width = width;
      heatmapImg.height = height;
      return new THREE.CanvasTexture(heatmapImg) // 返回一个CanvasTexture
    },
    // 创建heatmap的方法，传入参数：
    // * width: 指定宽，
    // * height：指定高
    // * points: 当前面带位置信息的数据点
    // * data_max: 当前数据中最大值，
    // * m：当前面是第几面
    // * radius：可指定当前点的渲染半径
    init_heatmap(width, height, points, data_max, m, radius) {
      const VM = this;
      // console.log(JSON.stringify(points));
      let new_data_max = VM.defaultDataMax;// 默认最大值
      let new_defaultRadius = VM.defaultRadius;// 默认渲染半径
      let per = new_data_max / new_defaultRadius;// 圈大小的系数
      if (data_max > VM.defaultDataMax) {
        // new_defaultRadius = data_max / per;
        new_data_max = data_max
      }
      if (m > 4) {
        // return VM.init_heatmap_mine(width, height, points, data_max, m);
      }
      if (m === 6 || m === 12) {// 中间两个渲染大小大一点
        new_defaultRadius = 90
      }
      const heatmap_dom = document.createElement("div");// 创建一个dom节点来渲染热力图
      // heatmap_dom.id = 'heatmap';
      heatmap_dom.setAttribute("class", "my_heatmap");
      // 这里图片大小设置要和canvas一致，这边宽度需要加一个机柜，还不找到为什么
      $(heatmap_dom).css({width: width || "600px", height: height, display: "none"});
      $("#main_model").append(heatmap_dom);
      const HeatMapInstance = Heatmap.create({
        container: heatmap_dom,
        backgroundColor: 0xffff0a,// 背景颜色
        // backgroundColor: '#ffffff',// 背景颜色
        radius: radius || new_defaultRadius,// 每个数据点的半径,
        // radius: (m > 4 ? 10 : 16),// 每个数据点的半径,
        // maxOpacity: 1,// 最大不透明度，如果设置了不透明度，就会给覆盖
        // minOpacity: 0,// 最小不透明度，如果设置了不透明度，就会给覆盖
        blur: 0.99,// 模糊因子，越高，渐变就越平滑，缺省0.85
        // opacity: 0.8,
        useGradientOpacity: true,// 热力图渲染是否使用gradient渐变色的透明度
        gradient: VM.deal_heatmap_color_data(m)// 渐变对象，你的最大值是37，那么每个value就要除以37,然后得到的值为颜色系数
      });
      /*假数据*/
      const pointss = [];
      let max = 0;
      const dataLimit = 1000;
      let flag = 0;
      for (let i = 0; i < dataLimit; i++) {
        if (i >= dataLimit / 2) {
          flag = 30
        }
        const val = Math.floor(Math.random() * flag);
        max = Math.max(max, val);
        const point = {
          x: Math.floor(Math.random() * width),
          y: Math.floor(Math.random() * height),
          value: val
        };
        pointss.push(point);
      }
      const data = {
        min: VM.defaultDataMin,// 最小值默认设为0
        max: new_data_max,// 最大值默认设为37
        data: points,
        // data: [...points,...pointss],
      };
      HeatMapInstance.setData(data);// 从热图实例中删除所有先前存在的点，然后重新初始化数据存储。
      VM.HeatMapInstance_Arr[m - 1] = HeatMapInstance.repaint();// 重绘
      setTimeout(() => {
        $('.my_heatmap').remove();
      }, 1000);
      return HeatMapInstance.getDataURL();// 返回的值是热图实例的base64编码的dataURL。
    },
    /*
    * 自定义处理渐变
    * */
    init_heatmap_mine(width, height, points, data_max, m) {
      const VM = this;
      let canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      let context = canvas.getContext("2d");
      let offset1 = 1;
      let offset2 = 0;
      if (m === 6 || m === 11 || m === 13) {
        offset1 = 0;
        offset2 = 1;
      }
      const Gradient = context.createLinearGradient(0, 0, width, 0);
      Gradient.addColorStop(offset1, '#14dcff');
      Gradient.addColorStop(offset2, '#96ff14');
      context.fillStyle = Gradient;
      context.fillRect(0, 0, width, height);
      // 这里做超时回收是因为如果直接回收会出现无法加载得到内容的情况
      setTimeout(() => {
        // 回收
        if (document.getElementById("CanvasHide")) {
          document.getElementById("CanvasHide").appendChild(canvas);/*放入垃圾桶*/
          document.getElementById("CanvasHide").innerHTML = '';// 将a从页面上删除 /*清除垃圾桶*/
        }
        canvas = null;
        context = null;
      }, 1000);
      return canvas.toDataURL()
    },
    /*
    * 处理温度值与颜色对应的方法
    * */
    deal_heatmap_color_data(m) {
      const VM = this;
      const gradient = {};
      let subIndex = 0;
      if (m === 1 || m === 4) {
        subIndex = 1;
      }
      VM.heatmap_data_list.forEach((coe, index) => {
        // if (index === 0 || index === 1){
        // return
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
    deal_color_list() {
      // if (this.viewFlag !== 2) {
      //   return
      // }
      // 这里显示需要剔除一个为0的底色值
      const new_color_list = this.color_list.filter((color, index) => {
        // return index !== 0 && index !== 1
        return color
      });
      $('#color_temp').css('background-image', 'linear-gradient(to right,' + new_color_list.join(',') + ')');
      this.calc_color_position('temp_16', 17);
      this.calc_color_position('temp_22', 23);
      this.calc_color_position('temp_28', 29);
      this.calc_color_position('temp_34', 36);
    },
    calc_color_position(Idn, temp) {
      const dom = $('#' + Idn);
      dom.css('left', `${((temp - 16) / (37 - 16)) * $('#color_temp').width() - dom.width() / 2}px`);
    },
    deal_cap_color_list() {
      const VM = this;
      // if (VM.viewFlag !== 1) {
      //   return
      // }
      const key_arr = [];
      const new_color_list = VM.capacity_color_list.map((color, index) => {
        // return index !== 0 && index !== 1
        key_arr.push(color.key);
        return color.color
      });
      // $('#color_cap').css('background-image', 'linear-gradient(to right,' + new_color_list.join(',') + ')');
      for (let i = 0; i < key_arr.length; i++) {
        let value = key_arr[i];
        if (value !== 0) {
          value -= 10
        }
        const id = 'cap_' + value;
        let span_html = `<span id="${id}">${value}</span>`;
        if (i === key_arr.length - 1) {
          span_html = `<span id="${id}">${value}</span><span id="cap_100">100</span>`
        }
        $('#color_cap').append(`<div id="${id} + '_div'" style="background: ${new_color_list[i]}" class="cap_color_div">${span_html}</div>`)
        // $('#cap_num').append(`<span id="${id}">${value}</span>`)
        // VM.calc_cap_color_position(id, value);
      }
    },
    calc_cap_color_position(Idn, val) {
      const dom = $('#' + Idn);
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
    new_calc_capacity_position(per) {
      return -(this.objCabinetHeight + this.objCabinetBottomHeight) / 100 * (100 - Math.abs(per)) - this.objCabinetBottomHeight - 5;
    },
    //处理容量云图模式，
    deal_capacity_type(i) {
      const current_key = this.get_current_capacity_key();// 获取当前选中的是哪个视图
      let current_per = this.cubeArry[i][current_key];// 获取当前的值
      // const old_current_per = this.cubeArry[i]['old_' + current_key];
      // if (current_per == old_current_per){// 如果值不变而且已经设置过一次了，那不需要重新渲染
      // if (this['has_old_' + current_key]) {
      // return
      // }
      // }
      // this['has_old_' + current_key] = true;
      // this.clearCache(this.cubeArry[i].mesh);// 清除一下之前
      this.mineDispose(this.scene, this.cubeArry[i].mesh);// 清除一下之前柱图
      this.cubeArry[i]['old_' + current_key] = current_per;
      this.mesh2[i].userData = {per: current_per};// 记录一下当前的温度值
      this.mesh2[i].material.map = this.initCabinetPercent(current_per, this.calc_cabinet_width(this.cubeArry[i]), 0, i);// 设备容量数值
      current_per = this.check_value(current_per);// 处理一下计算值的大小，主要是空值和超过100的数，这样柱图高度的计算才不会有问题
      this.creat_capacity_Mesh(this.new_calc_capacity_position1(current_per), i);// 创建立体模型
      // this.cube[i].position.setY(this.new_calc_capacity_position(current_per));// 容量云图实现依据，将机柜的Y轴进行偏移达到效果
    },
    /*
    * 处理容量云图颜色，找接近的颜色值，以差值10为分界
    * capacity_color_list
    * */
    deal_capacity_color(i, value, defaultColor) {
      const VM = this
      let color = defaultColor || VM.capacity_color_list[0]
      let flag = false
      const current_per = ifNullData(i) ? value : VM.cubeArry[i][VM.get_current_capacity_key(i)]
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
    get_current_capacity_key(i) {
      const VM = this;
      let new_key = "pdc_rate";
      $.each(VM.capacity_type_list, (index, value) => {
        if (VM.current_capacity_type === value.index) {
          new_key = value.key
        }
      });
      return new_key
    },
    /*
    * 创建容量云图的模型
    *
    * */
    creat_capacity_Mesh(height, i) {
      const VM = this;
      if (height === 0) {// 如果是0 就不画了，再去清理一下之前创建过的
        if (VM.cubeArry[i].mesh) {
          VM.mineDispose(VM.scene, VM.cubeArry[i].mesh);
        }
        return
      }
      // VM.clearCache(VM.cubeArry[i].mesh)
      const x = VM.cubeArry[i].x;
      let z = VM.objSingleLength;
      const singleWidth = VM.calc_cabinet_width(VM.cubeArry[i]);
      const cur_capacity = VM.capacity_type_list.find(item => item.index === VM.current_capacity_type);
      let color = cur_capacity ? cur_capacity.colors[0] : "#4cbcff";// 柱体颜色
      if (i % 2 === 0) {// 偶数，后面一排
        z = -z;
        color = cur_capacity ? cur_capacity.colors[1] : "#3cebff"
      }
      const geometry = new THREE.BoxGeometry(singleWidth - 4, height, VM.objSingleLength - 10);// 盒子模型 减 4是因为有间隙 4
      const material = new THREE.MeshPhysicalMaterial({
        // color:VM.deal_capacity_color(i),
        color: color,
        emissive: "#000000",// 底色
        roughness: 0.4,// 光滑程度
        metalness: 0.1,// 金属性贴图亮度
        reflectivity: 0.68,// 发亮点大小
        transparent: false,
        opacity: 0.85
      });// 材料
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = x - VM.MmovL - 2;// 这里减去自己的2分之一参考initObject中的位置设置 搜关键字  VM.cubeArry[iNum].x - movL  MmovL是个累加值
      mesh.position.y = height / 2 + this.objCabinetBottomHeight;
      mesh.position.z = z;
      // mesh.renderOrder = 1000;
      // mesh.material.depthTest = false;
      VM.cubeArry[i].mesh = mesh;
      VM.scene.add(mesh)
    },
    /**
     *  温度柱图
     */
    deal_capacity_temp_column(i, key) {
      let temp_hot = this.cubeArry[i][key]
      // const old_temp_hot = this.cubeArry_old[i][key]// 旧值
      // if (temp_hot === old_temp_hot){
      // return
      // }
      this.mesh3[i + key].material.map = this.initCabinetPercent(temp_hot, this.calc_cabinet_width(this.cubeArry[i]))// 设备容量数值
      temp_hot = this.check_value(temp_hot)
      this.creat_capacity_temp_Mesh(this.new_calc_capacity_position1(temp_hot), i, temp_hot, key)// 创建立体模型
    },
    /*
    * 创建温度柱图的模型
    * 根据位置计算偏移量，
    *
    * */
    creat_capacity_temp_Mesh(height, i, value, key) {
      const VM = this;
      if (height === 0 && VM.mesh4[i + key + "_mesh"]) {// 如果是0 就不画了，再去清理一下之前创建过的
        VM.mineDispose(VM.scene, VM.mesh4[i + key + "_mesh"]);
        // VM.clearCache(VM.mesh4[i + key + "_mesh"])
        return
      }
      let visible;// 这里处理显示是因为若是选了某个通道情况下，机柜数值发生变化，会全部显示出来
      if (VM.cap_temp_type < 0) {// 显示全部
        visible = true
      } else {
        // if (VM.cap_temp_type === 0){// 显示前排
        // visible = i % 2 === 1
        // if (VM.cap_temp_view > 0 ){// 选了某个通道
        // if (key === 'temp_hot'){// 热通道
        // visible = i % 2 === 1 && VM.cap_temp_view === 1
        // }else{
        // visible = i % 2 === 1 && VM.cap_temp_view === 0
        // }
        // }
        // }else{// 显示后排
        // visible = i % 2 === 0
        // if (VM.cap_temp_view > 0 ){// 选了某个通道
        // if (key === 'temp_hot'){// 热通道
        // visible = i % 2 === 0 && VM.cap_temp_view === 1
        // }else{
        // visible = i % 2 === 0 && VM.cap_temp_view === 0
        // }
        // }
        // }
        if (VM.cap_temp_type === 0) {// 热通道1
          visible = i % 2 === 1 && key === "temp_hot"
        } else if (VM.cap_temp_type === 1) {// 冷通道1
          visible = i % 2 === 1 && key === "temp_cold"
        } else if (VM.cap_temp_type === 2) {// 热通道2
          visible = i % 2 === 0 && key === "temp_hot"
        } else if (VM.cap_temp_type === 3) {// 冷通道2
          visible = i % 2 === 0 && key === "temp_cold"
        }
      }

      const x = VM.cubeArry[i].x;
      let z = VM.objSingleLength / 2;
      const singleWidth = VM.calc_cabinet_width(VM.cubeArry[i]);
      let color;
      if (i % 2 === 0) {// 偶数，后面一排
        z = -z;
        if (key === "temp_hot") {// 热通道
          color = "#83ff62"
        } else {
          color = "#4cbcff"
        }
      } else {
        if (key === "temp_hot") {// 热通道
          color = "#ff8e52"
        } else {
          color = "#3cebff"
        }
      }
      // if (value >= 90){// 超过90设置为红色
      // color = "#e54545";
      // }
      const geometry = new THREE.BoxGeometry(singleWidth - 4, height, VM.objSingleLength / 2 - 10);// 盒子模型 减 4是因为有间隙 4
      const material = new THREE.MeshPhysicalMaterial({
        // color: VM.deal_capacity_color(null,value),
        color: color,
        emissive: "#000000",// 底色
        roughness: 0.4,// 光滑程度
        metalness: 0.1,// 金属性贴图亮度
        reflectivity: 0.68,// 发亮点大小
        transparent: false,
        opacity: 0.85,
        blendDstAlpha: 0.5
      });// 材料
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = x - VM.MmovL - 2;// 这里减去自己的2分之一参考initObject中的位置设置 搜关键字  VM.cubeArry[iNum].x - movL  MmovL是个累加值
      mesh.position.y = height / 2 + this.objCabinetBottomHeight;
      mesh.position.z = z * (key === "temp_hot" ? 2.5 : 1.5);
      mesh.visible = visible;
      // mesh.renderOrder = 1000;
      // mesh.material.depthTest = false;
      // VM.clearCache(VM.cubeArry[i][key + '_mesh']);
      VM.mineDispose(VM.scene, VM.mesh4[i + key + "_mesh"])
      // VM.clearCache(VM.mesh4[i + key + "_mesh"])
      // VM.cubeArry[i][key + '_mesh'] = mesh;
      VM.mesh4[i + key + "_mesh"] = mesh;
      if (height !== 0) {
        VM.scene.add(mesh)
      }
    },

    /*3个横切面测试使用*/
    init_three_heat_map() {
      const VM = this;
      if (VM.isTransparent && VM.isTempCloud) {// 云图视图
        // console.time('three_heat_map')
        const cubeArrL = VM.cubeArry.length;
        const width = VM.objLength + (VM.cubeArry[VM.cubeArry.length - 1].width === 0 ? VM.objSingleWidth : 49); // 这里加的宽度要根据最后一个排机柜的宽度加
        const height = VM.objAllCabinetWidth;// 机柜两排，以及中间通道各为120

        for (let i = 0; i < 3; i++) {
          VM.all_passageway_data[i + 101] = {};
          let data_max = 0;
          let data_arr = [];// 位置与数据对象数组
          const j_arr = [];// 有数据的下标数组
          let is_the_same = true;// 是否和旧数据一样
          $('.my_heatmap').remove();// 删掉创建的dom
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
          let need_position = 1;
          if (i === 0) {// 上
            need_position = 1
          } else if (i === 1) {// 中
            need_position = 3
          } else if (i === 2) {// 下
            need_position = 5
          }
          const all_hot_odd = VM.set_temp_data_type(VM.cal_heatmap_one_way_data(0, VM.key_way_hot), VM.key_hot);// 所有热通道为奇数的数据
          const all_cold_odd = VM.set_temp_data_type(VM.cal_heatmap_one_way_data(0, VM.key_way_cold), VM.key_cold);// 所有冷通道为奇数的数据
          const all_cold_even = VM.set_temp_data_type(VM.cal_heatmap_one_way_data(1, VM.key_way_cold), VM.key_cold);// 所有冷通道为偶数的数据
          const all_hot_even = VM.set_temp_data_type(VM.cal_heatmap_one_way_data(1, VM.key_way_hot), VM.key_hot);// 所有热通道为偶数的数据
          const pos_data = {
            pos_1: VM.cal_heatmap_one_position(all_hot_odd, need_position),// 用作位置1的数据
            pos_2: VM.cal_heatmap_one_position(all_cold_odd, need_position),// 用作位置2的数据
            pos_4: VM.cal_heatmap_one_position(all_cold_even, need_position),// 用作位置4的数据
            pos_5: VM.cal_heatmap_one_position(all_hot_even, need_position),// 用作位置5的数据
          };
          pos_data.pos_3 = VM.cal_heatmap_ave_position(pos_data.pos_2, pos_data.pos_4);
          for (let j = 0; j < cubeArrL / 2; j++) {
            const passageway_data = [];// 俯视一列机柜的5个位置图
            for (let pos = 1; pos <= 5; pos++) {// 五个位置的数据设置 组成第几排机柜的位置为pos的值
              const current_data = JSON.parse(JSON.stringify(pos_data['pos_' + pos][j]));// 这里要深拷贝不然会影响原来的值
              current_data.position = pos;
              passageway_data.push(current_data);
            }
            if (!ifNullData(passageway_data)) {
              const jj = j * 2;// 这里* 2 是为了保证计算机柜宽度的时候是以某一排为准，当前以偶数排为基准
              j_arr.push(jj);
              if (!isEqual(VM.all_passageway_data[i + 101][jj], passageway_data)) {
                // if (!VM.Is_the_same_with_old_data(i + 101,jj,passageway_data)){
                is_the_same = false
              }
              VM.all_passageway_data[i + 101][jj] = passageway_data;
              for (let k = 0; k < passageway_data.length; k++) {
                const all_data = VM.cal_heatmap_data_position(width, height, cubeArrL, passageway_data[k], jj, k, j_arr.indexOf(jj));
                data_max = Math.max(data_max, all_data.max);
                data_arr = [...data_arr, ...all_data.position_arr];
              }
            }
          }
          if (is_the_same) {// 如果和旧数据一样，那就别渲染了
            continue
          }
          VM.filter_repeat_point(data_arr);
          // console.time('three_heat_map1')
          const heatmapBase64 = VM.init_heatmap(width, height, data_arr, data_max, i + 101);// 拿到base64的图片资源
          // console.timeEnd('three_heat_map1')
          // VM.clearCache(VM.heatmap_map_three[i]);// 对之前存在的对象也最好清除一下，待测试
          VM.heatmap_map_three[i] = VM.init_heatmap_canvas(width, height, heatmapBase64);
          if (VM.heatmap_Mesh_three.length < 3) {// 说明是第一次加载
            VM.init_three_mesh(width, height, data_arr, data_max, i);
            // }else if(!VM.hasLoadOtherView){
          } else {
            VM.heatmap_Mesh_three[i].material.map.dispose();
            setTimeout(() => {
              VM.heatmap_Mesh_three[i].material.map = VM.heatmap_map_three[i];
              // VM.render_render('render_render_three_heat_map');//注意，这里是云图刷新数据后不更新的主要问题，主动render一次
            }, 0)
          }
        }
        VM.render_render('render_render_three_heat_map');//注意，这里是云图刷新数据后不更新的主要问题，主动render一次
        // console.timeEnd('three_heat_map')
      }
    },
    // 创建平面视图的mesh
    // * width: 指定宽，
    // * height：指定高
    // * data_arr: 当前面带位置信息的数据点
    // * data_max: 当前数据中最大值，
    // * i：当前面是第几面
    init_three_mesh(width, height, data_arr, data_max, i) {
      const VM = this;
      const material = new THREE.MeshBasicMaterial({
        map: VM.heatmap_map_three[i],// 热力图贴图
        side: THREE.DoubleSide,
        // side:THREE.FrontSide,
        transparent: true,// 是否使用透明度
        fog: false,
        opacity: 0.7
      });
      const geometry = new THREE.PlaneGeometry(width, height);
      const heatmap_mesh = new THREE.Mesh(geometry, material);
      heatmap_mesh.rotateX(-Math.PI / 2);// 右手世界坐标定理
      // heatmap_mesh.rotateZ(Math.PI / 2);
      const position = VM.calc_three_position(i);
      heatmap_mesh.position.set(position.x, position.y + 2, position.z);
      // heatmap_mesh.position.set(0, 300 , 0);
      heatmap_mesh.name = VM.cabinetTemp_ + (i + 101);// 注册名字
      heatmap_mesh.material.needsUpdate = true;// 材质可以更新
      heatmap_mesh.material.precision = 'mediump';// 重写材质精度 可以是"highp", "mediump" 或 "lowp"。默认值为null。
      heatmap_mesh.geometry.colorsNeedUpdate = true;// 使颜色可以更新

      heatmap_mesh.renderOrder = 1;
      heatmap_mesh.material.depthTest = false;
      // heatmap_mesh.material.depthWrite = true;
      VM.mineDispose(VM.scene, VM.heatmap_Mesh_three[i]);
      // VM.clearCache(VM.heatmap_Mesh_three[i]);
      heatmap_mesh.visible = false;
      VM.heatmap_Mesh_three[i] = heatmap_mesh;// 注意这里减一是因为之前的设定就是m是从1开始的，方便位置计算
      VM.scene.add(heatmap_mesh);
    },
    change_heatmap_view(event, flag, key) {
      event.stopPropagation();// 事件阻止
      const VM = this;
      // const flag = $(event.target).val() || value;
      this[key] = flag;
      flag = Number(flag);
      if (this.isTempCloud) {
        if (this.heatmap_type < 0) {// 三个平面
          for (let i = 0; i < this.heatmap_Mesh_three.length; i++) {
            this.heatmap_Mesh_three[i].visible = flag < 0 || i === flag
          }
        } else if (this.heatmap_type === 0) {// 全景视图
          let hide_position_list = [];// 需要隐藏的位置
          if (flag >= 0) {// 选了具体的哪一排
            if (flag === 0) {// 选了显示前排
              hide_position_list = [3, 4, 11, 12, 13]// 需要改动的mesh对象相对位置
            } else {
              hide_position_list = [1, 2, 5, 6, 7]// 需要改动的mesh对象相对位置
            }
          }
          this.heatmap_Mesh.forEach((item, index) => {
            item.visible = hide_position_list.indexOf(index + 1) < 0
          })
        } else {// 立面视图
          const four_list = [1, 2, 3, 4];
          this.heatmap_Mesh.forEach((item, index) => {
            item.visible = (flag < 0 && four_list.indexOf(index + 1) >= 0) || index === flag
          })
        }
      } else if (this.viewFlag === 6) {
        let keys = Object.keys(this.mesh4);
        keys.forEach((item, index) => {// 温度柱图
          if (index >= keys.length / 2) {
            return false
          }
          if (flag === 1) {// 热通道
            if ((VM.cap_temp_type === 0 && index % 2 === 1) || (VM.cap_temp_type === 1 && index % 2 === 0)) {// 前排机柜 后排机柜
              VM.meshVisibleChange(VM.mesh3[index + "temp_hot"], true);
              VM.meshVisibleChange(VM.mesh4[index + "temp_hot_mesh"], true)
            } else {
              VM.meshVisibleChange(VM.mesh3[index + "temp_hot"], false);
              VM.meshVisibleChange(VM.mesh4[index + "temp_hot_mesh"], false)
            }
            VM.meshVisibleChange(VM.mesh3[index + "temp_cold"], false);
            VM.meshVisibleChange(VM.mesh4[index + "temp_cold_mesh"], false)
          } else {// 冷通道
            if ((VM.cap_temp_type === 0 && index % 2 === 1) || (VM.cap_temp_type === 1 && index % 2 === 0)) {// 前排机柜 后排机柜
              VM.meshVisibleChange(VM.mesh3[index + "temp_cold"], true);
              VM.meshVisibleChange(VM.mesh4[index + "temp_cold_mesh"], true)
            } else {
              VM.meshVisibleChange(VM.mesh3[index + "temp_cold"], false);
              VM.meshVisibleChange(VM.mesh4[index + "temp_cold_mesh"], false)
            }
            VM.meshVisibleChange(VM.mesh3[index + "temp_hot"], false);
            VM.meshVisibleChange(VM.mesh4[index + "temp_hot_mesh"], false)
          }
        })
      }
      this.$nextTick(() => {
        VM.render_render('change_heatmap_view')
      })
    },
    change_heatmap_view1(flag, key) {
      // const flag = $(event.target).val();
      const VM = this;
      let threeD_show = true;// 是否显示3D
      this.threeD_chose_menu.map(item => {
        if (item.value === flag && item.children) {
          item.showChildren = !item.showChildren
        } else {
          item.showChildren = false
        }
      });
      this[key] = flag;
      this.heatmap_view = -1;// 这里重置一下上中下选项问题
      this.heatmap_view1 = -1;// 这里重置一下上中下选项问题
      this.heatmap_view2 = -1;// 这里重置一下上中下选项问题
      this.cap_temp_view = -1;// 这里重置一下冷热通道选项问题
      threeD_show = flag < 0;
      if (this.isTempCloud) {// 温度云图菜单切换
        for (let i = 0; i < 3; i++) {
          if (this.heatmap_Mesh_three[i]) {
            this.heatmap_Mesh_three[i].visible = threeD_show
          }
        }
        this.heatmap_Mesh.forEach((item, index) => {
          if (flag === 1) {// 立面视图,前面四个面
            item.visible = index < 4
          } else {
            item.visible = !threeD_show
          }
        })
      } else if (this.viewFlag === 6) {// 温度柱图菜单切换
        let keys = Object.keys(this.mesh4);
        keys.forEach((item, index) => {// 温度柱图
          if (index >= keys.length / 2) {
            return false
          }
          if (flag < 0) {
            VM.meshVisibleChange(VM.mesh3[index + "temp_hot"], true);
            VM.meshVisibleChange(VM.mesh3[index + "temp_cold"], true);
            VM.meshVisibleChange(VM.mesh4[index + "temp_hot_mesh"], true);
            VM.meshVisibleChange(VM.mesh4[index + "temp_cold_mesh"], true)
          } else {
            if (flag === 0) {// 热通道1
              VM.meshVisibleChange(VM.mesh3[index + "temp_hot"], index % 2 === 1);
              VM.meshVisibleChange(VM.mesh3[index + "temp_cold"], false);
              VM.meshVisibleChange(VM.mesh4[index + "temp_hot_mesh"], index % 2 === 1);
              VM.meshVisibleChange(VM.mesh4[index + "temp_cold_mesh"], false)
            } else if (flag === 1) {// 冷通道1
              VM.meshVisibleChange(VM.mesh3[index + "temp_hot"], false);
              VM.meshVisibleChange(VM.mesh3[index + "temp_cold"], index % 2 === 1);
              VM.meshVisibleChange(VM.mesh4[index + "temp_hot_mesh"], false);
              VM.meshVisibleChange(VM.mesh4[index + "temp_cold_mesh"], index % 2 === 1)
            } else if (flag === 2) {// 热通道2
              VM.meshVisibleChange(VM.mesh3[index + "temp_hot"], index % 2 === 0);
              VM.meshVisibleChange(VM.mesh3[index + "temp_cold"], false);
              VM.meshVisibleChange(VM.mesh4[index + "temp_hot_mesh"], index % 2 === 0);
              VM.meshVisibleChange(VM.mesh4[index + "temp_cold_mesh"], false)
            } else if (flag === 3) {// 冷通道2
              VM.meshVisibleChange(VM.mesh3[index + "temp_hot"], false);
              VM.meshVisibleChange(VM.mesh3[index + "temp_cold"], index % 2 === 0);
              VM.meshVisibleChange(VM.mesh4[index + "temp_hot_mesh"], false);
              VM.meshVisibleChange(VM.mesh4[index + "temp_cold_mesh"], index % 2 === 0)
            }
          }
          // if ((flag === 0 && index % 2 === 1) || (flag === 1 && index % 2 === 0)){// 前面一排，后面一排
          // VM.mesh3[index + 'temp_hot'].visible = true;
          // VM.mesh3[index + 'temp_cold'].visible = true;
          // VM.mesh4[index + 'temp_hot_mesh'].visible = true;
          // VM.mesh4[index + 'temp_cold_mesh'].visible = true;
          // }else{
          // VM.mesh3[index + 'temp_hot'].visible = false;
          // VM.mesh3[index + 'temp_cold'].visible = false;
          // VM.mesh4[index + 'temp_hot_mesh'].visible = false;
          // VM.mesh4[index + 'temp_cold_mesh'].visible = false;
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
      const height = this.objHeight + this.objSmallHeight;// 机柜的整体高度
      const position_obj = {x: 0, y: height / 2, z: 0};
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
    new_calc_capacity_position1(per) {
      // return this.objCabinetHeight / 100 * Math.abs(per);
      return this.objCabinetHeight / 100 * per
    },
    calc_cabinet_width(data) {
      const width = data.width;
      if (width === 1) { // 0 全柜  1 半柜
        return this.objSingleHalfWidth;
      } else {
        return this.objSingleWidth;
      }
    },
    initMouseClick() {
      const VM = this;
      // document.addEventListener('mousemove', () =>{
      // event.preventDefault();
      // VM.MOUSE.x = (event.clientX / window.innerWidth) * 2 - 1;
      // VM.MOUSE.y = -(event.clientY / window.innerHeight) * 2 + 1;
      // }, false);
      window.addEventListener('click', VM.dev_click_fun(), false);
    },
    /*
        添加光投射器 及 鼠标二维向量 用于捕获鼠标移入物体
        下次渲染时，通过mouse对于的二维向量判断是否经过指定物体
    */
    renderRaycasterObj() {
      const VM = this;
      VM.RAYCASTER = new THREE.Raycaster();// 光线投射器
      VM.MOUSE = new THREE.Vector2();// 二维向量
      VM.RAYCASTER.setFromCamera(VM.MOUSE, VM.CAMERA);
      const intersects = VM.RAYCASTER.intersectObjects(VM.scene.children);
      if (intersects.length > 0) {
        const currentProjectiveObjT = intersects[0].object;
        if (VM.projectiveObj != currentProjectiveObjT) {

          if ((currentProjectiveObjT instanceof THREE.AxesHelper)) {
            // 穿过的是坐标轴线和网格线
            return;
          }

          VM.projectiveObj = intersects[0].object;
          VM.projectiveObj.material.color.setHex(VM.projectiveObj.currentHex);
        }
      } else {
        VM.projectiveObj = null;
      }
    },
    dev_click_fun() {
      const VM = this;
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
      const VM = this;
      const basePath = '/static/models/';
      const Loader = {
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
    // 提前加载一些材料
    loadTextureLoader(loader) {
      const VM = this;
      // console.time('loadTextureLoader');
      // VM.loadTextureLoaderTime = this.getTimeNow()
      var TextureLoader = new THREE.TextureLoader();
      TextureLoader.setPath(VM.basicURL);
      return new Promise((resolve, reject) => {
        TextureLoader.load(loader.name, (materials) => {//普通机柜
          VM.setStoreData({name: loader.data_name, value: materials});
          VM[loader.data_name] = materials;// 保存下来留着使用
          resolve();
          // console.timeEnd('loadTextureLoader');
          VM.testTime('loadTextureLoaderTime')
        }, VM.onProgress, VM.onError);
        TextureLoader = null;
      })
    },
    // 加载材质
    loadMaterialNew(loader) {
      const VM = this;
      // console.time('loadMaterialNewTime');
      // VM.loadMaterialNewTime = this.getTimeNow()
      let mtlLoader = new MTLLoader();
      mtlLoader.setPath(VM.basicURL);
      return new Promise((resolve, reject) => {
        mtlLoader.load(loader.name, (materials) => {// 普通机柜
          // VM.setStoreData({name: loader.data_name, value: materials});
          materials.preload(); // 加载速度优化
          VM[loader.data_name] = materials;// 先保存存一下材质
          resolve();
          // console.timeEnd('loadMaterialNewTime');
          VM.testTime('loadMaterialNewTime')
        }, VM.onProgress, VM.onError);
        mtlLoader = null;
      })
    },
    // 加载材质
    loadObjectNew(loader) {
      const VM = this;
      // console.time('loadObjectNewTime');
      // VM.loadObjectNewTime = this.getTimeNow()
      let objLoader = new OBJLoader();
      objLoader.setMaterials(VM[loader.data_name]);// 设置一下之前的材质
      objLoader.setPath(VM.basicURL);
      return new Promise((resolve, reject) => {
        objLoader.load(loader.children.name, (oo) => {
          VM.setStoreData({name: loader.children.data_name, value: oo});
          VM[loader.children.data_name] = oo;// 保存下来，留着调用
          resolve();
          // console.timeEnd('loadObjectNewTime');
          VM.testTime('loadObjectNewTime')
        }, VM.onProgress, VM.onError);
        objLoader = null;
      })
    },
    onProgress(xhr) {
    },
    onError(xhr) {
    },
    set_line_geometry(group, vector = {x: 0, y: 0, z: 0}, color = 0x0096FF) {
      const VM = this;
      if (group instanceof THREE.Group && !ifNullData(group.children)) {
        for (let i = 0; i < group.children.length; i++) {
          // const edges = new THREE.EdgesHelper( group.children[i], 0x0096FF );
          const line = new THREE.LineSegments(new THREE.EdgesGeometry(group.children[i].geometry), new THREE.LineBasicMaterial({color: color}));
          line.position.set(vector.x, vector.y, vector.z);
          VM.scene.add(line)
        }
      }
    },
    // 筛选特别相近的点
    filter_repeat_point(data_arr) {
      const VM = this;
      const per = VM.limit_per;
      const need_splice = new Set();// 需要删掉的
      for (let i = data_arr.length - 1; i >= 0; i--) {
        for (let j = data_arr.length - 1; j >= 0; j--) {
          // 两个点如果x轴与y轴 都过近,就删掉这个点
          if (i === j) {// 屏蔽自己
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
    // 对比旧数据，如果没变化，就不用重新渲染了 ,true 不需要重新渲染，false 需要渲染
    /**
     * @return {boolean}
     */
    Is_the_same_with_old_data(m, n, data) {
      const VM = this;
      let is_the_same = true;
      let compare_data = VM.all_passageway_data[m];
      if (!ifNullData(n)) {
        compare_data = compare_data[n];
      }
      if (ifNullData(compare_data)) {// 表示第一次渲染
        return !is_the_same
      }
      VM.sort_fun(data, 'position');
      VM.sort_fun(compare_data, 'position');
      $.each(compare_data, (key, value) => {
        if (value.temp !== data[key].temp) {// 只要有一个不一样的值，就去重新渲染
          is_the_same = false;
          return false
        }
      });
      return is_the_same
    },
    sort_fun(data, key) {
      data.sort((a, b) => {
        return a[key] - b[key]
      });
    },
    get_min_max_data(data, key1, key2, isMax) {
      let min;
      $.each(data, (key, value) => {
        $.each(value[key2], (kk, vv) => {
          if (!min) {
            min = vv.temp;
          }
          if (isMax) {// 取最大值
            min = Math.max(min, vv.temp);
          } else {
            min = Math.min(min, vv.temp);
          }
        })
      });
      return min
    },
    initCameraDev() {
      const VM = this;
      if (VM.isTransparent && VM.viewFlag === 3) {// 安防视图
        const pos_list = Object.keys(VM.camera_dev_group);// 之前已经加载过的位置
        // 根据设备类型判断所要载入的模型
        // old_temp_camera_Obj
        if (isEqual(VM.temp_camera_list, VM.old_temp_camera_list)) {// 新旧数据一样，不重新刷新
          return
        }
        if (ifNullData(VM.old_temp_camera_list)) {// 首次加载的数据，保存一下旧数据
          VM.old_temp_camera_list = VM.temp_camera_list;
        }
        if (VM.temp_camera_list.length === 0) {// 全部删除或者没有数据的时候
          for (let j = 0; j < pos_list.length; j++) {
            VM.mineDispose(VM.scene, VM.camera_dev_group[pos_list[j]]);//删除已经删除的摄像头位置
            // VM.clearCache(VM.camera_dev_group[pos_list[j]]);//删除已经删除的摄像头位置
          }
        }
        VM.temp_camera_list.forEach((item, index) => {
          let type_f = item.type_f;
          let isRotate = false;
          if (VM.is_camera(item.dev_type)) {// 枪型摄像头，在数组中特殊设置为2，不能影响传值
            if (type_f){
              type_f = 2;
              isRotate = item.pos_id <= 5;
            } else if (VM.is_qt){// 如果是QT浏览器不渲染摄像头
              return
            }
          }
          const dev_model_name = VM.temp_camera_obj[type_f];// 设备类型对应模型的名字
          if (!dev_model_name) {// 如果在预设的类型中没有对应类型，不加载
            return
          }
          if (!isEqual(VM.old_temp_camera_Obj[item.pos_id], item)) {// 若是数据不一样
            VM.mineDispose(VM.scene, VM.camera_dev_group[item.pos_id]);// 删掉之前已经加载的模型，重新创建
            // VM.clearCache(VM.camera_dev_group[item.pos_id]);// 删掉之前已经加载的模型，重新创建
            const half_rr = VM.cal_model_length_unit(VM.cubeArry[VM.cubeArry.length - 1]);// 机柜一半的宽度
            const oo_position = VM.cal_dev_camera_position(VM.objLength, half_rr, item.pos_id);
            const modelName = 'obj_' + dev_model_name;
            if (VM[modelName]) {
              const oo = VM[modelName];
              let obj_clone = oo.clone();
              VM.setObjMeshAttr(obj_clone, ['userData', 'name'], [item, VM.cameraDev_ + item.pos_id]);// 遍历每一个mesh对象加上一些属性
              // obj_clone.userData.data = item;
              if (item.is_alarm !== 0) {// 如果设备告警了
                VM.changeDevMaterial(obj_clone);
              }
              if (isRotate) {// 枪型摄像头需要旋转,旋转要用π
                // obj_clone.rotation.x = 0;
                obj_clone.rotation.y = Math.PI;
                // obj_clone.rotation.z = 0;
              }
              obj_clone.scale.x = VM.devScale;// 调整放大倍数
              obj_clone.scale.y = VM.devScale;
              obj_clone.scale.z = VM.devScale;
              obj_clone.position.set(oo_position.x, oo_position.y, oo_position.z);
              VM.camera_dev_group[item.pos_id] = obj_clone;
              VM.scene.add(obj_clone);
              VM.render_render();
              VM.Loadover--;
            }
          }
          VM.old_temp_camera_Obj[item.pos_id] = item;// 设置一下旧值
          pos_list.splice(pos_list.indexOf(item.pos_id.toString()), 1);// 删掉当前在的设备
          if (index === VM.temp_camera_list.length - 1) {// 最后一个了
            for (let j = 0; j < pos_list.length; j++) {
              VM.mineDispose(VM.scene, VM.camera_dev_group[pos_list[j]]);//删除已经删除的摄像头位置
              // VM.clearCache(VM.camera_dev_group[pos_list[j]]);//删除已经删除的摄像头位置
            }
          }
        })
      }
    },
    deal_dev_status(status) {
      return status === 0 ? '正常' : '异常'
    },
    is_camera(dev_type) {
      return dev_type === 15 || dev_type === 26
    },
    // 关闭弹窗，请勿删除
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
      // this.reset_position ,初始位置
      let camera = (event && event.target) ? event.target.object : {};
      let position = camera.position;
      if (this.isTempCloud) {// 温度云图
        if (this.heatmap_type === 0) {// 机柜云图
          // this.temp_position_change(position,this.heatmap_Mesh);
        } else {// 3个平面
        }
      } else if (this.viewFlag === 2) {// 容量云图
        // VM.cubeArry[i].mesh
        // this.capacity_position_change(position,this.cubeArry);
      } else if (this.viewFlag === 6) {// 温度柱图
        // VM.cubeArry[i][key + '_mesh']
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
      let position_list = [1, 2, 3, 4, 5, 6, 7, 11, 12, 13];// 当前是哪几个面
      let opacity = this.hide_opacity;
      if (position && position.z > 0 && position.z > this.reset_position.z / 2 && position.y > this.reset_position.y / 2) {// 正面 超过正z轴的一半 超过正y轴的一半
        position_list = [3, 4, 11, 12, 13]// 需要改动的mesh对象为相对位置的
      } else if (position && position.z < 0 && position.z < this.reset_position.z / 2 && position.y > this.reset_position.y / 2) {// 背面 超过负z轴的一半  超过正y轴的一半
        position_list = [1, 2, 5, 6, 7]// 需要改动的mesh对象为相对位置的
      } else {// 其他转向
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
      let index_list = Object.keys(this.cubeArry);// 下标列表
      let visible = false;
      if (position && position.z > 0 && position.z > this.reset_position.z / 2 && position.y > this.reset_position.y / 2) {// 正面 超过正z轴的一半 超过正y轴的一半
        index_list = index_list.filter(item => item % 2 === 1)// 去掉正面 单数
      } else if (position && position.z < 0 && position.z < this.reset_position.z / 2 && position.y > this.reset_position.y / 2) {// 背面 超过负z轴的一半  超过正y轴的一半
        index_list = index_list.filter(item => item % 2 === 0)// 去掉背面 双数
      } else {// 其他面
        visible = true
      }
      if (is_ca_per) {
        let hot = "temp_hot_mesh";
        let cold = "temp_cold_mesh";
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
      let timeout = null;
      return () => {
        if (timeout !== null) {
          clearTimeout(timeout)
        }
        timeout = setTimeout(fn, wait)
      }
    },
    changeView(flag, type) {
      let VM = this;

      // 最后要执行的函数
      function change() {
        VM.changeViewFun(VM.curr_view, VM.curr_type)
      }

      if (!VM.func) {
        VM.func = VM.debounce(change, 200);// 开启防抖
      }
      VM.curr_view = flag;
      VM.curr_type = type;
      VM.func();// 执行一下500毫秒之前点击的事件
    },
    show_threeD_chose_menu(event) {
      let offsetTop = $('#main_model').offset().top;
      this.threeD_chose_menu_position = {
        x: event.offsetX + 30 || this.getScreenClickPoint(event, 'pageX') + 30,
        y: event.offsetY + offsetTop || this.getScreenClickPoint(event, 'pageY')
      };
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
          .height();
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
      });
      if (newTheOne) {// 有找到就替换一下
        INTERSECTED = newTheOne.object;
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
    preLoadNormalCabinet() {
      const VM = this;
      console.time('jg_02')
      VM.preLoadNormalCabinetTime = VM.getTimeNow();
      if (VM.obj_jg_02) {
        const oo = VM.obj_jg_02.clone();
        if (!VM.is_qt) {
          VM.changeMaterial(oo);
        }
        let objLengh = 0;
        for (let i = 0; i < VM.cubeArry.length; i++) {
          objLengh = objLengh + VM.cal_model_length(i);

          VM.cubeArry[i]['x'] = objLengh;
          VM.cubeArry[i + 1]['x'] = objLengh;
          if (VM.cubeArry[i].width !== 1) {
            const obj_clone_normal = oo.clone();
            const Jigui_01_normal = obj_clone_normal.getObjectByName('Jigui_01');
            const Jigui_02_normal = obj_clone_normal.getObjectByName('Jigui_02');
            VM.cube[i] = Jigui_01_normal;
            VM.cube[i + 1] = Jigui_02_normal;
            obj_clone_normal.position.set(objLengh, 0, 0);
            VM.objGroup.add(obj_clone_normal);
            // VM.set_line_geometry(obj_clone,{x:objLengh - VM.half_ll - VM.objSingleWidth ,y:0,z:0})
          }
          i++;// 这个很重要，不然会重读计算
        }
        VM.objLength = objLengh;
      }
      VM.testTime('preLoadNormalCabinetTime')
      console.timeEnd("jg_02");
    },
    // 预加载前门
    preLoadDoorFront() {
      const VM = this;
      if (VM.obj_men_01) {
        VM.preLoadDoorFrontTime = VM.getTimeNow();
        console.time("men_01");
        const oo = VM.obj_men_01;
        let obj_clone_front = oo.clone();
        if (!VM.is_qt) {
          VM.changeMaterial(obj_clone_front);
          VM.changeDevMaterialOpacity(obj_clone_front, 'Kehua_logo_02', {isTransparent: true});// logo
          VM.changeDevMaterialOpacity(obj_clone_front, 'boli_01', {isTransparent: true, viewFlag: 1});// 玻璃
          VM.changeDevMaterialOpacity(obj_clone_front, 'boli_02', {isTransparent: true, viewFlag: 1});// 玻璃
          VM.changeDevMaterialOpacity(obj_clone_front, 'Rectangle058', {isTransparent: true, viewFlag: 1});// 门框四周
          VM.changeDevMaterialOpacity(obj_clone_front, 'Box314', {isTransparent: true, viewFlag: 1});// 门框上面
          VM.changeDevMaterialOpacity(obj_clone_front, 'Box345', {isTransparent: true, viewFlag: 1});// 门框底部
          VM.changeDevMaterialOpacity(obj_clone_front, 'Box342', {isTransparent: true, viewFlag: 1});// 门框上面靠里
        }
        obj_clone_front.position.set(0 - VM.objLength / 2 - VM.half_ll - 9, 0, 0);
        // if (VM.viewFlag !== 1 && VM.viewFlag !== 2) {
        // if (VM.viewFlag !== 1) {
        VM.scene.add(obj_clone_front);
        // VM.set_line_geometry(oo,{x:0 - objLengh / 2 - VM.half_ll - 9,y:0,z:0});
        // }
        VM.Loadover--;
        VM.testTime('preLoadDoorFrontTime')
        console.timeEnd("men_01");
      }
    },
    // 预加载后门
    preLoadDoorBack() {
      const VM = this;
      if (VM.obj_men_02) {
        VM.preLoadDoorBackTime = VM.getTimeNow();
        const oo = VM.obj_men_02;
        let obj_clone_back = oo.clone();
        if (!VM.is_qt) {
          VM.changeMaterial(obj_clone_back);
          VM.changeDevMaterialOpacity(obj_clone_back, 'Kehua_logo_01', {isTransparent: true});
          VM.changeDevMaterialOpacity(obj_clone_back, 'boli_01', {isTransparent: true, viewFlag: 1});// 玻璃
          VM.changeDevMaterialOpacity(obj_clone_back, 'boli_02', {isTransparent: true, viewFlag: 1});// 玻璃
          VM.changeDevMaterialOpacity(obj_clone_back, 'Rectangle028', {isTransparent: true, viewFlag: 1});// 门框四周
          VM.changeDevMaterialOpacity(obj_clone_back, 'Box021', {isTransparent: true, viewFlag: 1});// 门框上面
          VM.changeDevMaterialOpacity(obj_clone_back, 'Box280', {isTransparent: true, viewFlag: 1});// 门框底部
          VM.changeDevMaterialOpacity(obj_clone_back, 'Box066', {isTransparent: true, viewFlag: 1});// 门框上面靠里
        }
        obj_clone_back.position.set(VM.objLength / 2 + VM.half_rr + 9, 0, 0);
        // if (VM.viewFlag !== 1 && VM.viewFlag !== 2) {
        // if (VM.viewFlag !== 1) {
        VM.scene.add(obj_clone_back);
        // VM.set_line_geometry(oo,{x:objLengh / 2 + VM.half_rr + 9,y:0,z:0});
        // }
        VM.Loadover--;
        VM.testTime('preLoadDoorBackTime')
      }
    },
    // 预加载空调
    preLoadCabinetAir() {
      const VM = this;
      if (VM.obj_jg_03) {
        VM.preLoadCabinetAirTime = VM.getTimeNow();
        const oo = VM.obj_jg_03;
        let obj_jg_03 = oo.clone();
        let objLengh_air = 0;
        if (!VM.is_qt) {
          VM.changeMaterial(obj_jg_03);
        }
        for (let i = 0; i < VM.cubeArry.length; i++) {
          objLengh_air = objLengh_air + VM.cal_model_length(i);
          if (VM.cubeArry[i].width === 1) {// 两排只要有一个是空调柜,另一个一定是空调柜
            const obj_clone_air = obj_jg_03.clone();

            const Jigui_01_air = obj_clone_air.getObjectByName('Jigui_01');
            const Jigui_02_air = obj_clone_air.getObjectByName('Jigui_02');
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
        VM.isLoading = false;// 进度gif
        VM.initObject(VM.objLength / 2);// 机柜位置排列参考，在容量云图中所创建的立体模型位置排列
        VM.MmovL = VM.objLength / 2;
        VM.animation('initModel');// 动画
        console.timeEnd("alltime");
        VM.testTime('alltime');
        VM.testTime('preLoadCabinetAirTime')
      }
    },
    // 地板
    loadCabinetFloor() {
      const VM = this;
      let newobjLengh = 0;
      for (let mm = 0; mm < VM.cubeArry.length; mm++) {
        const arrLength = VM.cubeArry.length;
        newobjLengh += VM.objBottomWidth;
        for (let kk = -4; kk <= 7; kk++) {// 每一个循环12次，负值开始是因为要设置负值
          let num = 1;
          if (mm === arrLength - 2) {// 最后一个多添加机柜数量一半小格
            num = arrLength / 2;
          }
          for (let jj = 0; jj < num; jj++) {
            // const geometry = new THREE.BoxBufferGeometry( VM.objBottomWidth, VM.objBottomHeight, VM.objBottomLength);// 体
            const geometry = new THREE.PlaneBufferGeometry(VM.objBottomWidth, VM.objBottomHeight, VM.objBottomLength);
            const material = new THREE.MeshBasicMaterial({
              color: 0x377e8a,
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0.3,
              // blendDstAlpha: 0.3,
            });
            const plane = new THREE.Mesh(geometry, material);
            const line = new THREE.LineSegments(
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
    loadOtherView() {
      // console.log('loadOtherView:' + boo);
      if (!this.is_qt) {
        this.initCameraDev();// 安防视图的摄像头模型
        this.init_heatmap_four_mesh();// 温度云图全景视图的内容以及立面视图视图
        this.init_three_heat_map();// 温度云图平面视图内容
      }

    },
    // 液晶屏缩放
    LCDScale() {
      if (this.LCD === 1) {// 液晶屏上展示pc端代码--大屏展示:放大2倍，缩小0.5倍
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
    webGlLoadPromise() {
      const VM = this;
      if (VM.checkIsLoad()) {
        VM.loadOverFun();
      } else {
        // VM.loadMaterial(VM.loadJPG);
        console.time('lastThen');
        this.lastThen = this.getTimeNow();
        VM.loadMaterialNew(VM.jg_02).then(() => {// 加载普通机柜的材质描述
          return VM.loadObjectNew(VM.jg_02)// 加载普通机柜
        }).then(() => {
          return VM.loadMaterialNew(VM.men_01);// 加载前门的材质描述
        }).then(() => {
          return VM.loadObjectNew(VM.men_01);// 加载前门
        }).then(() => {
          return VM.loadMaterialNew(VM.men_02);// 加载后门的材质描述
        }).then(() => {
          return VM.loadObjectNew(VM.men_02);// 加载后门
        }).then(() => {
          return VM.loadMaterialNew(VM.jg_03);// 加载空调机柜的材质描述
        }).then(() => {
          return VM.loadObjectNew(VM.jg_03);// 加载空调机柜
        }).then(() => {
          return VM.loadMaterialNew(VM.af_smoke);// 加载烟雾的材质描述
        }).then(() => {
          return VM.loadObjectNew(VM.af_smoke);// 加载烟雾
        }).then(() => {
          return VM.loadMaterialNew(VM.af_sp_qiang);// 加载枪型摄像头的材质描述
        }).then(() => {
          return VM.loadObjectNew(VM.af_sp_qiang);// 加载枪型摄像头
        }).then(() => {
          return VM.loadMaterialNew(VM.af_sp_qiu);// 加载球型摄像头的材质描述
        }).then(() => {
          return VM.loadObjectNew(VM.af_sp_qiu);// 加载球型摄像头
        }).then(() => {
          return VM.loadTextureLoader(VM.loadTexture0);// 加载普通机柜贴图
        }).then(() => {
          return VM.loadTextureLoader(VM.loadTexture1);// 加载空调贴图
        }).then(() => {
          return VM.loadTextureLoader(VM.loadTextureDisabledBig);// 加载无效柜全柜贴图
        }).then(() => {
          return VM.loadTextureLoader(VM.textureDisabledSmall);// 加载无效柜半柜贴图
        }).then(() => {
          console.timeEnd('lastThen');
          VM.testTime('lastThen');
          VM.loadOverFun();
          console.timeEnd('LoadPromise');
          VM.testTime('LoadPromise');
        });
      }
    },
    // 表格宽度设定
    widthLimit(i) {
      return i === 0 ? '12%' : (i === 1 ? '8%' : 'auto')
    },
    // 检查一下是否已经加载了模型
    checkIsLoad() {
      if (!this.obj_jg_02 || !this.obj_jg_03 ||
        !this.obj_men_01 || !this.obj_men_02 ||
        !this.obj_af_smoke || !this.obj_af_sp_qiang || !this.obj_af_sp_qiu ||
        !this.texture0 || !this.texture1 || !this.texture_disabled_big || !this.texture_disabled_small
      ) {
        return false
      } else {
        return true
      }
    },
    // 模型加载结束之后执行
    loadOverFun() {
      this.ThreeDinterval();// 设置定时器，实时刷新数据
      this.deal_color_list();// 处理一下温度云图的颜色参考显示
      this.deal_cap_color_list();// 处理一下容量云图的颜色参考
    },
    testInfo(message) {
      var VM = this;
      if (VM.LCD === 1 && (typeof qt != 'undefined')) {//-B液晶屏 慧云液晶屏
        // if (VM.LCD === 1) {//-B液晶屏 慧云液晶屏
        if (window.loginHelper && window.loginHelper.loginfo) {
          window.loginHelper.loginfo(message);
        } else {
          new QWebChannel(qt.webChannelTransport, function (channel) {
            window.loginHelper = channel.objects.loginHelper;
            if (window.loginHelper.loginfo){
              window.loginHelper.loginfo(message);
            }
          });
        }
      }
    },
    testTime(attr) {
      const time = this.getTimeNow() - this[attr];
      this.testInfo({[attr]: time});
    },
    setStoreData(data){
      if (!this.$store.state[data.name]){// 判断一下是否存在
        this.$store.commit('setThreeDModel',data);
      }
    },
  },
  created() {
    const VM = this;
    // 在此处获取一下当前配置的告警颜色，用于机柜产生告警时顶部感叹号的颜色变化
    // 如果没有这个颜色，那就使用默认的颜色值
    VM.isLoading = true;// 这里触发一次等待
    alarmLevel_get_ajax(VM).then((data) => {
      $.each(data, (key, value) => {
        VM.alarmL_color[value.level] = value.color || defaultAlarmLevelColorList(value.level)
      });
    });
  },
  mounted() {
    const VM = this;
    const idn = $("#main_model");
    VM.Dwidth = idn.width();
    VM.Dheight = idn.height();
    VM.isWebGl = WEBGL.isWebGLAvailable();// 是否支持webgl
    if (VM.isWebGl) {
      console.time('LoadPromise');
      this.LoadPromise = this.getTimeNow();
      VM.webGlLoadPromise();// 开始预加载机柜模型
    }
    // 若是判定未不支持添加1秒之后再次验证
    setTimeout(() => {
      if (!VM.isWebGl) {
        VM.isWebGl = WEBGL.isWebGLAvailable();// 是否支持webgl
        VM.webGlLoadPromise();// 开始预加载机柜模型
      }
    }, 1000);
    VM.main_ico_3d = $('#main_ico_3d');
    // 这个标识用作识别当前是否进入过mounted，因为当前页面使用了keep-alive，再次进入时可重新加载处理一下模型的大小
    VM.hasEnterMounted = true;
  },
  activated() {
    this.activatedBoo = true;
    if (!this.hasEnterMounted) {// 防止第一次进入的时候没有loading 提示
      this.render_setSize()
    }
  },
  deactivated() {
    this.activatedBoo = false;
    this.devShow = false;
  },
  beforeDestroy() {
    this.clearFun();
  }
};

