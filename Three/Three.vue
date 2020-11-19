<template xmlns:v-bind="http://www.w3.org/1999/xhtml">

  <section>
    <div id="main_model" class="absoult_all" v-show="isWebGl">
      <div id="Stats_output"></div>
      <div id="circeLeft" :class="isWebGl ? 'circeLeft':'circeLeft_dis'" @mousedown="circleActionDebounce(1, tag_left)"></div>
      <div id="circeRight" :class="isWebGl? 'circeRight':'circeRight_dis'"
           @mousedown="circleActionDebounce(-1, tag_left)"></div>
      <div class="cabinet3D_switch">
        <div v-for="menu in threeD_switch_menu" :id="menu.id"
             v-if="isShowSwitchMenu && menu.isShow" v-on:click="changeView(menu.viewFlag,menu.type)"
             :class="(viewFlag === menu.viewFlag && (menu.type ? current_capacity_type === menu.type : true))? menu.selectClass : ''"
             :title="menu.title"></div>
      </div>
      <div id="circeReset" title="初始视角" :style="{top: is_qt ? '1rem':'unset'}"
           @mousedown="circleActionDebounce(1, tag_reset)"></div>
      <div id="CanvasHide" style="display: none"></div>
<!--      <div class="loading_center" v-show="isLoading"></div>-->
      <div class="bangben_warning" v-show="cubeArry.length===0 &&!isLoading">暂无数据，请添加机柜</div>
      <div id="color_temp" class="color_list" v-show="viewFlag === 1">
        <div id="temp_text" class="color_top_text">温度（℃）</div>
        <span id="temp_16"><16</span>
        <span id="temp_22">22</span>
        <span id="temp_28">28</span>
        <span id="temp_34">34></span>
      </div>
      <!--容量温度柱图参考开始-->
      <div id="color_cap" class="color_list" v-show="viewFlag === 2 || viewFlag === 6">
        <div id="cap_text" class="color_top_text" v-text="capTypeText"></div>
        <div id="cap_num"></div>
      </div>
      <!--        容量温度柱图参考结束-->
      <!--旧的云图切换开始-->
      <!--      <label v-if="viewFlag === 1" class="heatmap_type" :style="{right: heatmap_type === 1 ? (LCD === 1 ? '4.5rem':'3.5rem'):'1rem'}">-->
      <!--        <select v-model.number="heatmap_type" @change="change_heatmap_view1">-->
      <!--          <option v-for="(val,key) in three_map_type" :value="key">{{val}}</option>-->
      <!--        </select>-->
      <!--      </label>-->
      <!--      <label v-if="viewFlag === 1" class="heatmap_type_1">-->
      <!--        <select v-if="heatmap_type === 1 || true" v-model.number="heatmap_view" @change="change_heatmap_view">-->
      <!--          <option v-for="(val,key) in three_map_chose" :value="key">{{val}}</option>-->
      <!--        </select>-->
      <!--      </label>-->
      <!--旧的云图切换结束-->
    </div>

    <div class="absoult_all" v-show="!isWebGl">
      <div class="bangben_warning">您的浏览器版本过低，不支持WebGL,请升级浏览器</div>
    </div>
    <!-- <div class="absoult_all" v-show="cubeArry.length==0 && isWebGl">
    </div> -->

    <!--机柜浮动信息 -->
    <div class="main_ico_3d" id="main_ico_3d" v-show="devShow" v-html="nowItme.name"
         :style="{top:nowItme.y + 'px',left:nowItme.x + 'px',color: '#ffffff'}"></div>
    <!--    <div v-show="viewFlag === 1 || viewFlag === 6" id="threeD_chose_menu_center" class="position_center" @click="show_threeD_chose_menu"></div>-->
    <div class="main_ico_3d threeD_chose_menu_3d" id="main_3d_menu" v-show="threeD_chose_menu_show"
         v-clickOutSide="show_false"
         :style="{top:threeD_chose_menu_position.y + 'px',left:threeD_chose_menu_position.x + 'px',color: '#ffffff'}">
      <div id="left_sanjiao"></div>
      <ul class="threeD_chose_menu">
        <li v-for="(menu,index) in threeD_chose_menu"
            style="padding: 5px;"
            :class="[index !== threeD_chose_menu.length - 1 && 'threeD_chose_menu_li_class',(threeD_chose_menu_chose_judge(menu.key,menu.value) && !menu.showChildren) && 'threeD_chose_menu_chose']"
            @click="change_heatmap_view1(menu.value,menu.key)">
          <div class="threeD_chose_menu_div">
            <span class="menu_img"></span>
            <span v-text="menu.name"></span>
            <span v-show="menu.children"
                  :class="['threeD_chose_menu_arrow',menu.showChildren ? 'threeD_chose_menu_arrow_down':'threeD_chose_menu_arrow_up']"></span>
          </div>
          <ul v-show="menu.showChildren">
            <li v-for="children in menu.children" @click="change_heatmap_view($event,children.value,children.key)">
              <div>
                <span v-text="children.name"
                      :class="threeD_chose_menu_chose_judge(children.key,children.value) && 'threeD_chose_menu_chose'"></span>
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </div>
    <mainPopWin idn="main_three_pop" v-on:showChange="showChange"
                v-bind="{showFlag:showFlag,box_index:box_index,cab_type:0,dev_index:0}"></mainPopWin>
    <!--<mobileSoftKey v-if="LCD"></mobileSoftKey>-->

    <popWindow idn="main_cabinet_message" buttonNum="0" title="机柜设备信息" width="40"
               :close1-click="main_normal_close" :close-click0="main_normal_close">
      <div class="flex-c-c">
        <div :class="['main_cabinet_pop_left',cabinetTypeImg]"></div>
        <ul class="main_cabinet_pop">
          <li class="main_cabinet_li" v-for="devData in popCabinetDevData">
            <div class="mCabmin_ul">
              <div class="mCabmin_ul_pd mythead">
                <table class="main_table">
                  <thead>
                  <tr>
                    <td
                      v-for="(val,key) in devData.title"
                      :title="val"
                      v-html="val"
                      v-if="val"
                      :width="widthLimit(key)"
                    ></td>
                  </tr>
                  </thead>
                </table>
              </div>
              <div class="mCabmin_ul_pd mytbody">
                <table class="main_table">
                  <tbody>
                  <tr v-if="devData.value.length === 0">
                    <td colspan="3" style="text-align:center">暂无数据</td>
                  </tr>
                  <tr v-for="(vl,kl) in devData.value">
                    <td
                      v-for="(v,k) in vl"
                      :title="devData.tips[kl] && devData.tips[kl][k]"
                      v-html="v"
                      v-if="v"
                      :width="widthLimit(k)"
                    ></td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </popWindow>
    <popWindow idn="camera_dev_message" buttonNum="0"
               :title="pop_camera_dev.name_f + textDetail">
      <div class="alarm_linkage_table myPoPWin">
        <span>设备状态</span>：<p v-html="deal_dev_status(pop_camera_dev.is_alarm) || textNodata">
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
  #test_3d {
    position: absolute;
    bottom: 50%;
    cursor: pointer;
    z-index: 1000;
    right: 1rem;
    top: 2rem;
  }

  .myPoPWin {
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

  .my_main_ico_3d {
    height: 2.4rem;
  }
  .mytbody {
    max-height: 15rem;
    overflow-x: hidden;
    overflow-y: auto;
    /*border-bottom: 0.05rem solid #d2c8b4;*/
  }
</style>

<script src="../../libs/main/mainThreeD.js"></script>

