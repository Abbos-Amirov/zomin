import React, { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { Language } from "../../../lib/translations";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LoginIcon from "@mui/icons-material/Login";
import "../../../css/welcome-landing.css";

const WELCOME_STORAGE_KEY = "zomin_welcome_completed";

const languages: { code: Language; label: string }[] = [
  { code: "uz", label: "O'zbek" },
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "ru", label: "Русский" },
];

export function isWelcomeCompleted(): boolean {
  return localStorage.getItem(WELCOME_STORAGE_KEY) === "true";
}

export function setWelcomeCompleted(): void {
  localStorage.setItem(WELCOME_STORAGE_KEY, "true");
}

interface WelcomeLandingProps {
  setSignupOpen: (open: boolean) => void;
  setLoginOpen: (open: boolean) => void;
}

export default function WelcomeLanding(props: WelcomeLandingProps) {
  const { setSignupOpen, setLoginOpen } = props;
  const { setLanguage, t } = useLanguage();
  const [phase, setPhase] = useState<"language" | "auth">("language");

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setPhase("auth");
  };

  const handleSignupClick = () => {
    setWelcomeCompleted();
    setSignupOpen(true);
  };

  const handleLoginClick = () => {
    setWelcomeCompleted();
    setLoginOpen(true);
  };

  return (
    <div className="welcome-landing">
      <div className="welcome-landing-content">
        {phase === "language" ? (
          <>
            <div className="welcome-logo">
              <img src="/icons/zomin.svg" alt="Zomin" />
            </div>
            <p className="welcome-lang-title-item">{t("authChooseLang")}</p>
            <div className="welcome-lang-buttons">
              {languages.map(({ code, label }) => (
                <button
                  key={code}
                  className="welcome-lang-btn"
                  onClick={() => handleLanguageSelect(code)}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="welcome-logo">
              <img src="/icons/zomin.svg" alt="Zomin" />
            </div>
            <p className="welcome-auth-title">{t("authFirstTimeSignup")}</p>
            <p className="welcome-auth-subtitle">{t("authBeenHereLogin")}</p>
            <div className="welcome-auth-buttons">
              <button
                className="welcome-lang-btn welcome-auth-signup"
                onClick={handleSignupClick}
              >
                <span className="welcome-btn-icon">
                  <PersonAddIcon sx={{ fontSize: 20 }} />
                </span>
                {t("signup")}
              </button>
              <button
                className="welcome-lang-btn welcome-auth-login"
                onClick={handleLoginClick}
              >
                <span className="welcome-btn-icon">
                  <LoginIcon sx={{ fontSize: 20 }} />
                </span>
                {t("login")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
