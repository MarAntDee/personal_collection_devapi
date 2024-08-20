import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as basicAuth from "express-basic-auth";
import * as cors from "cors";

import { checkBuilder, resendCheckBuilder, verifyCheckBuilder, } from "./apis/checkBuilder";
import { forgotPin, resendForgotPin, setPin, verifyForgotPin } from "./apis/pin";
import { getUser } from "./apis/user";
import { getDepartments, getProductGroups, getProducts } from "./apis/product";

admin.initializeApp();
admin.firestore().settings({timestampsInSnapshots: true});

export const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));
app.use(basicAuth({
    users: {
        'personalcollection-dev': 'ecclesiastes2:24',
    },
}));

app.post("/dev/BuilderCheck", checkBuilder);
app.put("/dev/BuilderCheck", resendCheckBuilder);
app.delete("/dev/BuilderCheck", verifyCheckBuilder);

app.post("/dev/SetPin", setPin);
app.post("/dev/ForgotPin", forgotPin);
app.put("/dev/ForgotPin", resendForgotPin);
app.delete("/dev/ForgotPin", verifyForgotPin);

app.get("/dev/User", getUser);

app.get("/dev/Departments", getDepartments);

app.get("/dev/Products", getProducts);
app.get("/dev/ProductGroups", getProductGroups);

//TODO:
//GET PRODUCTS FUNCTION (ALL/BY DEPARTMENT/SEARCH TEXT)
//GET DEPARTMENT FUNCTION
//GET GROUPS FUNCTION
//ADD TO CART

exports.api = functions.region('asia-southeast1').https.onRequest(app);