import { useState, useEffect } from "react";

const useKeyPress = (targetKey1: string, callback: () => void) => {
  // State for keeping track of whether key is pressed
  const [key1Pressed, setKey1Pressed] = useState<number | null>(null);

  useEffect(() => {
    if (key1Pressed) {
      callback();
    }
  }, [key1Pressed]);

  // If pressed key is our target key then set to true
  function downHandler({ key }: { key: string }) {
    if (targetKey1 === key) {
      const t = new Date().getTime();
      setKey1Pressed(t);
    }
  }

  // If released key is our target key then set to false
  const upHandler = ({ key }: { key: string }) => {
    if (targetKey1 === key) {
      setKey1Pressed(null);
    }
  };

  // Add event listeners
  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return;
};

const useKeysPress2 = (
  targetKey1: string,
  targetKey2: string,
  callback: () => void
) => {
  // State for keeping track of whether key is pressed
  const [key1Pressed, setKey1Pressed] = useState<number | null>(null);
  const [key2Pressed, setKey2Pressed] = useState<number | null>(null);

  useEffect(() => {
    if (key1Pressed && key2Pressed) {
      callback();
    }
  }, [key1Pressed, key2Pressed]);

  // If pressed key is our target key then set to true
  function downHandler({ key }: { key: string }) {
    if (targetKey1 === key) {
      const t = new Date().getTime();
      setKey1Pressed(t);
    }
    if (targetKey2 === key) {
      const t = new Date().getTime();
      setKey2Pressed(t);
    }
  }

  // If released key is our target key then set to false
  const upHandler = ({ key }: { key: string }) => {
    if (targetKey1 === key) {
      setKey1Pressed(null);
    }
    if (targetKey2 === key) {
      setKey2Pressed(null);
    }
  };

  // Add event listeners
  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return;
};

export { useKeyPress, useKeysPress2 };
