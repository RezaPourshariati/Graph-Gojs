<script setup lang="ts">
import go from 'gojs'
import treeModelData from '../tree/tree2.json'
import Slider from "primevue/slider";
import {onMounted, ref, watch} from "vue";

let graphDiagram
const sliderValue = ref(1)
const horizontalLayout = ref(false)
const nodeNumber = ref()
const allNodesCollapsed = ref(true); // Track the collapse/expand state
const treeExpanded = ref()

// Watch the PrimeVue slider value and update the diagram scale
watch(sliderValue, (newValue, oldValue) => {
  if (graphDiagram && newValue !== oldValue)
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

  // const tool = graphDiagram.commandHandler;
  NodeTemplate()
  graphDiagram.linkTemplate = new go.Link({
    fromEndSegmentLength: 10,
    toEndSegmentLength: 10,
    relinkableFrom: true,
    relinkableTo: true,
    routing: go.Routing.Orthogonal,
    corner: 10,
  })
      .add(new go.Shape({
        strokeWidth: 1,
      }))
      .add(new go.Shape({
        toArrow: 'Standard',
        strokeWidth: 1,
      }));

  graphDiagram.model = new go.TreeModel({
    isReadOnly: true,
    nodeDataArray: treeModelData
  })

  // Initially, make all nodes visible (expanded)
  graphDiagram.nodes.each(node => {
    node.visible = true;
    node.isTreeExpanded = true; // Set expanded state
  });

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
      case 'Enter':  // New case for the Enter key
        toggleNodeCollapseExpand() // Call function to toggle node
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

// ------------------------------------------------------------------------------------ end of init() function

// function toggleNodeCollapseExpand() {
//   const selectedNode = graphDiagram.selection.first();  // Get the currently selected node
//
//   if (selectedNode) {
//     graphDiagram.startTransaction("toggleCollapseExpand");  // Start a transaction for undo/redo support
//
//     selectedNode.isTreeExpanded = !selectedNode.isTreeExpanded;  // Toggle the collapse/expand state
//
//     graphDiagram.commitTransaction("toggleCollapseExpand");  // Commit the transaction
//   }
// }

function toggleNodeCollapseExpand() { // controlled by enter keyword
  const selectedNode = graphDiagram.selection.first(); // Get the currently selected node
  if (selectedNode) {
    if (selectedNode.isTreeExpanded) {
      collapseTree(selectedNode); // Collapse if currently expanded
    } else {
      expandTree(selectedNode); // Expand if currently collapsed
    }
  }
}

function expandTree(node) {
  node.isTreeExpanded = true;
  graphDiagram.startTransaction('Expand Node');
  node.findTreeChildrenNodes().each(child => {
    child.visible = true;
    child.isTreeExpanded = false;
  });
  graphDiagram.commitTransaction('Expand Node');
}

function collapseTree(node) {
  node.isTreeExpanded = false;
  graphDiagram.startTransaction('Collapse Node');
  collapseAllDescendants(node);
  graphDiagram.commitTransaction('Collapse Node');
}

function collapseAllDescendants(node) {
  node.findTreeChildrenNodes().each(child => {
    // child.visible = true; // ------------------------------
    child.isTreeExpanded = false;
    collapseAllDescendants(child);
  });
}


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
            click: (e, obj) => {
              const node = obj.part; // the node containing this button
              if (node.isTreeExpanded) {
                collapseTree(node);
              } else {
                expandTree(node);
              }
            }
          })
      );
}

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

// function isTreeExpanded() {
//   return treeExpanded.value = !treeExpanded.value
// }

function collapseAll() {
  if (!graphDiagram) return;
  graphDiagram.startTransaction("collapseAll");

  // Loop through all nodes in the diagram and collapse them
  graphDiagram.nodes.each((node) => {
    if (node instanceof go.Node) {
      node.isTreeExpanded = false // Collapse node
      // collapseAllDescendants(node)
    }
  });

  graphDiagram.commitTransaction("collapseAll");
}

function expandAll() {
  if (!graphDiagram) return;
  graphDiagram.startTransaction("expandAll");

  // Loop through all nodes in the diagram and expand them
  graphDiagram.nodes.each((node) => {
    if (node instanceof go.Node) {
      node.isTreeExpanded = true // Expand node
    }
  });

  graphDiagram.commitTransaction("expandAll");
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
  if (nodeData && nodeData.isVisible()) {
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
  const selectedNode = graphDiagram.selection.first();
  if (!selectedNode) return;

  const parentNode = selectedNode.findTreeParentNode();
  if (parentNode && parentNode.isVisible()) {
    graphDiagram.select(parentNode);
    graphDiagram.scrollToRect(parentNode.actualBounds);
  }
}

function goToFirstChild() {
  const selectedNode = graphDiagram.selection.first();
  if (!selectedNode || !selectedNode.isTreeExpanded) return;

  const firstChild = selectedNode.findTreeChildrenNodes().first();
  if (firstChild && firstChild.isVisible()) {
    graphDiagram.select(firstChild);
    graphDiagram.scrollToRect(firstChild.actualBounds);
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
  // if (graphDiagram)
  //   delete graphDiagram.model

  if (!graphDiagram)
    return

  graphDiagram.model.applyIncrementalJson({
    nodeDataArray: treeModelData
  })

  // graphDiagram.model = new go.TreeModel({
  //   isReadOnly: true,
  //   nodeDataArray: treeModelData
  // })
  calculateOverviewMap()
}

onMounted(() => {
  init()
  setTimeout(() => {
    onCenterRoot()
  }, 100)
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
        <Button
            id="Layout"
            @click="changeLayoutAngleAndNodeType"
        >
          Change Layout
        </Button>
        <Button
            @click="expandAll"
        >
          Expand All
        </Button>
        <Button
            @click="collapseAll"
        >
          Collapse All
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