import { useState } from "react";
import { Box, IconButton, Typography, CircularProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { Order, OrderItem } from "../../../lib/types/order";
import { Product } from "../../../lib/types/product";
import { OrderStatus } from "../../../lib/enums/order.enum";
import OrderService from "../../services/OrderService";
import { sweetErrorHandling } from "../../../lib/sweetAlert";
import { CURRENCY_SYMBOL, serverApi } from "../../../lib/config";
import "../../../css/link-order-qty.css";

export function canEditLinkOrderLineQuantity(order: Order): boolean {
  const s = order.orderStatus;
  return (
    s === OrderStatus.PAUSE ||
    s === OrderStatus.PENDING ||
    s === OrderStatus.PROCESS
  );
}

interface LinkOrderItemLineProps {
  order: Order;
  item: OrderItem;
  product: Product;
  mobile: boolean;
  onUpdated: () => void;
}

export default function LinkOrderItemLine(props: LinkOrderItemLineProps) {
  const { order, item, product, mobile, onUpdated } = props;
  const [loading, setLoading] = useState(false);
  const editable = canEditLinkOrderLineQuantity(order);

  const applyQuantity = async (next: number) => {
    if (next < 0 || loading) return;
    setLoading(true);
    try {
      const svc = new OrderService();
      await svc.updateOrderItemQuantity(order._id, item._id, next);
      onUpdated();
    } catch (e) {
      sweetErrorHandling(e).then();
    } finally {
      setLoading(false);
    }
  };

  const img = product.productImages?.[0];
  const imagePath = img ? `${serverApi}/${img}` : "/icons/noimage-list.svg";
  const lineTotal = item.itemQuantity * item.itemPrice;

  if (mobile) {
    return (
      <Box className={`link-order-line link-order-line--mobile${loading ? " link-order-line--loading" : ""}`}>
        <img src={imagePath} className="link-order-line__img" alt="" />
        <Box className="link-order-line__main">
          <Typography className="link-order-line__name">{product.productName}</Typography>
          <Box className="link-order-line__meta">
            <Typography className="link-order-line__unit">
              {CURRENCY_SYMBOL}
              {item.itemPrice}
            </Typography>
            {editable ? (
              <Box className="link-order-line__qty">
                <IconButton
                  size="small"
                  className="link-order-line__qty-btn"
                  disabled={loading}
                  onClick={() => void applyQuantity(item.itemQuantity - 1)}
                  aria-label="minus"
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                {loading ? (
                  <CircularProgress size={20} className="link-order-line__qty-spinner" />
                ) : (
                  <span className="link-order-line__qty-value">{item.itemQuantity}</span>
                )}
                <IconButton
                  size="small"
                  className="link-order-line__qty-btn"
                  disabled={loading}
                  onClick={() => void applyQuantity(item.itemQuantity + 1)}
                  aria-label="plus"
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <Typography className="link-order-line__qty-readonly">× {item.itemQuantity}</Typography>
            )}
            <Typography className="link-order-line__line-total">
              {CURRENCY_SYMBOL}
              {lineTotal.toFixed(0)}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box className={`link-order-line link-order-line--desktop${loading ? " link-order-line--loading" : ""}`}>
      <img src={imagePath} className="link-order-line__img" alt="" />
      <Box className="link-order-line__main">
        <Typography className="link-order-line__name">{product.productName}</Typography>
        <Typography className="link-order-line__sub" variant="body2" color="text.secondary">
          {CURRENCY_SYMBOL}
          {item.itemPrice} × {item.itemQuantity}
        </Typography>
      </Box>
      <Box className="link-order-line__right">
        {editable ? (
          <Box className="link-order-line__qty link-order-line__qty--pill">
            <button
              type="button"
              className="link-order-line__pill-btn"
              disabled={loading}
              onClick={() => void applyQuantity(item.itemQuantity - 1)}
            >
              −
            </button>
            {loading ? (
              <CircularProgress size={22} className="link-order-line__qty-spinner" />
            ) : (
              <span className="link-order-line__qty-value">{item.itemQuantity}</span>
            )}
            <button
              type="button"
              className="link-order-line__pill-btn"
              disabled={loading}
              onClick={() => void applyQuantity(item.itemQuantity + 1)}
            >
              +
            </button>
          </Box>
        ) : (
          <Typography className="link-order-line__qty-readonly">× {item.itemQuantity}</Typography>
        )}
        <Typography className="link-order-line__line-total">
          {CURRENCY_SYMBOL}
          {lineTotal.toFixed(0)}
        </Typography>
      </Box>
    </Box>
  );
}
