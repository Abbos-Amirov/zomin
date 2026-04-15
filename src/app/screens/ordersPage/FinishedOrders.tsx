import React from "react";
import { Box, Button, Stack } from "@mui/material";
import { createSelector } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { Order, OrderItem, OrderUpdateInput } from "../../../lib/types/order";
import { Product } from "../../../lib/types/product";
import { serverApi, CURRENCY_SYMBOL } from "../../../lib/config";
import { retrieveFinishedOrders } from "./selector";
import { useGlobals } from "../../hooks/useGlobals";
import { T } from "../../../lib/types/common";
import { OrderStatus, PaymentStatus } from "../../../lib/enums/order.enum";
import OrderService from "../../services/OrderService";
import { sweetErrorHandling } from "../../../lib/sweetAlert";
import { Typography } from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import useDeviceDetect from "../../hooks/useDeviceDetect";
import { useLanguage } from "../../context/LanguageContext";
import LinkOrderItemLine from "../../components/orders/LinkOrderItemLine";

/** REDUX SLICE & SELECTOR */

const finishedOrdersRetriever = createSelector(
  retrieveFinishedOrders,
  (finishedOrders) => ({ finishedOrders })
);

interface FinishedOrdersProps {
  /** Havola orqali kirganlar — to'lov o'rniga bekor qilish */
  linkFlow?: boolean;
}

export default function FinishedOrders(props: FinishedOrdersProps) {
  const { linkFlow = false } = props;
  const { finishedOrders } = useSelector(finishedOrdersRetriever);
  const { setOrderBulder, authMember } = useGlobals();
  const refreshOrders = () => setOrderBulder(new Date());
  const device = useDeviceDetect();
  const { t } = useLanguage();

  /** HANDLERS **/
  const complatedOrderHandler = async (e: T) => {
    try {
      const orderId = e.target.value;
      const input: OrderUpdateInput = {
        orderId: orderId,
        orderStatus: OrderStatus.COMPLETED,
        paymentStatus: PaymentStatus.PAID,
      };

      const confirmation = window.confirm(
        "Do you want to complete with payment?"
      );
      if (confirmation) {
        const order = new OrderService();
        await order.updateOrder(input);
        setOrderBulder(new Date());
      }
    } catch (err) {
      console.log(err);
      sweetErrorHandling(err).then();
    }
  };

  const cancelOrderHandler = async (e: T) => {
    try {
      const orderId = e.target.value;
      if (!window.confirm(t("linkCancelOrderConfirm"))) return;
      const order = new OrderService();
      if (linkFlow && authMember?._id) {
        await order.cancelOrderByMember(
          authMember._id,
          orderId,
          authMember.memberPhone ?? ""
        );
      } else {
        const input: OrderUpdateInput = {
          orderId,
          orderStatus: OrderStatus.CANCELLED,
        };
        await order.updateOrder(input);
      }
      refreshOrders();
    } catch (err) {
      console.log(err);
      sweetErrorHandling(err).then();
    }
  };

  if (device === "mobile") {
    return (
      <Box>
        <Box className="mobile-orders-list">
          {finishedOrders && finishedOrders.length > 0 ? (
            finishedOrders.map((order: Order) => (
              <Box key={order._id} className="mobile-order-card mobile-order-finished">
                {/* Order Items */}
                <Box className="mobile-order-items">
                  {order.orderItems?.map((item: OrderItem) => {
                    const product: Product = order.productData.filter(
                      (ele: Product) => item.productId === ele._id
                    )[0];
                    if (!product) return null;
                    if (linkFlow) {
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
                    }
                    const imagePath = `${serverApi}/${product.productImages[0]}`;
                    return (
                      <Box key={item._id} className="mobile-order-item">
                        <img src={imagePath} className="mobile-order-item-img" alt={product.productName} />
                        <Box className="mobile-order-item-info">
                          <Typography className="mobile-order-item-name">
                            {product.productName}
                          </Typography>
                          <Box className="mobile-order-item-price-row">
                            <Typography className="mobile-order-item-price">
                              {CURRENCY_SYMBOL}{item.itemPrice}
                            </Typography>
                            <Typography className="mobile-order-item-quantity">
                              x {item.itemQuantity}
                            </Typography>
                            <Typography className="mobile-order-item-total">
                              {CURRENCY_SYMBOL}{(item.itemQuantity * item.itemPrice).toFixed(2)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
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

                {/* Payment / cancel (link flow) */}
                <Box className="mobile-order-actions">
                  {linkFlow ? (
                    <Button
                      value={order._id}
                      variant="outlined"
                      color="error"
                      className="mobile-order-cancel-btn"
                      startIcon={<DeleteOutlineIcon />}
                      onClick={cancelOrderHandler}
                      fullWidth
                    >
                      {t("cancel")}
                    </Button>
                  ) : (
                    <Button
                      value={order._id}
                      variant="contained"
                      className="mobile-order-payment-btn"
                      startIcon={<PaymentIcon />}
                      onClick={complatedOrderHandler}
                      fullWidth
                    >
                      {t("payment")}
                    </Button>
                  )}
                </Box>
              </Box>
            ))
          ) : (
            <Box className="mobile-no-orders">
              <img src="/icons/noimage-list.svg" alt="No orders" />
              <Typography>{t("noFinishedOrders")}</Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Stack>
        {finishedOrders?.map((order: Order) => {
          return (
            <Box key={order._id} className="order-main-box">
              <Box className="order-box-scroll">
                {order.orderItems?.map((item: OrderItem) => {
                  const product: Product = order.productData.filter(
                    (ele: Product) => item.productId === ele._id
                  )[0];
                  if (!product) return null;
                  if (linkFlow) {
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
                  }
                  const imagePath = `${serverApi}/${product.productImages[0]}`;
                  return (
                    <Box key={item._id} className="orders-name-price">
                      <img src={imagePath} className="order-dish-img" alt="" />
                      <p className="title-dish">{product.productName}</p>
                      <Box className="price-box">
                        <p>{CURRENCY_SYMBOL}{item.itemPrice}</p>
                        <img src={"/icons/close.svg"} alt="" />
                        <p>{item.itemQuantity}</p>
                        <img src="/icons/pause.svg" alt="" />
                        <p>{CURRENCY_SYMBOL}{item.itemQuantity * item.itemPrice}</p>
                      </Box>
                    </Box>
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
                    {linkFlow ? (
                      <Button
                        value={order._id}
                        variant="contained"
                        className="cancel-button"
                        color="secondary"
                        onClick={cancelOrderHandler}
                      >
                        {t("cancel")}
                      </Button>
                    ) : (
                      <Button
                        value={order._id}
                        variant="contained"
                        className="verify-button"
                        onClick={complatedOrderHandler}
                      >
                        {t("payment")}
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          );
        })}

        {(!finishedOrders || finishedOrders.length === 0) && (
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
        )}
      </Stack>
    </Box>
  );
}
