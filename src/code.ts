figma.showUI(__html__, { width: 600, height: 310 });

// const rootFrames = figma.currentPage.children;
const root = figma.root;

// TODO: After the API is ready to able to change currentPage
const pages = root.children.map(p => {
  return { id: p.id, name: p.name, type: p.type, page: null };
});

// TODO: After the API is ready to be a le to change currentPage
const topFrames = root.children
  .map(p =>
    p.type === "PAGE"
      ? p.children.map(f => ({
          id: f.id,
          name: f.name,
          type: f.type,
          page: p.name
        }))
      : null
  )
  .reduce((acc, val) => {
    return acc.concat(val);
  }, []);

figma.ui.onmessage = msg => {
  if (msg.type === "select") {
    const nodeId = msg.id;
    const node = figma.getNodeById(nodeId);

    // change page
    if (node.type !== "DOCUMENT" && node.type !== "PAGE") {
      figma.currentPage.selection = [node];
    }

    figma.viewport.scrollAndZoomIntoView([node]);

    figma.closePlugin();
  }

  if (msg.type === "FETCH_FRAMES") {
    // TODO: Find all pages, and not current page
    const currentTopFrames = figma.currentPage.children
      .filter(node => node.type === "FRAME")
      .map(node => ({
        id: node.id,
        name: node.name,
        type: node.type,
        page: figma.currentPage.name
      }));

    figma.ui.postMessage({ type: "FRAME", data: currentTopFrames });
  }

  if (msg.type === "FETCH_COMPONENTS") {
    const components = figma.currentPage
      .findAll(node => node.type === "COMPONENT")
      .map(node => ({
        id: node.id,
        name: node.name,
        type: node.type,
        page: figma.currentPage.name
      }));
    figma.ui.postMessage({ type: "COMPONENT", data: components });
  }
};
