<script setup lang="ts">
import 'primeflex/primeflex.css'
import 'primeflex/themes/primeone-light.css'
import HadithGraph from '@/component/HadithGraph.vue'
import { graphService } from '@/service/GraphService'
</script>

<template>
  <HadithGraph
      :graph-service="graphService"
  />
</template>

<style>
#app {
  height: 100vh;
}
</style>
