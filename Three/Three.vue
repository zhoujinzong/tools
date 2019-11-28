

<template>

<section>
        <div  id="main_model" class="absoult_all" v-show="isWebGl">
          <div id="Stats_output"></div>
            <div id="circeLeft" v-bind:class="isWebGl && animationFlag === 1? 'circeLeft':'circeLeft_dis'"></div>
            <div id="circeRight" v-bind:class="isWebGl && animationFlag === 1 ? 'circeRight':'circeRight_dis'"></div>
            <!--<div id="circeTop"></div>-->
            <!--<div id="circeBottom"></div>-->
            <div id="cabinet_cap" v-if="false" v-on:click="changeView(2)" v-bind:class="{'cabinet_cap_select' : viewFlag === 2}" title="容量云图"></div>
            <div id="cabinet_temp" v-if="LCD === 0" v-on:click="changeView(1)" v-bind:class="{'cabinet_temp_select' : viewFlag === 1}" title="温度云图"></div>
            <div id="cabinet_safe" v-if="LCD === 0" v-on:click="changeView(3)" v-bind:class="{'cabinet_safe_select' : viewFlag === 3}" title="安防视图"></div>
            <div id="cabinet_3d" v-if="LCD === 0" v-on:click="changeView(4)" v-bind:class="{'cabinet_3d_select' : viewFlag === 4}" title="3D视图"></div>
            <div id="circeReset" title="初始视角"></div>
            <div id="CanvasHide" style="display: none"></div>
            <div class="loading_center" v-show="isLoading"></div>
            <div class="bangben_warning" v-show="cubeArry.length==0 &&!isLoading">暂无数据，请添加机柜</div>
            <div id="color_list" v-show="viewFlag === 1" >
              <span id="temp_text">温度（℃）</span>
              <span id="temp_16"><16</span>
              <span id="temp_22">22</span>
              <span id="temp_28">28</span>
              <span id="temp_34">34></span>
            </div>
        </div>

        <div class="absoult_all" v-show="!isWebGl">
            <div class="bangben_warning">您的浏览器版本过低，不支持WebGL,请升级浏览器</div>
        </div>
        <!-- <div class="absoult_all" v-show="cubeArry.length==0 && isWebGl">
        </div> -->

        <!--机柜浮动信息 -->
        <div class="main_ico_3d" v-show="devShow" v-text="nowItme.name" v-bind:style="{top:nowItme.y + 'px',left:nowItme.x + 'px'}"></div>
        <mainPopWin idn="main_three_pop" v-on:showChange="showChange" v-bind="{showFlag:showFlag,box_index:box_index,cab_type:0,dev_index:0}"></mainPopWin>
         <!--<mobileSoftKey v-if="LCD"></mobileSoftKey>-->

        <popWindow idn="main_cabinet_message" buttonNum="0" v-bind:title="cabinet_pop_title+'详细信息'" v-bind:close1-click="main_normal_close">
            <ul class="main_cabinet_pop" v-bind:class="(pc_data.length==0)?'main_cabinet_popS':''">

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
                                     <tr v-if="el.length==0"><td colspan="3">暂无数据</td></tr>
                                     <tr v-for="(vv,kk) in el">
                                        <td v-bind:title="vv.name_f">{{vv.name_f}}</td>
                                        <td>{{vv.Tem}}</td>
                                        <td>{{vv.Humi}}</td>
                                     </tr>
                                  </tbody>
                              </table>
                          </div>
                      </div>

                      <div class="mCabmin_ul" v-if="pc_data.length!=0">
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
</section>

</template>


<script src="../../libs/main/mainThreeD.js"></script>

