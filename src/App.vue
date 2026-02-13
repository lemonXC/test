<template>
  <div id="app">
    <router-view v-slot="{ Component, route }">
      <component :is="Component" :key="route.path" />
    </router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
}
</script>

<style>
#app {
  width: 100%;
  min-height: 100vh;
}

/* 滑动动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-enter-to,
.slide-leave-from {
  transform: translateX(0);
  opacity: 1;
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: scale(1);
}

/* 无动画效果 */
.none-enter-active,
.none-leave-active {
  transition: none !important;
}

.none-enter-from,
.none-leave-to,
.none-enter-to,
.none-leave-from {
  opacity: 1;
  transform: none;
}

/* 确保动画期间的层级关系 */
.slide-enter-active,
.slide-leave-active,
.fade-enter-active,
.fade-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
}

/* 无动画的页面保持正常文档流 */
.none-enter-active,
.none-leave-active {
  position: static !important;
  width: auto !important;
  height: auto !important;
}



</style>
