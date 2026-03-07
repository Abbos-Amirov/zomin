import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  StepIconClassKey,
  Typography,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import Badge from "@mui/material/Badge";
import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Chip from "@mui/material/Chip";

import { useDispatch, useSelector } from "react-redux";
import { createSelector, Dispatch } from "@reduxjs/toolkit";
import { setProducts } from "./slice";
import { Product, ProductInquiry } from "../../../lib/types/product";
import { retrieveProducts } from "./selector";
import ProductService from "../../services/ProductService";
import { CURRENCY_SYMBOL } from "../../../lib/config";
import { ProductCollection } from "../../../lib/enums/product.enums";
import { serverApi } from "../../../lib/config";
import { useHistory } from "react-router-dom";
import { CartItem } from "../../../lib/types/search";
import useDeviceDetect from "../../hooks/useDeviceDetect";
import { useLanguage } from "../../context/LanguageContext";
import { useAddToCartAnimation } from "../../context/AddToCartAnimation";
import "../../../css/mobile/products.css";

const categoryKeys: Record<string, string> = {
  DISH: "dish",
  DESSERT: "dessert",
  DRINK: "drink",
  OTHER: "other",
  SALAD: "salad",
};

/** REDUX SLICE & SELECTOR */
const actionDispatch = (dispatch: Dispatch) => ({
  setProducts: (data: Product[]) => dispatch(setProducts(data)),
});

const productsRetriever = createSelector(retrieveProducts, (products) => ({
  products,
}));

interface ProductProps {
  onAdd: (item: CartItem) => void;
}

const services = [
  {
    icon: "🍽️",
    title: "Dine-In",
    desc: "Enjoy authentic Uzbek flavors in a cozy atmosphere.",
  },
  {
    icon: "🥡",
    title: "Takeaway",
    desc: "Fresh meals packed to go, perfect for busy days.",
  },
  {
    icon: "🚚",
    title: "Delivery",
    desc: "Hot and fast meals delivered right to your doorstep.",
  },
  {
    icon: "🎉",
    title: "Catering",
    desc: "Authentic cuisine for events, parties, and gatherings.",
  },
];

export default function Products(props: ProductProps) {
  const { onAdd } = props;
  const { setProducts } = actionDispatch(useDispatch());
  const { products } = useSelector(productsRetriever);
  const [productSearch, setProductSearch] = useState<ProductInquiry>({
    page: 1,
    limit: 8,
    order: "createdAt",
    productCollection: ProductCollection.DISH,
    search: "",
  });
  const [searchText, setSearchText] = useState<string>("");
  const history = useHistory();
  const device = useDeviceDetect();
  const { t } = useLanguage();
  const addToCartAnim = useAddToCartAnimation();

  useEffect(() => {
    const product = new ProductService();
    product
      .getProducts(productSearch)
      .then((data) => {
        const list = Array.isArray(data) ? data : (data as any)?.data ?? (data as any)?.value ?? [];
        setProducts(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        console.log("Products fetch error:", err);
        setProducts([]);
      });
  }, [productSearch]);

  useEffect(() => {
    if (searchText === "") {
      setProductSearch((prev) => ({ ...prev, search: "", page: 1 }));
    }
  }, [searchText]);

  /** Filtered & sorted products (client-side) */
  const filteredProducts = useMemo(() => {
    const rawProducts = products || [];
    if (!Array.isArray(rawProducts)) return [];
    let result = [...rawProducts];

    // Filter by category
    if (productSearch.productCollection) {
      result = result.filter((p) => p?.productCollection === productSearch.productCollection);
    }

    // Filter by search
    if (productSearch.search?.trim()) {
      const searchLower = productSearch.search.toLowerCase();
      result = result.filter((p) =>
        (p?.productName || "").toLowerCase().includes(searchLower)
      );
    }

    // Sort: Yangi (createdAt), Narx (productPrice), Mashhur (productViews)
    const order = productSearch.order || "createdAt";
    result = [...result].sort((a, b) => {
      if (order === "createdAt") {
        const timeA = new Date((a as any).createdAt || (a as any).created_at || 0).getTime();
        const timeB = new Date((b as any).createdAt || (b as any).created_at || 0).getTime();
        return timeB - timeA; // yangilari birinchi
      }
      if (order === "productPrice") {
        const priceA = Number((a as any).productPrice ?? (a as any).product_price ?? (a as any).price ?? 0) || 0;
        const priceB = Number((b as any).productPrice ?? (b as any).product_price ?? (b as any).price ?? 0) || 0;
        return priceA - priceB; // arzonidan qimmatiga
      }
      if (order === "productViews") {
        const viewsA = Number((a as any).productViews ?? (a as any).product_views ?? 0) || 0;
        const viewsB = Number((b as any).productViews ?? (b as any).product_views ?? 0) || 0;
        return viewsB - viewsA; // mashhurlari birinchi
      }
      return 0;
    });

    return result;
  }, [products, productSearch.productCollection, productSearch.search, productSearch.order]);

  /** Paginated products */
  const paginatedProducts = useMemo(() => {
    const start = (productSearch.page - 1) * productSearch.limit;
    return filteredProducts.slice(start, start + productSearch.limit);
  }, [filteredProducts, productSearch.page, productSearch.limit]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / productSearch.limit));

  /** HANDLERS */

  const searchCollectionHandler = (colletion: ProductCollection) => {
    setProductSearch((prev) => ({
      ...prev,
      page: 1,
      productCollection: colletion,
    }));
  };

  const searchOrderHandler = (order: string) => {
    setProductSearch((prev) => ({
      ...prev,
      page: 1,
      order,
    }));
  };

  const searchProductHandler = () => {
    setProductSearch((prev) => ({
      ...prev,
      page: 1,
      search: searchText,
    }));
  };

  const paginationHandler = (e: ChangeEvent<any>, value: number) => {
    setProductSearch((prev) => ({ ...prev, page: value }));
  };

  const chooseDishHandler = (product: Product) => {
    history.push(`/products/${product._id}`, { product });
  };

  if (device === "mobile") {
    return (
      <div className="mobile-products-page">
        {/* Search Bar */}
        <Box className="mobile-products-search">
          <Box className="mobile-search-container">
            <input
              type="search"
              placeholder={t("searchDishes")}
              className="mobile-search-input"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") searchProductHandler();
              }}
            />
            <IconButton
              onClick={searchProductHandler}
              className="mobile-search-button"
            >
              <SearchIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Category Chips */}
        <Box className="mobile-category-section">
          <Box className="mobile-category-scroll">
            {[
              ProductCollection.DISH,
              ProductCollection.DESSERT,
              ProductCollection.DRINK,
              ProductCollection.SALAD,
              ProductCollection.OTHER,
            ].map((item, i) => (
              <Chip
                key={i}
                label={t(categoryKeys[item] || item)}
                onClick={() => searchCollectionHandler(item)}
                className={`mobile-category-chip ${
                  productSearch.productCollection === item ? "active" : ""
                }`}
              />
            ))}
          </Box>
        </Box>

        {/* Sort Options - Yangi, Narx, Mashhur */}
        <Box className="mobile-sort-section">
          <Chip
            label={t("new")}
            onClick={() => searchOrderHandler("createdAt")}
            className={`mobile-sort-chip ${
              productSearch.order === "createdAt" ? "active" : ""
            }`}
            size="small"
            sx={{ cursor: "pointer" }}
            component="button"
            type="button"
          />
          <Chip
            label={t("price")}
            onClick={() => searchOrderHandler("productPrice")}
            className={`mobile-sort-chip ${
              productSearch.order === "productPrice" ? "active" : ""
            }`}
            size="small"
            sx={{ cursor: "pointer" }}
            component="button"
            type="button"
          />
          <Chip
            label={t("popular")}
            onClick={() => searchOrderHandler("productViews")}
            className={`mobile-sort-chip ${
              productSearch.order === "productViews" ? "active" : ""
            }`}
            size="small"
            sx={{ cursor: "pointer" }}
            component="button"
            type="button"
          />
        </Box>

        {/* Products Grid */}
        <Box className="mobile-products-container">
          {paginatedProducts.length !== 0 ? (
            <Box className="mobile-products-grid">
              {paginatedProducts.map((product: Product) => {
                const imagePath = `${serverApi}/${product.productImages[0]}`;
                const sizeVolume =
                  product.productCollection === ProductCollection.DRINK
                    ? product.productVolume + "L"
                    : product.productSize;
                return (
                  <Box
                    key={product._id}
                    className="mobile-product-card"
                    onClick={() => chooseDishHandler(product)}
                  >
                    <Box className="mobile-product-image-container">
                      <img
                        src={imagePath}
                        alt={product.productName}
                        className="mobile-product-image"
                      />
                      <Chip
                        label={sizeVolume}
                        size="small"
                        className="mobile-product-size-chip"
                      />
                      <IconButton
                        className="mobile-product-cart-btn"
                        onClick={(e) => {
                          const item = {
                            _id: product._id,
                            quantity: 1,
                            name: product.productName,
                            price: product.productPrice,
                            image: product.productImages[0],
                          };
                          const card = (e.currentTarget as HTMLElement).closest(".mobile-product-card");
                          const imgEl = card?.querySelector(".mobile-product-image") as HTMLElement;
                          addToCartAnim?.triggerAnimation(imgEl || e.currentTarget, item.image);
                          onAdd(item);
                          e.stopPropagation();
                        }}
                      >
                        <AddShoppingCartIcon />
                      </IconButton>
                    </Box>
                    <Box className="mobile-product-info">
                      <Typography className="mobile-product-name">
                        {product.productName}
                      </Typography>
                      <Box className="mobile-product-footer">
                        <Box className="mobile-product-price">
                          <MonetizationOnIcon className="mobile-price-icon" />
                          <span>{CURRENCY_SYMBOL}{product.productPrice}</span>
                        </Box>
                        <Badge
                          badgeContent={product.productViews}
                          color="secondary"
                          className="mobile-product-views"
                        >
                          <RemoveRedEyeIcon className="mobile-views-icon" />
                        </Badge>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Box className="mobile-no-products">
              <Typography>{t("noProducts")}</Typography>
            </Box>
          )}
        </Box>

        {/* Pagination */}
        <Box className="mobile-pagination">
          <Pagination
            count={totalPages}
            page={productSearch.page}
            renderItem={(item) => (
              <PaginationItem
                slots={{
                  previous: ArrowBackIcon,
                  next: ArrowForwardIcon,
                }}
                {...item}
              />
            )}
            onChange={paginationHandler}
            size="small"
          />
        </Box>
      </div>
    );
  } else {
    return (
      <div className="products-page">
        <div className="products">
          <Container>
            <Stack flexDirection={"column"} alignItems={"center"} mt="77px">
              <Stack
                flexDirection={"row"}
                justifyContent={"right"}
                alignItems={"center"}
                width={"100%"}
              >
                <Stack className="avatar-big-box">
                  <Box className="top-text">Zomin restaurant</Box>
                  <Stack flexDirection={"row"} alignItems={"center"}>
                    <input
                      type="search"
                      name="singleResearch"
                      placeholder="Type here"
                      className="input"
                      value={searchText}
                      onChange={(e) => {
                        setSearchText(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") searchProductHandler();
                      }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      className="input-btn"
                      endIcon={<SearchIcon />}
                      onClick={searchProductHandler}
                    >
                      Search
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
              <Stack className="dishes-filter-section">
                <Button
                  type="button"
                  variant={"contained"}
                  color={
                    productSearch.order === "createdAt"
                      ? "primary"
                      : "secondary"
                  }
                  className={"order"}
                  onClick={() => searchOrderHandler("createdAt")}
                >
                  {t("new")}
                </Button>
                <Button
                  type="button"
                  variant={"contained"}
                  color={
                    productSearch.order === "productPrice"
                      ? "primary"
                      : "secondary"
                  }
                  className={"order"}
                  onClick={() => searchOrderHandler("productPrice")}
                >
                  {t("price")}
                </Button>
                <Button
                  type="button"
                  variant={"contained"}
                  color={
                    productSearch.order === "productViews"
                      ? "primary"
                      : "secondary"
                  }
                  className={"order"}
                  sx={{ marginRight: "56px" }}
                  onClick={() => searchOrderHandler("productViews")}
                >
                  {t("popular")}
                </Button>
              </Stack>
              <Stack className="list-category-section">
                <Stack className="product-category">
                  {[
                    ProductCollection.DISH,
                    ProductCollection.DESSERT,
                    ProductCollection.DRINK,
                    ProductCollection.OTHER,
                    ProductCollection.SALAD,
                  ].map((item, i) => (
                    <Button
                      key={i}
                      variant={"contained"}
                      color={
                        productSearch.productCollection === item
                          ? "primary"
                          : "secondary"
                      }
                      className="order"
                      sx={{ marginTop: item === "DISH" ? "25px" : "10px" }}
                      onClick={() => searchCollectionHandler(item)}
                    >
                      {item}
                    </Button>
                  ))}
                </Stack>
                <Stack className="product-wrapper">
                  {paginatedProducts.length !== 0 ? (
                    paginatedProducts.map((product: Product) => {
                      const imagePath = `${serverApi}/${product.productImages[0]}`;
                      const sizeVolume =
                        product.productCollection === ProductCollection.DRINK
                          ? product.productVolume + "litre"
                          : product.productSize + "size";
                      return (
                        <Stack
                          key={product._id}
                          className="product-card"
                          onClick={() => chooseDishHandler(product)}
                        >
                          <Stack
                            className="product-img"
                            sx={{ backgroundImage: `url(${imagePath})` }}
                          >
                            <div className="product-sale">{sizeVolume}</div>
                            <Button
                              className="shop-btn"
                              onClick={(e) => {
                                console.log("BUTTON PRESSED!");
                                onAdd({
                                  _id: product._id,
                                  quantity: 1,
                                  name: product.productName,
                                  price: product.productPrice,
                                  image: product.productImages[0],
                                });
                                e.stopPropagation();
                              }}
                            >
                              <img
                                src="/icons/shopping-cart.svg"
                                style={{ display: "flex" }}
                              />
                            </Button>
                            <Button className="view-btn">
                              <Badge
                                badgeContent={product.productViews}
                                color="secondary"
                              >
                                <RemoveRedEyeIcon
                                  sx={{
                                    color:
                                      product.productViews === 0
                                        ? "gray"
                                        : "white",
                                  }}
                                />
                              </Badge>
                            </Button>
                          </Stack>
                          <Box className="product-desc">
                            <span className="product-title">
                              {product.productName}
                            </span>
                            <div className="product-desc">
                              <MonetizationOnIcon />
                              {CURRENCY_SYMBOL}{product.productPrice}
                            </div>
                          </Box>
                        </Stack>
                      );
                    })
                  ) : (
                    <Box className="no-data">Products are not available!</Box>
                  )}
                </Stack>
              </Stack>
              <Stack className="pagination-section">
                <Stack spacing={2}>
                  <Pagination
                    count={totalPages}
                    page={productSearch.page}
                    renderItem={(item) => (
                      <PaginationItem
                        slots={{
                          previous: ArrowBackIcon,
                          next: ArrowForwardIcon,
                        }}
                        {...item}
                        color={"secondary"}
                      />
                    )}
                    onChange={paginationHandler}
                  />
                </Stack>
              </Stack>
            </Stack>
          </Container>
          <div className="brands-logo">
            <Container sx={{ marginTop: "20px" }}>
              <Box sx={{ color: "#fff", py: 8 }}>
                <Container>
                  <Typography
                    variant="h2"
                    align="center"
                    sx={{ mb: 6, fontWeight: "bold", color: "#d4af7f" }}
                  >
                    Our Services
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={4}
                    justifyContent="center"
                    flexWrap="wrap"
                  >
                    {services.map((service, index) => (
                      <Card
                        key={index}
                        sx={{
                          width: 250,
                          height: 300,
                          bgcolor: "#1e1e1e",
                          color: "#fff",
                          textAlign: "center",
                          borderRadius: 3,
                          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                          "&:hover": {
                            transform: "scale(1.05)",
                            transition: "0.3s",
                          },
                        }}
                      >
                        <CardContent>
                          <Typography sx={{ fontSize: 50 }}>
                            {service.icon}
                          </Typography>
                          <Typography
                            variant="h3"
                            sx={{ fontWeight: "bold", mt: 1 }}
                          >
                            {service.title}
                          </Typography>
                          <Typography
                            variant="h4"
                            sx={{ mt: 1, color: "#ccc" }}
                          >
                            {service.desc}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </Container>
              </Box>
            </Container>
          </div>

          <div className="address">
            <Container>
              <Stack className="address-area">
                <Box className="title">Our address</Box>
                <iframe
                  style={{ marginTop: "20px" }}
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3167.319131247058!2d128.0829753!3d35.1801889!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x356e308da2897b87%3A0x3880b1459bb117c0!2sJinju-si%2C%20Gyeongsangnam-do%2C%20South%20Korea!5e0!3m2!1sen!2skr!4v1696240032161!5m2!1sen!2skr"
                  width="1320"
                  height="570"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </Stack>
            </Container>
          </div>
        </div>
      </div>
    );
  }
}
