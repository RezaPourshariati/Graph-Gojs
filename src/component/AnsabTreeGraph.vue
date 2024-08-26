<script id="code">
import go from 'gojs'
import tree from '../tree/tree.json'

// this controls whether the tree grows deeper towards the right or downwards:
const HORIZONTAL = true
let graphDiagram = null
let myWholeModel = null
let myLoading = null

function init() {
  graphDiagram = new go.Diagram('DiagramDiv', {
    initialDocumentSpot: go.Spot.Center,
    initialViewportSpot: go.Spot.Center,

    // Do manual layout in the layoutTree function below, rather than automatic layout using a
    // TreeLayout which would require the Nodes and Links to exist first for an accurate layout.
    //layout: new go.TreeLayout(
    //          { nodeSpacing: 4, compaction: go.TreeCompaction.None }),
    // Assume there's no Layout -- all data.bounds are calculated in layoutTree
    layout: new go.Layout({isInitial: false, isOngoing: false}), // never invalidates

    // Define the template for Nodes, used by virtualization.
    nodeTemplate: new go.Node('Auto', {
      isLayoutPositioned: false,
      width: 70,
      height: 20, // in cooperation with the load function, below
      toolTip: go.GraphObject.build('ToolTip')
          .add(
              new go.TextBlock({margin: 3})
                  .bind('text', '', (d) => 'key: ' + d.key + '\nbounds: ' + d.bounds.toString())
          )
    }) // optimization
        .bindTwoWay('position', 'bounds', (b) => b.position,
            (p, d) => new go.Rect(p.x, p.y, d.bounds.width, d.bounds.height))
        .add(
            new go.Shape('Rectangle').bind('fill', 'color'),
            new go.TextBlock({margin: 2}).bind('text', 'title')
        ),

    // Define the template for Links
    linkTemplate: new go.Link({
      isLayoutPositioned: false, // optimization
      fromSpot: HORIZONTAL ? go.Spot.Right : go.Spot.Bottom,
      toSpot: HORIZONTAL ? go.Spot.Left : go.Spot.Top
    })
        .add(
            new go.Shape()
        ),

    'animationManager.isEnabled': false
  });

  // This model includes all the data
  myWholeModel = new go.TreeModel(); // must match the TreeModel used by the Diagram, below

  // Do not set graphDiagram.model = myWholeModel -- that would create a zillion Nodes and Links!
  // In the future Diagram may have built-in support for virtualization.
  // For now, we have to implement virtualization ourselves by having the Diagram's model
  // be different from the "real" model.
  graphDiagram.model = // this only holds nodes that should be in the viewport
      new go.TreeModel(); // must match the model, above

  // for now, we have to implement virtualization ourselves
  graphDiagram.isVirtualized = true;
  graphDiagram.addDiagramListener('ViewportBoundsChanged', onViewportChanged);

  // This is a status message
  const textBlock = new go.TextBlock('loading...', {stroke: 'red', font: '20pt sans-serif'});
  myLoading = new go.Part({layerName: 'ViewportForeground', alignment: go.Spot.Center})
      .add(textBlock);

  // // temporarily add the status indicator
  // const animate = (state) => {
  //   textBlock.text = 'loading' + '.'.repeat(state);
  //   console.log('int');
  //   setTimeout(() => {
  //     animate(state++);
  //   }, 50);
  // };
  // animate(0);
  graphDiagram.add(myLoading);

  // Allow the myLoading indicator to be shown now,
  // but allow objects added in load to also be considered part of the initial Diagram.
  // If you are not going to add temporary initial Parts, don't call delayInitialization.
  graphDiagram.delayInitialization(load);
}

// implement a wait spinner in HTML with CSS animation
// function spinDuring(diagram, spinner, compute) {
//   // where compute is a function of zero args
//   // show the animated spinner
//   if (typeof spinner === 'string') spinner = document.getElementById(spinner);
//   if (spinner) {
//     // position it in the middle of the viewport DIV
//     const x = Math.floor(diagram.div.offsetWidth / 2 - spinner.naturalWidth / 2);
//     const y = Math.floor(diagram.div.offsetHeight / 2 - spinner.naturalHeight / 2);
//     spinner.style.left = x + 'px';
//     spinner.style.top = y + 'px';
//     spinner.style.display = 'inline';
//   }
//   setTimeout(() => {
//     try {
//       compute(); // do the computation
//     } finally {
//       if (spinner) spinner.style.display = 'none';
//     }
//   }, 20);
// }

function load(diagram) {
  // create a lot of data for the myWholeModel
  const total = tree.length;
  const treeData = [];
  for (let i = 0; i < total; i++) {
    const node = tree[i]
    const d = {
      key: node.key, // this node data's key
      color: go.Brush.randomColor(),
      title: node.title, // the node's color
      parent: i > 0 ? node.parent : undefined // the random parent's key
    };
    //!!!???@@@ this needs to be customized to account for your chosen Node template
    d.bounds = new go.Rect(0, 0, 70, 20);
    treeData.push(d);
  }
  myWholeModel.nodeDataArray = treeData;

  // make it faster to get from a model parent data object to all the children data
  improveNavigation(myWholeModel);

  // this sets the data.bounds on each node data
  // and Diagram.fixedBounds on the diagram, so the diagram knows how far it can scroll
  layoutTree(myWholeModel);

  // remove the status indicator
  diagram.remove(myLoading);
}

// this adds ._parent and ._children properties on each node data
function improveNavigation(model) {
  // this must be a TreeModel
  const nData = model.nodeDataArray;
  // create an Array of child data references for each parent data
  for (let i = 0; i < nData.length; i++) {
    const child = nData[i];
    const parentKey = model.getParentKeyForNodeData(child);
    const parent = model.findNodeDataForKey(parentKey);
    if (parent) {
      child._parent = parent;
      const childArr = parent._children;
      if (childArr) {
        childArr.push(child);
      } else {
        parent._children = [child];
      }
    }
  }
}

// The following functions implement virtualization of the Diagram
// Assume data.bounds is a Rect of the area occupied by the Node in document coordinates.

// The normal mechanism for determining the size of the document depends on all the
// Nodes and Links existing, so we need to use a function that depends only on the model data.
function computeDocumentBounds() {
  const b = new go.Rect();
  const nData = myWholeModel.nodeDataArray;
  for (let i = 0; i < nData.length; i++) {
    const d = nData[i];
    if (!d.bounds) continue;
    if (i === 0) {
      b.set(d.bounds);
    } else {
      b.unionRect(d.bounds);
    }
  }
  return b;
}

let myRemoveTimer;

// As the user scrolls or zooms, make sure the Parts (Nodes and Links) exist in the viewport.
function onViewportChanged(e) {
  const diagram = e.diagram;
  // make sure there are Nodes for each node data that is in the viewport
  // or that is connected to such a Node
  const viewb = diagram.viewportBounds; // the new viewportBounds
  const model = diagram.model;

  const oldskips = diagram.skipsUndoManager;
  diagram.skipsUndoManager = true;

  const b = new go.Rect();
  const ndata = myWholeModel.nodeDataArray;
  for (let i = 0; i < ndata.length; i++) {
    const n = ndata[i];
    if (model.containsNodeData(n)) continue;
    if (!n.bounds) continue;
    if (n.bounds.intersectsRect(viewb)) {
      model.addNodeData(n);
    }
    // make sure links to all parent nodes appear
    const parentkey = myWholeModel.getParentKeyForNodeData(n);
    const parent = myWholeModel.findNodeDataForKey(parentkey);
    if (parent !== null) {
      if (n.bounds.intersectsRect(viewb)) {
        // N is inside viewport
        model.addNodeData(parent); // so that link to parent appears
      } else {
        // N is outside of viewport
        // see if there's a parent that is in the viewport,
        // or if the link might cross over the viewport
        b.set(n.bounds);
        b.unionRect(parent.bounds);
        if (b.intersectsRect(viewb)) {
          model.addNodeData(n); // add N so that link to parent appears
        }
      }
    }
  }

  diagram.skipsUndoManager = oldskips;

  if (myRemoveTimer === null) {
    // only remove offscreen nodes after a delay
    myRemoveTimer = setTimeout(() => removeOffscreen(diagram), 3000);
  }

  updateCounts(); // only for this sample
}

// occasionally remove Parts that are offscreen from the Diagram
myRemoveTimer = null;

function removeOffscreen(diagram) {
  myRemoveTimer = null;

  const viewb = diagram.viewportBounds;
  const model = diagram.model;
  const remove = []; // collect for later removal
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
      }
    }
  }

  if (remove.length > 0) {
    const oldskips = diagram.skipsUndoManager;
    diagram.skipsUndoManager = true;
    model.removeNodeDataCollection(remove);
    diagram.skipsUndoManager = oldskips;
  }

  updateCounts(); // only for this sample
}
// end of virtualized Diagram

// A very simple tree layout.
// Basic tree layout parameters
const nodeSpacing = 4;
const layerSpacing = 50;

// Layout the whole tree just using the model, not any Nodes or Links.
function layoutTree(model) {
  let d;
  let i;
  const ndata = model.nodeDataArray;
  // layout each tree root
  if (HORIZONTAL) {
    let y = 0;
    for (i = 0; i < ndata.length; i++) {
      d = ndata[i];
      // is this a root node?
      if (!d._parent) {
        y = walkTreeH(d, 0, y) + d.bounds.height + nodeSpacing;
      }
    }
  } else {
    // !HORIZONTAL
    let x = 0;
    for (i = 0; i < ndata.length; i++) {
      d = ndata[i];
      // is this a root node?
      if (!d._parent) {
        x = walkTreeV(d, x, 0) + d.bounds.width + nodeSpacing;
      }
    }
  }

  // can't depend on regular bounds computation that depends on all Nodes existing
  graphDiagram.fixedBounds = computeDocumentBounds();
}

// Walk subtrees from each root node, positioning as we go.
function walkTreeH(parent, oldx, oldy) {
  // HORIZONTAL
  const origy = oldy;
  let newy = oldy;
  const childarr = parent._children;
  if (childarr) {
    for (let i = 0; i < childarr.length; i++) {
      const child = childarr[i];
      newy = walkTreeH(child, oldx + child.bounds.width + layerSpacing, oldy);
      oldy = newy + child.bounds.height + nodeSpacing;
    }
  }
  parent.bounds.x = oldx;
  parent.bounds.y = (origy + newy) / 2;
  return newy;
}

function walkTreeV(parent, oldx, oldy) {
  // !HORIZONTAL
  const origx = oldx;
  let newx = oldx;
  const childarr = parent._children;
  if (childarr) {
    for (let i = 0; i < childarr.length; i++) {
      const child = childarr[i];
      newx = walkTreeV(child, oldx, oldy + child.bounds.height + layerSpacing);
      oldx = newx + child.bounds.width + nodeSpacing;
    }
  }
  parent.bounds.x = (origx + newx) / 2;
  parent.bounds.y = oldy;
  return newx;
}
// end of layoutTree functionality

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
  <div id="sample">
    <div id="DiagramDiv" style="background-color: white; border: solid 1px black; width: 100%; height: 600px"></div>
    <div id="description">
      <p>This uses a <a>TreeModel</a> but not <a>TreeLayout</a>.</p>
      Node data in Model: <span id="myMessage1"></span>. Actual Nodes in Diagram: <span id="myMessage2"></span>. Actual Links in Diagram:
      <span id="myMessage4"></span>.
    </div>
    <br>
  </div>
</template>

<style scoped>
</style>
