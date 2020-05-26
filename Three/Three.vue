<template xmlns:v-bind="http://www.w3.org/1999/xhtml">

  <section>
    <div  id="main_model" class="absoult_all" v-show="isWebGl">
      <div id="Stats_output"></div>
      <!--<div id="circeLeft" v-bind:class="isWebGl && animationFlag === 1? 'circeLeft':'circeLeft_dis'"></div>-->
      <!--<div id="circeRight" v-bind:class="isWebGl && animationFlag === 1 ? 'circeRight':'circeRight_dis'"></div>-->
      <div id="circeLeft" v-bind:class="isWebGl ? 'circeLeft':'circeLeft_dis'"></div>
      <div id="circeRight" v-bind:class="isWebGl? 'circeRight':'circeRight_dis'"></div>
      <!--<div id="circeTop"></div>-->
      <!--<div id="circeBottom"></div>-->
      <div class="cabinet3D_switch">
        <div v-for="menu in threeD_switch_menu" :id="menu.id"
             v-if="LCD === 0 && menu.isShow" v-on:click="changeView(menu.viewFlag,menu.type)"
             :class="(viewFlag === menu.viewFlag && (menu.type ? current_capacity_type === menu.type : true))? menu.selectClass : ''"
             :title="menu.title"></div>
      </div>
      <div id="circeReset" title="初始视角"></div>
      <div id="CanvasHide" style="display: none"></div>
      <div class="loading_center" v-show="isLoading"></div>
      <div class="bangben_warning" v-show="cubeArry.length===0 &&!isLoading">暂无数据，请添加机柜</div>
      <div id="color_temp" class="color_list" v-show="viewFlag === 1" >
        <div id="temp_text" class="color_top_text">温度（℃）</div>
        <span id="temp_16"><16</span>
        <span id="temp_22">22</span>
        <span id="temp_28">28</span>
        <span id="temp_34">34></span>
      </div>
      <div id="color_cap" class="color_list" v-show="viewFlag === 2 || viewFlag === 6" >
        <div id="cap_text" class="color_top_text">{{viewFlag === 6 ? '温度（℃）': '容量（%）'}}</div>
        <div id="cap_num"></div>
      </div>
      <label v-if="viewFlag === 1" style="position:absolute;top: 2rem;" :style="{right: heatmap_type === 1 ? '3.5rem':'1rem'}">
        <select v-model.number="heatmap_type" @change="change_heatmap_view1">
          <option v-for="(val,key) in three_map_type" :value="key">{{val}}</option>
        </select>
      </label>
      <label v-if="viewFlag === 1" style="position:absolute;top: 2rem;right: 1rem;">
        <select v-if="heatmap_type === 1" v-model.number="heatmap_view" @change="change_heatmap_view">
          <option v-for="(val,key) in three_map_chose" :value="key">{{val}}</option>
        </select>
      </label>
    </div>

    <div class="absoult_all" v-show="!isWebGl">
      <div class="bangben_warning">您的浏览器版本过低，不支持WebGL,请升级浏览器</div>
    </div>
    <!-- <div class="absoult_all" v-show="cubeArry.length==0 && isWebGl">
    </div> -->

    <!--机柜浮动信息 -->
    <div class="main_ico_3d" id="main_ico_3d" v-show="devShow" v-html="nowItme.name" v-bind:style="{top:nowItme.y + 'px',left:nowItme.x + 'px',color: '#ffffff'}"></div>
    <mainPopWin idn="main_three_pop" v-on:showChange="showChange" v-bind="{showFlag:showFlag,box_index:box_index,cab_type:0,dev_index:0}"></mainPopWin>
    <!--<mobileSoftKey v-if="LCD"></mobileSoftKey>-->

    <popWindow idn="main_cabinet_message" buttonNum="0" v-bind:title="cabinet_pop_title+'详细信息'" v-bind:close1-click="main_normal_close">
      <ul class="main_cabinet_pop" v-bind:class="(pc_data.length===0)?'main_cabinet_popS':''">

        <li class="main_cabinet_li">
          <div class="mCabmin_ul">
            <p class="mCabmin_ul_thead">温湿度</p>
            <div class="mCabmin_ul_pd" v-for="(el,kl) in cold_hot">
              <table class="main_table">
                <thead>
                <tr>
                  <td colspan="3" v-bind:class="(kl=='cold')?'mC_yel_bg':'mC_green_bg'">
                    {{(kl=='cold')?'冷通道':'热通道'}}
                  </td>
                </tr>
                </thead>
                <tbody>
                <tr><td>{{AveEnable==1 ? '':'设备名称'}}</td><td>温度(℃)</td><td>湿度(%RH)</td></tr>
                <tr v-if="el.length===0"><td colspan="3" style="text-align:center">暂无数据</td></tr>
                <tr v-for="(vv,kk) in el">
                  <td v-bind:title="vv.name_f">{{vv.name_f}}</td>
                  <td>{{vv.Tem}}</td>
                  <td>{{vv.Humi}}</td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="mCabmin_ul" v-if="pc_data.length!==0">
            <p class="mCabmin_ul_thead">配电</p>
            <table  class="main_table">
              <tbody>
              <tr>
                <td>
                  <ul class="mCabmin_ul_pd" v-for="(el,kl) in pc_data">
                    <li class="mCabmin_pd_title" v-bind:title="el.title">{{el.title}}</li>
                    <li>电流(A):{{el.cur}}</li>
                    <li>电压(V):{{el.vol}}</li>
                    <li>功率(kW):{{el.power}}</li>
                  </ul>
                </td>
              </tr>
              </tbody>
            </table>
          </div>

        </li>
      </ul>
    </popWindow>
    <popWindow idn="camera_dev_message" buttonNum="0"
               :title="pop_camera_dev.name_f + '详细信息'">
      <div class="alarm_linkage_table myPoPWin">
        {{$t('lang._EMGENERAL_DEVICE_STATUS_')}}{{$t('lang._COMM_SEMICOLON_')}}<p v-html="deal_dev_status(pop_camera_dev.is_alarm) || $t('lang._RS_PUE_NO_DATA_')">
        </p>
      </div>
    </popWindow>
    <popWindow
      idn="showVideo"
      width="40"
      title="视频"
      buttonNum="0"
      :closeClick0="close_event1"
    >
      <myVideoPlay ref="myVideo" :devType="video_dev_type" :devIndex="video_dev_index"></myVideoPlay>
    </popWindow>
  </section>

</template>
<style lang="scss" scoped>
  #test_3d{
    position: absolute;
    bottom: 50%;
    cursor: pointer;
    z-index: 1000;
    right: 1rem;
    top: 2rem;
  }
  .myPoPWin{
    width: 19rem;
    min-height: 5rem;
    max-height: 15rem;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    overflow-x: hidden;
    overflow-y: auto;
  }
  .my_main_ico_3d{
    height: 2.4rem;
  }
</style>

<script src="../../libs/main/mainThreeD.js"></script>

