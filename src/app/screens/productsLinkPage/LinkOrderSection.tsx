import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  InputAdornment,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import { useHistory } from "react-router-dom";
import { CartItem } from "../../../lib/types/search";
import {
  CURRENCY_SYMBOL,
  DEFAULT_RESTAURANT_ID,
  Messages,
  serverApi,
} from "../../../lib/config";
import { useGlobals } from "../../hooks/useGlobals";
import { useLanguage } from "../../context/LanguageContext";
import OrderService from "../../services/OrderService";
import { sweetErrorHandling, sweetTopSuccessAlert } from "../../../lib/sweetAlert";
import { OrderType } from "../../../lib/enums/order.enum";
import { TableStatus } from "../../../lib/enums/table.enum";
import { Table } from "../../../lib/types/table";
import TableService from "../../services/TableService";
import "../../../css/link-order.css";

function tableStatusColor(status: TableStatus): "success" | "warning" | "default" {
  switch (status) {
    case TableStatus.AVAILABLE:
      return "success";
    case TableStatus.OCCUPIED:
      return "warning";
    case TableStatus.CLEANING:
      return "default";
    default:
      return "default";
  }
}

/** DB dagi stol turi — tarjima bo‘lsa shu, yo‘qsa `tableKindDisplay` yoki matn */
function tableKindLabel(table: Table, t: (key: string) => string): string | null {
  if (table.tableKind) {
    const key = `tableKind_${table.tableKind}`;
    const tr = t(key as never);
    if (typeof tr === "string" && tr && tr !== key) return tr;
    return table.tableKindDisplay ?? String(table.tableKind);
  }
  return table.tableKindDisplay ?? null;
}

export interface LinkOrderSectionProps {
  cartItems: CartItem[];
  onAdd: (item: CartItem) => void;
  onRemove: (item: CartItem) => void;
  onDelete: (item: CartItem) => void;
  onDeleteAll: () => void;
}

export default function LinkOrderSection(props: LinkOrderSectionProps) {
  const { cartItems, onAdd, onRemove, onDelete, onDeleteAll } = props;
  const { authMember, setOrderBulder } = useGlobals();
  const { t } = useLanguage();
  const history = useHistory();

  const [tableId, setTableId] = useState("");
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [tablesLoadError, setTablesLoadError] = useState(false);
  const tablesLoadingRef = useRef(false);
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [queueTicket, setQueueTicket] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [arrivalInMinutes, setArrivalInMinutes] = useState<number>(30);
  const [orderType, setOrderType] = useState<OrderType>(OrderType.TABLE);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authMember) return;
    setCustomerName((prev) => prev || authMember.memberNick || "");
    setCustomerPhone((prev) => prev || authMember.memberPhone || "");
  }, [authMember]);

  const loadTables = useCallback(async (options?: { silent?: boolean }) => {
    const silent = Boolean(options?.silent);
    if (!silent) {
      if (tablesLoadingRef.current) return;
      tablesLoadingRef.current = true;
      setTablesLoading(true);
    }
    if (!silent) setTablesLoadError(false);
    try {
      const svc = new TableService();
      const data = await svc.getAllTables();
      setTables(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log(e);
      if (!silent) {
        setTables([]);
        setTablesLoadError(true);
      }
    } finally {
      if (!silent) {
        tablesLoadingRef.current = false;
        setTablesLoading(false);
      }
    }
  }, []);

  /** Dialog ochiq bo‘lganda har 5 s da stollar ro‘yxatini yangilash */
  useEffect(() => {
    if (!tableDialogOpen) return;
    const tick = window.setInterval(() => {
      void loadTables({ silent: true });
    }, 5000);
    return () => window.clearInterval(tick);
  }, [tableDialogOpen, loadTables]);

  /** Barcha stollar band/yuvishda bo‘lsa — navbat raqami (bir marta) */
  useEffect(() => {
    if (!tableDialogOpen) {
      setQueueTicket(null);
      return;
    }
    if (tables.length === 0) return;
    const hasAvailable = tables.some((tb) => tb.tableStatus === TableStatus.AVAILABLE);
    setQueueTicket((prev) => {
      if (hasAvailable) return null;
      if (prev !== null) return prev;
      return Math.floor(100 + Math.random() * 899);
    });
  }, [tableDialogOpen, tables]);

  useEffect(() => {
    if (orderType === OrderType.TAKEOUT) {
      setTableId("");
      setSelectedTable(null);
      setTableDialogOpen(false);
    }
  }, [orderType]);

  const openTablePicker = () => {
    setTableDialogOpen(true);
    void loadTables();
  };

  const closeTablePicker = () => {
    setTableDialogOpen(false);
  };

  const selectTableRow = (table: Table) => {
    if (table.tableStatus === TableStatus.OCCUPIED) {
      sweetErrorHandling(new Error(t("linkTableOccupiedMsg"))).then();
      return;
    }
    setSelectedTable(table);
    setTableId(table._id);
    closeTablePicker();
  };

  const hasAvailableTable =
    tables.length > 0 && tables.some((tb) => tb.tableStatus === TableStatus.AVAILABLE);
  const showAllBusyBanner = tableDialogOpen && tables.length > 0 && !hasAvailableTable && !tablesLoading;

  const itemsPrice = cartItems.reduce((a, c) => a + c.quantity * c.price, 0);
  const shippingCost = itemsPrice < 100 ? 5 : 0;
  const totalPrice = (itemsPrice + shippingCost).toFixed(1);

  const handleSubmit = async () => {
    if (!authMember) {
      sweetErrorHandling(new Error(Messages.error2)).then();
      return;
    }
    const trimmed = {
      tableId: tableId.trim(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
    };
    if (
      !trimmed.customerName ||
      !trimmed.customerPhone ||
      Number.isNaN(arrivalInMinutes) ||
      arrivalInMinutes < 0
    ) {
      sweetErrorHandling(new Error(t("linkFillAllFields"))).then();
      return;
    }
    if (orderType === OrderType.TABLE && !trimmed.tableId) {
      sweetErrorHandling(new Error(t("linkFillAllFields"))).then();
      return;
    }
    if (cartItems.length === 0) {
      sweetErrorHandling(new Error(t("linkCartRequired"))).then();
      return;
    }

    setSubmitting(true);
    try {
      const order = new OrderService();
      const orderItems = cartItems.map((c) => ({
        productId: c._id,
        quantity: c.quantity,
      }));
      const restaurantId = DEFAULT_RESTAURANT_ID.trim();
      const common = {
        restaurantId,
        customerName: trimmed.customerName,
        customerPhone: trimmed.customerPhone,
        arrivalInMinutes: Math.floor(arrivalInMinutes),
        orderItems,
        memberId: authMember._id,
      };

      if (orderType === OrderType.TAKEOUT) {
        await order.createLinkTakeoutOrder({
          ...common,
          orderType: OrderType.TAKEOUT,
        });
      } else {
        await order.createLinkOrder({
          ...common,
          tableId: trimmed.tableId,
          orderType: OrderType.TABLE,
        });
      }
      onDeleteAll();
      setOrderBulder(new Date());
      await sweetTopSuccessAlert(t("linkOrderSuccess"), 900);
      history.push("/orders-link");
    } catch (err) {
      console.log(err);
      sweetErrorHandling(err).then();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper className="link-order-panel" elevation={2} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" component="h2" className="link-order-title" gutterBottom>
        {t("linkOrderTitle")}
      </Typography>

      <Stack spacing={2} className="link-order-form">
        <FormControl component="fieldset">
          <FormLabel component="legend">{t("linkOrderType")}</FormLabel>
          <RadioGroup
            row
            value={orderType}
            onChange={(e) => setOrderType(e.target.value as OrderType)}
          >
            <FormControlLabel value={OrderType.TABLE} control={<Radio size="small" />} label={t("linkOrderTypeTable")} />
            <FormControlLabel
              value={OrderType.TAKEOUT}
              control={<Radio size="small" />}
              label={t("linkOrderTypeTakeout")}
            />
          </RadioGroup>
        </FormControl>

        {orderType === OrderType.TABLE ? (
          <>
            <Box
              className="link-table-field-wrap"
              onClick={() => openTablePicker()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openTablePicker();
                }
              }}
              role="button"
              tabIndex={0}
              sx={{ cursor: "pointer" }}
            >
              <TextField
                required
                fullWidth
                size="small"
                label={t("linkTableSelect")}
                placeholder={t("linkTableSelectPlaceholder")}
                value={selectedTable ? String(selectedTable.tableNumber) : ""}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      {tablesLoading ? <CircularProgress size={18} /> : <ArrowDropDownIcon />}
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Dialog
              open={tableDialogOpen}
              onClose={closeTablePicker}
              maxWidth="md"
              fullWidth
              scroll="paper"
              className="link-table-dialog"
              PaperProps={{ className: "link-table-dialog-paper" }}
            >
              <DialogTitle className="link-table-dialog-title">{t("linkTableDialogTitle")}</DialogTitle>
              <DialogContent dividers className="link-table-dialog-content">
                {showAllBusyBanner ? (
                  <Box className="link-table-all-busy-banner">
                    <Typography variant="subtitle1" className="link-table-all-busy-title">
                      {t("linkAllTablesBusyTitle")}
                    </Typography>
                    {queueTicket !== null ? (
                      <Typography variant="h4" className="link-table-queue-number">
                        {t("linkQueueNumberLabel")}: {queueTicket}
                      </Typography>
                    ) : null}
                    <Typography variant="body2" className="link-table-kutaman">
                      {t("linkAllTablesKutaman")}
                    </Typography>
                  </Box>
                ) : null}
                {tablesLoading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress size={40} />
                  </Box>
                ) : tables.length === 0 ? (
                  <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }} variant="body1">
                    {tablesLoadError ? t("linkTableLoadError") : t("linkTableEmptyList")}
                  </Typography>
                ) : (
                  <Box className="link-table-cards-grid">
                    {tables.map((option) => {
                      const kindLbl = tableKindLabel(option, t);
                      return (
                        <Box
                          key={option._id}
                          component="button"
                          type="button"
                          className={
                            "link-table-card" +
                            (selectedTable?._id === option._id ? " link-table-card--selected" : "") +
                            (option.tableStatus === TableStatus.OCCUPIED ? " link-table-card--occupied" : "")
                          }
                          onClick={() => selectTableRow(option)}
                        >
                          <Box className="link-table-card-icon" aria-hidden>
                            <TableRestaurantIcon className="link-table-card-icon-svg" />
                          </Box>
                          <Typography className="link-table-card-number" component="span">
                            {option.tableNumber}
                          </Typography>
                          <Box className="link-table-card-inner">
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap className="link-table-card-chips">
                              {kindLbl ? (
                                <Chip
                                  size="small"
                                  variant="filled"
                                  color="default"
                                  className="link-table-kind-chip"
                                  label={kindLbl}
                                />
                              ) : null}
                              <Chip
                                size="small"
                                className="link-table-card-status"
                                color={tableStatusColor(option.tableStatus as TableStatus)}
                                label={t(`tableStatus_${String(option.tableStatus)}` as never)}
                              />
                            </Stack>
                            {option.tableType ? (
                              <Typography variant="caption" className="link-table-card-type-line" component="span">
                                {t("linkTableTypeShort")}: {option.tableType}
                              </Typography>
                            ) : null}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </DialogContent>
            </Dialog>
          </>
        ) : null}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            required
            fullWidth
            label={t("linkCustomerName")}
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            size="small"
          />
          <TextField
            required
            fullWidth
            label={t("linkCustomerPhone")}
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            size="small"
            type="tel"
          />
        </Stack>
        <TextField
          required
          label={t("linkArrivalMinutes")}
          type="number"
          value={arrivalInMinutes}
          onChange={(e) => setArrivalInMinutes(Number(e.target.value))}
          size="small"
          inputProps={{ min: 0 }}
          sx={{ maxWidth: 200 }}
        />
      </Stack>

      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
        {t("linkCartSection")}
      </Typography>

      {cartItems.length === 0 ? (
        <Typography color="text.secondary" className="link-order-cart-empty">
          {t("cartEmpty")}
        </Typography>
      ) : (
        <Stack spacing={1} className="link-order-cart-lines">
          {cartItems.map((item) => {
            const imagePath = `${serverApi}/${item.image}`;
            return (
              <Box key={item._id} className="link-order-line">
                <img src={imagePath} alt="" className="link-order-line-img" />
                <Box className="link-order-line-info">
                  <span className="link-order-line-name">{item.name}</span>
                  <span className="link-order-line-price">
                    {CURRENCY_SYMBOL}
                    {item.price} × {item.quantity}
                  </span>
                </Box>
                <Stack direction="row" alignItems="center" spacing={0.5} className="link-order-line-qty">
                  <button type="button" className="link-order-qty-btn" onClick={() => onRemove(item)}>
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button type="button" className="link-order-qty-btn" onClick={() => onAdd(item)}>
                    +
                  </button>
                  <IconButton size="small" aria-label="remove" onClick={() => onDelete(item)}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      )}

      {cartItems.length > 0 && (
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }} flexWrap="wrap" gap={1}>
          <Typography variant="body1">
            {t("linkTotal")}: {CURRENCY_SYMBOL}
            {totalPrice}
            <span className="link-order-total-detail">
              {" "}
              ({CURRENCY_SYMBOL}
              {itemsPrice.toFixed(1)} + {CURRENCY_SYMBOL}
              {shippingCost})
            </span>
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            disabled={submitting}
            startIcon={<ShoppingCartCheckoutIcon />}
            onClick={handleSubmit}
            className="link-order-submit"
          >
            {t("linkSubmitOrder")}
          </Button>
        </Stack>
      )}
    </Paper>
  );
}
