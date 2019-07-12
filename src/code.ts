figma.showUI(__html__, { width: 600, height: 350 });

const rootFrames = figma.currentPage.children;
figma.ui.postMessage(
  rootFrames.map(f => {
    return { id: f.id, name: f.name };
  })
);

figma.ui.onmessage = msg => {
  if (msg.type === "select") {
    const nodeId = msg.id;
    const node = figma.getNodeById(nodeId);

    figma.viewport.scrollAndZoomIntoView([node]);
  }

  figma.closePlugin();
};
