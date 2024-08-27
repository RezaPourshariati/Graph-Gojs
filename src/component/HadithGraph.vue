<script setup lang="ts">
import go from 'gojs'
import {onMounted, ref, watch} from 'vue'
import Slider from 'primevue/slider'
import type {IGraphService} from './IGraphService.ts'
import {graphService} from '@/service/GraphService'

const props = defineProps<{
  graphService: IGraphService
}>()

const clusterNumber = ref(1400)
const nodes = ref([])
const relations = ref([])
const sliderValue = ref(20)

let graphDiagram = null
const shapeWidth = 350

// Watch nodes and relations for changes and update the diagram model
watch([nodes, relations], () => {
  updateModel()
})

// Watch the PrimeVue slider value and update the diagram scale
watch(sliderValue, (newValue) => {
  if (graphDiagram)
    graphDiagram.scale = valueToScale(newValue)
})

// Initialize the GoJS Diagram
function initDiagram() {
  graphDiagram = new go.Diagram('graphDiv', {
    layout: new go.LayeredDigraphLayout({
      direction: 90,
      layerSpacing: 150,
    }),
  })

  graphDiagram.nodeTemplate = new go.Node('Auto', {})
      .add(
          new go.Shape('Rectangle', {
            margin: new go.Margin(0, 0, 0, 0),
            strokeWidth: 1,
            stroke: 'orange',
            fill: 'transparent',
            stretch: go.Stretch.Fill,
            // background: 'transparent', didn't work
          })
              .bind(new go.Binding('height', 'text', (text) => {
                const lineHeight = 20 // Assuming each line of text occupies 20 units of height
                const numOfLines = text ? Math.ceil(text.length / 20) : 1
                return Math.min(20, numOfLines * lineHeight) // we can adjust it
              })),
          new go.Panel('Table', {
            background: 'transparent',
            defaultAlignment: go.Spot.Left,
            defaultRowSeparatorStroke: "orange",
          })
              .addColumnDefinition(0, {width: 350, separatorStrokeWidth: 1, separatorStroke: "orange"})
              .addRowDefinition(0, {separatorStrokeWidth: 1, background: '#ffffff', separatorStroke: "orange"})
              .addRowDefinition(1, {separatorStrokeWidth: 1})
              .add(new go.TextBlock('HadithId Link', { // ------------ Id Link
                row: 0,
                column: 0,
                margin: new go.Margin(8, 8, 8, 8),
                // background: 'yellow',
                alignment: go.Spot.Left,
                stroke: '#ff006e',
                font: 'bold 12pt serif',
                isMultiline: true,
                cursor: 'pointer',
                stretch: go.Stretch.Fill,
                // wrap: go.TextBlock.WrapFit, // Check
                click(e, obj) { // click event handler
                  const node = obj.part
                  if (node) {
                    const nodeId = node.data.hadithId // Assuming 'hadithId' is the id of the node
                    window.open(graphService.getUrl(nodeId), '_blank')
                  }
                },
                // position: new go.Point(10, -38),
              }).bind('text', 'hadithId'))
              .add(new go.Panel('Auto', {
                // margin: 0,
                row: 1,
                column: 0,
                background: 'transparent',
                alignment: go.Spot.Center,
                // position: new go.Point(2, 0),
              })
                  .bind('background', 'color')
                  .add(new go.Shape('Rectangle', {
                        strokeWidth: 0,
                        // stroke: 'orange',
                        fill: 'transparent',
                        width: shapeWidth,
                      }),
                  )
                  .add(new go.TextBlock({
                        margin: new go.Margin(10, 0, 10, 0),
                        stroke: '#333',
                        font: 'bold 14pt sans-serif',
                        width: 320,
                        isMultiline: true,
                        textAlign: 'right',
                        maxLines: 5,
                      })
                          .bind('text', 'hadith'),
                  )
              ), // End of TextBlock
      )

  graphDiagram.linkTemplate = new go.Link({
    fromEndSegmentLength: 10,
    toEndSegmentLength: 100,
    relinkableFrom: true,
    relinkableTo: true,
    routing: go.Routing.Orthogonal,
    corner: 15,
  })
      .add(new go.Shape({strokeWidth: 1})
          .bind('stroke', 'color'))
      .add(new go.Shape({
        toArrow: 'Standard',
        strokeWidth: 1,
      }).bind('stroke', 'color')
          .bind('fill', 'color'))

  graphDiagram.model = new go.GraphLinksModel(nodes.value, relations.value)

  const overView = new go.Overview('overviewDiv', {observed: graphDiagram})
  // Sync the PrimeVue slider with the ZoomSlider
  syncSliderWithZoomSlider()
  // Listening to viewport bounds changes, which include zoom and pan events
  // graphDiagram.addDiagramListener('ViewportBoundsChanged', (_e) => {
  //   calculateOverviewMap()
  // })
}

function onCenterRoot() {
  graphDiagram.scale = 1
  graphDiagram.commandHandler.scrollToPart(graphDiagram.findNodeForKey(1))
}

// Convert scale to slider value
function scaleToValue(scale) {
  const minScale = 0
  const maxScale = 5
  const minValue = -50
  const maxValue = 100

  return ((scale - minScale) / (maxScale - minScale)) * (maxValue - minValue) + minValue
}

// Convert slider value to scale
function valueToScale(value) {
  const minScale = 0
  const maxScale = 5
  const minValue = -50
  const maxValue = 100

  return ((value - minValue) / (maxValue - minValue)) * (maxScale - minScale) + minScale
}

function syncSliderWithZoomSlider() {
  graphDiagram.addDiagramListener('ViewportBoundsChanged', (_e) => {
    calculateOverviewMap() // Listening to viewport bounds changes for overview map zoom and bounds.
    // Update PrimeVue slider when ZoomSlider changes
    if (graphDiagram) {
      const scale = graphDiagram.scale
      sliderValue.value = scaleToValue(scale)
    }
  })
}

function calculateOverviewMap() {
  // console.log('Calculation called.')
  setTimeout(() => {
    const parentCanvasElement = document.querySelector('#graphDiv>div') as HTMLElement
    const canvasElement = document.querySelector('#graphDiv>div>div') as HTMLElement
    const canvasWidth = canvasElement.offsetWidth === 1
        ? parentCanvasElement.offsetWidth
        : canvasElement.offsetWidth
    const canvasHeight = canvasElement.offsetHeight === 1
        ? parentCanvasElement.offsetHeight
        : canvasElement.offsetHeight
    const overViewElement = document.getElementById('overviewDiv')
    const height = 100
    overViewElement.style.width = `${canvasWidth * height / canvasHeight}px`
    overViewElement.style.height = `${height}px`
  }, 0)
}

function updateModel() {
  if (graphDiagram)
    delete graphDiagram.model

  graphDiagram.model = new go.GraphLinksModel(nodes.value, relations.value)
  calculateOverviewMap()
}

// Fetch data and update the diagram
async function fetchClusterData() {
  try {
    const result = await props.graphService.getData(clusterNumber.value)
    nodes.value = result.nodes
    relations.value = result.relations
  } catch (error) {
    console.error('There was an error fetching the data:', error)
  }
}

onMounted(() => {
  initDiagram()
  fetchClusterData()
})
</script>

<template>
  <div class="flex flex-column relative h-full">
    <div
        class="relative flex justify-content-between align-items-center my-2 mx-2"
    >
      <div class="flex align-items-center gap-2">
        <Button
            id="zoomToFit"
            @click="graphDiagram.commandHandler.zoomToFit()"
        >
          Zoom to Fit
        </Button>
        <Button
            @click="onCenterRoot()"
        >
          Center on root
        </Button>
      </div>
      <div class="flex align-items-center gap-2">
        <InputNumber
            v-model="clusterNumber"
            input-id="minmax-buttons"
            mode="decimal"
            show-buttons
            :min="3"
            :max="7999"
            fluid
            class=""
            type="number"
            @keyup.enter="fetchClusterData"
        />
        <Button
            class="fetch-button"
            @click="fetchClusterData"
        >
          Show Diagram
        </Button>
        <div class="w-10rem flex flex-column align-items-center gap-2 p-2 border-2 border-gray-300 border-round-sm">
          <div class="w-8rem py-2">
            <Slider
                v-model="sliderValue"
                class="w-full"
                :min="-50"
                :max="100"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="graph-container flex-auto m-2 relative">
      <div
          id="graphDiv"
          class="h-full border-1 border-gray-500"
      />
      <div
          id="overviewDiv"
          class="absolute top-0 left-0 z-4 border-1 border-gray-700"
          style="height: 10%; width: 10%"
      />
    </div>
  </div>
</template>

<style scoped>
</style>
