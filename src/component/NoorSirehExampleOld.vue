<script setup>
import go from 'gojs'

let updateModelDataVariable

const $ = go.GraphObject.make
let myDiagram
let timer = null
const WAIT_TIME = 1000 // 1 s
let selectedKey = -1
const nodeCircleSize = 15
const nodeImageHeight = 48 / 3
const nodeImageWidth = 42 / 3
const nodeHeightMargin = 5

const modelIsUpdated = function () {
  //  nativeHelper.showNode();

  clickedOnNode(selectedKey)

  clearTimeout(timer) // remove timer
}

const startTimer = function () {
  timer = setTimeout(modelIsUpdated, WAIT_TIME)
}

function init() {
  myDiagram
      = $(go.Diagram, 'myDiagramDiv',
      {
        // Put the diagram contents at the top center of the viewport
        'initialDocumentSpot': go.Spot.Top,
        'initialViewportSpot': go.Spot.Top,
        'allowCopy': false,
        'allowDelete': false,
        'allowMove': false,
        // initialAutoScale: go.Diagram.Uniform, //auto scale in begging

        'layout': $(go.TreeLayout,
            {
              angle: 90,
              layerSpacing: 35,
              isOngoing: false, // don't relayout when expanding/collapsing panels
            }),
        'undoManager.isEnabled': true,
        'animationManager.isEnabled': false, // turn off automatic animations

      })

  // then get a reference to the diagram's CommandHandler, you can call it SpacingCommandHandler instead of tool if you like.
  const tool = myDiagram.commandHandler
  myDiagram.div.setAttribute('class', 'scroll')
  // then you can override a function of the CommandHandler like so:
  tool.decreaseZoom = function () {
    console.log('my decrease zoom function!')
    if (myDiagram.scale < 0.3)
      return

    // Be careful about using 'this' within such functions!
    // In cases where you want normal behavior, call the base functionality
    // Note the reference to the prototype
    // and the call to 'call' passing it what 'this' should be.
    go.CommandHandler.prototype.decreaseZoom.call(tool)

    // nativeHelper.zoomLevelChanged(myDiagram.scale);
  }

  // when fit tree to veiw you must check zoomlevel to refuse conflict in zoom level percent in tabar widget
  tool.canDecreaseZoom = function () {
    if (myDiagram.scale < 0.3)
      return

    go.CommandHandler.prototype.decreaseZoom.call(tool)
    // nativeHelper.zoomLevelChanged(myDiagram.scale);
  }

  tool.increaseZoom = function () {
    console.log('my increaseZoom  zoom function!')

    if (myDiagram.scale > 2)
      return

    // Be careful about using 'this' within such functions!
    // In cases where you want normal behavior, call the base functionality
    // Note the reference to the prototype
    // and the call to 'call' passing it what 'this' should be.
    go.CommandHandler.prototype.increaseZoom.call(tool)

    // nativeHelper.zoomLevelChanged(myDiagram.scale);
  }

  // when fit tree to veiw you must check zoomlevel to refuse conflict in zoom level percent in tabar widget
  tool.canIncreaseZoom = function () {
    if (myDiagram.scale > 2)
      return

    go.CommandHandler.prototype.increaseZoom.call(tool)
    // nativeHelper.zoomLevelChanged(myDiagram.scale);
  }

  // click in specific shape
  const nodeClicked = function (e, obj) {
    const key = obj.part.data.key
    // alert("Clicked on " + obj.part.data.key);
    clickedOnNode(key)
  }

  // right-clicked in specific node
  function nodeRightClicked(key, xPos, Ypos) {
    const node = myDiagram.findNodeForKey(key)

    if (node.data.haveRelation === 'true')
      console.log(node.data.relationIds)
    //  nativeHelper.showNodeLinkedMenu(node.data.relationIds, xPos, Ypos);
  }

  // when right-clicked on a node
  const myContextMenu = $(go.HTMLInfo, {
    show: showContextMenu,
  })

  myDiagram.contextMenu = myContextMenu

  function showContextMenu(obj, diagram, tool) {
    const mousePt = diagram.lastInput.viewPoint
    const xPos = mousePt.x
    const yPos = mousePt.y

    if (obj) {
      const key = obj.part.data.key
      nodeRightClicked(key, xPos, yPos)
    }
  }

  function nodeOpenMenuClicked(e, obj) {
    const mousePt = myDiagram.lastInput.viewPoint
    const xPos = mousePt.x
    const yPos = mousePt.y

    if (obj) {
      const node = obj.part
      const key = node.data.key

      const shape = node.findObject('SHAPE')
      const textBlock = node.findObject('TextBlock')

      const h1 = shape.height
      // var h2 = textBlock.height;
      const h2 = 40

      nodeRightClicked(key, xPos + 5, yPos + h1 + h2 + nodeHeightMargin)
    }
  }

  const parentNodeTemplate = $(go.Node, 'Vertical',
      { selectionObjectName: 'BODY' },
      {
        // click: nodeClicked, //left clicked
        // contextMenu: myContextMenu, //right clicked
        selectionAdorned: false, // don't bother with any selection adornment
      },
      $(go.Panel, 'Vertical', { name: 'BODY' },
          $(go.Panel, 'Horizontal',
              $('Button',
                  {
                    'name': 'Button',
                    'visible': false,
                    // set properties on the border Shape of the "Button"
                    'ButtonBorder.fill': 'transparent',
                    'ButtonBorder.stroke': 'transparent',
                    'ButtonBorder.strokeWidth': 0,
                    // set properties on the "Button" itself used by its event handlers
                    '_buttonFillOver': 'transparent',
                    '_buttonStrokeOver': 'transparent',
                    '_buttonFillPressed': 'transparent',
                    // click: function(e, button) { alert("won't be alerted"); }
                    'click': nodeOpenMenuClicked,
                    'margin': new go.Margin(nodeHeightMargin, 0, 0, 0),

                  },
                  $(go.Shape,
                      { geometryString: 'F M0 0 L10 0 5 10z', fill: '#909090', stroke: '#909090' }),
                  new go.Binding('visible', 'haveRelation', (t) => {
                    return t === 'true'
                  }),
              ),
              $(go.TextBlock,
                  {
                    name: 'TextBlock',
                    font: 'bold 10pt Vazir,Arial, sans-serif',
                    margin: new go.Margin(0, 0, 0, 0),
                  },
                  new go.Binding('stroke', 'haveRelation', (t) => {
                    return t === 'true' ? '#0402F1' : 'black'
                  }),
                  new go.Binding('text', 'name')),
              $(go.Picture, {
                name: 'Picture',
                source: '',
                background: 'transparent',
                width: nodeImageWidth,
                height: nodeImageHeight,
                margin: new go.Margin(0, 0, 0, 0),
              }),
          ),
          //  $(go.Shape, "Ellipse",
          //     {
          //        name: "SHAPE", // added the name property to find with node.findObject("shape name")
          //        fill: "#909090",
          //        stroke: "#909090",
          //        desiredSize: new go.Size(nodeCircleSize, nodeCircleSize)
          //     },
          //     new go.Binding("desiredSize", "size"),
          //     new go.Binding("fill", "fill")
          //  ),

          //  $(go.Shape, "Ellipse",
          //     {
          //        name: "SHAPE", // added the name property to find with node.findObject("shape name")
          //        fill: "transparent",
          //        stroke: "transparent",
          //        desiredSize: new go.Size(2, 1)
          //     },
          //     new go.Binding("desiredSize", "size"),
          //     new go.Binding("fill", "fill")
          //  ),

          $(go.Panel, // this is underneath the "BODY"
              { height: 20 }, // always this height, even if the TreeExpanderButton is not visible
              $('TreeExpanderButton')),
      ),
  )

  const childNodeTemplate = $(go.Node, 'Vertical',
      { selectionObjectName: 'BODY' },
      {
        // click: nodeClicked, //left clicked
        // contextMenu: myContextMenu, //right clicked
        selectionAdorned: false, // don't bother with any selection adornment
      },
      $(go.Panel, 'Vertical', { name: 'BODY' },
          // $(go.Shape, 'Ellipse',
          //   {
          //     name: 'SHAPE',
          //     fill: 'white',
          //     stroke: 'black',
          //     desiredSize: new go.Size(nodeCircleSize, nodeCircleSize),
          //   },
          //   new go.Binding('desiredSize', 'size'),
          //   new go.Binding('fill', 'fill'),
          // ),
          $(go.Panel, 'Horizontal',
              $('Button',
                  {
                    'name': 'Button',
                    'visible': false,
                    // set properties on the border Shape of the "Button"
                    'ButtonBorder.fill': 'transparent',
                    'ButtonBorder.stroke': 'transparent',
                    'ButtonBorder.strokeWidth': 0,
                    // set properties on the "Button" itself used by its event handlers
                    '_buttonFillOver': 'transparent',
                    '_buttonStrokeOver': 'transparent',
                    '_buttonFillPressed': 'transparent',
                    'click': nodeOpenMenuClicked,
                    'margin': new go.Margin(nodeHeightMargin, 0, 0, 0),
                  },
                  $(go.Shape,
                      { geometryString: 'F M0 0 L10 0 5 10z', fill: '#909090', stroke: '#909090' }),
                  new go.Binding('visible', 'haveRelation', (t) => {
                    return t === 'true'
                  }),
              ),
              $(go.TextBlock,
                  {
                    name: 'TextBlock',
                    font: 'bold 10pt Vazir,Arial, sans-serif',
                    margin: new go.Margin(0, 0, 0, 0),
                  },
                  new go.Binding('stroke', 'haveRelation', (t) => {
                    return t === 'true' ? '#0402F1' : 'black'
                  }),
                  new go.Binding('text', 'name')),
              $(go.Picture, {
                name: 'Picture',
                source: '',
                background: 'transparent',
                width: nodeImageWidth,
                height: nodeImageHeight,
                margin: new go.Margin(0, 0, 0, 0),
              }),
          ),
      ),
  )

  const templmap = new go.Map() // In TypeScript, you could write: new go.Map<string, go.Node>();
  templmap.add('parent', parentNodeTemplate)
  templmap.add('child', childNodeTemplate)
  myDiagram.nodeTemplateMap = templmap

  // define a Link template that routes orthogonally, with no arrowhead
  myDiagram.linkTemplate
      = $(go.Link,
      { routing: go.Link.Orthogonal, corner: 5 },
      $(go.Shape, // the link's path shape
          { strokeWidth: 3, stroke: '#909090' }),
  )

  const modelData = [ // the nodeDataArray
    { key: '1', name: 'this is test number one', category: 'parent' },
    { key: '2', parent: '1', name: 'this is test number two', category: 'parent' },
    { key: '3', parent: '1', name: 'this is test number three', category: 'child' },
    { key: '4', parent: '2', name: 'this is test number four', category: 'child' },
    { key: '5', parent: '2', name: 'this is test number five', category: 'parent' },
    { key: '6', parent: '5', name: 'this is test number sex', category: 'child' },
    { key: '7', parent: '5', name: 'this is test number seven', category: 'child' },

  ]
  selectedNode('1')
  myDiagram.model = new go.TreeModel(modelData)
  startTimer()
}

function zoomToFit() {
  myDiagram.commandHandler.zoomToFit()
  //  nativeHelper.zoomLevelChanged(myDiagram.scale);
}

function scale(scale) {
  myDiagram.scale = scale
  // myDiagram.commandHandler.resetZoom();
}

function scrollToNode(key) {
  const node = myDiagram.findNodeForKey(key)
  if (node !== null)
    myDiagram.scrollToRect(node.actualBounds)
}

function clickedOnNode(key) {
  // iterate over all nodes in Diagram
  myDiagram.nodes.each((node) => {
    const shape = node.findObject('SHAPE')
    const textBlock = node.findObject('TextBlock')
    const picture = node.findObject('Picture')
    const button = node.findObject('Button')

    textBlock.margin = new go.Margin(0, 0, 0, 10)

    button.margin = new go.Margin(0, -10, 0, 0)

    picture.source = ''
    picture.margin = new go.Margin(0, 0, 0, 0)

    if (node.data.haveRelation === 'true')
      textBlock.stroke = '#0402F1'

    else
      textBlock.stroke = 'black'

    // if (node.data.category === "parent") {
    //    shape.fill = "black";
    // }
    // else {
    //    shape.fill = "white";
    // }
  })

  const node = myDiagram.findNodeForKey(key)

  // var shape = node.findObject("SHAPE");
  // shape.fill = "#FF7F7F";

  const textBlock = node.findObject('TextBlock')
  textBlock.stroke = '#FF7F7F'
  textBlock.margin = new go.Margin(0, 5, 0, 0)

  const button = node.findObject('Button')
  button.margin = new go.Margin(0, 0, 0, 0)

  const picture = node.findObject('Picture')
  picture.source = './assets/images/personIcon___.png'
  picture.margin = new go.Margin(0, 0, 0, 5)

  scrollToNode(key)

  // get document widget with this key and show it in DocumentWidget
  //  nativeHelper.openDocumentWidget(key);
}

function updateGOJSModel() {

  //  window.nativeHelper.getCurrentNodeJson(function (jsonData) {
  //     //update GOJS model
  //     // myDiagram.commandHandler.resetZoom();

  //     myDiagram.model = new go.TreeModel(jsonData);

  //     startTimer();
  //  })
}

function selectedNode(key) {
  selectedKey = key
}

window.addEventListener('DOMContentLoaded', init)

</script>

<template>
  <div id="myDiagramDiv"></div>
</template>

<style scoped>

</style>