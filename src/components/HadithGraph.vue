<script setup>
import {ref} from 'vue'
import axios from 'axios'
import {defineEmits} from 'vue'

const clusterNumber = ref('');
const result = ref(null);

const emit = defineEmits(['nodes', 'relations'])

const fetchClusterData = async () => {
  try {
    const response = await axios.get(`http://localhost:5000/cluster/${clusterNumber.value}`);
    result.value = response.data;
    // console.log("-------", response)
    emit('nodes', response.data.nodes)
    emit('relations', response.data.relations)

  } catch (error) {
    console.error('There was an error fetching the data:', error);
    // result.value = 'Error fetching data';
  }
};
</script>

<template>
  <div>
    <h1>Hadith Graph Data</h1>
    <input v-model="clusterNumber" type="number" placeholder="Enter cluster number"/>
    <button @click="fetchClusterData">Get Cluster Data</button>
    <!--    <pre>{{ result }}</pre>-->
  </div>
</template>
