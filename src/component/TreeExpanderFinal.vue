<script setup lang="ts">
import go from 'gojs'
import treeModelData from '../tree/tree2.json'
import Slider from "primevue/slider";
import {onMounted, ref, watch} from "vue";

let graphDiagram
let selectedKey = -1
const nodeHeightMargin = 5
const sliderValue = ref(1)
const horizontalLayout = ref(false)
const nodeNumber = ref()

// Watch the PrimeVue slider value and update the diagram scale
watch(sliderValue, (newValue) => {
  if (graphDiagram)
    graphDiagram.scale = valueToScale(newValue)
})

watch(() => treeModelData, () => {
  updateModel()
})

function init() {
  graphDiagram = new go.Diagram('DiagramDiv', {
    // initialAutoScale: go.AutoScale.UniformToFill,
    allowMove: false,
    initialScale: 1,
    layout: new go.TreeLayout({
      angle: horizontalLayout.value ? 0 : 90,
      nodeSpacing: 5,
      layerSpacing: 30,
      arrangement: go.TreeArrangement.FixedRoots
    })
  });

  graphDiagram.div.setAttribute('class', 'scroll');

  const tool = graphDiagram.commandHandler;

  tool.decreaseZoom = () => {
    console.log('my decrease zoom function!');
    if (graphDiagram.scale < 0.3) return;
    go.CommandHandler.prototype.decreaseZoom.call(tool);
  };

  tool.canDecreaseZoom = () => graphDiagram.scale >= 0.3;

  tool.increaseZoom = () => {
    console.log('my increase zoom function!');
    if (graphDiagram.scale > 2) return;
    go.CommandHandler.prototype.increaseZoom.call(tool);
  };

  tool.canIncreaseZoom = () => graphDiagram.scale <= 2;

  const nodeClicked = (e, obj) => {
    const key = obj.part.data.key;
    clickedOnNode(key);
  };

  const nodeRightClicked = (key, xPos, yPos) => {
    const node = graphDiagram.findNodeForKey(key);
    if (node && node.data.haveRelation === 'true') {
      console.log(node.data.relationIds);
    }
  };

  function showContextMenu(obj, diagram) {
    const {x, y} = diagram.lastInput.viewPoint;

    if (obj) {
      const key = obj.part.data.key;
      nodeRightClicked(key, x, y);
    }
  }

  graphDiagram.contextMenu = new go.HTMLInfo({
    show: (obj, diagram) => showContextMenu(obj, diagram)
  });

  const nodeOpenMenuClicked = (e, obj) => {
    const {x, y} = graphDiagram.lastInput.viewPoint;

    if (obj) {
      const node = obj.part;
      const key = node.data.key;
      const shape = node.findObject('SHAPE');
      const textBlock = node.findObject('TextBlock');
      const h1 = shape ? shape.height : 0;
      const h2 = 40; // Height for textBlock

      nodeRightClicked(key, x + 5, y + h1 + h2 + nodeHeightMargin);
    }
  }

  NodeTemplate()
  // graphDiagram.nodeTemplate = new go.Node('Vertical', {
  //   selectionChanged: nodeSelectionChanged,
  //   isTreeExpanded: true, // Initially expand all nodes
  // })
  //     .add(
  //         new go.Panel('Auto')
  //             .add(
  //                 new go.Shape({
  //                   name: 'SHAPE',
  //                   fill: 'transparent',
  //                   stroke: 'transparent',
  //                   // strokeWidth: 1,
  //                 }),
  //                 new go.TextBlock({
  //                   font: '13px Iransans, Arial, sans-serif',
  //                   stroke: '#212121',
  //                   margin: 3,
  //                 }).bind('text', 'title'),
  //             ),
  //         // Expand/collapse button with custom click behavior
  //         go.GraphObject.make('TreeExpanderButton', {
  //           'ButtonBorder.figure': 'Circle',
  //         })
  //     )

  graphDiagram.linkTemplate = new go.Link({
    fromEndSegmentLength: 10,
    toEndSegmentLength: 10,
    relinkableFrom: true,
    relinkableTo: true,
    routing: go.Routing.Orthogonal,
    corner: 10,
  })
      .add(new go.Shape({strokeWidth: 1}))
      .add(new go.Shape({
        toArrow: 'Standard',
        strokeWidth: 1,
      }));

  graphDiagram.model = new go.TreeModel({
    isReadOnly: true,
    nodeDataArray: treeModelData
  })

  // Override the default doKeyDown method to handle custom key commands
  graphDiagram.commandHandler.doKeyDown = function () {
    const e = graphDiagram.lastInput

    switch (e.key) {
      case 'ArrowUp':
        goToParent()
        break
      case 'ArrowDown':
        goToFirstChild()
        break
      case 'ArrowLeft':
        goToPreviousSibling()
        break
      case 'ArrowRight':
        goToNextSibling()
        break
      default:
        // Call the base method
        go.CommandHandler.prototype.doKeyDown.call(this)
        break
    }
  }

  const overView = new go.Overview('overviewDiv', {observed: graphDiagram})

  syncSliderWithZoomSlider()
}

// Function to determine the node layout type
function nodeLayoutType() {
  return horizontalLayout.value ? 'Horizontal' : 'Vertical';
}

// Function to update the node template dynamically
function NodeTemplate() {
  graphDiagram.nodeTemplate = new go.Node(nodeLayoutType(), {
    selectionChanged: nodeSelectionChanged,
    isTreeExpanded: true, // Initially expand all nodes
  })
      .add(
          new go.Panel('Auto')
              .add(
                  new go.Shape({
                    name: 'SHAPE',
                    fill: 'transparent',
                    stroke: 'transparent',
                  }),
                  new go.TextBlock({
                    font: '13px Iransans, Arial, sans-serif',
                    stroke: '#212121',
                    margin: 3,
                  }).bind('text', 'title'),
              ),
          go.GraphObject.make('TreeExpanderButton', {
            'ButtonBorder.figure': 'Circle',
          })
      );
}

// Function to toggle the layout and node type
function changeLayoutAngleAndNodeType() {
  graphDiagram.startTransaction("toggle layout and node type")
  horizontalLayout.value = !horizontalLayout.value
  const currentLayout = graphDiagram.layout

  if (currentLayout instanceof go.TreeLayout)
    currentLayout.angle = horizontalLayout.value ? 0 : 90

  // Re-layout to apply the new angle
  graphDiagram.layoutDiagram(true)
  NodeTemplate() // update creating node template (node type)
  onCenterRoot()
  calculateOverviewMap()
  graphDiagram.commitTransaction("toggle layout and node type")
}

function onCenterRoot() {
  graphDiagram.scale = 1
  graphDiagram.commandHandler.scrollToPart(graphDiagram.findNodeForKey(1))
}

function nodeSelectionChanged(_node) {
  console.log('selection changed.')
}

function goToNode() {
  if (!nodeNumber.value) {
    console.log('Please enter a valid node number.')
    return
  }

  const nodeData = graphDiagram.findNodeForKey(nodeNumber.value)
  if (nodeData) {
    graphDiagram.select(nodeData) // Select the node
    graphDiagram.centerRect(nodeData.actualBounds) // Center on the selected node
    document.getElementById('nodeNumberInput').focus()
  } else {
    console.log('Node not found. Please enter a valid node number.')
  }
}

function scaleToValue(scale) {
  const minScale = 0.1
  const maxScale = 5
  const minValue = -50
  const maxValue = 100

  return ((scale - minScale) / (maxScale - minScale)) * (maxValue - minValue) + minValue
}

// Convert slider value to scale
function valueToScale(value) {
  const minScale = 0.1
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
    const parentCanvasElement = document.querySelector('#DiagramDiv>div') as HTMLElement
    const canvasElement = document.querySelector('#DiagramDiv>div>div') as HTMLElement
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

function goToParent() {
  const selectedNode = graphDiagram.selection.first()
  if (!selectedNode)
    return

  const parentNode = selectedNode.findTreeParentNode()
  if (parentNode) {
    graphDiagram.select(parentNode)
    graphDiagram.scrollToRect(parentNode.actualBounds)
  }
}

function goToFirstChild() {
  const selectedNode = graphDiagram.selection.first()
  if (!selectedNode)
    return

  const firstChild = selectedNode.findTreeChildrenNodes().first()
  if (firstChild) {
    graphDiagram.select(firstChild)
    graphDiagram.scrollToRect(firstChild.actualBounds)
  }
}

function goToPreviousSibling() {
  const selectedNode = graphDiagram.selection.first()
  if (!selectedNode)
    return

  const parentKey = selectedNode.data.parent
  if (parentKey) {
    const siblings = graphDiagram.model.nodeDataArray.filter(node => node.parent === parentKey)
    const selectedKey = selectedNode.data.key

    // Find the index of the selected sibling
    const index = siblings.findIndex(sibling => sibling.key === selectedKey)

    if (index > 0) { // Check if there is a previous sibling
      const prevSibling = siblings[index - 1]
      const findNodeForKey = graphDiagram.findNodeForKey(prevSibling.key)
      graphDiagram.select(findNodeForKey)
      graphDiagram.scrollToRect(findNodeForKey.actualBounds)
      // graphDiagram.centerRect(graphDiagram.findNodeForKey(prevSibling.key).actualBounds)
    }
  }
}

function goToNextSibling() {
  const selectedNode = graphDiagram.selection.first()
  if (!selectedNode)
    return

  const parentKey = selectedNode.data.parent
  if (parentKey) {
    const siblings = graphDiagram.model.nodeDataArray.filter(node => node.parent === parentKey)
    const selectedKey = selectedNode.data.key

    // Find the index of the selected sibling
    const index = siblings.findIndex(sibling => sibling.key === selectedKey)

    if (index >= 0 && index < siblings.length - 1) { // Check if there is a next sibling
      const nextSibling = siblings[index + 1]
      const findNodeForKey = graphDiagram.findNodeForKey(nextSibling.key)
      graphDiagram.select(findNodeForKey)
      graphDiagram.scrollToRect(findNodeForKey.actualBounds) // Scroll to the first node to ensure it is visible
      // graphDiagram.centerRect(graphDiagram.findNodeForKey(nextSibling.key).actualBounds)
    }
  }
}

function updateModel() {
  if (graphDiagram)
    delete graphDiagram.model

  graphDiagram.model = new go.TreeModel({
    isReadOnly: true,
    nodeDataArray: treeModelData
  })
  calculateOverviewMap()
}

onMounted(() => {
  setTimeout(() => {
    onCenterRoot()
  }, 100)
})

// ---------------------------------------------------------------------------------- Functions for Qt App

function zoomToFit() {
  graphDiagram.commandHandler.zoomToFit()
}

function scale(scale) {
  graphDiagram.scale = scale
}

function scrollToNode(key) {
  const node = graphDiagram.findNodeForKey(key)
  if (node !== null)
    graphDiagram.scrollToRect(node.actualBounds)
}

function clickedOnNode(key) {
  // Iterate over all nodes in the Diagram
  graphDiagram.nodes.each((node) => {
    const textBlock = node.findObject('TextBlock');
    const picture = node.findObject('Picture');
    const button = node.findObject('Button');

    // Resetting node styles
    if (textBlock) {
      textBlock.margin = new go.Margin(0, 0, 0, 10);
      textBlock.stroke = node.data.haveRelation === 'true' ? '#0402F1' : 'black';
    }

    if (button) {
      button.margin = new go.Margin(0, -10, 0, 0);
    }

    if (picture) {
      picture.source = '';
      picture.margin = new go.Margin(0, 0, 0, 0);
    }
  });

  const node = graphDiagram.findNodeForKey(key);

  if (node) {
    const textBlock = node.findObject('TextBlock');
    const button = node.findObject('Button');
    const picture = node.findObject('Picture');

    if (textBlock) {
      textBlock.stroke = '#FF7F7F';
      textBlock.margin = new go.Margin(0, 5, 0, 0);
    }

    if (button) {
      button.margin = new go.Margin(0, 0, 0, 0);
    }

    if (picture) {
      picture.source = './assets/images/personIcon___.png';
      picture.margin = new go.Margin(0, 0, 0, 5);
    }

    scrollToNode(key);
  }
}

function updateGOJSModel() {
  // Placeholder function for updating the GOJS model
  // Implementation would depend on the actual data fetching and model update logic
}

function selectedNode(key) {
  selectedKey = key;
}

window.addEventListener('DOMContentLoaded', init);
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
        <Button
            id="Layout"
            @click="changeLayoutAngleAndNodeType"
        >
          Change Layout
        </Button>
      </div>
      <div class="flex align-items-center gap-2">
        <InputNumber
            v-model="nodeNumber"
            input-id="minmax-buttons"
            id="nodeNumberInput"
            mode="decimal"
            show-buttons
            :min="1"
            :max="7999"
            fluid
            class=""
            type="number"
            @keyup.enter="goToNode"
        />
        <Button
            class="fetch-button"
            @click="goToNode"
        >
          Find Node
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
          id="DiagramDiv"
          class="h-full border-1 border-gray-500"
      />
      <div
          id="overviewDiv"
          class="absolute top-0 left-0 z-4 border-1 border-orange-700"
          style="height: 20%; width: 20%"
      />
    </div>
  </div>
</template>

<style scoped>
</style>