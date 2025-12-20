import "./config/db.config.js";
// import "./config/redisDb.config.js";

import ui_routes from './routes/Ui_routes.js';
import Server from "./common/server.js";
import app from "./common/app.js";
import io from "./services/socketService.js";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import rootpath from "./helper/rootPath.js";
import logger from "./helper/logger.js";
import respHelper from "./helper/respHelper.js";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { swaggerOptions } from "./swagger/swaggerDefinition.js";
import helper from "./helper/helper.js";
import { fileURLToPath } from 'url';
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import expressLayouts from 'express-ejs-layouts';
import {returnCartList} from "../src/api/services/cartService.js";
import {getCategories} from "../src/api/services/home.service.js"
import {businessLogic} from "../src/api/services/centralService.js"
import flash from 'connect-flash';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(helmet());
app.set("trust proxy", 1);
app.use(morgan("dev"));
app.use(cors());
app.use(express.urlencoded({ extended: true })); // to parse form data
app.use(express.json());  // JSON data ke liye
// to maintain session
app.use(expressLayouts);
app.use(
	session({
	  secret: 'babyGammingZoneDev',
	  resave: true,
	  saveUninitialized: true,
	  cookie: { secure: false } // Use true only with HTTPS
	})
  );
// to maintain session
 app.use(flash());
app.use(cookieParser());
app.use(async (req, res, next) => {
res.locals.flashMessage = req.flash('message') || null;
res.locals.user = req.session.user || null;
let cart=[]
if(req.cookies.userCart){
cart=await returnCartList(req.cookies.userCart);
}
res.locals.cartList=cart;
res.locals.hotCategories=await getCategories(0,6)
res.locals.helper=helper;
res.locals.businessLogic=await businessLogic('SHIPPING_DETAILS');
res.locals.storeInfo=await businessLogic('STORE_INFO');
next();
});

// app.use("/api", routes);
helper.checkFolder();
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// add this
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

app.get("/api/uploads/:user/:fileName", (req, res) => {
	res.sendFile(
		path.join(rootpath, `../uploads/${req.params.user}/${req.params.fileName}`),
	);
});
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout',	 path.join(__dirname, 'layouts/main')); // default layout file
app.use(express.static(path.join(process.cwd(), '/src/public')));

app.use('/', ui_routes);
io.on("connection", (socket) => {
	console.log("Client Socket Connected");
	// console.log(socket)
	socket.on("new-user-joined", (name) => {
		//   users[socket.id] = name;

		socket.broadcast.emit("user-joined", name);
	});

	socket.on("disconnect", () => {
		console.log("Client Socket Disconnected");
	});

	socket.emit("test", "Socket Connected With Server");
});

export default Server;
