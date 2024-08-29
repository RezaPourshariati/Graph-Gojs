<script setup>
import go from 'gojs'
import Slider from 'primevue/slider'
import tree from '../tree/tree.json'
import {ref, watch} from "vue";

// this controls whether the tree grows deeper towards the right or downwards:
const HORIZONTAL = false
let graphDiagram = null
let myWholeModel = null
const sliderValue = ref(20)

// Watch the PrimeVue slider value and update the diagram scale
watch(sliderValue, (newValue) => {
  if (graphDiagram)
    graphDiagram.scale = valueToScale(newValue)
})

function init() {
  // ------------------------ creating the diagram
  graphDiagram = new go.Diagram('DiagramDiv', {
    initialDocumentSpot: go.Spot.Center,
    initialViewportSpot: go.Spot.Center,
    layout: new VirtualizedTreeLayout({ // ---------- Layout
      angle: HORIZONTAL ? 0 : 90,
      nodeSpacing: 0,
      layerSpacing: 0,
    }),
    'animationManager.isEnabled': false,
    SelectionMoved: (e) => {
      e.subject.each((n) => {
        if (n instanceof go.Node) n.data.points = undefined;
      });
    },
  });

  // Define the template for Nodes, used by virtualization.
  graphDiagram.nodeTemplate =
      new go.Node('Vertical', {  // Use a horizontal panel to arrange children
        isLayoutPositioned: false,
        isTreeExpanded: true,
        toolTip: go.GraphObject.build('ToolTip')
            .add(
                new go.TextBlock({margin: 3})
                    .bind('text', 'title')
            )
      })
          .bindTwoWay('position', 'bounds', (b) => b.position,
              (p, d) => new go.Rect(p.x, p.y, d.bounds.width, d.bounds.height))
          .add(
              new go.Panel('Auto', {  // Container panel for the shape and text
                width: 70,
                height: 20 // Defined to match the load function setup
              }).add(
                  new go.Shape('Rectangle', {}).bind(
                      new go.Binding('fill', 'color'),
                  ),
                  new go.TextBlock({
                    margin: 2,
                    wrap: go.TextBlock.WrapFit,  // Enable text wrapping
                    overflow: go.TextBlock.OverflowEllipsis,  // Ellipsis for overflow text
                    editable: true  // Make text editable if needed
                  }).bind(
                      new go.Binding('text', 'title')
                  ),
              ),
              go.GraphObject.build('TreeExpanderButton', {  // TreeExpanderButton outside the main content
                width: 14, height: 14,
                alignment: go.Spot.Center // Center alignment in the panel
              })
          )

  // Define the template for links
  graphDiagram.linkTemplate = new go.Link({
    isLayoutPositioned: false, // Optimization for performance
    fromSpot: HORIZONTAL ? go.Spot.Right : go.Spot.Bottom,
    toSpot: HORIZONTAL ? go.Spot.Left : go.Spot.Top,
    routing: go.Routing.Orthogonal,
    corner: 25,
  })
      .add(
          new go.Shape({strokeWidth: 1})
      )
      .add(new go.Shape({
        toArrow: 'Standard',
        strokeWidth: 1,
      }))

  // This model includes all the data
  myWholeModel = new go.TreeModel(); // must match the model used by the Diagram, below

  // The virtualized layout works on the full model, not on the Diagram Nodes and Links
  graphDiagram.layout.model = myWholeModel;

  // Do not set graphDiagram.model = myWholeModel -- that would create a zillion Nodes and Links!
  // In the future Diagram may have built-in support for virtualization.
  // For now, we have to implement virtualization ourselves by having the Diagram's model
  // be different from the "real" model.
  graphDiagram.model = new go.TreeModel(); // this only holds nodes that should be in the viewport

  // for now, we have to implement virtualization ourselves
  graphDiagram.isVirtualized = true;
  graphDiagram.addDiagramListener('ViewportBoundsChanged', onViewportChanged);

  graphDiagram.delayInitialization((diagram) => spinDuring(diagram, 'Spinner', load));
  syncSliderWithZoomSlider()
}

function onCenterRoot() {
  graphDiagram.scale = 1
  graphDiagram.commandHandler.scrollToPart(graphDiagram.findNodeForKey(1))
}

function scaleToValue(scale) {
  const minScale = 0
  const maxScale = 5
  const minValue = -50
  const maxValue = 100

  return ((scale - minScale) / (maxScale - minScale)) * (maxValue - minValue) + minValue
}

// Convert slider value to scale
function valueToScale(value) {
  const minScale = 0
  const maxScale = 5
  const minValue = -50
  const maxValue = 100

  return ((value - minValue) / (maxValue - minValue)) * (maxScale - minScale) + minScale
}

function syncSliderWithZoomSlider() {
  graphDiagram.addDiagramListener('ViewportBoundsChanged', (_e) => {
    // calculateOverviewMap() // Listening to viewport bounds changes for overview map zoom and bounds.
    // Update PrimeVue slider when ZoomSlider changes
    if (graphDiagram) {
      const scale = graphDiagram.scale
      sliderValue.value = scaleToValue(scale)
    }
  })
}

// implement a wait spinner in HTML with CSS animation
function spinDuring(diagram, spinner, compute) {
  // where compute is a function of zero args
  // show the animated spinner
  if (typeof spinner === 'string') spinner = document.getElementById(spinner);
  if (spinner) {
    // position it in the middle of the viewport DIV
    const x = Math.floor(diagram.div.offsetWidth / 2 - spinner.naturalWidth / 2);
    const y = Math.floor(diagram.div.offsetHeight / 2 - spinner.naturalHeight / 2);
    spinner.style.left = x + 'px';
    spinner.style.top = y + 'px';
    spinner.style.display = 'inline';
  }
  setTimeout(() => {
    try {
      compute(); // do the computation
    } finally {
      if (spinner) spinner.style.display = 'none';
    }
  }, 20);
}

function load() {
  // Initialize the data array for the model
  const treeData = []; // Start with an empty array

  const total = tree.length;
  // Process the imported tree data
  for (let i = 0; i < total; i++) {
    const node = tree[i]; // Get each node from the tree
    const d = {
      key: node.key, // this node data's key
      color: go.Brush.randomColor(),
      title: node.title, // the node's color
      parent: i > 0 ? node.parent : undefined // the random parent's key
    };

    // Customize bounds as needed; existing template is kept simple
    d.bounds = new go.Rect(0, 0, 70, 20); // Replace this with your bounding box logic if needed

    // Add the constructed data object to the treeData array
    treeData.push(d);
  }

  // Finally, assign the prepared data array to the model
  myWholeModel.nodeDataArray = treeData;

  // Layout the diagram with the new data
  graphDiagram.layoutDiagram(true);
}

// The following functions implement virtualization of the Diagram
// Assume data.bounds is a Rect of the area occupied by the Node in document coordinates.

// The normal mechanism for determining the size of the document depends on all the
// Nodes and Links existing, so we need to use a function that depends only on the model data.
function computeDocumentBounds() {
  const b = new go.Rect()
  const nData = myWholeModel.nodeDataArray
  for (let i = 0; i < nData.length; i++) {
    const d = nData[i]
    if (!d.bounds) continue
    if (i === 0) {
      b.set(d.bounds)
    } else {
      b.unionRect(d.bounds)
    }
  }
  return b
}

let myRemoveTimer

// As the user scrolls or zooms, make sure the Parts (Nodes and Links) exist in the viewport.
function onViewportChanged(e) {
  const diagram = e.diagram
  // make sure there are Nodes for each node data that is in the viewport
  // or that is connected to such a Node
  const viewB = diagram.viewportBounds // the new viewportBounds
  const model = diagram.model

  const oldSkips = diagram.skipsUndoManager
  diagram.skipsUndoManager = true

  const b = new go.Rect();
  const nData = myWholeModel.nodeDataArray;
  for (let i = 0; i < nData.length; i++) {
    const n = nData[i];
    if (model.containsNodeData(n)) continue;
    if (!n.bounds) continue;
    if (n.bounds.intersectsRect(viewB)) {
      model.addNodeData(n);
    }
    if (model instanceof go.TreeModel) {
      // make sure links to all parent nodes appear
      const parentKey = myWholeModel.getParentKeyForNodeData(n);
      const parent = myWholeModel.findNodeDataForKey(parentKey);
      if (parent !== null) {
        if (n.bounds.intersectsRect(viewB)) {
          // N is inside viewport
          model.addNodeData(parent); // so that link to parent appears
          const child = diagram.findNodeForData(n);
          if (child !== null) {
            const link = child.findTreeParentLink();
            if (link !== null) {
              // do this now to avoid delayed routing outside of transaction
              link.fromNode.ensureBounds();
              link.toNode.ensureBounds();
              if (child.data.fromSpot) link.fromSpot = child.data.fromSpot;
              if (child.data.toSpot) link.toSpot = child.data.toSpot;
              if (child.data.points) {
                link.points = child.data.points;
              } else {
                link.updateRoute();
              }
            }
          }
        } else {
          // N is outside of viewport
          // see if there's a parent that is in the viewport,
          // or if the link might cross over the viewport
          b.set(n.bounds);
          b.unionRect(parent.bounds);
          if (b.intersectsRect(viewB)) {
            model.addNodeData(n); // add N so that link to parent appears
            const child = diagram.findNodeForData(n);
            if (child !== null) {
              const link = child.findTreeParentLink();
              if (link !== null) {
                // do this now to avoid delayed routing outside of transaction
                link.fromNode.ensureBounds();
                link.toNode.ensureBounds();
                if (child.data.fromSpot) link.fromSpot = child.data.fromSpot;
                if (child.data.toSpot) link.toSpot = child.data.toSpot;
                if (child.data.points) {
                  link.points = child.data.points;
                } else {
                  link.updateRoute();
                }
              }
            }
          }
        }
      }
    }
  }

  if (model instanceof go.GraphLinksModel) {
    const lData = myWholeModel.linkDataArray;
    for (let i = 0; i < lData.length; i++) {
      const l = lData[i];
      const fromKey = myWholeModel.getFromKeyForLinkData(l);
      if (fromKey === undefined) continue;
      const from = myWholeModel.findNodeDataForKey(fromKey);
      if (from === null || !from.bounds) continue;

      const toKey = myWholeModel.getToKeyForLinkData(l);
      if (toKey === undefined) continue;
      const to = myWholeModel.findNodeDataForKey(toKey);
      if (to === null || !to.bounds) continue;

      b.set(from.bounds);
      b.unionRect(to.bounds);
      if (b.intersectsRect(viewB)) {
        // also make sure both connected nodes are present,
        // so that link routing is authentic
        model.addNodeData(from);
        model.addNodeData(to);
        model.addLinkData(l);
        const link = diagram.findLinkForData(l);
        if (link !== null) {
          // do this now to avoid delayed routing outside of transaction
          link.fromNode.ensureBounds();
          link.toNode.ensureBounds();
          if (link.data.fromSpot) link.fromSpot = link.data.fromSpot;
          if (link.data.toSpot) link.toSpot = link.data.toSpot;
          //if (link.data.points) {
          //  link.points = link.data.points;
          //} else {
          link.updateRoute();
          //}
        }
      }
    }
  }

  diagram.skipsUndoManager = oldSkips;

  if (myRemoveTimer === null) {
    // only remove offscreen nodes after a delay
    myRemoveTimer = setTimeout(() => removeOffscreen(diagram), 3000);
  }

  updateCounts(); // only for this sample
}

// occasionally remove Parts that are offscreen from the Diagram
myRemoveTimer = null

function removeOffscreen(diagram) {
  myRemoveTimer = null;

  const viewB = diagram.viewportBounds;
  const model = diagram.model;
  const remove = []; // collect for later removal
  const removeLinks = new go.Set(); // links connected to a node data to remove
  const it = diagram.nodes;
  while (it.next()) {
    const n = it.value;
    const d = n.data;
    if (d === null) continue;
    if (!n.actualBounds.intersectsRect(viewB) && !n.isSelected) {
      // even if the node is out of the viewport, keep it if it is selected or
      // if any link connecting with the node is still in the viewport
      if (!n.linksConnected.any((l) => l.actualBounds.intersectsRect(viewB))) {
        remove.push(d);
        if (model instanceof go.GraphLinksModel) {
          removeLinks.addAll(n.linksConnected);
        }
      }
    }
  }

  if (remove.length > 0) {
    const oldSkips = diagram.skipsUndoManager;
    diagram.skipsUndoManager = true;
    model.removeNodeDataCollection(remove);
    if (model instanceof go.GraphLinksModel) {
      removeLinks.each((l) => {
        if (!l.isSelected) model.removeLinkData(l.data);
      });
    }
    diagram.skipsUndoManager = oldSkips;
  }

  updateCounts(); // only for this sample
}

// end of virtualized Diagram

// start of VirtualizedTree[Layout/Network] classes

// Here we try to replace the dependence of TreeLayout on Nodes
// with depending only on the data in the TreeModel.
class VirtualizedTreeLayout extends go.TreeLayout {
  constructor() {
    super()
    this.angle = 90
    this.nodeSpacing = 5
    this.layerSpacing = 40
    this.isOngoing = false
    this.model = null // add this property for holding the whole TreeModel
  }

  static _cachedLinks = []

  createNetwork() {
    return new VirtualizedTreeNetwork(this) // defined below
  }

  // ignore the argument, an (implicit) collection of Parts
  makeNetwork(coll) {
    const net = this.createNetwork()
    net.addData(this.model) // use the model data, not any actual Nodes and Links
    return net
  }

  commitLayout() {
    VirtualizedTreeEdge._dummyLink = this.diagram.linkTemplate.copy();
    VirtualizedTreeEdge._dummyFromNode = this.diagram.nodeTemplate.copy();
    VirtualizedTreeEdge._dummyToNode = this.diagram.nodeTemplate.copy();
    VirtualizedTreeEdge._dummyLink.fromNode = VirtualizedTreeEdge._dummyFromNode;
    VirtualizedTreeEdge._dummyLink.toNode = VirtualizedTreeEdge._dummyToNode;
    this.diagram.add(VirtualizedTreeEdge._dummyFromNode);
    this.diagram.add(VirtualizedTreeEdge._dummyToNode);
    this.diagram.add(VirtualizedTreeEdge._dummyLink);

    super.commitLayout();
    // can't depend on regular bounds computation that depends on all Nodes existing
    this.diagram.fixedBounds = computeDocumentBounds();

    this.diagram.remove(VirtualizedTreeEdge._dummyFromNode);
    this.diagram.remove(VirtualizedTreeEdge._dummyToNode);
    this.diagram.remove(VirtualizedTreeEdge._dummyLink);

    // update the positions of any existing Nodes
    this.diagram.nodes.each((node) => node.updateTargetBindings());
  }

  setPortSpots(v) {
    v.destinationEdges.each((e) => {
      e.link = VirtualizedTreeLayout._cachedLinks.pop() || new go.Link();
    });
    super.setPortSpots(v);
    v.destinationEdges.each((e) => {
      if (e.data) {
        e.data.fromSpot = e.link.fromSpot.copy();
        e.data.toSpot = e.link.toSpot.copy();
      }
      VirtualizedTreeLayout._cachedLinks.push(e.link);
      e.link = null;
    });
  }
}

// end VirtualizedTreeLayout class

class VirtualizedTreeNetwork extends go.TreeNetwork {
  constructor(layout) {
    super(layout);
  }

  createEdge() {
    return new VirtualizedTreeEdge(this);
  }

  addData(model) {
    if (model instanceof go.TreeModel) {
      const dataVertexMap = new go.Map();
      const nData = model.nodeDataArray;
      for (let i = 0; i < nData.length; i++) {
        const d = nData[i];
        const v = this.createVertex();
        v.data = d; // associate this Vertex with data, not a Node
        dataVertexMap.set(d, v);
        this.addVertex(v);
      }

      for (let i = 0; i < nData.length; i++) {
        const child = nData[i];
        const parentKey = model.getParentKeyForNodeData(child);
        const parent = model.findNodeDataForKey(parentKey);
        if (parent !== null) {
          // if there is a parent, there should be an edge
          // now find corresponding vertexes
          const f = dataVertexMap.get(parent);
          const t = dataVertexMap.get(child);
          if (f === null || t === null) continue; // skip
          // create and add VirtualizedTreeEdge
          const e = this.createEdge();
          e.data = child; // associate this Edge with data, not a Link
          e.fromVertex = f;
          e.toVertex = t;
          this.addEdge(e);
        }
      }
    } else {
      throw new Error('can only handle TreeModel data');
    }
  }
}

// end VirtualizedTreeNetwork class

class VirtualizedTreeEdge extends go.TreeEdge {
  constructor(network) {
    super(network);
  }

  static _dummyLink = null;
  static _dummyFromNode = null;
  static _dummyToNode = null;

  commit() {
    const parentV = this.fromVertex;
    if (!parentV) return;
    const routed = parentV.alignment === go.TreeAlignment.Start || parentV.alignment === go.TreeAlignment.End;
    if (this.data && routed) {
      this.link = VirtualizedTreeEdge._dummyLink;
      this.link.fromNode.moveTo(this.fromVertex.x, this.fromVertex.y);
      this.link.toNode.moveTo(this.toVertex.x, this.toVertex.y);
      this.link.fromNode.ensureBounds();
      this.link.toNode.ensureBounds();
      this.link.updateRoute();
    }
    super.commit();
    if (this.data && routed) {
      this.data.points = this.link.points.copy();
      this.link = null;
    }
  }
}

// end of VirtualizedTree[Layout/Network] classes

// This function is only used in this sample to demonstrate the effects of the virtualization.
// In a real application you would delete this function and all calls to it.
function updateCounts() {
  document.getElementById('myMessage1').textContent = myWholeModel.nodeDataArray.length;
  document.getElementById('myMessage2').textContent = graphDiagram.nodes.count;
  document.getElementById('myMessage4').textContent = graphDiagram.links.count;
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

        <div id="description" class="mx-2 font-bold">
          Node data: <span id="myMessage1" class="text-purple-400"></span>
          Nodes: <span id="myMessage2" class="text-purple-400"></span>
          Links: <span id="myMessage4" class="text-purple-400"></span>
        </div>
      </div>
      <div class="flex align-items-center gap-2">
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

    <div id="sample" style="width: 100%; height: 90vh" class="flex-auto m-2 relative">
      <div id="DiagramDiv" style="background-color: white; border: solid 1px orange; width: 100%; height: 90vh"></div>
      <img id="Spinner" src="/spinner.png" alt="spinner-img"/>
    </div>
  </div>
</template>

<style scoped>
#Spinner {
  display: none;
  position: absolute;
  z-index: 100;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
