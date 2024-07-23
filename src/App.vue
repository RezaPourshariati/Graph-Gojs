<script setup>
import { onMounted, ref, watch } from 'vue'
import go from 'gojs'
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

  myDiagram.nodeTemplate = new go.Node('Auto', {
    // selectionObjectName: 'SCROLLER',
    // resizable: true,
    // resizeObjectName: 'SCROLLER',
    // portSpreading: go.PortSpreading.None,
  })
      .add(
          new go.Shape('RoundedRectangle', {
            strokeWidth: 2,
            stroke: 'orange',
            fill: 'transparent',
            // background: 'transparent', didn't work
          })
              .bind(new go.Binding('width', 'text', (text) => {
                const textLength = text ? text.length : 0
                const minWidth = 80 // Minimum width for the node
                return Math.max(minWidth, textLength * 5) // we can adjust it
              }))
              // .bind('fill', 'color')
              .bind(new go.Binding('height', 'text', (text) => {
                const lineHeight = 20 // Assuming each line of text occupies 20 units of height
                const numOfLines = text ? Math.ceil(text.length / 20) : 1
                return Math.max(50, numOfLines * lineHeight) // we can adjust it
              })),
          new go.Panel('Vertical', {
            background: 'transparent',
            // padding: 8,
          })
              .add(new go.TextBlock('HadithId Link', { // ------------ Id Link
                margin: new go.Margin(8, 0, 0, 8),
                // background: 'yellow',
                alignment: go.Spot.Left,
                stroke: '#ff006e',
                font: 'bold 12pt JetBrains Mono Light',
                isMultiline: true,
                textAlign: 'center',
                // maxSize: new go.Size(350, 100), // Check
                cursor: 'pointer',
                // wrap: go.TextBlock.WrapFit, // Check
                click(e, obj) { // click event handler
                  const node = obj.part
                  if (node) {
                    const nodeId = node.data.hadithId // Assuming 'hadithId' is the id of the node
                    window.open(`https://hadith.inoor.ir/fa/hadith/${nodeId}`, '_blank')
                  }
                },
              }).bind('text', 'hadithId'))
              // Ending the last add

              .add(new go.Shape('MinusLine', {
                // start: new go.Point(0, 0), // start at top left
                // end: new go.Point(500, 0), // end at top right
                margin: new go.Margin(-10, 0, -25, 0),
                stroke: 'orange', // orange color for the top border
                strokeWidth: 2, // width of the top border
                background: 'transparent',
                width: 350,
                maxWidth: 400,
              }))

              .add(new go.Panel('Auto', {
                background: 'transparent',
                margin: 0,
                // defaultRowSeparatorStroke: '', // Check
              })
                  .bind('background', 'color')
                  .add(new go.Shape('RoundedRectangle', {
                        strokeWidth: 0,
                        margin: new go.Margin(0, 2, 0, 2),
                        stroke: 'orange',
                        fill: 'transparent',
                        width: 350,
                        maxWidth: 400,
                        // background: 'transparent', // didn't work
                      })
                          .bind(new go.Binding('width', 'text', (text) => {
                            const textLength = text ? text.length : 0
                            const minWidth = 80 // Minimum width for the node
                            return Math.max(minWidth, textLength * 5) // we can adjust it
                          }))
                          // .bind('fill', 'color')
                          .bind(new go.Binding('height', 'text', (text) => {
                            const lineHeight = 20 // Assuming each line of text occupies 20 units of height
                            const numOfLines = text ? Math.ceil(text.length / 20) : 1
                            return Math.max(50, numOfLines * lineHeight) // we can adjust it
                          })),
                  )
                  .add(new go.TextBlock({
                        margin: new go.Margin(10, 20, 10, 20),
                        stroke: '#333',
                        font: 'bold 14pt sans-serif',
                        width: 320,
                        maxWidth: 400,
                        maxLines: 5,
                        isMultiline: true,
                        textAlign: 'center',
                        // wrap: go.TextBlock.WrapFit, // Check
                      })
                          .bind('text', 'hadith'),
                  )), // End of TextBlock
      )
  // New code for link

  // ------------------------------------------------------------------------------
  // .add(new go.Binding('toolTip', 'hadith', function(hadith, node) {
  //   return go.GraphObject.make(go.Adornment, 'Auto',
  //     go.GraphObject.make(go.Shape, { fill: '#FFFFCC' }),
  //     go.GraphObject.make(go.TextBlock, { margin: 4 }, hadith)
  //   );
  // }))
  // .bind('width', 'hadithId', (hadith) => Math.max(Math.min(hadith.length  2, 400), 200))
  // .bind('height', 'hadithId', (hadith) => Math.max(Math.min(hadith.length  1.2, 100), 50))
  // .bind('maxLines', 'hadithId', (hadith) => Math.max(Math.floor(hadith.length / 20), 2)))

  myDiagram.linkTemplate = new go.Link({
    fromEndSegmentLength: 10,
    toEndSegmentLength: 100,
    relinkableFrom: true,
    relinkableTo: true,
    routing: go.Routing.Orthogonal,
    corner: 45,
    // curve: go.Curve.JumpGap,
    // curviness: 100,
  })
      .add(new go.Shape({ strokeWidth: 2 }).bind('stroke', 'color'))
      .add(new go.Shape({ toArrow: 'Standard', strokeWidth: 2 }).bind('stroke', 'color').bind('fill', 'color'))

  myDiagram.model = new go.GraphLinksModel(nodes.value, relations.value)

  const Overview = new go.Overview('myOverviewDiv', { observed: myDiagram })
  const zoomSlider = new ZoomSlider(myDiagram, {
    orientation: 'horizontal',
    alignment: go.Spot.TopRight,
  })

  document.getElementById('zoomToFit').addEventListener('click', () => myDiagram.commandHandler.zoomToFit())
  document.getElementById('centerRoot').addEventListener('click', () => {
    myDiagram.scale = 1
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
async function fetchClusterData() {
  try {
    const response = await axios.get(`http://${window.location.hostname}:5000/cluster/${clusterNumber.value}`)
    result.value = response.data
    nodes.value = response.data.nodes
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
  <div class="navbar">
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

<style>
.zoomSlider {
  position: absolute;
  top: -55px !important;
  right: 10px !important;
}

.navbar {
  position: relative;
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

/* ---------- Diagram */

.parent-diagram {
  position: relative;
  height: calc(100vh - 115px);
  width: calc(100vw - 8%);
  margin: 0 auto;
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
