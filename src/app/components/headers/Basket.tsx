import React from "react";
import { Box, Button, Stack, Drawer } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Menu from "@mui/material/Menu";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import CancelIcon from "@mui/icons-material/Cancel";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CloseIcon from "@mui/icons-material/Close";
import { useHistory } from "react-router-dom";
import { CartItem } from "../../../lib/types/search";
import { Messages, serverApi } from "../../../lib/config";
import { sweetErrorHandling } from "../../../lib/sweetAlert";
import { useGlobals } from "../../hooks/useGlobals";
import OrderService from "../../services/OrderService";
import useDeviceDetect from "../../hooks/useDeviceDetect";
import { useLanguage } from "../../context/LanguageContext";
import "../../../css/mobile/navbar.css";

interface BasketProps {
  cartItems: CartItem[];
  onAdd: (item: CartItem) => void;
  onRemove: (item: CartItem) => void;
  onDelete: (item: CartItem) => void;
  onDeleteAll: () => void;
}

export default function Basket(props: BasketProps) {
  const { cartItems, onAdd, onDelete, onDeleteAll, onRemove } = props;
  const { authMember, setOrderBulder, authTable } = useGlobals();
  const history = useHistory();
  const itemsPrice = cartItems.reduce(
    (a: number, c: CartItem) => a + c.quantity * c.price,
    0
  );
  const shippingCost: number = itemsPrice < 100 ? 5 : 0;
  const totalPrice = (itemsPrice + shippingCost).toFixed(1);
  const device = useDeviceDetect();
  const { t } = useLanguage();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [bounce, setBounce] = React.useState(false);
  const open = Boolean(anchorEl);
  const prevCountRef = React.useRef(cartItems.length);

  React.useEffect(() => {
    if (cartItems.length > prevCountRef.current) {
      setBounce(true);
      const t = setTimeout(() => setBounce(false), 500);
      prevCountRef.current = cartItems.length;
      return () => clearTimeout(t);
    }
    prevCountRef.current = cartItems.length;
  }, [cartItems.length]);

  /** HANDLERS **/
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const proceedOrderHandler = async () => {
    try {
      handleClose();
      if (!authMember&&!authTable) throw new Error(Messages.error2);

      const order = new OrderService();
      await order.createOrder(cartItems);

      onDeleteAll();

      setOrderBulder(new Date());
      history.push("/orders");
    } catch (err) {
      console.log(err);
      sweetErrorHandling(err).then();
    }
  };

  if(device === "mobile") {
    return (
      <Box className={"hover-line mobile-basket"}>
        <IconButton
          id="cart-icon"
          aria-label="cart"
          onClick={handleClick}
          sx={{ color: "#f8f8ff" }}
          className={bounce ? "cart-badge-bounce" : ""}
        >
          <Badge badgeContent={cartItems.length} color="secondary">
            <img src={"/icons/shopping-cart.svg"} alt="Cart" />
          </Badge>
        </IconButton>
        <Drawer
          anchor="bottom"
          open={open}
          onClose={handleClose}
          PaperProps={{
            className: "mobile-basket-drawer",
            sx: {
              maxHeight: "70vh",
              borderTopLeftRadius: "16px",
              borderTopRightRadius: "16px",
            },
          }}
        >
          <Stack className={"mobile-basket-frame"}>
            {/* Header */}
            <Box className={"mobile-basket-header"}>
              <Box className={"mobile-basket-title"}>
                {cartItems.length === 0 ? (
                  <span>{t("cartEmpty")}</span>
                ) : (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <span>{t("cartProducts")} ({cartItems.length})</span>
                    {cartItems.length > 0 && (
                      <DeleteForeverIcon
                        sx={{ cursor: "pointer", fontSize: "20px" }}
                        onClick={onDeleteAll}
                        color={"primary"}
                      />
                    )}
                  </Stack>
                )}
              </Box>
              <IconButton
                onClick={handleClose}
                sx={{ padding: "4px" }}
                className="mobile-basket-close"
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Cart Items */}
            <Box className={"mobile-basket-items-wrapper"}>
              {cartItems.length === 0 ? (
                <Box className={"mobile-basket-empty"}>
                  <ShoppingCartIcon sx={{ fontSize: 64, color: "#ccc", marginBottom: "16px" }} />
                  <span>Your cart is empty</span>
                </Box>
              ) : (
                <Box className={"mobile-basket-items"}>
                  {cartItems.map((item: CartItem) => {
                    const imagePath = `${serverApi}/${item.image}`;
                    return (
                      <Box className={"mobile-basket-item"} key={item._id}>
                        <img src={imagePath} className={"mobile-product-img"} alt={item.name} />
                        <Box className={"mobile-product-info"}>
                          <span className={"mobile-product-name"}>{item.name}</span>
                          <span className={"mobile-product-price"}>
                            ${item.price} x {item.quantity}
                          </span>
                        </Box>
                        <Box className={"mobile-product-actions"}>
                          <IconButton
                            size="small"
                            onClick={() => onDelete(item)}
                            sx={{ padding: "4px", marginBottom: "4px" }}
                          >
                            <CancelIcon fontSize="small" color="primary" />
                          </IconButton>
                          <Box className="mobile-quantity-controls">
                            <button
                              onClick={() => onRemove(item)}
                              className="mobile-quantity-btn mobile-quantity-minus"
                            >
                              -
                            </button>
                            <span className="mobile-quantity-value">{item.quantity}</span>
                            <button
                              onClick={() => onAdd(item)}
                              className="mobile-quantity-btn mobile-quantity-plus"
                            >
                              +
                            </button>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>

            {/* Footer with Total and Order Button */}
            {cartItems.length !== 0 && (
              <Box className={"mobile-basket-footer"}>
                <span className={"mobile-basket-total"}>
                  Total: ${totalPrice}
                </span>
                <Button
                  startIcon={<ShoppingCartIcon />}
                  variant={"contained"}
                  onClick={proceedOrderHandler}
                  className="mobile-order-button"
                >
                  {t("order")}
                </Button>
              </Box>
            )}
          </Stack>
        </Drawer>
      </Box>
    );
  } else {
  return (
    <Box className={"hover-line"}>
      <IconButton
        id="cart-icon"
        aria-label="cart"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <Badge badgeContent={cartItems.length} color="secondary">
          <img src={"/icons/shopping-cart.svg"} />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        // onClick={handleClose}
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
        <Stack className={"basket-frame"}>
          <Box className={"all-check-box"}>
            {cartItems.length === 0 ? (
              <div>{t("cartEmpty")}</div>
            ) : (
              <Stack flexDirection={"row"}>
                <div>{t("cartProducts")}:</div>
                <DeleteForeverIcon
                  sx={{ marginLeft: "5px", cursor: "pointer" }}
                  onClick={onDeleteAll}
                  color={"primary"}
                />
              </Stack>
            )}
          </Box>

          <Box className={"orders-main-wrapper"}>
            <Box className={"orders-wrapper"}>
              {cartItems.map((item: CartItem) => {
                const imagePath = `${serverApi}/${item.image}`;
                return (
                  <Box className={"basket-info-box"} key={item._id}>
                    <div className={"cancel-btn"}>
                      <CancelIcon
                        onClick={() => onDelete(item)}
                        color={"primary"}
                      />
                    </div>
                    <img src={imagePath} className={"product-img"} />
                    <span className={"product-name"}>{item.name}</span>
                    <p className={"product-price"}>
                      ${item.price} x {item.quantity}
                    </p>
                    <Box sx={{ minWidth: 120 }}>
                      <div className="col-2">
                        <button
                          onClick={() => onRemove(item)}
                          className="remove"
                        >
                          -
                        </button>{" "}
                        <button onClick={() => onAdd(item)} className="add">
                          +
                        </button>
                      </div>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
          {cartItems.length !== 0 ? (
            <Box className={"basket-order"}>
              <span className={"price"}>
                Total: ${totalPrice} ({itemsPrice} +{shippingCost})
              </span>
              <Button
                startIcon={<ShoppingCartIcon />}
                variant={"contained"}
                onClick={proceedOrderHandler}
              >
                {t("order")}
              </Button>
            </Box>
          ) : (
            ""
          )}
        </Stack>
      </Menu>
    </Box>
    );
  }
}
