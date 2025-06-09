let express = require("express");
const Auth = require("../Middleware/Auth");
const Ordercontroller = require("../Controller/Order.Controller");
const isAdmin = require("../Middleware/Admin");



let OrderRoutes = express.Router();
OrderRoutes.post("/orderplace/:userid/:pid",Auth, Ordercontroller.Orderplace);
OrderRoutes.post("/create/:userid", Auth, Ordercontroller.Orderpost);
OrderRoutes.get("/totalorder/:userid", Auth, Ordercontroller.TotalOrder);
OrderRoutes.get("/amount/:userid", Auth, Ordercontroller.GetSubtotal);
OrderRoutes.delete("/deleteorder/:userid/:pid/:orderid", Auth, Ordercontroller.Orderdelete);
OrderRoutes.patch("/order-cancel-request/:userid/:orderid/:pid", Auth, Ordercontroller.CancelRequestByUser);
OrderRoutes.patch("/admin-cancel-approve/:orderid/:pid", Auth, isAdmin, Ordercontroller.AdminApproveCancel);
OrderRoutes.get("/cancel-requests", Auth, isAdmin, Ordercontroller.GetAllCancelRequests);
OrderRoutes.get("/allorder/:userid", Auth, isAdmin, Ordercontroller.GetAllOrderbyAdmin);
OrderRoutes.post("/payment/:userid/:orderid", Auth, Ordercontroller.InitiatePayment);
OrderRoutes.post("/verify-payment", Auth, Ordercontroller.verifyPayment);


module.exports = OrderRoutes;