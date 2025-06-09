let express = require("express");
const connection = require("./Config/db");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const Userroutes = require("./Routes/userroutes");
const Productroute = require("./Routes/Productroutes");
const Commentroute = require("./Routes/Commentroutes");
const OrderRoutes = require("./Routes/Orderroutes");

let app = express();


app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174","https://transcendent-melba-4080cb.netlify.app"],
    credentials: true
}));
app.use(express.static("./UploadImage"));


app.use("/api/users", Userroutes);
app.use("/api/product", Productroute);
app.use("/api/comment", Commentroute);
app.use("/api/order", OrderRoutes);

app.get("/", (req, res) => {
    res.send("<h1>API is Working......</h1>");
});

const startServer = async () => {
    try {
        await connection; 
        console.log("MongoDB connected");

        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`);
        });

    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
    }
};

startServer(); 
