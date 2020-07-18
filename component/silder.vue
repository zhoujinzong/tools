<!--
 * @Description: 滑块选择组件
 * @Author: zxd
 * @Date: 2019-10-16 11:31:19
 * @LastEditTime : 2020-02-10 15:25:25
 * @LastEditors  : zxd
 -->
<template>
  <div id="c-slider">
    <div id="test1">
      <div class="slider">
        <!--滑杆-->
        <div class="ruler" id="ruler" ref="ruler">
          <!--左滑块左边的占位-->
          <div class="rangeLine" ref="rangeLine"></div>
          <!--左滑块-->
          <div
            ref="bar"
            class="bar startbar"
            @touchstart="startTouchstart"
            @mousedown="startMouseStart"
            @touchmove="startTouchmove"
            @touchend="endTouch(0)"
          ></div>
          <!--右滑块-->
          <div
            ref="endbar"
            class="bar endbar"
            @touchstart="endTouchstart"
            @mousedown="startMouseEnd"
            @touchmove="endTouchmove"
            @touchend="endTouch(1)"
          ></div>
          <!--右滑块右边的占位-->
          <div class="rangeLine" ref="rangeLine2" style="float:right"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "slider",
  data() {
    return {
      $ruler: "", // 滑竿
      $bar: "", // 左侧滑块
      $endbar: "", // 右侧滑块

      startX: "", // 左侧滑块位置
      endX: "", // 右侧滑块位置

      amountW: "", //  滑竿多长距离

      left: 0, //左滑块移动的px数
      right: 100, //右滑块移动的px数

      leftValue: 0, //左滑块距离左端的比例数
      rightValue: 1, //右滑块距离左端的比例数

      Lsilder: 0,
      Rsilder: "",

      rulerClientWidth: "",

      touchMove_can_deal:false,//移动模式下，是否可计算移动距离
    };
  },
  created() {
    // const vm = this;
    // vm.$nextTick(() => {
    //   vm.initSlider();
    // });
    // window.addEventListener("resize", function() {
    //   //监听浏览器宽度变化
    //   if (document.getElementById("ruler")) {
    //     vm.rulerClientWidth = document.getElementById("ruler").clientWidth;
    //   }
    // });
  },
  mounted() {
    const vm = this;
    vm.$nextTick(() => {
      vm.initSlider();
    });
    window.addEventListener("resize", function() {
      //监听浏览器宽度变化
      if (document.getElementById("ruler")) {
        vm.rulerClientWidth = document.getElementById("ruler").clientWidth;
      }
    });
  },
  destroyed() {
    const vm = this;
    window.removeEventListener("resize", function() {
      //监听浏览器宽度变化
      vm.rulerClientWidth = document.getElementById("ruler").clientWidth;
    });
  },
  watch: {
    rulerClientWidth(val) {
      //因为浏览器宽度有变化，所以重置slider
      this.initSlider();
      this.resetSlider();
    }
  },
  methods: {
    initSlider() {
      //初始化滑动条
      const vm = this;
      vm.$ruler = this.$refs.ruler;
      vm.$bar = this.$refs.bar;
      vm.$endbar = this.$refs.endbar;

      vm.amountW = vm.$ruler.clientWidth - vm.$bar.clientWidth; // 滑竿多长距离
      if (LCD === 1 && vm.amountW == 0) {
        vm.amountW = 844;
      }
      vm.Rsilder = vm.amountW;
    },
    resetSlider() {
      //重置slider
      this.left = 0;
      this.right = 100;
      // debugger
      this.leftValue = 0;
      this.rightValu = 1;
      this.$bar.style.left = -1 + "px";
      this.$endbar.style.left = this.amountW + 1 + "px";

      this.$refs.rangeLine.style.width = 0 + "px";
      this.$refs.rangeLine2.style.width = 0 + "px";

      this.Lsilder = 0;
      this.Rsilder = this.amountW;
    },
    startMouseStart(e) {
      //pc 左滑块
      const vm = this;
      let flag = false;
      document.onmousemove = e => {
        let slidedis = e.pageX - vm.$ruler.offsetLeft; // 左滑块距离滑杆最左边点的距离

        if (slidedis < -1) {
          slidedis = 0;
        }
        if (slidedis+20 >= vm.Rsilder) {
          slidedis = vm.Rsilder-20
        }
        flag = true;//是否可以计算值
        vm.$bar.style.left = slidedis + "px";
        vm.Lsilder = slidedis;
        vm.left = slidedis;
        vm.$refs.rangeLine.style.width = slidedis + 1 + "px";
      };
      document.onmouseup = e => {
        document.onmousemove = null;
        document.onmouseup = null;
        if(!flag){
          return
        }
        vm.computeLeftValue(vm.left);
      };
    },

    startMouseEnd(e) {
      //pc 右滑块
      const vm = this;
      let flag = false;
      document.onmousemove = e => {
        let slidedis = e.pageX - vm.$ruler.offsetLeft; // 右滑块距离滑杆最左边点的距离
        // if (slidedis < 0) {
        //   slidedis = 20;
        // }
        if(slidedis > vm.amountW + 1){
          slidedis = vm.amountW 
        }
        if (slidedis-20 <= vm.Lsilder) {
          slidedis = vm.Lsilder + 20;
        }
        flag = true;
        vm.$endbar.style.left = slidedis + "px";
        vm.right = slidedis;
        vm.Rsilder = slidedis;
        vm.$refs.rangeLine2.style.width = vm.amountW - slidedis + "px";
      };
      document.onmouseup = e => {
        document.onmousemove = null;
        document.onmouseup = null;
        if (!flag) {
          return;
        }
        vm.computeRightValue(vm.right);
      };
    },

    startTouchstart(e) {
      //LCD 左滑块
      const vm = this;
      vm.startX = e.touches[0].pageX;
    },

    startTouchmove(e) {
      //LCD 左滑块
      const vm = this;
      let mouseMove;
      mouseMove = e.touches[0].pageX;
      vm.touchMove_can_deal=false;
      let slidedis = mouseMove - vm.$ruler.offsetLeft; // 左滑块距离滑杆最左边点的距离

      if (slidedis < -1 || slidedis > vm.amountW) {
        return;
      }
      if (slidedis >= vm.Rsilder) {
        return;
      }
      vm.touchMove_can_deal=true
      vm.$bar.style.left = slidedis + "px";
      vm.Lsilder = slidedis;
      vm.$refs.rangeLine.style.width = slidedis + "px";
      if (slidedis == -1) {
        slidedis = 0;
      }
      vm.left = slidedis;

      // vm.computeLeftValue(vm.left);
    },
    endTouchstart(e) {
      //LCD 右滑块
      const vm = this;
      vm.endX = e.touches[0].pageX;
    },
    endTouchmove(e) {
      //LCD 右滑块
      const vm = this;
      let mouseMove;
      mouseMove = e.touches[0].pageX;
      vm.touchMove_can_deal=false;
      let slidedis = mouseMove - vm.$ruler.offsetLeft; // 右滑块距离滑杆最左边点的距离
      if (slidedis < 0 || slidedis > vm.amountW + 1) {
        return;
      }
      if (slidedis <= vm.Lsilder) {
        return;
      }
      vm.touchMove_can_deal=true;
      vm.$endbar.style.left = slidedis + "px";
      vm.Rsilder = slidedis;
      vm.$refs.rangeLine2.style.width = vm.amountW - slidedis + "px";
      if (slidedis == vm.amountW + 1) {
        slidedis = vm.amountW;
      }
      vm.right = slidedis;
      // vm.computeRightValue(vm.right);
    },
    endTouch(val) {
      const vm = this;
      if(!vm.touchMove_can_deal){
        return
      }
      if (val) {
        vm.computeRightValue(vm.right);
      } else {
        vm.computeLeftValue(vm.left);
      }
    },
    zoom() {
      //放大   左减右加
      const vm = this;

      let slidedis = vm.Lsilder - 0.01 * vm.amountW; // 左滑块距离滑杆最左边点的距离
      if (slidedis < 0) {
        slidedis = -1;
      }
      vm.Lsilder = slidedis;

      let slidedis2 = vm.Rsilder + 0.01 * vm.amountW; // 右滑块距离滑杆最左边点的距离
      if (slidedis2 > vm.amountW + 1) {
        slidedis2 = vm.amountW + 1;
      }

      vm.Rsilder = slidedis2;

      vm.$bar.style.left = slidedis + "px";
      vm.$refs.rangeLine.style.width = slidedis + 1 + "px";

      vm.$endbar.style.left = slidedis2 + "px";
      vm.$refs.rangeLine2.style.width = vm.amountW - slidedis2 + "px";

      if (slidedis == -1) {
        slidedis = 0;
      }
      if (slidedis2 == vm.amountW + 1) {
        slidedis2 = vm.amountW;
      }

      this.$emit("changeValue", [
        (slidedis / this.amountW).toFixed(2),
        (slidedis2 / this.amountW).toFixed(2)
      ]);
    },
    reduce() {
      //缩小  左加右减
      const vm = this;

      let slidedis = vm.Lsilder + 0.01 * vm.amountW; // 左滑块距离滑杆最左边点的距离
      if (slidedis >= vm.Rsilder) {
        slidedis = vm.Rsilder - 0.01 * vm.amountW;
      }
      vm.Lsilder = slidedis;

      let slidedis2 = vm.Rsilder - 0.01 * vm.amountW; // 右滑块距离滑杆最左边点的距离
      if (slidedis2 <= vm.Lsilder) {
        slidedis2 = vm.Lsilder + 0.01 * vm.amountW;
      }

      vm.Rsilder = slidedis2;

      vm.$bar.style.left = slidedis + "px";
      vm.$refs.rangeLine.style.width = slidedis + 1 + "px";

      vm.$endbar.style.left = slidedis2 + "px";
      vm.$refs.rangeLine2.style.width = vm.amountW - slidedis2 + 0.5 + "px";

      this.$emit("changeValue", [
        (slidedis / this.amountW).toFixed(2),
        (slidedis2 / this.amountW).toFixed(2)
      ]);
    },

    computeLeftValue(val) {
      this.leftValue = (val / this.amountW).toFixed(2);
      this.$emit("changeValue", [this.leftValue, this.rightValue]);
    },
    computeRightValue(val) {
      this.rightValue = (val / this.amountW).toFixed(2);
      this.$emit("changeValue", [this.leftValue, this.rightValue]);
    }
  }
};
</script>

