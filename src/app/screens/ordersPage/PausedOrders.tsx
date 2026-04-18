import React from "react";
import { Box, Stack } from "@mui/material";
import Button from "@mui/material/Button";
import { retrievePausedOrders } from "./selector";
import { createSelector } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { Order, OrderItem, OrderUpdateInput } from "../../../lib/types/order";
import { Product } from "../../../lib/types/product";
import { CURRENCY_SYMBOL } from "../../../lib/config";
import { sweetErrorHandling } from "../../../lib/sweetAlert";
import { OrderStatus, PaymentStatus } from "../../../lib/enums/order.enum";
import { useGlobals } from "../../hooks/useGlobals";
import OrderService from "../../services/OrderService";
import { T } from "../../../lib/types/common";
import { Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import useDeviceDetect from "../../hooks/useDeviceDetect";
import { useLanguage } from "../../context/LanguageContext";
import LinkOrderItemLine from "../../components/orders/LinkOrderItemLine";
import "../../../css/link-order-qty.css";

/** REDUX SLICE & SELECTOR */

const pausedOrdersRetriever = createSelector(
  retrievePausedOrders,
  (pausedOrders) => ({ pausedOrders })
);

export default function PausedOrders() {
  const { setOrderBulder, authMember, authTable } = useGlobals();
  const refreshOrders = () => setOrderBulder(new Date());
  const { pausedOrders } = useSelector(pausedOrdersRetriever);
  const device = useDeviceDetect();
  const { t } = useLanguage();

  /** HANDLERS **/
  const deleteOrderHandler = async (e: T) => {
    try {
      const orderId = e.target.value;
      const input: OrderUpdateInput = {
        orderId: orderId,
        orderStatus: OrderStatus.CANCELLED,
      };

      const confirmation = window.confirm("Do you want to delete the order?");
      if (confirmation) {
        const order = new OrderService();
        await order.updateOrder(input);
        refreshOrders();
      }
    } catch (err) {
      console.log(err);
      sweetErrorHandling(err).then();
    }
  };

  const processOrderHandler = async (e: T) => {
    try {
      const orderId = e.target.value;
      const input: OrderUpdateInput = {
        orderId: orderId,
        orderStatus: OrderStatus.PENDING,
      };
      if (authMember) input.paymentStatus = PaymentStatus.PAID;

      const confirmation = window.confirm(
        authMember
          ? "Do you want to proceed with payment?"
          : "Do you want to order?"
      );
      if (confirmation) {
        const order = new OrderService();
        await order.updateOrder(input);
        refreshOrders();
      }
    } catch (err) {
      console.log(err);
      sweetErrorHandling(err).then();
    }
  };

  if (device === "mobile") {
    return (
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: "#333" }}>
          {t("pausedOrdersTitle")}
        </Typography>
        <Box className="mobile-orders-list">
          {pausedOrders && pausedOrders.length > 0 ? (
            pausedOrders.map((order: Order) => (
              <Box key={order._id} className="mobile-order-card">
                {/* Order Items */}
                <Box className="mobile-order-items">
                  {order.orderItems?.map((item: OrderItem) => {
                    const product: Product = order.productData.filter(
                      (ele: Product) => item.productId === ele._id
                    )[0];
                    if (!product) return null;
                    return (
                      <LinkOrderItemLine
                        key={item._id}
                        order={order}
                        item={item}
                        product={product}
                        mobile
                        onUpdated={refreshOrders}
                      />
                    );
                  })}
                </Box>

                {/* Order Summary */}
                <Box className="mobile-order-summary">
                  <Box className="mobile-order-summary-row">
                    <Typography>Product price</Typography>
                    <Typography>{CURRENCY_SYMBOL}{(order.orderTotal - order.orderDelivery).toFixed(2)}</Typography>
                  </Box>
                  <Box className="mobile-order-summary-row">
                    <Typography>Delivery cost</Typography>
                    <Typography>{CURRENCY_SYMBOL}{order.orderDelivery.toFixed(2)}</Typography>
                  </Box>
                  <Box className="mobile-order-summary-total">
                    <Typography>Total</Typography>
                    <Typography>{CURRENCY_SYMBOL}{order.orderTotal.toFixed(2)}</Typography>
                  </Box>
                </Box>

                {/* Action Buttons */}
                <Box className="mobile-order-actions">
                  <Button
                    value={order._id}
                    variant="outlined"
                    className="mobile-order-cancel-btn"
                    startIcon={<DeleteIcon />}
                    onClick={deleteOrderHandler}
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    value={order._id}
                    variant="contained"
                    className="mobile-order-process-btn"
                    startIcon={<ShoppingCartIcon />}
                    onClick={processOrderHandler}
                  >
                    {authMember ? t("payment") : t("order")}
                  </Button>
                </Box>
              </Box>
            ))
          ) : (
            <Box className="mobile-no-orders">
              <img src="/icons/noimage-list.svg" alt="No orders" />
              <Typography>{t("noPausedOrders")}</Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: "#333" }}>
        {t("pausedOrdersTitle")}
      </Typography>
      <Stack>
        {pausedOrders?.map((order: Order) => {
          return (
            <Box key={order._id} className="order-main-box">
              <Box className="order-box-scroll">
                {order.orderItems?.map((item: OrderItem) => {
                  const product: Product | undefined = order.productData?.filter(
                    (ele: Product) => item.productId === ele._id
                  )[0];
                  if (!product) return null;
                  return (
                    <LinkOrderItemLine
                      key={item._id}
                      order={order}
                      item={item}
                      product={product}
                      mobile={false}
                      onUpdated={refreshOrders}
                    />
                  );
                })}
                <Box className="total-price-box">
                  <Box className="box-total">
                    <p>Product price</p>
                    <p>{CURRENCY_SYMBOL}{order.orderTotal - order.orderDelivery}</p>
                    <img src={"/icons/plus.svg"} />
                    <p>delivery cost</p>
                    <p>{CURRENCY_SYMBOL}{order.orderDelivery}</p>
                    <img src={"/icons/pause.svg"} />
                    <p>Total</p>
                    <p>{CURRENCY_SYMBOL}{order.orderTotal}</p>
                  </Box>
                  <Button
                    value={order._id}
                    variant="contained"
                    className="cancel-button"
                    color={"secondary"}
                    onClick={deleteOrderHandler}
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    value={order._id}
                    variant="contained"
                    className="verify-button"
                    onClick={processOrderHandler}
                  >
                    {authMember ? t("payment") : t("order")}
                  </Button>
                </Box>
              </Box>
            </Box>
          );
        })}

        {!pausedOrders ||
          (pausedOrders.length === 0 && (
            <Box
              width={"800px"}
              display="flex"
              flexDirection="row"
              justifyContent="center"
            >
              <img
                src={"/icons/noimage-list.svg"}
                style={{ width: 400, height: 400 }}
              />
            </Box>
          ))}
      </Stack>
    </Box>
  );
}
