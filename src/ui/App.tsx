import { h, render } from "preact";
import { useRef, useEffect, useReducer, useState } from "preact/hooks";

import { useKeyPress } from "./hooks/useKeyPress";
import { Frame } from "./icons/Frame";
import { Component } from "./icons/Component";
import {
  useStoreReducer,
  filterItemsSelector,
  Item,
  modeSelector,
  Mode
} from "./hooks/useStoreReducer";

import "./figma-ui.min.css";

// send the selected item to Figma
const postItem = (item: Item | undefined, mode: Mode) => {
  if (item) {
    switch (mode) {
      case "jump": {
        parent.postMessage(
          {
            pluginMessage: { type: "JUMP", id: item.id }
          },
          "*"
        );
      }
      case "insert": {
        parent.postMessage(
          {
            pluginMessage: { type: "INSERT", id: item.id }
          },
          "*"
        );
      }
    }
  }
};

const App = () => {
  const [store, dispatch] = useStoreReducer();

  const downPressed = useKeyPress("ArrowDown");
  const upPressed = useKeyPress("ArrowUp");
  const enterPressed = useKeyPress("Enter");
  const ctrlPressed = useKeyPress("Control");
  const nPressed = useKeyPress("n");
  const pPressed = useKeyPress("p");

  const items = filterItemsSelector(store);

  useEffect(() => {
    if (downPressed || (ctrlPressed && nPressed)) {
      dispatch({ type: "NEXT" });
    }

    if (upPressed || (ctrlPressed && pPressed)) {
      dispatch({ type: "PREV" });
    }

    if (enterPressed) {
      const item = items[store.selected];
      postItem(item, modeSelector(store));
    }
  }, [downPressed, upPressed, enterPressed, ctrlPressed, nPressed, pPressed]);

  const input = useRef(null);
  useEffect(() => {
    input.current.focus();
  }, []);

  useEffect(() => {
    parent.postMessage(
      {
        pluginMessage: { type: "FETCH_FRAMES" }
      },
      "*"
    );
    onmessage = event => {
      const message = event.data.pluginMessage;
      if (message) {
        if (message.type === "FRAME") {
          dispatch({ type: "SET_ITEMS", items: message.data });
          parent.postMessage(
            {
              pluginMessage: { type: "FETCH_COMPONENTS" }
            },
            "*"
          );
        }

        if (message.type === "COMPONENT") {
          dispatch({ type: "SET_ITEMS", items: message.data });
        }
      }
    };
  }, []);

  const wrapper = useRef(null);

  useEffect(() => {
    if (wrapper.current) {
      if (store.selected === 0) {
        wrapper.current.scrollTo(0, 0);
        return;
      }
      const blockHeight = 32;
      const offset = (store.selected + 1) * blockHeight;
      const displayOffset = store.scrollTop + 256;

      // scroll down
      if (displayOffset < offset) {
        wrapper.current.scrollTo(0, store.scrollTop + blockHeight);
      }

      // scroll up
      if (store.scrollTop >= offset) {
        wrapper.current.scrollTo(0, store.scrollTop - blockHeight);
      }
    }
  }, [store.selected]);

  const onResultScroll = e => {
    const target = e.currentTarget;
    if (target) {
      dispatch({ type: "SET_SCROLL_TOP", scrollTop: target.scrollTop });
    }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <input
        ref={input}
        className="input"
        style={{ marginBottom: 8 }}
        type="text"
        placeholder="Jump to a Frame in your current page"
        onInput={(e: any) =>
          dispatch({ type: "INPUT_SEARCH", value: e.target.value })
        }
      />
      {store.loading ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div className="type--12-pos">loading...</div>
        </div>
      ) : (
        <div
          id="result"
          onScroll={onResultScroll}
          ref={wrapper}
          style={{ overflow: "auto" }}
        >
          {items.map((v, i) => {
            const style =
              store.selected === i
                ? { backgroundColor: "rgba(24, 160, 251, 0.3)" }
                : {};
            return (
              <div
                className="type--12-pos"
                style={{
                  ...style,
                  ...{ padding: 8, cursor: "pointer", display: "flex" }
                }}
                key={i}
                onMouseEnter={() => dispatch({ type: "GO_TO", index: i })}
                onClick={() => postItem(items[i], modeSelector(store))}
              >
                {v.type === "COMPONENT" ? <Component /> : <Frame />}
                <div style={{ margin: "0 8px" }}>{v.name}</div>
                <div style={{ color: "rgba(0, 0, 0, 0.3)" }}>{v.page}</div>
              </div>
            );
          })}
          {items.length === 0 && (
            <div className="type--11-pos" style={{ padding: "0 8px" }}>
              No result found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

render(<App />, document.getElementById("app"));
