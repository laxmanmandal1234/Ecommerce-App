const express = require("express");
const { getAllProducts, createProduct, updateProduct, deleteProduct, getProductDetails, createProductReview, deleteAllProducts, getProductReviews, deleteReview } = require("../controllers/productController");
const {isAuthenticatedUser, authorizeRoles} = require("../middleware/auth");

const router = express.Router();

//defining all routes paths related to product CRUD operation

router.route("/products").get(getAllProducts);
router.route("/product/new").post(isAuthenticatedUser, authorizeRoles("admin"), createProduct);
router.route("/product/:id")            //since put(), delete(), get() all methods are listening to the same routes "/product/:id", we have used Chained Routing
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateProduct)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct)
    .get(getProductDetails);

router.route("/product/delete/all").delete(isAuthenticatedUser, authorizeRoles("admin"), deleteAllProducts);
router.route("/review/create").put(isAuthenticatedUser, createProductReview);
router.route("/reviews")
    .get(isAuthenticatedUser, getProductReviews)
    .delete(isAuthenticatedUser, deleteReview);

module.exports = router;