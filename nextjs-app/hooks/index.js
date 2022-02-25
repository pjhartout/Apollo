import { useCallback, useEffect, useRef, useState } from "react";

// Hook to close modals on click outside
export const useOnClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (e) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(e.target)) {
        return;
      }

      handler(e);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

export const useDebouncedEffect = (effect, delay, deps) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const callback = useCallback(effect, deps);

  useEffect(() => {
    const handler = setTimeout(() => {
      callback();
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [callback, delay]);
};

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      function handleResize() {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
      window.addEventListener("resize", handleResize);
      handleResize();
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);
  return windowSize;
};
