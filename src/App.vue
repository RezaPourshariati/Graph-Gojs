<script setup>
import {onMounted} from "vue";
import go from 'gojs'

onMounted(() => {
  const myTag = document.getElementById('myDiagramDiv')
  console.log(myTag)

  const myDiagram = new go.Diagram("myDiagramDiv", {
    "undoManager.isEnabled": true,
    // layout: new go.TreeLayout({ angle: 90, layerSpacing: 35 })
  });  // enable undo & redo

  // define a simple Node template
  myDiagram.nodeTemplate = new go.Node("Auto")  // the Shape will automatically surround the TextBlock
      // add a Shape and a TextBlock to this "Auto" Panel
      .add(new go.Shape("RoundedRectangle",
          {strokeWidth: 0, fill: "white"})  // no border; default fill is white
          .bind("fill", "color"))  // Shape.fill is bound to Node.data.color
      .add(new go.TextBlock({margin: 8, stroke: "#333"})  // some room around the text
          .bind("text", "key"));  // TextBlock.text is bound to Node.data.key

  // but use the default Link template, by not setting Diagram.linkTemplate

  // create the model data that will be represented by Nodes and Links
  myDiagram.model = new go.GraphLinksModel(
      [
        {key: "Alpha", color: "lightblue"},
        {key: "Beta", color: "orange"},
        {key: "Gamma", color: "lightgreen"},
        {key: "Delta", color: "pink"}
      ],
      [
        {from: "Alpha", to: "Beta"},
        {from: "Alpha", to: "Gamma"},
        {from: "Beta", to: "Beta"},
        {from: "Gamma", to: "Delta"},
        {from: "Delta", to: "Alpha"}
      ]);
})
</script>

<template>
  <div id="myDiagramDiv" style="width:100%; height:100vh; border: 5px solid green"></div>
</template>

<style scoped>

</style>
