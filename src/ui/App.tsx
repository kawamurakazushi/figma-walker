import { h, render } from "preact";
import { useRef, useEffect, useReducer, useState } from "preact/hooks";

import { useKeyPress } from "./hooks/useKeyPress";
import { Action } from "./actions";
import { Store } from "./store";

import "./figma-ui.min.css";

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
          return { ...state, items: action.items };
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

  useEffect(() => {
    if (downPressed) {
      dispatch({ type: "NEXT" });
    }

    if (upPressed) {
      dispatch({ type: "PREV" });
    }

    if (enterPressed) {
      const item = store.items.filter(v =>
        v.name.toLowerCase().includes(store.search)
      )[store.selected];

      if (item) {
        parent.postMessage(
          {
            pluginMessage: { type: "select", id: item.id }
          },
          "*"
        );
      }
    }
  }, [downPressed, upPressed, enterPressed]);

  const input = useRef(null);
  useEffect(() => {
    input.current.focus();
  }, []);

  useEffect(() => {
    onmessage = event => {
      const data = event.data.pluginMessage;
      if (data) {
        console.log(data);
        dispatch({ type: "SET_ITEMS", items: data });
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
        onInput={(e: any) =>
          dispatch({ type: "INPUT_SEARCH", value: e.target.value })
        }
      />
      <div style={{ overflow: "auto" }}>
        {store.items
          .filter(v => v.name.toLowerCase().includes(store.search))
          .map((v, i) => {
            const style =
              store.selected === i ? { backgroundColor: "lightblue" } : {};
            return (
              <div
                className="type--12-pos-bold"
                onMouseEnter={() => dispatch({ type: "GO_TO", index: i })}
                style={{ ...style, ...{ padding: 8 } }}
                key={i}
              >
                {v.name}
              </div>
            );
          })}
      </div>
    </div>
  );
};

render(<App />, document.getElementById("app"));
