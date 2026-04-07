import {
  Box,
  Button,
  Container,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
} from "@mui/material";
import { NavLink, useLocation } from "react-router-dom";
import Basket from "./Basket";
import { CartItem } from "../../../lib/types/search";
import { useGlobals } from "../../hooks/useGlobals";
import { serverApi } from "../../../lib/config";
import { Logout } from "@mui/icons-material";
import useDeviceDetect from "../../hooks/useDeviceDetect";
import { RESTAURANT_NAME } from "../../../lib/config";
import { useLanguage } from "../../context/LanguageContext";
import {
  getMenuProductsPath,
  isMenuProductsActive,
} from "../../../lib/menuProductsPath";
import LanguageSwitcher from "./LanguageSwitcher";
import DarkModeToggle from "./DarkModeToggle";
import "../../../css/mobile/navbar.css";

interface OtherNavbarProps {
  cartItems: CartItem[];
  onAdd: (item: CartItem) => void;
  onRemove: (item: CartItem) => void;
  onDelete: (item: CartItem) => void;
  onDeleteAll: () => void;
  setSignupOpen: (isOpen: boolean) => void;
  setLoginOpen: (isOpen: boolean) => void;
  handleLogoutOpen: (e: React.MouseEvent<HTMLElement>) => void;
  anchorEl: HTMLElement | null;
  handleCloseLogout: () => void;
  handleLogoutClick: (
    e: React.MouseEvent<HTMLLIElement>
  ) => void | Promise<void>;
  /** Hide cart icon (e.g. link flow shows cart on page) */
  hideBasket?: boolean;
}

export default function OtherNavbar(props: OtherNavbarProps) {
  const {
    cartItems,
    onAdd,
    onDelete,
    onDeleteAll,
    onRemove,
    setLoginOpen,
    setSignupOpen,
    handleLogoutOpen,
    anchorEl,
    handleCloseLogout,
    handleLogoutClick,
    hideBasket,
  } = props;
  const { authMember, authTable } = useGlobals();
  const location = useLocation();
  const menuProductsPath = getMenuProductsPath(authTable);
  const device = useDeviceDetect();
  const { t } = useLanguage();

  if (device === "mobile") {
    return (
      <div className="other-navbar mobile-navbar">
        <Container className="navbar-container">
          <Stack className="menu">
            <Box className="mobile-navbar-left">
              <img
                className="brand-logo mobile-navbar-logo"
                src="/icons/zomin.svg"
                alt={RESTAURANT_NAME}
              />
            </Box>

            <Stack className="links mobile-navbar-right">
              <Box className={"hover-line"}>
                <NavLink
                  to={menuProductsPath}
                  isActive={() =>
                    isMenuProductsActive(location.pathname, menuProductsPath)
                  }
                  activeClassName="underline"
                >
                  {t("menu")}
                </NavLink>
              </Box>
              <Box className={"hover-line"}>
                <NavLink to="/help" activeClassName="underline">
                  {t("help")}
                </NavLink>
              </Box>
              {authTable && (
                <Box className={"hover-line"}>
                  <NavLink to="/orders" activeClassName="underline">
                    {t("orders")}
                  </NavLink>
                </Box>
              )}
              {!hideBasket && (
                <Basket
                  cartItems={cartItems}
                  onAdd={onAdd}
                  onRemove={onRemove}
                  onDelete={onDelete}
                  onDeleteAll={onDeleteAll}
                />
              )}
              <LanguageSwitcher />
              <DarkModeToggle />
            </Stack>
          </Stack>
        </Container>
      </div>
    );
  } else {
    return (
      <div className="other-navbar">
        <Container className="navbar-container">
          <Stack className="menu">
            <Box>
              <NavLink to="/">
                <img className="brand-logo" src="/icons/zomin.svg"></img>
              </NavLink>
            </Box>
            <Stack className="links">
              {!authTable && (
                <Box className={"hover-line"}>
                  <NavLink to="/">{t("home")}</NavLink>
                </Box>
              )}
              <Box className={"hover-line"}>
                <NavLink
                  to={menuProductsPath}
                  isActive={() =>
                    isMenuProductsActive(location.pathname, menuProductsPath)
                  }
                  activeClassName="underline"
                >
                  {t("products")}
                </NavLink>
              </Box>
              {authMember || authTable ? (
                <Box className={"hover-line"}>
                  <NavLink to="/orders" activeClassName="underline">
                    {t("orders")}
                  </NavLink>
                </Box>
              ) : null}
              {authMember ? (
                <Box className={"hover-line"}>
                  <NavLink to="/member-page" activeClassName="underline">
                    {t("myPage")}
                  </NavLink>
                </Box>
              ) : null}
              <Box className="hover-line">
                <NavLink to="/help" activeClassName="underline">
                  {t("help")}
                </NavLink>
              </Box>

              {!hideBasket && (
                <Basket
                  cartItems={cartItems}
                  onAdd={onAdd}
                  onRemove={onRemove}
                  onDelete={onDelete}
                  onDeleteAll={onDeleteAll}
                />
              )}
              <LanguageSwitcher />
              <DarkModeToggle />

              {!authMember && !authTable ? (
                <Box>
                  <Button
                    variant="contained"
                    className="login-button"
                    onClick={() => setLoginOpen(true)}
                  >
                    {t("login")}
                  </Button>
                </Box>
              ) : (
                <img
                  className="user-avatar"
                  src={
                    authMember?.memberImage
                      ? `${serverApi}/${authMember?.memberImage}`
                      : authTable
                      ? "/img/table.jpg"
                      : "/icons/default-user.svg"
                  }
                  aria-haspopup={"true"}
                  onClick={handleLogoutOpen}
                />
              )}
              <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={Boolean(anchorEl)}
                onClose={handleCloseLogout}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: "visible",
                    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                    mt: 1.5,
                    "& .MuiAvatar-root": {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                    "&:before": {
                      content: '""',
                      display: "block",
                      position: "absolute",
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: "background.paper",
                      transform: "translateY(-50%) rotate(45deg)",
                      zIndex: 0,
                    },
                  },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <MenuItem onClick={handleLogoutClick}>
                  <ListItemIcon>
                    <Logout fontSize="small" style={{ color: "blue" }} />
                  </ListItemIcon>
                  {t("logout")}
                </MenuItem>
              </Menu>
            </Stack>
          </Stack>
          <Stack className="header-frame">
            <Stack className="detail"></Stack>
          </Stack>
        </Container>
      </div>
    );
  }
}
