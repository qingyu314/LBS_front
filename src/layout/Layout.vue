<script setup>
import Header from "@/components/header.vue";
</script>

<template>
  <!--    头部-->
  <Header/>
  <!--主体-->
  <div style="display: flex">
    <!--      内容区域-->
    <RouterView style="flex: 1"/>
  </div>
</template>

<style scoped>

</style>