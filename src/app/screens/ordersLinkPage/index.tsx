import { useEffect } from "react";
import { Box } from "@mui/material";
import { Redirect } from "react-router-dom";
import ProcessOrders from "../ordersPage/ProcessOrders";
import FinishedOrders from "../ordersPage/FinishedOrders";
import { Dispatch } from "@reduxjs/toolkit";
import { Order } from "../../../lib/types/order";
import {
  setFinishedOrders,
  setPausedOrders,
  setPendingOrders,
  setProcessOrders,
} from "../ordersPage/slice";
import { useDispatch } from "react-redux";
import OrderService from "../../services/OrderService";
import { useGlobals } from "../../hooks/useGlobals";
import "../../../css/order.css";
import useDeviceDetect from "../../hooks/useDeviceDetect";
import "../../../css/mobile/order.css";
import { isLinkFlowCustomer } from "../../../lib/menuProductsPath";

const actionDispatch = (dispatch: Dispatch) => ({
  setPausedOrders: (data: Order[]) => dispatch(setPausedOrders(data)),
  setPendingOrders: (data: Order[]) => dispatch(setPendingOrders(data)),
  setProcessOrders: (data: Order[]) => dispatch(setProcessOrders(data)),
  setFinishedOrders: (data: Order[]) => dispatch(setFinishedOrders(data)),
});

interface OrdersLinkPageProps {
  callHandler: (id: string) => void;
}

/**
 * Faqat havola (`/products-link`) orqali kirgan a'zolar uchun buyurtmalar.
 * Backend: GET `/orders/all-member?memberId=...`
 */
export default function OrdersLinkPage(props: OrdersLinkPageProps) {
  const { callHandler } = props;
  const {
    setFinishedOrders,
    setPausedOrders,
    setProcessOrders,
    setPendingOrders,
  } = actionDispatch(useDispatch());
  const { orderBulder, authMember, authTable } = useGlobals();
  const device = useDeviceDetect();

  useEffect(() => {
    if (!authMember?._id) return;

    const svc = new OrderService();

    const run = async () => {
      try {
        const { paused, pending, process, finished } = await svc.getMemberOrdersPartitioned(
          authMember._id
        );
        setPausedOrders(paused);
        setPendingOrders(pending);
        setProcessOrders(process);
        setFinishedOrders(finished);
      } catch (err) {
        console.log(err);
      }
    };

    void run();
  }, [authMember?._id, orderBulder]);

  if (!isLinkFlowCustomer(authTable, authMember)) {
    return <Redirect to="/orders" />;
  }

  if (device === "mobile") {
    return (
      <div className="mobile-orders-page">
        <Box className="mobile-orders-container">
          <ProcessOrders
            callHandler={callHandler}
            linkFlow
            mergePausedIntoProgress
          />
          <FinishedOrders linkFlow />
        </Box>
      </div>
    );
  }

  return (
    <div className="order-page">
      <Box className="order-container" sx={{ maxWidth: 960, mx: "auto", px: 2 }}>
        <ProcessOrders
          callHandler={callHandler}
          linkFlow
          mergePausedIntoProgress
        />
        <FinishedOrders linkFlow />
      </Box>
    </div>
  );
}
