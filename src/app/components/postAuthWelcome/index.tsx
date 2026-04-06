import React from "react";
import "../../../css/post-auth-welcome.css";

interface PostAuthWelcomeProps {
  onContinue: () => void;
}

export default function PostAuthWelcome(props: PostAuthWelcomeProps) {
  const { onContinue } = props;

  return (
    <div className="post-auth-welcome">
      <div className="post-auth-welcome-content">
        <div className="post-auth-welcome-logo">
          <img src="/icons/zomin.svg" alt="Zomin" />
        </div>
        <h1 className="post-auth-welcome-title-uz">Xush kelibsiz Zomin oshxonasiga!</h1>
        <p className="post-auth-welcome-subtitle-uz">
          Siz Zomin oshxonasiga xush kelibsiz
        </p>
        <h2 className="post-auth-welcome-title-en">Welcome to Zomin Restaurant!</h2>
        <p className="post-auth-welcome-subtitle-en">
          Welcome to Zomin Restaurant
        </p>
        <button className="post-auth-welcome-btn" onClick={onContinue}>
          Davom etish / Continue
        </button>
      </div>
    </div>
  );
}
