import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as basicAuth from "express-basic-auth";
import * as cors from "cors";

import { checkBuilder, resendCheckBuilder, verifyCheckBuilder, } from "./apis/checkBuilder";
import { forgotPin, resendForgotPin, setPin, verifyForgotPin } from "./apis/pin";
import { getUser } from "./apis/user";
import { getDepartments, getProductGroups, getProducts } from "./apis/product";
import { addToFavorite, getFavoriteList } from "./apis/favorite";
import { getCart, updateCart } from "./apis/cart";
import { addAddress, editAddress, getAddressBook, removeAddress, setAddressToMain } from "./apis/address";

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

app.get("/dev/Favorites", getFavoriteList);
app.post("/dev/Favorites", addToFavorite);

app.get("/dev/Cart", getCart);
app.post("/dev/Cart", updateCart);

app.get("/dev/AddressBook", getAddressBook);
app.post("/dev/AddressBook", addAddress);
app.patch("/dev/AddressBook", editAddress);
app.delete("/dev/AddressBook", removeAddress);
app.put("/dev/AddressBook", setAddressToMain);

exports.api = functions.region('asia-southeast1').https.onRequest(app);