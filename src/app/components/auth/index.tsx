import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  Fade,
  Fab,
  Stack,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import styled from "styled-components";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { T } from "../../../lib/types/common";
import { Messages } from "../../../lib/config";
import { LoginInput, MemberInput } from "../../../lib/types/member";
import MemberService from "../../services/MemberService";
import { sweetErrorHandling } from "../../../lib/sweetAlert";
import { useGlobals } from "../../hooks/useGlobals";
import { useHistory, useLocation } from "react-router-dom";
import { MemberType } from "../../../lib/enums/member.enum";
import { useLanguage } from "../../context/LanguageContext";
import useDeviceDetect from "../../hooks/useDeviceDetect";
import "../../../css/auth-modal.css";

const ModalImg = styled.img`
  width: 62%;
  height: 100%;
  border-radius: 10px;
  background: #000;
  margin-top: 9px;
  margin-left: 10px;
`;

const Transition = React.forwardRef(function Transition(
  props: React.ComponentProps<typeof Fade>,
  ref: React.Ref<unknown>
) {
  return <Fade ref={ref} {...props} />;
});

interface AuthenticationModalProps {
  signupOpen: boolean;
  loginOpen: boolean;
  handleLoginClose: () => void;
  handleSignupClose: () => void;
}

export default function AuthenticationModal(props: AuthenticationModalProps) {
  const { signupOpen, loginOpen, handleSignupClose, handleLoginClose } = props;
  const history = useHistory();
  const location = useLocation();
  const redirectToProducts = location.pathname.startsWith("/products-link") ? "/products-link" : "/products";
  const { t } = useLanguage();
  const device = useDeviceDetect();
  const isMobile = device === "mobile";
  const [memberNick, setMemberNick] = useState<string>("");
  const [memberPhone, setMemberPhone] = useState<string>("");
  const [memberPassword, setMemberPassword] = useState<string>("");
  const { setAuthMember, setAuthTable } = useGlobals();

  const handleUsername = (e: T) => setMemberNick(e.target.value);
  const handlePhone = (e: T) => setMemberPhone(e.target.value);
  const handlePassword = (e: T) => setMemberPassword(e.target.value);

  const handlePasswordKeyDown = (e: T) => {
    if (e.key === "Enter" && signupOpen) handleSignupRequest();
    else if (e.key === "Enter" && loginOpen) handleLoginRequest();
  };

  const handleSignupRequest = async () => {
    try {
      const isFulfill = memberNick && memberPassword && memberPhone;
      if (!isFulfill) throw new Error(Messages.error3);

      const signupInput: MemberInput = {
        memberNick,
        memberPassword,
        memberPhone,
        memberType: MemberType.USER,
      };
      const member = new MemberService();
      const result = await member.signup(signupInput);
      setAuthMember(result);
      setAuthTable(null);
      setMemberPassword("");
      handleSignupClose();
      history.push(redirectToProducts);
    } catch (err) {
      handleSignupClose();
      sweetErrorHandling(err);
    }
  };

  const handleLoginRequest = async () => {
    try {
      const isFulfill = memberNick && memberPassword;
      if (!isFulfill) throw new Error(Messages.error3);

      const loginInput: LoginInput = { memberNick, memberPassword };
      const member = new MemberService();
      const result = await member.login(loginInput);
      setAuthMember(result);
      setAuthTable(null);
      setMemberPassword("");
      handleLoginClose();
      history.push(redirectToProducts);
    } catch (err) {
      handleLoginClose();
      sweetErrorHandling(err);
    }
  };

  return (
    <>
      {/* SIGNUP DIALOG */}
      <Dialog
        open={signupOpen}
        onClose={handleSignupClose}
        TransitionComponent={Transition}
        fullScreen={isMobile}
        maxWidth={false}
        PaperProps={{
          className: `auth-modal ${isMobile ? "mobile" : ""}`,
          sx: {
            p: isMobile ? 0 : 2,
            border: "2px solid #000",
            boxShadow: 5,
            width: isMobile ? "100%" : 800,
            maxWidth: isMobile ? "100%" : 800,
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Stack direction="row" className="auth-modal-inner">
            {!isMobile && <ModalImg src={"/img/auth.webp"} alt="camera" className="auth-modal-image" />}
            <Stack className="auth-modal-form" sx={{ alignItems: "center", justifyContent: "center" }}>
              <Typography className="auth-modal-title">{t("signup")}</Typography>
              <Box className="auth-modal-form-wrapper">
                <Box className="auth-modal-field-group">
                  <Typography className="auth-modal-helper">{t("signupNameHelper")}</Typography>
                  <TextField
                    id="signup-username"
                    label={t("signupUsername")}
                    variant="outlined"
                    fullWidth
                    onChange={handleUsername}
                  />
                </Box>
                <Box className="auth-modal-field-group">
                  <TextField
                    id="signup-phone"
                    label={t("signupPhone")}
                    variant="outlined"
                    fullWidth
                    onChange={handlePhone}
                  />
                </Box>
                <Box className="auth-modal-field-group">
                  <Typography className="auth-modal-helper">{t("signupPasswordHelper")}</Typography>
                  <TextField
                    id="signup-password"
                    label={t("signupPassword")}
                    type="password"
                    variant="outlined"
                    fullWidth
                    onChange={handlePassword}
                    onKeyDown={handlePasswordKeyDown}
                  />
                </Box>
                <Fab
                  className="auth-modal-submit"
                  variant="extended"
                  color="primary"
                  onClick={handleSignupRequest}
                >
                  <PersonAddIcon sx={{ mr: 1 }} />
                  {t("signup")}
                </Fab>
              </Box>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* LOGIN DIALOG */}
      <Dialog
        open={loginOpen}
        onClose={handleLoginClose}
        TransitionComponent={Transition}
        fullScreen={isMobile}
        maxWidth={false}
        PaperProps={{
          className: `auth-modal ${isMobile ? "mobile" : ""}`,
          sx: {
            p: isMobile ? 0 : 2,
            border: "2px solid #000",
            boxShadow: 5,
            width: isMobile ? "100%" : 700,
            maxWidth: isMobile ? "100%" : 700,
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Stack direction="row" className="auth-modal-inner">
            {!isMobile && <ModalImg src={"/img/auth.webp"} alt="camera" className="auth-modal-image" />}
            <Stack className="auth-modal-form" sx={{ alignItems: "center", justifyContent: "center" }}>
              <Typography className="auth-modal-title">{t("loginTitle")}</Typography>
              <Box className="auth-modal-form-wrapper">
                <Box className="auth-modal-field-group">
                  <Typography className="auth-modal-helper">{t("signupNameHelper")}</Typography>
                  <TextField
                    id="login-username"
                    label={t("loginUsername")}
                    variant="outlined"
                    fullWidth
                    onChange={handleUsername}
                  />
                </Box>
                <Box className="auth-modal-field-group">
                  <Typography className="auth-modal-helper">{t("signupPasswordHelper")}</Typography>
                  <TextField
                    id="login-password"
                    label={t("loginPassword")}
                    variant="outlined"
                    type="password"
                    fullWidth
                    onChange={handlePassword}
                    onKeyDown={handlePasswordKeyDown}
                  />
                </Box>
                <Fab
                  className="auth-modal-submit"
                  variant="extended"
                  color="primary"
                  onClick={handleLoginRequest}
                >
                  <LoginIcon sx={{ mr: 1 }} />
                  {t("login")}
                </Fab>
              </Box>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
