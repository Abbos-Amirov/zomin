import React from "react";
import { Box, Stack } from "@mui/material";
import Button from "@mui/material/Button";
import moment from "moment";
import {
  retrievePausedOrders,
  retrievePendingOrders,
  retrieveProcessOrders,
} from "./selector";
import { createSelector } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { Order, OrderItem, OrderUpdateInput } from "../../../lib/types/order";
import { Product } from "../../../lib/types/product";
import { serverApi, CURRENCY_SYMBOL } from "../../../lib/config";
import { useGlobals } from "../../hooks/useGlobals";
import { OrderStatus, PaymentStatus } from "../../../lib/enums/order.enum";
import OrderService from "../../services/OrderService";
import { sweetErrorHandling } from "../../../lib/sweetAlert";
import { T } from "../../../lib/types/common";
import { Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PhoneIcon from "@mui/icons-material/Phone";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import useDeviceDetect from "../../hooks/useDeviceDetect";
import { useLanguage } from "../../context/LanguageContext";
import LinkOrderItemLine from "../../components/orders/LinkOrderItemLine";

/** A'zo (havola oqimi): PAUSE buyurtmalar bitta ro'yxatda */
function mergeInProgressOrders(
  mergePaused: boolean,
  paused: Order[] | undefined,
  pending: Order[] | undefined,
  process: Order[] | undefined
): Order[] {
  if (!mergePaused) {
    return [...(pending || []), ...(process || [])];
  }
  const m = new Map<string, Order>();
  for (const o of [...(paused || []), ...(pending || []), ...(process || [])]) {
    m.set(o._id, o);
  }
  return Array.from(m.values());
}

const pendingOrdersRetriever = createSelector(
  retrievePendingOrders,
  (pendingOrders) => ({ pendingOrders })
);

const processOrdersRetriever = createSelector(
  retrieveProcessOrders,
  (processOrders) => ({ processOrders })
);

const pausedOrdersRetriever = createSelector(
  retrievePausedOrders,
  (pausedOrders) => ({ pausedOrders })
);

interface ProcessOrdersProps {
  callHandler: (id: string) => void;
  /** `/orders-link` — jarayonda asosan bekor, PAUSE ni birlashtirish */
  linkFlow?: boolean;
  /** true: PAUSE + PENDING + PROCESS bitta ro'yxatda */
  mergePausedIntoProgress?: boolean;
}

export default function ProcessOrders(props: ProcessOrdersProps) {
  const { callHandler, linkFlow = false, mergePausedIntoProgress = false } = props;
  const { setOrderBulder, authTable, authMember } = useGlobals();
  const { t } = useLanguage();
  const { processOrders } = useSelector(processOrdersRetriever);
  const { pendingOrders } = useSelector(pendingOrdersRetriever);
  const { pausedOrders } = useSelector(pausedOrdersRetriever);
  const device = useDeviceDetect();

  const allOrders = mergeInProgressOrders(
    mergePausedIntoProgress,
    pausedOrders,
    pendingOrders,
    processOrders
  );

  const deleteOrderHandler = async (e: T) => {
    try {
      const orderId = e.target.value;
      const input: OrderUpdateInput = {
        orderId: orderId,
        orderStatus: OrderStatus.CANCELLED,
      };

      const confirmation = window.confirm(
        linkFlow ? t("linkCancelOrderConfirm") : "Do you want to delete the order?"
      );
      if (confirmation) {
        const order = new OrderService();
        if (linkFlow && authMember?._id) {
          await order.cancelOrderByMember(
            authMember._id,
            orderId,
            authMember.memberPhone ?? ""
          );
        } else {
          await order.updateOrder(input);
        }
        setOrderBulder(new Date());
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
        setOrderBulder(new Date());
      }
    } catch (err) {
      console.log(err);
      sweetErrorHandling(err).then();
    }
  };

  const finishOrderHandler = async (e: T) => {
    try {
      const orderId = e.target.value;
      const input: OrderUpdateInput = {
        orderId: orderId,
        orderStatus: OrderStatus.COMPLETED,
      };

      const confirmation = window.confirm("Have you received your order?");
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

  const renderMobileActions = (order: Order) => {
    if (linkFlow && order.orderStatus !== OrderStatus.PAUSE) {
      return (
        <Box className="mobile-order-actions">
          <Button
            value={order._id}
            variant="outlined"
            className="mobile-order-cancel-btn"
            fullWidth
            startIcon={<DeleteIcon />}
            onClick={deleteOrderHandler}
          >
            {t("cancel")}
          </Button>
        </Box>
      );
    }
    if (order.orderStatus === OrderStatus.PAUSE) {
      return (
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
      );
    }
    return (
      <Box className="mobile-order-actions">
        <Button
          value={order._id}
          variant="outlined"
          className="mobile-order-cancel-btn"
          startIcon={<DeleteIcon />}
          onClick={deleteOrderHandler}
          disabled={order.orderStatus !== OrderStatus.PENDING}
        >
          {t("cancel")}
        </Button>
        <Button
          value={order._id}
          variant="contained"
          className="mobile-order-process-btn"
          startIcon={authTable ? <PhoneIcon /> : <CheckCircleIcon />}
          onClick={(e) => {
            if (authTable) {
              callHandler(authTable._id);
            } else {
              finishOrderHandler(e);
            }
          }}
        >
          {authTable ? t("call") : t("verify")}
        </Button>
      </Box>
    );
  };

  if (device === "mobile") {
    return (
      <Box>
        <Box className="mobile-orders-list">
          {allOrders.length > 0 ? (
            allOrders.map((order: Order) => (
              <Box key={order._id} className="mobile-order-card mobile-order-processing">
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
                          onUpdated={() => setOrderBulder(new Date())}
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
                  <Typography className="mobile-order-date">
                    {moment().format("MMM DD, YYYY HH:mm")}
                  </Typography>
                </Box>

                {renderMobileActions(order)}
              </Box>
            ))
          ) : (
            <Box className="mobile-no-orders">
              <img src="/icons/noimage-list.svg" alt="No orders" />
              <Typography>{t("noProcessingOrders")}</Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Stack>
        {allOrders.map((order: Order) => (
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
                      onUpdated={() => setOrderBulder(new Date())}
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
                  <img src={"/icons/plus.svg"} alt="" />
                  <p>delivery cost</p>
                  <p>{CURRENCY_SYMBOL}{order.orderDelivery}</p>
                  <img src="/icons/pause.svg" alt="" />
                  <p>Total</p>
                  <p>{CURRENCY_SYMBOL}{order.orderTotal}</p>
                </Box>
                <p className="data-compl">{moment().format("YY-MM-DD HH:mm")}</p>

                {linkFlow && order.orderStatus !== OrderStatus.PAUSE ? (
                  <Button
                    value={order._id}
                    variant="contained"
                    className="cancel-button"
                    color="secondary"
                    onClick={deleteOrderHandler}
                  >
                    {t("cancel")}
                  </Button>
                ) : order.orderStatus === OrderStatus.PAUSE ? (
                  <>
                    <Button
                      value={order._id}
                      variant="contained"
                      className="cancel-button"
                      color="secondary"
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
                  </>
                ) : (
                  <>
                    <Button
                      value={order._id}
                      variant="contained"
                      className="cancel-button"
                      color="secondary"
                      onClick={deleteOrderHandler}
                      disabled={order.orderStatus !== OrderStatus.PENDING}
                    >
                      {t("cancel")}
                    </Button>
                    <Button
                      value={order._id}
                      variant="contained"
                      className="verify-button"
                      onClick={(e) => {
                        if (authTable) {
                          callHandler(authTable._id);
                        } else {
                          finishOrderHandler(e);
                        }
                      }}
                    >
                      {authTable ? t("call") : t("verify")}
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          </Box>
        ))}

        {allOrders.length === 0 && (
          <Box
            width={"800px"}
            display="flex"
            flexDirection="row"
            justifyContent="center"
          >
            <img
              src={"/icons/noimage-list.svg"}
              style={{ width: 400, height: 400 }}
              alt=""
            />
          </Box>
        )}
      </Stack>
    </Box>
  );
}
