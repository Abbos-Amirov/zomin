import React from "react";
import { Box, Container, Stack } from "@mui/material";
import { Link, NavLink, useLocation } from "react-router-dom";
import styled from "styled-components";
import useDeviceDetect from "../../hooks/useDeviceDetect";
import { useGlobals } from "../../hooks/useGlobals";
import { RESTAURANT_NAME } from "../../../lib/config";
import { useLanguage } from "../../context/LanguageContext";
import {
  getMenuProductsPath,
  getOrdersPath,
  isMenuProductsActive,
} from "../../../lib/menuProductsPath";
import "../../../css/mobile/footer.css";

const Footers = styled.div`
  width: 100%;
  height: 590px;
  display: flex;
  background: #343434;
  background-size: cover;
`;

export default function Footer() {
  const { authMember, authTable } = useGlobals();
  const location = useLocation();
  const menuProductsPath = getMenuProductsPath(authTable);
  const ordersPath = getOrdersPath(authTable, authMember);
  const device = useDeviceDetect();
  const { t } = useLanguage();

  if (device === "mobile") {
    return (
      <footer className="mobile-footer">
        <div className="mobile-footer-content">
          <Box className="mobile-footer-brand">
            <img
              className="mobile-footer-logo"
              src="/icons/zomin.svg"
              alt={RESTAURANT_NAME}
            />
            <span className="mobile-footer-restaurant-name">{RESTAURANT_NAME}</span>
            <p className="mobile-footer-tagline">
              {t("authenticFlavors")}
            </p>
          </Box>

          <Box className="mobile-footer-links">
            <NavLink
              to={menuProductsPath}
              isActive={() =>
                isMenuProductsActive(location.pathname, menuProductsPath)
              }
            >
              {t("menu")}
            </NavLink>
            {(authTable || authMember) && <NavLink to="/orders">{t("orders")}</NavLink>}
            <NavLink to="/help">{t("help")}</NavLink>
          </Box>

          <div className="mobile-footer-divider" />

          <Box className="mobile-footer-contact">
            <div className="mobile-footer-contact-item">
              <span>L.</span>
              <span>충청남도 천안시 동남구 터미널4길 26</span>
            </div>
            <div className="mobile-footer-contact-item">
              <span>P.</span>
              <span>070-4833-1959</span>
            </div>
            <div className="mobile-footer-contact-item">
              <span>E.</span>
              <span>zomin.restaurant@gmail.com</span>
            </div>
            <div className="mobile-footer-contact-item">
              <span>H.</span>
              <span>{t("open247")}</span>
            </div>
          </Box>

          <Box className="mobile-footer-social">
            <a href="#" aria-label="Facebook">
              <img src="/icons/facebook.svg" alt="" />
            </a>
            <a href="#" aria-label="Twitter">
              <img src="/icons/twitter.svg" alt="" />
            </a>
            <a href="#" aria-label="Instagram">
              <img src="/icons/instagram.svg" alt="" />
            </a>
            <a href="#" aria-label="YouTube">
              <img src="/icons/youtube.svg" alt="" />
            </a>
          </Box>

          <div className="mobile-footer-divider" />

          <span className="mobile-footer-copyright">
            © {new Date().getFullYear()} {RESTAURANT_NAME}. {t("allRightsReserved")}.
          </span>
        </div>
      </footer>
    );
  }

  return (
    <Footers>
      <Container>
        <Stack flexDirection={"row"} sx={{ mt: "94px" }}>
          <Stack flexDirection={"column"} style={{ width: "340px" }}>
            <Box>
              <img width={"100px"} src={"/icons/zomin.svg"} />
            </Box>
            <Box className={"foot-desc-txt"}>
              Celebrating the spirit of Uzbekistan, Zomin Restaurant brings
              authentic flavors of plov, kebabs, and traditional dishes to your
              table. A place where culture meets taste.
            </Box>
            <Box className="sns-context">
              <img src={"/icons/facebook.svg"} />
              <img src={"/icons/twitter.svg"} />
              <img src={"/icons/instagram.svg"} />
              <img src={"/icons/youtube.svg"} />
            </Box>
          </Stack>
          <Stack sx={{ ml: "288px" }} flexDirection={"row"}>
            <Stack>
              <Box>
                <Box className={"foot-category-title"}>Sections</Box>
                <Box className={"foot-category-link"}>
                  <Link to="/">{t("home")}</Link>
                  <Link to={menuProductsPath}>{t("menu")}</Link>
                  {authMember && <Link to={ordersPath}>{t("orders")}</Link>}
                  <Link to="/help">{t("help")}</Link>
                  <Link to="/about">{t("about")}</Link>
                </Box>
              </Box>
            </Stack>
            <Stack sx={{ ml: "100px" }}>
              <Box>
                <Box className={"foot-category-title"}>{t("findUs")}</Box>
                <Box
                  flexDirection={"column"}
                  sx={{ mt: "20px" }}
                  className={"foot-category-link"}
                  justifyContent={"space-between"}
                >
                  <Box flexDirection={"row"} className={"find-us"}>
                    <span>L.</span>
                    <div>충청남도 천안시 동남구 터미널4길 26</div>
                  </Box>
                  <Box className={"find-us"}>
                    <span>P.</span>
                    <div>070-4833-1959</div>
                  </Box>
                  <Box className={"find-us"}>
                    <span>E.</span>
                    <div>zomin.restaurant@gmail.com</div>
                  </Box>
                  <Box className={"find-us"}>
                    <span>H.</span>
                    <div>{t("open247")}</div>
                  </Box>
                </Box>
              </Box>
            </Stack>
          </Stack>
        </Stack>
        <Stack
          style={{ border: "1px solid #C5C8C9", width: "100%", opacity: "0.2" }}
          sx={{ mt: "80px" }}
        ></Stack>
        <Stack className={"copyright-txt"}>
          © {new Date().getFullYear()} Zomin Restaurant. {t("allRightsReserved")}.
        </Stack>
      </Container>
    </Footers>
    );
}
