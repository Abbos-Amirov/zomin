import React, { useState } from "react";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { useLanguage } from "../../context/LanguageContext";
import { Language } from "../../../lib/translations";
import "../../../css/mobile/navbar.css";

const languages: { code: Language; label: string }[] = [
  { code: "uz", label: "O'zbek" },
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "ru", label: "Русский" },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    handleClose();
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        className="language-switcher-btn"
        aria-label="Change language"
        size="small"
      >
        <img src="/icons/globe.svg" alt="" className="language-globe-icon" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 120,
            "& .MuiMenuItem-root": { fontSize: 14 },
          },
        }}
      >
        {languages.map(({ code, label }) => (
          <MenuItem
            key={code}
            onClick={() => handleSelect(code)}
            selected={language === code}
          >
            {label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
