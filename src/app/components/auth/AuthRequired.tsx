import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useLanguage } from "../../context/LanguageContext";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LoginIcon from "@mui/icons-material/Login";
import "../../../css/auth-required.css";

interface AuthRequiredProps {
  onSignup: () => void;
  onLogin: () => void;
}

export default function AuthRequired(props: AuthRequiredProps) {
  const { onSignup, onLogin } = props;
  const { t } = useLanguage();

  return (
    <Box className="auth-required">
      <Box className="auth-required-content">
        <img src="/icons/zomin.svg" alt="Zomin" className="auth-required-logo" />
        <Typography className="auth-required-title">
          {t("authFirstTimeSignup")}
        </Typography>
        <Typography className="auth-required-subtitle">
          {t("authBeenHereLogin")}
        </Typography>
        <Stack direction="row" spacing={2} className="auth-required-buttons">
          <Button
            variant="contained"
            className="auth-required-signup-btn"
            startIcon={<PersonAddIcon />}
            onClick={onSignup}
          >
            {t("signup")}
          </Button>
          <Button
            variant="outlined"
            className="auth-required-login-btn"
            startIcon={<LoginIcon />}
            onClick={onLogin}
          >
            {t("login")}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
