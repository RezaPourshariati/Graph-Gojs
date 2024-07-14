<script setup>
import {onMounted, ref, watch} from "vue";
import go from 'gojs'
import axios from "axios";

const clusterNumber = ref('');
const result = ref(null);
const nodes = ref([]);
const relations = ref([]);

let myDiagram;

// Initialize the GoJS Diagram
function initDiagram() {
  const myTag = document.getElementById('myDiagramDiv')
  console.log(myTag)

  myDiagram = new go.Diagram("myDiagramDiv", {
    "undoManager.isEnabled": true,
    layout: new go.LayeredDigraphLayout({
      direction: 90,
      layerSpacing: 150,
    })
  });

  myDiagram.nodeTemplate = new go.Node("Auto")
      .add(new go.Shape("RoundedRectangle", {strokeWidth: 0, fill: "white", width: 440, height: 130})
          .bind("fill", "color"))
      .add(new go.TextBlock({
        margin: 8,
        stroke: "#333",
        font: "bold 14pt sans-serif",
        width: 350,
        height: 80,
        maxLines: 5,
        isMultiline: true,
        // text: "verticalAlignment: center",
        // text: "alignment: Center",
        textAlign: "center",
        wrap: go.Wrap.Fit
      })
          .bind("text", "hadith"))

  myDiagram.linkTemplate = new go.Link({
    fromEndSegmentLength: 20,
    toEndSegmentLength: 20,
    relinkableFrom: true,
    relinkableTo: true,
    routing: go.Routing.Orthogonal,
    corner: 25
  })
      .add(new go.Shape({stroke: '#555555', strokeWidth: 4}))
      .add(new go.Shape({toArrow: 'Standard', stroke: '#555555', strokeWidth: 5}))

  myDiagram.model = new go.GraphLinksModel(nodes.value, relations.value)

  new go.Overview("myOverviewDiv", {observed: myDiagram})
  new ZoomSlider(myDiagram)

  document.getElementById("zoomToFit").addEventListener("click", () => myDiagram.commandHandler.zoomToFit());
  document.getElementById("centerRoot").addEventListener("click", () => {
    myDiagram.scale = 1;
    myDiagram.commandHandler.scrollToPart(myDiagram.findNodeForKey(1))
  })

  // document.getElementById('myZoomSlider').addEventListener('input', function () {
  //   myDiagram.scale = parseFloat(this.value);
  // })
}

onMounted(() => {
  initDiagram()
})

// Fetch data and update the diagram
const fetchClusterData = async () => {
  try {
    const response = await axios.get(`http://172.16.8.51:5000/cluster/${clusterNumber.value}`)
    result.value = response.data;
    nodes.value = response.data.nodes;
    relations.value = response.data.relations;
  } catch (error) {
    console.error('There was an error fetching the data:', error)
  }
}

// Watch nodes and relations for changes and update the diagram model
watch([nodes, relations], () => {
  if (myDiagram) {
    myDiagram.model = new go.GraphLinksModel(nodes.value, relations.value)
  }
})
</script>


<template>
  <!--  <div class="hadith">-->
  <!--    <hadith-graph @relations="handleRelations" @nodes="handleNodes"/>-->
  <!--  </div>-->
  <div class="hadith">
    <h1>Hadith Graph Data</h1>
    <input v-model="clusterNumber" class="input-text" type="number" placeholder="Enter cluster number"/>
    <button @click="fetchClusterData">Get Cluster Data</button>
    <!--      <pre>{{ result }}</pre>-->
  </div>


  <div class="parent-diagram">
    <div id="myDiagramDiv" style="width:1000px; height:80vh;"></div>

    <!--  Overview map  -->
    <div id="myOverviewDiv" style="width:150px; height:150px; border: 5px solid orangered"></div>
    <!--  zoom slider (search)  -->
    <!--    <input type="range" id="myZoomSlider" min="0.1" max="2" step="0.1" value="1"/>-->

    <!--  zoom slider  -->
    <!--    <div id="zoomSlider" style="width:150px; height:150px;"></div>-->

    <p class="button-zoom">
      <button id="zoomToFit">Zoom to Fit</button>
      <button id="centerRoot">Center on root</button>
    </p>
  </div>
</template>


<style scoped>
.parent-diagram {
  position: relative;
}

#myZoomSlider {
  position: absolute;
  bottom: 15px;
  right: 15px;
  z-index: 99;
}

#myDiagramDiv {
  border: 4px solid green;
  margin: 0 auto;
}

#myOverviewDiv {
  margin: 0 auto;
}

.button-zoom {
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-bottom: 3rem;
}

.button-zoom button {
  font-family: "JetBrains Mono Light", ui-monospace;
  font-size: 1rem;
  background: #dfadfc;
  font-weight: bold;
  border: none;
  padding: 1.2rem;
  border-radius: 5px;
}

.button-zoom button:hover {
  background: #c597fc;
  transition: 0.2s ease;
}

.hadith {
  display: flex;
  flex-direction: column;
  gap: 5px;
//justify-content: center; align-items: center;
}

.input-text {
  padding: 7px;
}
</style>
