import React, { act, useEffect } from "react";
import { Container, Stack, Box } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import Divider from "../../components/divider";
import Button from "@mui/material/Button";
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
import { useParams } from "react-router-dom";
import ProductService from "../../services/ProductService";
import MemberService from "../../services/MemberService";
import { Member } from "../../../lib/types/member";
import { serverApi } from "../../../lib/config";
import { CartItem } from "../../../lib/types/search";
import useDeviceDetect from "../../hooks/useDeviceDetect";
import { useAddToCartAnimation } from "../../context/AddToCartAnimation";
import { Typography } from "@mui/material";
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

interface ChosenProductProps {
  onAdd: (item: CartItem) => void;
}

export default function ChosenProduct(props: ChosenProductProps) {
  const { onAdd } = props;
  const { productId } = useParams<{ productId: string }>();
  const { setChosenProdcut, setRestaurant } = actionDispatch(useDispatch());
  const { restaurant } = useSelector(restaurantRetriever);
  const { chosenProduct } = useSelector(chosenProductRetriever);
  const device = useDeviceDetect();
  const addToCartAnim = useAddToCartAnimation();
  useEffect(() => {
    const product = new ProductService();
    product
      .getProduct(productId)
      .then((data) => setChosenProdcut(data))
      .catch((err) => console.log(err));

    const member = new MemberService();
    member
      .getRestaurant()
      .then((data) => setRestaurant(data))
      .catch((err) => console.log(err));
  }, []);

  if (!chosenProduct) return null;
  if(device === "mobile") {
    return (
      <div className="mobile-chosen-product">
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
                ${chosenProduct?.productPrice}
              </Typography>
            </Box>
          </Box>

          {/* Description */}
          {chosenProduct?.productDesc && (
            <Box className="mobile-product-detail-description">
              <Typography className="mobile-description-title">Description</Typography>
              <Typography className="mobile-description-text">
                {chosenProduct.productDesc}
              </Typography>
            </Box>
          )}

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
              Add to Basket
            </Button>
          </Box>
        </Box>
      </div>
    );
  } else {
  return (
    <div className={"chosen-product"}>
      <Box className={"title"}>Product Detail</Box>
      <Container className={"product-container"}>
        <Stack className={"chosen-product-slider"}>
          <Swiper
            loop={true}
            spaceBetween={10}
            navigation={true}
            modules={[FreeMode, Navigation, Thumbs, Pagination]}
            className="swiper-area"
          >
            {chosenProduct?.productImages.map((ele: string, index: number) => {
              const imagePath = `${serverApi}/${ele}`;
              return (
                <SwiperSlide key={index}>
                  <img className="slider-image" src={imagePath} />
                </SwiperSlide>
              );
            })}
          </Swiper>
        </Stack>
        <Stack className={"chosen-product-info"}>
          <Box className={"info-box"}>
            <strong className={"product-name"}>
              {chosenProduct?.productName}
            </strong>
            <span className={"resto-name"}>{restaurant?.memberNick}</span>
            <span className={"resto-name"}>{restaurant?.memberPhone}</span>
            <Box className={"rating-box"}>
              <Rating name="half-rating" defaultValue={2.5} precision={0.5} />
              <div className={"evaluation-box"}>
                <div className={"product-view"}>
                  <RemoveRedEyeIcon sx={{ mr: "10px" }} />
                  <span>{chosenProduct.productViews}</span>
                </div>
              </div>
            </Box>
            <p className={"product-desc"}>
              {chosenProduct?.productDesc
                ? chosenProduct?.productDesc
                : "No Description"}
            </p>
            <Divider height="1" width="100%" bg="#000000" />
            <div className={"product-price"}>
              <span>Price:</span>
              <span>${chosenProduct?.productPrice}</span>
            </div>
            <div className={"button-box"}>
              <Button
                variant="contained"
                onClick={(e) => {
                  console.log("BUTTON PRESSED!");
                  onAdd({
                    _id: chosenProduct._id,
                    quantity: 1,
                    name: chosenProduct.productName,
                    price: chosenProduct.productPrice,
                    image: chosenProduct.productImages[0],
                  });
                  e.stopPropagation();
                }}
              >
                Add To Basket
              </Button>
            </div>
          </Box>
        </Stack>
      </Container>
    </div>
    );
  }
}
