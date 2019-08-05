figma.showUI(__html__, { width: 600, height: 310 });

figma.ui.onmessage = msg => {
  if (msg.type === "CLOSE") {
    figma.closePlugin();
  }

  if (msg.type === "JUMP") {
    const nodeId = msg.id;
    const node = figma.getNodeById(nodeId);

    // Change Page
    if (node.parent.type === "PAGE") {
      figma.currentPage = node.parent;
    }

    // Select the Node
    if (node.type !== "DOCUMENT" && node.type !== "PAGE") {
      figma.currentPage.selection = [node];
      figma.viewport.scrollAndZoomIntoView([node]);
    }

    // If Page
    if (node.type === "PAGE") {
      figma.currentPage = node;
    }

    figma.closePlugin();
  }

  if (msg.type === "INSERT") {
    const nodeId = msg.id;
    const node = figma.getNodeById(nodeId);

    if (node.type === "COMPONENT") {
      const { x, y } = figma.viewport.center;
      const instance = node.createInstance();

      instance.x = x;
      instance.y = y;
      figma.currentPage.appendChild(instance);
      figma.currentPage.selection = [instance];
    }

    figma.closePlugin();
  }

  if (msg.type === "FETCH_FRAMES") {
    const pages = figma.root.children.map(p => ({
      id: p.id,
      name: p.name,
      type: p.type
      // page: p.name
    }));

    const topFrames = figma.root.children
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

    figma.ui.postMessage({ type: "FRAME", data: [...pages, ...topFrames] });
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
