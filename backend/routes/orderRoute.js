const express = require("express");

const {createOrder, getMyOrders, getSingleOrderDetails, getAllOrders, updateOrder, deleteOrder} = require("../controllers/orderController.js");
const {isAuthenticatedUser, authorizeRoles} = require("../middleware/auth");

const router = express.Router();

router.route("/order/new").post(isAuthenticatedUser, createOrder);
router.route("/order/:id").get(isAuthenticatedUser, authorizeRoles("admin"), getSingleOrderDetails);
router.route("/orders/me").get(isAuthenticatedUser, getMyOrders);

router.route("/admin/orders").get(isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);

router.route("/admin/order/:orderId")
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateOrder)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);


module.exports = router;