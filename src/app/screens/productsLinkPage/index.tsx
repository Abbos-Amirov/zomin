import React, { useState, useEffect } from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { Language } from "../../../lib/translations";
import { useGlobals } from "../../hooks/useGlobals";
import ChosenProduct from "../productsPage/ChosenProduct";
import Products from "../productsPage/Products";
import { CartItem } from "../../../lib/types/search";
import AuthRequired from "../../components/auth/AuthRequired";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LoginIcon from "@mui/icons-material/Login";
import "../../../css/products.css";
import "../../../css/welcome-landing.css";
import "../../../css/auth-required.css";

const languages: { code: Language; label: string }[] = [
  { code: "uz", label: "O'zbek" },
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "ru", label: "Русский" },
];

interface ProductsLinkPageProps {
  onAdd: (item: CartItem) => void;
  onSignup: () => void;
  onLogin: () => void;
}

export default function ProductsLinkPage(props: ProductsLinkPageProps) {
  const { onAdd, onSignup, onLogin } = props;
  const { authMember, authTable } = useGlobals();
  const { setLanguage, t } = useLanguage();
  const productsMatch = useRouteMatch("/products-link");
  const [phase, setPhase] = useState<"language" | "auth" | "products">("language");

  // When auth completes, go to products
  useEffect(() => {
    if (authMember && !authTable && phase === "auth") {
      setPhase("products");
    }
  }, [authMember, authTable, phase]);

  // If in products phase but no auth (link user), go back to auth
  useEffect(() => {
    if (phase === "products" && !authMember && !authTable) {
      setPhase("auth");
    }
  }, [phase, authMember, authTable]);

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setPhase("auth");
  };

  const handleSignupClick = () => {
    onSignup();
  };

  const handleLoginClick = () => {
    onLogin();
  };

  // Phase 1: Language selection
  if (phase === "language") {
    return (
      <div className="welcome-landing">
        <div className="welcome-landing-content">
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
        </div>
      </div>
    );
  }

  // Phase 2: Auth (signup/login)
  if (phase === "auth") {
    return (
      <div className="auth-required-wrapper">
        <AuthRequired onSignup={handleSignupClick} onLogin={handleLoginClick} />
      </div>
    );
  }

  // Phase 3: Products (identical to ProductsPage)
  const basePath = productsMatch?.path ?? "/products-link";
  return (
    <div className="products-page">
      <Switch>
        <Route path={`${basePath}/:productId`}>
          <ChosenProduct onAdd={onAdd} basePath={basePath} />
        </Route>
        <Route path={basePath}>
          <Products onAdd={onAdd} basePath={basePath} />
        </Route>
      </Switch>
    </div>
  );
}
