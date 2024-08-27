<script setup>
import go from 'gojs'

const $ = go.GraphObject.make
let graphDiagram
let timer = null
const WAIT_TIME = 1000 // 1 s
let selectedKey = -1
const nodeCircleSize = 15
const nodeImageHeight = 48 / 3
const nodeImageWidth = 42 / 3
const nodeHeightMargin = 5

function modelIsUpdated() {
  clickedOnNode(selectedKey)
  clearTimeout(timer) // remove timer
}

function startTimer() {
  timer = setTimeout(modelIsUpdated, WAIT_TIME)
}

function init() {
  graphDiagram = new go.Diagram('DiagramDiv', {
    initialDocumentSpot: go.Spot.Top,
    initialViewportSpot: go.Spot.Top,
    initialAutoScale: go.AutoScale.UniformToFill,
    allowCopy: false,
    allowDelete: false,
    allowMove: false,
    layout: new go.TreeLayout({
      nodeSpacing: 5,
      layerSpacing: 30,
      arrangement: go.TreeArrangement.FixedRoots
    })
  })

  graphDiagram.div.setAttribute('class', 'scroll')

  const tool = graphDiagram.commandHandler

  tool.decreaseZoom = () => {
    console.log('my decrease zoom function!')
    if (graphDiagram.scale < 0.3) return
    go.CommandHandler.prototype.decreaseZoom.call(tool)
  }

  tool.canDecreaseZoom = () => graphDiagram.scale >= 0.3

  tool.increaseZoom = () => {
    console.log('my increase zoom function!')
    if (graphDiagram.scale > 2) return
    go.CommandHandler.prototype.increaseZoom.call(tool)
  }

  tool.canIncreaseZoom = () => graphDiagram.scale <= 2

  const nodeClicked = (e, obj) => {
    const key = obj.part.data.key
    clickedOnNode(key)
  }

  const nodeRightClicked = (key, xPos, yPos) => {
    const node = graphDiagram.findNodeForKey(key)
    if (node && node.data.haveRelation === 'true') {
      console.log(node.data.relationIds)
    }
  }

  function showContextMenu(obj, diagram) {
    const {x, y} = diagram.lastInput.viewPoint

    if (obj) {
      const key = obj.part.data.key
      nodeRightClicked(key, x, y)
    }
  }

  graphDiagram.contextMenu = new go.HTMLInfo({
    show: (obj, diagram) => showContextMenu(obj, diagram)
  })

  const nodeOpenMenuClicked = (e, obj) => {
    const {x, y} = graphDiagram.lastInput.viewPoint

    if (obj) {
      const node = obj.part
      const key = node.data.key
      const shape = node.findObject('SHAPE')
      const textBlock = node.findObject('TextBlock')
      const h1 = shape ? shape.height : 0
      const h2 = 40 // Height for textBlock

      nodeRightClicked(key, x + 5, y + h1 + h2 + nodeHeightMargin)
    }
  }

  const parentNodeTemplate = new go.Node('Vertical', {
    selectionObjectName: 'BODY',
    selectionAdorned: false,
  })
      .add(
          new go.Panel('Vertical', {name: 'BODY'})
              .add(
                  new go.Panel('Horizontal', {
                    background: 'transparent',
                  })
                      .add(
                          go.GraphObject.build("Button", {
                                name: 'Button',
                                visible: false,
                                "ButtonBorder.fill": 'transparent',
                                "ButtonBorder.stroke": 'transparent',
                                "ButtonBorder.strokeWidth": 0,
                                _buttonFillOver: 'transparent',
                                _buttonStrokeOver: 'transparent',
                                _buttonFillPressed: 'transparent',
                                click: nodeOpenMenuClicked,
                                margin: new go.Margin(nodeHeightMargin, 0, 0, 0),
                              },
                              new go.Shape({geometryString: 'F M0 0 L10 0 5 10z', fill: '#909090', stroke: '#909090'}),
                              new go.Binding('visible', 'haveRelation', t => t === 'true'),
                          ),
                          new go.TextBlock({
                            name: 'TextBlock',
                            font: 'bold 10pt Vazir,Arial, sans-serif',
                            margin: new go.Margin(0, 0, 0, 0),
                          }).bind(
                              new go.Binding('stroke', 'haveRelation', t => t === 'true' ? '#0402F1' : 'black')
                          ).bind('text', 'name'),
                          new go.Picture({
                            name: 'Picture',
                            source: '',
                            background: 'transparent',
                            width: nodeImageWidth,
                            height: nodeImageHeight,
                            margin: new go.Margin(0, 0, 0, 0),
                          })
                      ),
                  go.GraphObject.build("TreeExpanderButton")
              )
      )

  const childNodeTemplate = new go.Node('Vertical', {
    selectionObjectName: 'BODY',
    selectionAdorned: false,
  })
      .add(
          new go.Panel('Vertical', {name: 'BODY'})
              .add(
                  new go.Panel('Horizontal', {
                    background: 'transparent',
                  })
                      .add(
                          go.GraphObject.build("Button", {
                                name: 'Button',
                                visible: false,
                                "ButtonBorder.fill": 'transparent',
                                "ButtonBorder.stroke": 'transparent',
                                "ButtonBorder.strokeWidth": 0,
                                _buttonFillOver: 'transparent',
                                _buttonStrokeOver: 'transparent',
                                _buttonFillPressed: 'transparent',
                                click: nodeOpenMenuClicked,
                                margin: new go.Margin(nodeHeightMargin, 0, 0, 0),
                              },
                              new go.Shape({geometryString: 'F M0 0 L10 0 5 10z', fill: '#909090', stroke: '#909090'}),
                              new go.Binding('visible', 'haveRelation', t => t === 'true'),
                          ),
                          new go.TextBlock({
                            name: 'TextBlock',
                            font: 'bold 10pt Vazir,Arial, sans-serif',
                            margin: new go.Margin(0, 0, 0, 0),
                          }).bind(
                              new go.Binding('stroke', 'haveRelation', t => t === 'true' ? '#0402F1' : 'black')
                          ).bind('text', 'name'),
                      ),
                  new go.Picture({
                    name: 'Picture',
                    source: '',
                    background: 'transparent',
                    width: nodeImageWidth,
                    height: nodeImageHeight,
                    margin: new go.Margin(0, 0, 0, 0),
                  })
              )
      )

  const templmap = new go.Map();
  templmap.add('parent', parentNodeTemplate);
  templmap.add('child', childNodeTemplate);
  graphDiagram.nodeTemplateMap = templmap;

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
      }))

  const modelData = [
    {key: '1', name: 'this is test number one', category: 'parent'},
    {key: '2', parent: '1', name: 'this is test number two', category: 'parent'},
    {key: '3', parent: '1', name: 'this is test number three', category: 'child'},
    {key: '4', parent: '2', name: 'this is test number four', category: 'child'},
    {key: '5', parent: '2', name: 'this is test number five', category: 'parent'},
    {key: '6', parent: '5', name: 'this is test number six', category: 'child'},
    {key: '7', parent: '5', name: 'this is test number seven', category: 'child'},
  ];

  selectedNode('1');
  graphDiagram.model = new go.TreeModel(modelData);
  startTimer();
}

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
  <div id="DiagramDiv"></div>
</template>

<style scoped>

</style>