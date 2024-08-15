import { firestore } from "firebase-admin";
import { FirUser } from "../models/user";
import { beginOTP, resendOTP, verifyOTP } from "./otp";

export async function checkBuilder(req: any, res: any) {
    try {
        const _dealerCode: string | undefined = req.body.dealerCode;
        const _deviceId: string | undefined = req.body.deviceId;

        if (!_dealerCode || !_deviceId) throw "Bad Request";
        const _userDoc = await firestore().collection("servers").doc("dev").collection("users").doc(_dealerCode).get();

        if (!_userDoc.exists) throw "Builder not found";

        const _user = _userDoc?.data() as FirUser | undefined;
        if (_user == undefined) throw "Builder not found";

        const hasPin: boolean = _user.pin != undefined;

        res.send({
            'status': true,
            'code': 200,
            'message': 'Checking Mobile Successful',
            'data': {
                "needMobilePin": !hasPin,
                "mobileNumber": _user.mobile,
                "pincode": await beginOTP(_deviceId, _user.mobile, "CHECK MOBILE"),
            },
        });
    } catch (e) {
        res.send({
            'status': false,
            'code': 400,
            'message': e,
        });
    }
}

export async function resendCheckBuilder(req: any, res: any) {
    try {
        const _dealerCode: string | undefined = req.body.dealerCode;
        const _deviceId: string | undefined = req.body.deviceId;

        if (!_dealerCode || !_deviceId) throw "Bad Request";
        const _userDoc = await firestore().collection("servers").doc("dev").collection("users").doc(_dealerCode).get();

        if (!_userDoc.exists) throw "Builder not found";

        const _user = _userDoc?.data() as FirUser | undefined;
        if (_user == undefined) throw "Builder not found";
        const hasPin: boolean = _user.pin != undefined;

        res.send({
            'status': true,
            'code': 200,
            'message': 'Resending OTP Successful',
            'data': {
                "needMobilePin": !hasPin,
                "mobileNumber": _user.mobile,
                "pincode": await resendOTP(_deviceId, _user.mobile, "CHECK MOBILE"),
            },
        });
    } catch (e) {
        res.send({
            'status': false,
            'code': 400,
            'message': e,
        });
    }
}

export async function verifyCheckBuilder(req: any, res: any) {
    try {
        const _pincode: string | undefined = req.query.pincode;
        const _deviceId: string | undefined = req.query.deviceId;
        if (!_pincode || !_deviceId) throw "Bad Request";

        await verifyOTP(_deviceId, _pincode, "CHECK MOBILE");

        res.send({
            'status': true,
            'code': 200,
            'message': 'OTP is valid',
        });
    } catch (e) {
        res.send({
            'status': false,
            'code': 400,
            'message': e,
        });
    }
}