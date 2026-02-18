import React from "react";
import { IconButton } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useDarkMode } from "../../context/DarkModeContext";
import "../../../css/mobile/navbar.css";

export default function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <IconButton
      onClick={toggleDarkMode}
      className="dark-mode-toggle-btn"
      aria-label={darkMode ? "Light mode" : "Dark mode"}
      size="small"
    >
      {darkMode ? (
        <LightModeIcon className="dark-mode-icon" />
      ) : (
        <DarkModeIcon className="dark-mode-icon" />
      )}
    </IconButton>
  );
}
