<script id="code">
import go from 'gojs'
import tree from '../tree/tree.json'

// this controls whether the tree grows deeper towards the right or downwards:
const HORIZONTAL = true
let graphDiagram = null
let myWholeModel = null

function init() {
  // ------------------------ creating the diagram
  graphDiagram = new go.Diagram('myDiagramDiv', {
    initialDocumentSpot: go.Spot.Center,
    initialViewportSpot: go.Spot.Center,

    // Use a virtualized TreeLayout which does not require
    // that the Nodes and Links exist first for an accurate layout
    layout: new VirtualizedTreeLayout({angle: HORIZONTAL ? 0 : 90, nodeSpacing: 10}), // --------- Layout

    // Define the template for Nodes, used by virtualization.
    nodeTemplate: new go.Node('Auto', { // ------------------------------------------------ node template
      isLayoutPositioned: false,
      width: 70,
      height: 20, // in cooperation with the load function, below
      toolTip: go.GraphObject.build('ToolTip').add(new go.TextBlock({margin: 3})
          .bind('text', '', (d) => 'key: ' + d.key + '\nbounds: ' + d.bounds.toString()))
    }) // optimization
        .bindTwoWay('position', 'bounds', (b) => b.position,
            (p, d) => new go.Rect(p.x, p.y, d.bounds.width, d.bounds.height))
        .add(
            new go.Shape('Rectangle').bind('fill', 'color'),
            new go.TextBlock({margin: 2}).bind('text', 'color')
        ),

    // Define the template for Links
    linkTemplate: new go.Link({ // ------------------------------------------------ link template
      fromSpot: HORIZONTAL ? go.Spot.Right : go.Spot.Bottom,
      toSpot: HORIZONTAL ? go.Spot.Left : go.Spot.Top
    })
        .add(new go.Shape()),

    SelectionMoved: (e) => {
      e.subject.each((n) => {
        if (n instanceof go.Node) n.data.points = undefined
      })
    },

    'animationManager.isEnabled': false
  });

// This model includes all the data
  myWholeModel = new go.TreeModel() // must match the model used by the Diagram, below

  // The virtualized layout works on the full model, not on the Diagram Nodes and Links
  graphDiagram.layout.model = myWholeModel

  // Do not set graphDiagram.model = myWholeModel -- that would create a zillion Nodes and Links!
  // In the future Diagram may have built-in support for virtualization.
  // For now, we have to implement virtualization ourselves by having the Diagram's model
  // be different from the "real" model.
  graphDiagram.model = // this only holds nodes that should be in the viewport
      new go.TreeModel() // must match the model, above

  // for now, we have to implement virtualization ourselves
  graphDiagram.isVirtualized = true
  graphDiagram.addDiagramListener('ViewportBoundsChanged', onViewportChanged)

  graphDiagram.delayInitialization((diagram) => spinDuring(diagram, 'mySpinner', load))
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
  // create a lot of data for the myWholeModel
  const total = 123456
  const treedata = tree
  for (let i = 0; i < treedata.length; i++) {
    const d = {
      key: i.id, // this node data's key
      color: i.title, // the node's color
      parent: i.parent // the random parent's key
    }
    //!!!???@@@ this needs to be customized to account for your chosen Node template
    d.bounds = new go.Rect(0, 0, 70, 20)
    treedata.push(d)
  }
  myWholeModel.nodeDataArray = treedata
  graphDiagram.layoutDiagram(true)
}

// The following functions implement virtualization of the Diagram
// Assume data.bounds is a Rect of the area occupied by the Node in document coordinates.

// The normal mechanism for determining the size of the document depends on all the
// Nodes and Links existing, so we need to use a function that depends only on the model data.
function computeDocumentBounds() {
  const b = new go.Rect()
  const ndata = myWholeModel.nodeDataArray
  for (let i = 0; i < ndata.length; i++) {
    const d = ndata[i]
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
  const viewb = diagram.viewportBounds // the new viewportBounds
  const model = diagram.model

  const oldskips = diagram.skipsUndoManager
  diagram.skipsUndoManager = true

  const b = new go.Rect();
  const ndata = myWholeModel.nodeDataArray;
  for (let i = 0; i < ndata.length; i++) {
    const n = ndata[i];
    if (model.containsNodeData(n)) continue;
    if (!n.bounds) continue;
    if (n.bounds.intersectsRect(viewb)) {
      model.addNodeData(n);
    }
    if (model instanceof go.TreeModel) {
      // make sure links to all parent nodes appear
      const parentkey = myWholeModel.getParentKeyForNodeData(n);
      const parent = myWholeModel.findNodeDataForKey(parentkey);
      if (parent !== null) {
        if (n.bounds.intersectsRect(viewb)) {
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
          if (b.intersectsRect(viewb)) {
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
    const ldata = myWholeModel.linkDataArray;
    for (let i = 0; i < ldata.length; i++) {
      const l = ldata[i];
      const fromkey = myWholeModel.getFromKeyForLinkData(l);
      if (fromkey === undefined) continue;
      const from = myWholeModel.findNodeDataForKey(fromkey);
      if (from === null || !from.bounds) continue;

      const tokey = myWholeModel.getToKeyForLinkData(l);
      if (tokey === undefined) continue;
      const to = myWholeModel.findNodeDataForKey(tokey);
      if (to === null || !to.bounds) continue;

      b.set(from.bounds);
      b.unionRect(to.bounds);
      if (b.intersectsRect(viewb)) {
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

  diagram.skipsUndoManager = oldskips;

  if (myRemoveTimer === null) {
    // only remove offscreen nodes after a delay
    myRemoveTimer = setTimeout(() => removeOffscreen(diagram), 3000);
  }

  // updateCounts(); // only for this sample
}

// occasionally remove Parts that are offscreen from the Diagram
myRemoveTimer = null

function removeOffscreen(diagram) {
  myRemoveTimer = null;

  const viewb = diagram.viewportBounds;
  const model = diagram.model;
  const remove = []; // collect for later removal
  const removeLinks = new go.Set(); // links connected to a node data to remove
  const it = diagram.nodes;
  while (it.next()) {
    const n = it.value;
    const d = n.data;
    if (d === null) continue;
    if (!n.actualBounds.intersectsRect(viewb) && !n.isSelected) {
      // even if the node is out of the viewport, keep it if it is selected or
      // if any link connecting with the node is still in the viewport
      if (!n.linksConnected.any((l) => l.actualBounds.intersectsRect(viewb))) {
        remove.push(d);
        if (model instanceof go.GraphLinksModel) {
          removeLinks.addAll(n.linksConnected);
        }
      }
    }
  }

  if (remove.length > 0) {
    const oldskips = diagram.skipsUndoManager;
    diagram.skipsUndoManager = true;
    model.removeNodeDataCollection(remove);
    if (model instanceof go.GraphLinksModel) {
      removeLinks.each((l) => {
        if (!l.isSelected) model.removeLinkData(l.data);
      });
    }
    diagram.skipsUndoManager = oldskips;
  }

  // updateCounts(); // only for this sample
}

// end of virtualized Diagram

// start of VirtualizedTree[Layout/Network] classes

// Here we try to replace the dependence of TreeLayout on Nodes
// with depending only on the data in the TreeModel.
class VirtualizedTreeLayout extends go.TreeLayout {
  constructor() {
    super()
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
      const ndata = model.nodeDataArray;
      for (let i = 0; i < ndata.length; i++) {
        const d = ndata[i];
        const v = this.createVertex();
        v.data = d; // associate this Vertex with data, not a Node
        dataVertexMap.set(d, v);
        this.addVertex(v);
      }

      for (let i = 0; i < ndata.length; i++) {
        const child = ndata[i];
        const parentkey = model.getParentKeyForNodeData(child);
        const parent = model.findNodeDataForKey(parentkey);
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
    const parentv = this.fromVertex;
    if (!parentv) return;
    const routed = parentv.alignment === go.TreeAlignment.Start || parentv.alignment === go.TreeAlignment.End;
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
  // if (myWholeModel) {
  //   document.getElementById('myMessage1').textContent = myWholeModel.nodeDataArray.length;
  // } else {
  //   console.error("myWholeModel is not initialized!");
  // }
  // document.getElementById('myMessage2').textContent = graphDiagram.nodes.count;
  // document.getElementById('myMessage4').textContent = graphDiagram.links.count;
}

window.addEventListener('DOMContentLoaded', init);
</script>

<template>
  <div id="sample">
    <div id="myDiagramDiv" style="background-color: white; border: solid 1px black; width: 100%; height: 600px"></div>
    <img id="mySpinner" src="../../public/spinner.png"/>
  </div>
</template>

<style scoped>
#mySpinner {
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
