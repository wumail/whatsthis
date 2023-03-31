<script setup lang="ts">
import Main from "./utils/archive/main.vue";
import Canvas from "./views/canvas.vue";
</script>

<template>
  <!-- <Main /> -->
  <Canvas />
</template>

<style>
html,
body {
  margin: 0;
  background-color: white;
}
#app {
  width: 100%;
  height: 100%;
  top: 10px;
  position: relative;
}
#main-wrap {
  width: 100%;
  height: 100%;
}
</style>
