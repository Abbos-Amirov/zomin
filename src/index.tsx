// src/index.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./app/store";
import App from "./app/App";
import reportWebVitals from "./reportWebVitals";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./app/MaterialTheme";
import { BrowserRouter as Router } from "react-router-dom";
import "./css/index.css";
import "./css/dark-mode.css";
import ContextProvider from "./app/context/ContextProvider";
import { LanguageProvider } from "./app/context/LanguageContext";
import { DarkModeProvider } from "./app/context/DarkModeContext";

const container = document.getElementById("root")!;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ContextProvider>
        <LanguageProvider>
        <DarkModeProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <App />
          </Router>
        </ThemeProvider>
        </DarkModeProvider>
        </LanguageProvider>
      </ContextProvider>
    </Provider>
  </React.StrictMode>
);

reportWebVitals();
