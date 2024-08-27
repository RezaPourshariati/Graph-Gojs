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
  // myDiagram = new go.Diagram('myDiagramDiv', {
  //   initialDocumentSpot: go.Spot.Top,
  //   initialViewportSpot: go.Spot.Top,
  //   allowCopy: false,
  //   allowDelete: false,
  //   allowMove: false,
  //   layout: new go.TreeLayout({
  //     angle: 90,
  //     layerSpacing: 35,
  //     isOngoing: false,
  //   }),
  //   "undoManager.isEnabled": true,
  //   "animationManager.isEnabled": false,
  // });

  myDiagram = new go.Diagram('myDiagramDiv', {
    initialDocumentSpot: go.Spot.Top,
    initialViewportSpot: go.Spot.Top,
    initialAutoScale: go.AutoScale.UniformToFill,
    allowCopy: false,
    allowDelete: false,
    allowMove: false,
    // define the layout for the diagram
    layout: new go.TreeLayout({
      nodeSpacing: 5,
      layerSpacing: 30,
      arrangement: go.TreeArrangement.FixedRoots
    }),
    // "undoManager.isEnabled": true,
    // "animationManager.isEnabled": false,
  });

  const tool = myDiagram.commandHandler;
  myDiagram.div.setAttribute('class', 'scroll');

  tool.decreaseZoom = () => {
    console.log('my decrease zoom function!');
    if (myDiagram.scale < 0.3) return;
    go.CommandHandler.prototype.decreaseZoom.call(tool);
  };

  tool.canDecreaseZoom = () => {
    if (myDiagram.scale >= 0.3) {
      go.CommandHandler.prototype.decreaseZoom.call(tool);
    }
  };

  tool.increaseZoom = () => {
    console.log('my increase zoom function!');
    if (myDiagram.scale > 2) return;
    go.CommandHandler.prototype.increaseZoom.call(tool);
  };

  tool.canIncreaseZoom = () => {
    if (myDiagram.scale <= 2) {
      go.CommandHandler.prototype.increaseZoom.call(tool);
    }
  };

  const nodeClicked = (e, obj) => {
    const key = obj.part.data.key;
    clickedOnNode(key);
  };

  const nodeRightClicked = (key, xPos, yPos) => {
    const node = myDiagram.findNodeForKey(key);
    if (node.data.haveRelation === 'true') {
      console.log(node.data.relationIds);
    }
  };

  const myContextMenu = new go.HTMLInfo({
    show: (obj, diagram) => showContextMenu(obj, diagram),
  });

  myDiagram.contextMenu = myContextMenu;

  const showContextMenu = (obj, diagram) => {
    const { x, y } = diagram.lastInput.viewPoint;

    if (obj) {
      const key = obj.part.data.key;
      nodeRightClicked(key, x, y);
    }
  };

  const nodeOpenMenuClicked = (e, obj) => {
    const { x, y } = myDiagram.lastInput.viewPoint;

    if (obj) {
      const node = obj.part;
      const key = node.data.key;

      const shape = node.findObject('SHAPE');
      const textBlock = node.findObject('TextBlock');
      const h1 = shape.height;
      const h2 = 40; // Height for textBlock

      nodeRightClicked(key, x + 5, y + h1 + h2 + nodeHeightMargin);
    }
  };

  const parentNodeTemplate = new go.Node(go.Panel.Vertical, {
        selectionObjectName: 'BODY',
        selectionAdorned: false,
      },
      new go.Panel(go.Panel.Vertical, { name: 'BODY' },
          new go.Panel(go.Panel.Horizontal,
              go.GraphObject.build("Button", {
                    name: 'Button',
                    visible: false,
                    // ButtonBorder: {
                    //   fill: 'transparent',
                    //   stroke: 'transparent',
                    //   strokeWidth: 0,
                    // },
                    "ButtonBorder.fill": 'transparent',
                    "ButtonBorder.stroke": 'transparent',
                    "ButtonBorder.strokeWidth": 0,
                    _buttonFillOver: 'transparent',
                    _buttonStrokeOver: 'transparent',
                    _buttonFillPressed: 'transparent',
                    click: nodeOpenMenuClicked,
                    margin: new go.Margin(nodeHeightMargin, 0, 0, 0),
                  },
                  new go.Shape({ geometryString: 'F M0 0 L10 0 5 10z', fill: '#909090', stroke: '#909090' }),
                  new go.Binding('visible', 'haveRelation', t => t === 'true'),
              ),
              new go.TextBlock({
                    name: 'TextBlock',
                    font: 'bold 10pt Vazir,Arial, sans-serif',
                    margin: new go.Margin(0, 0, 0, 0),
                  },
                  new go.Binding('stroke', 'haveRelation', t => t === 'true' ? '#0402F1' : 'black'),
                  new go.Binding('text', 'name')),
              new go.Picture({
                name: 'Picture',
                source: '',
                background: 'transparent',
                width: nodeImageWidth,
                height: nodeImageHeight,
                margin: new go.Margin(0, 0, 0, 0),
              }),
          ),
          new go.Panel("Auto", { height: 20 }), go.GraphObject.build("TreeExpanderButton"),
      ),
  );

  const childNodeTemplate = new go.Node(go.Panel.Vertical, {
        selectionObjectName: 'BODY',
        selectionAdorned: false,
      },
      new go.Panel(go.Panel.Vertical, { name: 'BODY' },
          new go.Panel(go.Panel.Horizontal,
              go.GraphObject.build("Button", {
                  name: 'Button',
                    visible: false,
                    // ButtonBorder: {
                    //   fill: 'transparent',
                    //   stroke: 'transparent',
                    //   strokeWidth: 0,
                    // },
                    "ButtonBorder.fill": 'transparent',
                    "ButtonBorder.stroke": 'transparent',
                    "ButtonBorder.strokeWidth": 0,
                    _buttonFillOver: 'transparent',
                    _buttonStrokeOver: 'transparent',
                    _buttonFillPressed: 'transparent',
                    click: nodeOpenMenuClicked,
                    margin: new go.Margin(nodeHeightMargin, 0, 0, 0),
                  },
                  new go.Shape({ geometryString: 'F M0 0 L10 0 5 10z', fill: '#909090', stroke: '#909090' }),
                  new go.Binding('visible', 'haveRelation', t => t === 'true'),
              ),
              new go.TextBlock({
                    name: 'TextBlock',
                    font: 'bold 10pt Vazir,Arial, sans-serif',
                    margin: new go.Margin(0, 0, 0, 0),
                  },
                  new go.Binding('stroke', 'haveRelation', t => t === 'true' ? '#0402F1' : 'black'),
                  new go.Binding('text', 'name')),
              new go.Picture({
                name: 'Picture',
                source: '',
                background: 'transparent',
                width: nodeImageWidth,
                height: nodeImageHeight,
                margin: new go.Margin(0, 0, 0, 0),
              }),
          ),
      ),
  );

  const templmap = new go.Map();
  templmap.add('parent', parentNodeTemplate);
  templmap.add('child', childNodeTemplate);
  myDiagram.nodeTemplateMap = templmap;

  myDiagram.linkTemplate = new go.Link({
        routing: go.Link.Orthogonal,
        corner: 5,
      },
      new go.Shape({
        strokeWidth: 3,
        stroke: '#909090',
      }),
  );

  const modelData = [
    { key: '1', name: 'this is test number one', category: 'parent' },
    { key: '2', parent: '1', name: 'this is test number two', category: 'parent' },
    { key: '3', parent: '1', name: 'this is test number three', category: 'child' },
    { key: '4', parent: '2', name: 'this is test number four', category: 'child' },
    { key: '5', parent: '2', name: 'this is test number five', category: 'parent' },
    { key: '6', parent: '5', name: 'this is test number six', category: 'child' },
    { key: '7', parent: '5', name: 'this is test number seven', category: 'child' },
  ];

  selectedNode('1');
  myDiagram.model = new go.TreeModel(modelData);
  startTimer();
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