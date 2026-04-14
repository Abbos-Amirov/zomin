import React, { useState, useEffect } from "react";
import { Route, Switch, useLocation, useHistory, Redirect } from "react-router-dom";
import ProductsPage from "./screens/productsPage";
import OrdersPage from "./screens/ordersPage";
import UserPage from "./screens/userPage";
import OtherNavbar from "./components/headers/OtherNavbar";
import Footer from "./components/footer";
import HelpPage from "./screens/helpPage";
import useBasket from "./hooks/useBasket";
import AuthenticationModal from "./components/auth";
import { sweetErrorHandling, sweetTopSuccessAlert } from "../lib/sweetAlert";
import { Messages } from "../lib/config";
import MemberService from "./services/MemberService";
import { useGlobals } from "./hooks/useGlobals";
import "../css/app.css";
import "../css/navbar.css";
import "../css/footer.css";
import "../css/add-to-cart-animation.css";
import QrLanding from "./components/qrLanding";
import TableService from "./services/TableService";
import CallButton from "./components/callWaiter";
import { AddToCartAnimationProvider } from "./context/AddToCartAnimation";
import ProductsLinkPage from "./screens/productsLinkPage";
import OrdersLinkPage from "./screens/ordersLinkPage";
import { isLinkFlowCustomer } from "../lib/menuProductsPath";

export default function App() {
  const location = useLocation();
  const history = useHistory();
  const { setAuthMember, authMember, authTable, setAuthTable } = useGlobals();
  const { cartItems, onAdd, onRemove, onDelete, onDeleteAll } = useBasket();
  const [signupOpen, setSignupOpen] = useState<boolean>(false);
  const [loginOpen, setLoginOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  // Route protection: authTable can only access /products and /orders
  useEffect(() => {
    if (authTable) {
      const restrictedRoutes = ["/", "/member-page"];
      if (restrictedRoutes.includes(location.pathname)) {
        history.push("/products");
      }
    }
  }, [authTable, location.pathname, history]);

  /** Handlers */
  const handleSignupClose = () => setSignupOpen(false);
  const handleLoginClose = () => setLoginOpen(false);

  const handleLogoutOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleCloseLogout = () => {
    (document.activeElement as HTMLElement | null)?.blur?.();
    setAnchorEl(null);
  };

  const handleLogoutRequest = async () => {
    try {
      const member = new MemberService();
      const table = new TableService();
      authTable ? await table.tableLogout() : await member.logout();

      await sweetTopSuccessAlert("success", 700);
      setAuthTable(null);
      setAuthMember(null);
    } catch (err) {
      console.log(err);
      sweetErrorHandling(Messages.error1);
    }
  };

  const handleLogoutClick = async (e: React.MouseEvent<HTMLLIElement>) => {
    (e.currentTarget as HTMLElement).blur();
    handleCloseLogout();
    await Promise.resolve();
    await handleLogoutRequest();
  };

  const callHandler = async (id: string) => {
    const table = new TableService();
    try {
      if (!authTable) throw new Error(Messages.error6);
      await table.clickTableCall(id);
      sweetTopSuccessAlert("The waiter is coming!", 700);
    } catch (err) {
      console.log(err);
      sweetErrorHandling(err).then();
    }
  };

  // Link users must auth to access products, orders, help (QR users skip)
  const needsAuth = !authTable && !authMember;

  return (
    <AddToCartAnimationProvider>
      <OtherNavbar
          cartItems={cartItems}
          onAdd={onAdd}
          onRemove={onRemove}
          onDelete={onDelete}
          onDeleteAll={onDeleteAll}
          setSignupOpen={setSignupOpen}
          setLoginOpen={setLoginOpen}
          anchorEl={anchorEl}
          handleLogoutOpen={handleLogoutOpen}
          handleCloseLogout={handleCloseLogout}
          handleLogoutClick={handleLogoutClick}
          hideBasket={location.pathname.startsWith("/products-link")}
      />
      <Switch>
        <Route path="/products-link">
          <ProductsLinkPage
            cartItems={cartItems}
            onAdd={onAdd}
            onRemove={onRemove}
            onDelete={onDelete}
            onDeleteAll={onDeleteAll}
            onSignup={() => setSignupOpen(true)}
            onLogin={() => setLoginOpen(true)}
          />
        </Route>
        <Route path="/products">
          {needsAuth ? (
            <Redirect to="/products-link" />
          ) : (
            <ProductsPage onAdd={onAdd} />
          )}
        </Route>
        <Route path="/orders-link">
          {needsAuth ? (
            <Redirect to="/products-link" />
          ) : (
            <OrdersLinkPage callHandler={callHandler} />
          )}
        </Route>
        <Route path="/orders">
          {needsAuth ? (
            <Redirect to="/products-link" />
          ) : isLinkFlowCustomer(authTable, authMember) ? (
            <Redirect to="/orders-link" />
          ) : (
            <OrdersPage callHandler={callHandler} />
          )}
        </Route>
        <Route path="/member-page">
          <UserPage />
        </Route>
        <Route path="/help">
          {needsAuth ? (
            <Redirect to="/products-link" />
          ) : (
            <HelpPage />
          )}
        </Route>
        <Route path={"/table/qr/:id"}>
          <QrLanding />
        </Route>
        <Route exact path="/">
          {authTable ? <Redirect to="/products" /> : <Redirect to="/products-link" />}
        </Route>
      </Switch>
      <Footer />
      {authTable && <CallButton callHandler={callHandler} />}

      <AuthenticationModal
        signupOpen={signupOpen}
        loginOpen={loginOpen}
        handleLoginClose={handleLoginClose}
        handleSignupClose={handleSignupClose}
      />
    </AddToCartAnimationProvider>
  );
}
