import { h, render } from "preact";
import { useRef, useEffect, useReducer, useState } from "preact/hooks";

import { useKeyPress } from "./hooks/useKeyPress";
import { Action } from "./actions";
import { Store, Item } from "./store";
import { Frame } from "./icons/Frame";
import { Component } from "./icons/Component";

import "./figma-ui.min.css";

const postItem = (item: Item | undefined) => {
  if (item) {
    parent.postMessage(
      {
        pluginMessage: { type: "select", id: item.id }
      },
      "*"
    );
  }
};

const App = () => {
  const [store, dispatch] = useReducer<Store, Action>(
    (state, action) => {
      switch (action.type) {
        case "INPUT_SEARCH":
          return {
            ...state,
            search: action.value,
            selected: 0
          };

        case "NEXT": {
          return {
            ...state,
            selected: state.selected + 1
          };
        }

        case "PREV": {
          if (state.selected > 0) {
            return {
              ...state,
              selected: state.selected - 1
            };
          }

          return state;
        }

        case "GO_TO": {
          return {
            ...state,
            selected: action.index
          };
        }

        case "SET_ITEMS": {
          return { ...state, items: [...state.items, ...action.items] };
        }
        default:
          return state;
      }
    },
    {
      search: "",
      selected: 0,
      items: []
    }
  );

  const downPressed = useKeyPress("ArrowDown");
  const upPressed = useKeyPress("ArrowUp");
  const enterPressed = useKeyPress("Enter");

  const items = store.items.filter(v =>
    v.name.toLowerCase().includes(store.search)
  );

  useEffect(() => {
    if (downPressed) {
      dispatch({ type: "NEXT" });
    }

    if (upPressed) {
      dispatch({ type: "PREV" });
    }

    if (enterPressed) {
      const item = items[store.selected];
      postItem(item);
    }
  }, [downPressed, upPressed, enterPressed]);

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
      console.log(message);
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
      <div style={{ overflow: "auto" }}>
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
              onClick={() => postItem(items[i])}
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
    </div>
  );
};

render(<App />, document.getElementById("app"));
