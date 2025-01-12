import React from "react";
import { createRoot } from "react-dom/client";

import {Home} from "./Home";

export const App = () => {
    return(
      <div>
    <Home />
    </div>
    );
  };

const appDiv = document.getElementById("app");
const root = createRoot(appDiv);
root.render(<App />);