import React, { useEffect } from "react";
import { Container, Stack, Box, Button, Typography, Chip } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Divider from "../../components/divider";
import Rating from "@mui/material/Rating";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/pagination";
import { FreeMode, Navigation, Thumbs, Pagination } from "swiper";

import { useDispatch, useSelector } from "react-redux";
import { createSelector, Dispatch } from "@reduxjs/toolkit";
import { setChosenProdcut, setRestaurant } from "./slice";
import { Product } from "../../../lib/types/product";
import { retrieveChosenProduct, retrieveRestaurant } from "./selector";
import { useParams, useHistory, useLocation } from "react-router-dom";
import ProductService from "../../services/ProductService";
import MemberService from "../../services/MemberService";
import { Member } from "../../../lib/types/member";
import { serverApi, CURRENCY_SYMBOL } from "../../../lib/config";
import { CartItem } from "../../../lib/types/search";
import useDeviceDetect from "../../hooks/useDeviceDetect";
import { useAddToCartAnimation } from "../../context/AddToCartAnimation";
import { useLanguage } from "../../context/LanguageContext";
import { ProductCollection } from "../../../lib/enums/product.enums";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import "../../../css/mobile/products.css";

/** REDUX SLICE & SELECTOR */
const actionDispatch = (dispatch: Dispatch) => ({
  setChosenProdcut: (data: Product) => dispatch(setChosenProdcut(data)),
  setRestaurant: (data: Member) => dispatch(setRestaurant(data)),
});

const chosenProductRetriever = createSelector(
  retrieveChosenProduct,
  (chosenProduct) => ({ chosenProduct })
);

const restaurantRetriever = createSelector(
  retrieveRestaurant,
  (restaurant) => ({ restaurant })
);

const categoryKeys: Record<string, string> = {
  DISH: "dish",
  DESSERT: "dessert",
  DRINK: "drink",
  OTHER: "other",
  SALAD: "salad",
};

const sizeKeys: Record<string, string> = {
  SMALL: "sizeSmall",
  NORMAL: "sizeNormal",
  LARGE: "sizeLarge",
  SET: "sizeSet",
};

interface ChosenProductProps {
  onAdd: (item: CartItem) => void;
  basePath?: string;
}

export default function ChosenProduct(props: ChosenProductProps) {
  const { onAdd, basePath = "/products" } = props;
  const { productId } = useParams<{ productId: string }>();
  const history = useHistory();
  const location = useLocation<{ product?: Product }>();
  const { setChosenProdcut, setRestaurant } = actionDispatch(useDispatch());
  const { restaurant } = useSelector(restaurantRetriever);
  const { chosenProduct } = useSelector(chosenProductRetriever);
  const device = useDeviceDetect();
  const addToCartAnim = useAddToCartAnimation();
  const { t } = useLanguage();

  useEffect(() => {
    const productFromState = location.state?.product;
    if (productFromState && productFromState._id === productId) {
      setChosenProdcut(productFromState);
    } else if (productId) {
      const productService = new ProductService();
      productService
        .getAdminProduct(productId)
        .then((data) => setChosenProdcut(data))
        .catch(() =>
          productService
            .getProduct(productId)
            .then((data) => setChosenProdcut(data))
            .catch((err) => console.log(err))
        );
    }

    const member = new MemberService();
    member
      .getRestaurant()
      .then((data) => setRestaurant(data))
      .catch((err) => console.log(err));
  }, [productId]);

  const getSizeVolumeLabel = () => {
    if (!chosenProduct) return "";
    if (chosenProduct.productCollection === ProductCollection.DRINK) {
      return `${chosenProduct.productVolume} ${t("volumeLitre")}`;
    }
    return t(sizeKeys[chosenProduct.productSize] || chosenProduct.productSize);
  };

  if (!chosenProduct) return null;
  if (device === "mobile") {
    return (
      <div className="mobile-chosen-product">
        {/* Back Button */}
        <Box
          sx={{
            position: "absolute",
            top: 16,
            left: 16,
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: "#fff",
            bgcolor: "rgba(0,0,0,0.4)",
            borderRadius: "12px",
            px: 1.5,
            py: 1,
            cursor: "pointer",
          }}
          onClick={() => history.push(basePath)}
        >
          <ArrowBackIcon fontSize="small" />
          <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{t("backToProducts")}</Typography>
        </Box>

        {/* Image Carousel */}
        <Box className="mobile-product-image-carousel">
          <Swiper
            loop={true}
            spaceBetween={0}
            slidesPerView={1}
            pagination={{ clickable: true }}
            modules={[Pagination]}
            className="mobile-product-swiper"
          >
            {chosenProduct?.productImages.map((ele: string, index: number) => {
              const imagePath = `${serverApi}/${ele}`;
              return (
                <SwiperSlide key={index}>
                  <img className="mobile-product-detail-image" src={imagePath} alt={chosenProduct.productName} />
                </SwiperSlide>
              );
            })}
          </Swiper>
        </Box>

        {/* Product Info */}
        <Box className="mobile-product-detail-info">
          {/* Product Name & Restaurant */}
          <Box className="mobile-product-detail-header">
            <Typography className="mobile-product-detail-name">
              {chosenProduct?.productName}
            </Typography>
            {restaurant?.memberNick && (
              <Typography className="mobile-product-detail-restaurant">
                {restaurant.memberNick}
              </Typography>
            )}
          </Box>

          {/* Rating & Views */}
          <Box className="mobile-product-detail-meta">
            <Rating 
              name="product-rating" 
              defaultValue={2.5} 
              precision={0.5}
              size="small"
              readOnly
            />
            <Box className="mobile-product-detail-views">
              <RemoveRedEyeIcon className="mobile-views-icon-small" />
              <span>{chosenProduct.productViews}</span>
            </Box>
          </Box>

          {/* Price */}
          <Box className="mobile-product-detail-price-section">
            <Box className="mobile-product-detail-price">
              <MonetizationOnIcon className="mobile-price-icon-large" />
              <Typography className="mobile-price-amount">
                {CURRENCY_SYMBOL}{chosenProduct?.productPrice}
              </Typography>
            </Box>
          </Box>

          {/* Size/Volume Chip */}
          <Box sx={{ mb: 2 }}>
            <Chip
              label={getSizeVolumeLabel()}
              size="small"
              sx={{
                bgcolor: "#3776CC",
                color: "#fff",
                fontWeight: 600,
                fontSize: "12px",
              }}
            />
          </Box>

          {/* Description */}
          <Box className="mobile-product-detail-description">
            <Typography className="mobile-description-title">{t("description")}</Typography>
            <Typography className="mobile-description-text">
              {chosenProduct?.productDesc || t("noDescription")}
            </Typography>
          </Box>

          {/* Add to Basket Button */}
          <Box className="mobile-product-detail-actions">
            <Button
              variant="contained"
              fullWidth
              className="mobile-add-to-basket-btn"
              startIcon={<AddShoppingCartIcon />}
              onClick={(e) => {
                const item = {
                  _id: chosenProduct._id,
                  quantity: 1,
                  name: chosenProduct.productName,
                  price: chosenProduct.productPrice,
                  image: chosenProduct.productImages[0],
                };
                addToCartAnim?.triggerAnimation(e.currentTarget, item.image);
                onAdd(item);
                e.stopPropagation();
              }}
            >
              {t("addToBasket")}
            </Button>
          </Box>
        </Box>
      </div>
    );
  } else {
    return (
      <div className="chosen-product chosen-product-modern">
        <Container sx={{ pt: 4, pb: 8 }}>
          {/* Back Button */}
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => history.push(basePath)}
            sx={{
              mb: 3,
              color: "#3776CC",
              fontWeight: 600,
              "&:hover": { bgcolor: "rgba(55, 118, 204, 0.08)" },
            }}
          >
            {t("backToProducts")}
          </Button>

          <Box className="product-container product-container-modern">
            <Stack className="chosen-product-slider">
              <Swiper
                loop={true}
                spaceBetween={10}
                navigation={true}
                pagination={{ clickable: true }}
                modules={[FreeMode, Navigation, Thumbs, Pagination]}
                className="swiper-area"
              >
                {chosenProduct?.productImages.map((ele: string, index: number) => {
                  const imagePath = `${serverApi}/${ele}`;
                  return (
                    <SwiperSlide key={index}>
                      <img className="slider-image" src={imagePath} alt={chosenProduct.productName} />
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </Stack>
            <Stack className="chosen-product-info chosen-product-info-modern">
              <Box className="info-box">
                <Typography variant="h4" className="product-name-modern" sx={{ fontWeight: 700, mb: 1 }}>
                  {chosenProduct?.productName}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Chip
                    label={t(categoryKeys[chosenProduct.productCollection] || chosenProduct.productCollection)}
                    size="small"
                    sx={{ bgcolor: "#e8f4fd", color: "#3776CC", fontWeight: 600 }}
                  />
                  <Chip
                    label={getSizeVolumeLabel()}
                    size="small"
                    sx={{ bgcolor: "#f5f5f5", color: "#333", fontWeight: 600 }}
                  />
                </Stack>
                {restaurant?.memberNick && (
                  <Typography sx={{ color: "#666", fontSize: 15, mb: 2 }}>
                    {restaurant.memberNick}
                  </Typography>
                )}
                <Box className="rating-box" sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <Rating name="half-rating" defaultValue={2.5} precision={0.5} size="small" readOnly />
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#666" }}>
                    <RemoveRedEyeIcon sx={{ fontSize: 18 }} />
                    <span>{chosenProduct.productViews} {t("views")}</span>
                  </Box>
                </Box>
                <Divider height="1" width="100%" bg="#e0e0e0" />
                <Typography sx={{ mt: 2, mb: 2, color: "#444", lineHeight: 1.7, fontSize: 16 }}>
                  <strong>{t("description")}:</strong>{" "}
                  {chosenProduct?.productDesc || t("noDescription")}
                </Typography>
                <Divider height="1" width="100%" bg="#e0e0e0" />
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2, mb: 3 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: 18 }}>{t("price")}:</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <MonetizationOnIcon sx={{ color: "#3776CC", fontSize: 28 }} />
                    <Typography sx={{ fontWeight: 700, fontSize: 28, color: "#3776CC" }}>
                      {CURRENCY_SYMBOL}{chosenProduct?.productPrice}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddShoppingCartIcon />}
                  onClick={(e) => {
                    const item = {
                      _id: chosenProduct._id,
                      quantity: 1,
                      name: chosenProduct.productName,
                      price: chosenProduct.productPrice,
                      image: chosenProduct.productImages[0],
                    };
                    addToCartAnim?.triggerAnimation(e.currentTarget as HTMLElement, item.image);
                    onAdd(item);
                    e.stopPropagation();
                  }}
                  sx={{
                    width: "100%",
                    py: 1.5,
                    bgcolor: "#3776CC",
                    fontWeight: 600,
                    fontSize: 16,
                    borderRadius: 2,
                    "&:hover": { bgcolor: "#2d5fa3" },
                  }}
                >
                  {t("addToBasket")}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Container>
      </div>
    );
  }
}
