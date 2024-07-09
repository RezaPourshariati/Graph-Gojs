<script setup>
import {onMounted} from "vue";
import go from 'gojs'
import {hadithData, relationHadithData} from './components/graph-data/graphData3080.js'

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
      .add(new go.TextBlock({margin: 8, stroke: "#333", font: "bold 14pt sans-serif"})  // some room around the text
          .bind("text", "hadith"))  // TextBlock.text is bound to Node.data.key
  // but use the default Link template, by not setting Diagram.linkTemplate

  // create the model data that will be represented by Nodes and Links
  myDiagram.model = new go.GraphLinksModel(hadithData, relationHadithData)

  const myOverview =
      new go.Overview("myOverviewDiv",
          { observed: myDiagram });
})
</script>


<template>
  <div id="myDiagramDiv" style="width:1000px; height:80vh;"></div>
  <div id="myOverviewDiv" style="width:150px; height:150px; border: 5px solid orangered"></div>
</template>


<style scoped>
#myDiagramDiv {
  border: 4px solid green;
  margin: 0 auto;
}

#myOverviewDiv {
  margin: 0 auto;
}
</style>
