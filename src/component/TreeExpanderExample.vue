<script setup>
import go from 'gojs'

let graphDiagram
let timer = null
const WAIT_TIME = 1000 // 1 s
let selectedKey = -1
const nodeCircleSize = 15
const nodeImageHeight = 48 / 3
const nodeImageWidth = 42 / 3
const nodeHeightMargin = 5

function init() {
  graphDiagram = new go.Diagram('DiagramDiv', {
    initialAutoScale: go.AutoScale.UniformToFill,
    allowMove: false,
    layout: new go.TreeLayout({
      angle: 90,
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
  };

  // Define a simple node template consisting of text followed by an expand/collapse button
  graphDiagram.nodeTemplate = new go.Node('Vertical', {
    selectionChanged: nodeSelectionChanged,
    isTreeExpanded: true, // Initially expand all nodes
  })
      .add(
          new go.Panel('Auto')
              .add(
                  new go.Shape({fill: '#1F4963', stroke: null}),
                  new go.TextBlock({
                    font: 'bold 13px Helvetica, bold Arial, sans-serif',
                    stroke: 'white',
                    margin: 3
                  }).bind('text', 'name')
              ),
          // Expand/collapse button with custom click behavior
          go.GraphObject.make('TreeExpanderButton', {
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

  const modelData = [
    {key: '1', name: 'this is test number one', category: 'parent'},
    {key: '2', parent: '1', name: 'this is test number two', category: 'parent'},
    {key: '3', parent: '1', name: 'this is test number three', category: 'child'},
    {key: '4', parent: '2', name: 'this is test number four', category: 'child'},
    {key: '5', parent: '2', name: 'this is test number five', category: 'parent'},
    {key: '6', parent: '5', name: 'this is test number six', category: 'child'},
    {key: '7', parent: '5', name: 'this is test number seven', category: 'child'},
  ];

  graphDiagram.model = new go.TreeModel({
    isReadOnly: true,
    nodeDataArray: modelData
  });

  // Initially, make all nodes visible (expanded)
  graphDiagram.nodes.each(node => {
    node.visible = true;
    node.isTreeExpanded = true; // Set expanded state
  });

  function expandTree(node) {
    node.isTreeExpanded = true; // Mark node as expanded
    graphDiagram.startTransaction('Expand Node');
    graphDiagram.nodes.each(child => {
      if (child.data.parent === node.data.key) {
        child.visible = true; // Only make direct children visible
        child.isTreeExpanded = false; // Ensure direct children are not expanded
      }
    });
    graphDiagram.commitTransaction('Expand Node');
  }

  function collapseTree(node) {
    node.isTreeExpanded = false; // Mark node as collapsed
    graphDiagram.startTransaction('Collapse Node');
    collapseAllDescendants(node);
    graphDiagram.commitTransaction('Collapse Node');
  }

  function collapseAllDescendants(node) {
    graphDiagram.nodes.each(child => {
      if (child.data.parent === node.data.key) {
        child.visible = false; // Hide all descendants
        child.isTreeExpanded = false; // Ensure the expand state is also collapsed
        collapseAllDescendants(child); // Recursively hide all descendants
      }
    });
  }
}

function nodeSelectionChanged(_node) {
  console.log('selection changed.')
}

// --------------------------------------------------------------------

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

// --------------------------------------------------------------------

window.addEventListener('DOMContentLoaded', init);
</script>

<template>
  <div
      id="DiagramDiv"
      style="border: 1px solid black; width: 100%; height: 100vh">
  </div>
</template>

<style scoped>

</style>