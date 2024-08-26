<script setup lang="ts">
import 'primeflex/primeflex.css'
import 'primeflex/themes/primeone-light.css'
// import HadithGraph from '@/component/HadithGraph.vue'
// import AnsabTreeGraphLayout from "@/component/AnsabTreeGraphLayout.vue";
import AnsabTreeGraph from "@/component/AnsabTreeGraph.vue";
import {graphService} from '@/service/GraphService'
</script>

<template>
  <AnsabTreeGraph/>
</template>

<style>
#app {
  height: 100vh;
}
</style>
