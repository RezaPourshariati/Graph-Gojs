<script setup>
import go from 'gojs'

let myDiagram;

function init() {
  myDiagram = new go.Diagram('myDiagramDiv', {
    initialAutoScale: go.AutoScale.UniformToFill,
    allowMove: false,
    // define the layout for the diagram
    layout: new go.TreeLayout({
      angle: 90,
      nodeSpacing: 5,
      layerSpacing: 30,
      arrangement: go.TreeArrangement.FixedRoots
    })
  });

  // Define a simple node template consisting of text followed by an expand/collapse button
  myDiagram.nodeTemplate = new go.Node('Vertical', {
    selectionChanged: nodeSelectionChanged
  }) // this event handler is defined below
      .add(
          new go.Panel('Auto')
              .add(
                  new go.Shape({ fill: '#1F4963', stroke: null }),
                  new go.TextBlock({
                    font: 'bold 13px Helvetica, bold Arial, sans-serif',
                    stroke: 'white',
                    margin: 3
                  }).bind('text', 'name')
              ),
          go.GraphObject.build('TreeExpanderButton')
      );

  myDiagram.linkTemplate = new go.Link({
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
    { key: '1', name: 'this is test number one', category: 'parent' },
    { key: '2', parent: '1', name: 'this is test number two', category: 'parent' },
    { key: '3', parent: '1', name: 'this is test number three', category: 'child' },
    { key: '4', parent: '2', name: 'this is test number four', category: 'child' },
    { key: '5', parent: '2', name: 'this is test number five', category: 'parent' },
    { key: '6', parent: '5', name: 'this is test number six', category: 'child' },
    { key: '7', parent: '5', name: 'this is test number seven', category: 'child' },
  ];

  // create the model for the DOM tree
  myDiagram.model = new go.TreeModel({
    isReadOnly: true, // don't allow the user to delete or copy nodes
    // build up the tree in an Array of node data
    nodeDataArray: modelData
  });
}

function nodeSelectionChanged(_node) {
  console.log('selection changed.')
}

window.addEventListener('DOMContentLoaded', init);
</script>

<template>
  <div
      id="myDiagramDiv"
      style="border: 1px solid black; width: 100%; height: 100vh">
  </div>
</template>

<style scoped>

</style>