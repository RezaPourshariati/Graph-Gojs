<script setup>
import { onMounted, ref, watch } from 'vue'
import go, { TextOverflow, Wrap } from 'gojs'
import axios from 'axios'

const clusterNumber = ref('')
const result = ref(null)
const nodes = ref([])
const relations = ref([])

let myDiagram

// Initialize the GoJS Diagram
function initDiagram() {
  const myTag = document.getElementById('myDiagramDiv')
  console.log(myTag)

  myDiagram = new go.Diagram('myDiagramDiv', {
    'undoManager.isEnabled': true,
    'layout': new go.LayeredDigraphLayout({
      direction: 90,
      layerSpacing: 150,
    }),
  })

  myDiagram.nodeTemplate = new go.Node('Auto')
      .add(new go.Shape('RoundedRectangle', { strokeWidth: 2, stroke: 'orange', fill: 'white', alignment: go.Spot.Center })
          .bind('fill', 'color')
          .bind('width', 'hadith', (hadith) => Math.max(Math.min(hadith.length * 2.5, 450), 250))  // adjust the multiplier as needed
          .bind('height', 'hadith', (hadith) => Math.max(Math.min(hadith.length * 1.5, 150), 85)))  // adjust the multiplier and max height as needed
      .add(new go.Panel('Vertical')
          .add(new go.TextBlock({
            margin: 8,
            stroke: '#333',
            font: 'bold 14pt sans-serif',
            textAlign: 'center',
            maxSize: new go.Size(400, 100),
            wrap: Wrap.Fit,
          })
              .bind('text', 'shortText')
              .bind('width', 'shortText', (hadith) => Math.max(Math.min(hadith.length * 2, 400), 200))  // adjust the multiplier as needed
              .bind('height', 'shortText', (hadith) => Math.max(Math.min(hadith.length * 1.2, 100), 50))
              .bind('maxLines', 'shortText', (hadith) => Math.max(Math.floor(hadith.length / 20), 2)))  // adjust the multiplier and max height as needed
          .add(new go.TextBlock({
            margin: 8,
            stroke: '#333',
            font: 'bold 14pt sans-serif',
            textAlign: 'center',
            visible: false,
            wrap: Wrap.Fit,
          })
              .bind('text', 'fullText')
              .bind('visible', 'showFullText')
              .bind('width', 'fullText', (hadith) => Math.max(Math.min(hadith.length * 2, 400), 200))
              .bind('height', 'fullText', (hadith) => Math.max(Math.min(hadith.length * 1.2, 100), 50))
              .bind('maxLines', 'fullText', (hadith) => Math.max(Math.floor(hadith.length / 20), 2))
          )
          .add(new go.TextBlock({
            margin: 8,
            stroke: 'blue',
            font: 'bold 14pt sans-serif',
            textAlign: 'center',
            isUnderline: true,
            click: (e, obj) => toggleReadMore(obj.part.data),
          })
              .bind('text', 'readMoreText')
              .bind('visible', 'showReadMore')
              .bind('width', 'readMoreText', (hadith) => Math.max(Math.min(hadith.length * 2, 400), 200))  // adjust the multiplier as needed
              .bind('height', 'readMoreText', (hadith) => Math.max(Math.min(hadith.length * 1.2, 100), 50))
              .bind('maxLines', 'readMoreText', (hadith) => Math.max(Math.floor(hadith.length / 20), 2))))

  myDiagram.linkTemplate = new go.Link({
    fromEndSegmentLength: 20,
    toEndSegmentLength: 20,
    relinkableFrom: true,
    relinkableTo: true,
    routing: go.Routing.Orthogonal,
    corner: 25,
  })
      .add(new go.Shape({ stroke: '#555555', strokeWidth: 4 }))
      .add(new go.Shape({ toArrow: 'Standard', stroke: '#555555', strokeWidth: 5 }))

  myDiagram.model = new go.GraphLinksModel(nodes.value, relations.value)

  new go.Overview('myOverviewDiv', { observed: myDiagram })
  new ZoomSlider(myDiagram)

  document.getElementById('zoomToFit').addEventListener('click', () => myDiagram.commandHandler.zoomToFit())
  document.getElementById('centerRoot').addEventListener('click', () => {
    myDiagram.scale = 1
    myDiagram.commandHandler.scrollToPart(myDiagram.findNodeForKey(1))
  })

  // document.getElementById('myZoomSlider').addEventListener('input', function () {
  //   myDiagram.scale = parseFloat(this.value);
  // })
}

function toggleReadMore(data) {
  const node = myDiagram.findNodeForData(data)
  if (node) {
    myDiagram.model.commit((m) => {
      m.set(data, 'showFullText', !data.showFullText)
      // m.set(data, 'showShortText', data.showFullText)
      m.set(data, 'showReadMore', !data.showFullText)
    })
  }
}

onMounted(() => {
  initDiagram()
})

// Fetch data and update the diagram
async function fetchClusterData() {
  try {
    const response = await axios.get(`http://localhost:5000/cluster/${clusterNumber.value}`)
    result.value = response.data
    nodes.value = response.data.nodes.map(node => {
      const maxLength = 200  // Adjust as needed
      return {
        ...node,
        shortText: node.hadith.length > maxLength ? node.hadith.slice(0, maxLength) : node.hadith,
        fullText: node.hadith,
        showFullText: false,
        showReadMore: node.hadith.length > maxLength,
        readMoreText: 'Read more'
      }
    })
    relations.value = response.data.relations
  }
  catch (error) {
    console.error('There was an error fetching the data:', error)
  }
}

// Watch nodes and relations for changes and update the diagram model
watch([nodes, relations], () => {
  if (myDiagram)
    myDiagram.model = new go.GraphLinksModel(nodes.value, relations.value)
})
</script>


<template>
  <div class="hadith-graph">
    <!--    <h1>Hadith Graph Data</h1> -->
    <div class="graph-control">
      <div class="zoom-buttons">
        <button id="zoomToFit">
          Zoom to Fit
        </button>
        <button id="centerRoot">
          Center on root
        </button>
      </div>

      <div class="input-cluster">
        <input
            v-model="clusterNumber"
            class="cluster-number"
            type="number"
            placeholder="Enter cluster number"
        >
        <button
            class="fetch-button"
            @click="fetchClusterData"
        >
          Get Cluster Data
        </button>
      </div>
    </div>
  </div>

  <div class="parent-diagram">
    <div
        id="myDiagramDiv"
    />
    <!--  Overview map  -->
    <div
        id="myOverviewDiv"
        style="width:180px; height:150px; border: 3px solid mediumpurple"
    />
    <!--  zoom slider (search)  -->
    <!--    <input type="range" id="myZoomSlider" min="0.1" max="2" step="0.1" value="1"/> -->

    <!--  zoom slider  -->
    <!--    <div id="zoomSlider" style="width:150px; height:150px;"></div> -->
  </div>
</template>

<style scoped>
.parent-diagram {
  position: relative;
  height: calc(100vh - 115px);
  width: calc(100vw - 8%);
  margin: 0 auto;
}

.hadith-graph {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 1.5rem auto;
}

.graph-control {
  width: 800px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.input-cluster {
  display: flex;
  align-items: center;
  gap: 10px;
}

.fetch-button {
  font-family: "JetBrains Mono Light", ui-monospace;
  font-size: 1rem;
  color: #450a0a;
  background: #dfadfc;
  font-weight: bold;
  border: none;
  padding: 8px 10px;
  border-radius: 5px;
}

#myDiagramDiv {
  border: 3px solid green;
  height: 100%;
  width: 100%;
  border-radius: 6px;
  margin: 0 auto;
}

#myOverviewDiv {
  position: absolute;
  top: 0;
  left: 0;
  margin: 0 auto;
  border-radius: 6px;;
  z-index: 4;
}

.zoom-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.zoom-buttons button {
  font-family: "JetBrains Mono Light", ui-monospace;
  font-size: 1rem;
  color: #450a0a;
  background: #dfadfc;
  font-weight: bold;
  border: none;
  padding: 8px 10px;
  border-radius: 5px;
}

.zoom-buttons button:hover {
  background: #c597fc;
  transition: 0.2s ease;
}

.hadith-graph h1 {
  font-size: 40px;
  color: #22518c;
}

.fetch-button:hover {
  background: #c597fc;
  transition: 0.2s ease;
}

.cluster-number {
  padding: 7px;
  border: 2px solid #3b82f6;
  border-radius: 6px;
  outline: none;
}
</style>