import "../styles/global.scss";
import Store from "../components/Store";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { useEffect } from "react";

const App = ({ Component, pageProps }) => {
  const onUnload = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    // Provide a warning on page refresh
    window.addEventListener("beforeunload", onUnload);
    // Provide a warning on small devices
    if (window.innerWidth < 960 || screen.width < 960) {
      alert("This window is too small");
    }
  }, []);

  return (
    <Store>
      <Component {...pageProps} />
    </Store>
  );
};

export default App;
