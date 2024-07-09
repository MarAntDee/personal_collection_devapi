import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as basicAuth from "express-basic-auth";
import * as cors from "cors";
import { checkMobile, resendCheckMobile } from "./apis/auth";

admin.initializeApp();

export const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));
app.use(basicAuth({
    users: {
        'personalcollections-dev': 'ecclesiastes2:24',
    },
}));

app.post("/dev/MobileCheck", checkMobile);
app.put("/dev/MobileCheck", resendCheckMobile);

exports.api = functions.region('asia-southeast1').https.onRequest(app);