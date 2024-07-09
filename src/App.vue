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
          {observed: myDiagram});
  console.log(myOverview)

  const zoomSlider = new ZoomSlider(myDiagram)

  document.getElementById("zoomToFit").addEventListener("click", () => myDiagram.commandHandler.zoomToFit())
  document.getElementById("centerRoot").addEventListener("click", () => {
    myDiagram.scale = 1;
    myDiagram.commandHandler.scrollToPart(myDiagram.findNodeForKey(1));
  })

  // ------------------------- zoomSlider (search)
  document.getElementById('myZoomSlider').addEventListener('input', function () {
    // console.log('value ---------------', parseFloat(value))
    myDiagram.scale = parseFloat(this.value);
  });
})
</script>


<template>
  <div class="parent-diagram">
    <div id="myDiagramDiv" style="width:1000px; height:80vh;"></div>

    <!--  Overview map  -->
    <div id="myOverviewDiv" style="width:150px; height:150px; border: 5px solid orangered"></div>
    <!--  zoom slider (search)  -->
    <input type="range" id="myZoomSlider" min="0.1" max="2" step="0.1" value="1"/>

    <!--  zoom slider  -->
    <!--    <div id="zoomSlider" style="width:150px; height:150px;"></div>-->

    <p class="button-zoom">
      <button id="zoomToFit">Zoom to Fit</button>
      <button id="centerRoot">Center on root</button>
    </p>
  </div>

</template>


<style scoped>
.parent-diagram {
  position: relative;
}

#myZoomSlider {
  position: absolute;
  bottom: 15px;
  right: 15px;
  z-index: 99;
}

#myDiagramDiv {
  border: 4px solid green;
  margin: 0 auto;
}

#myOverviewDiv {
  margin: 0 auto;
}

.button-zoom {
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-bottom: 3rem;
}

.button-zoom button {
  font-family: "JetBrains Mono Light", ui-monospace;
  font-size: 1rem;
  background: #dfadfc;
  font-weight: bold;
  border: none;
  padding: 1.2rem;
  border-radius: 5px;
}

.button-zoom button:hover {
  background: #c597fc;
  transition: 0.2s ease;
}
</style>
