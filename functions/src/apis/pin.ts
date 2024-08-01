import { firestore } from "firebase-admin";
import { beginOTP, resendOTP, verifyOTP } from "./otp";
import { FirUser } from "../models/user";

export async function setPin(req: any, res: any) {
    try {
        const _dealerCode: string | undefined = req.body.dealerCode;
        const _deviceId: string | undefined = req.body.deviceId;
        const _pin: string | undefined = req.body.mpin;

        if (!_dealerCode || !_pin || !_deviceId) throw "Bad Request";

        const _userDoc = await firestore().collection("servers").doc("dev").collection("users").doc(_dealerCode).get();

        if (!_userDoc.exists) throw "Builder not found";

        const _user = _userDoc?.data() as FirUser | undefined;
        if (_user == undefined) throw "Builder not found";

        await _userDoc.ref.update({
            'pin': _pin,
        });    

        res.send({
            'status': true,
            'code': 200,
            'message': 'Setting PIN Successful',
        });

    } catch (e) {
        res.send({
            'status': false,
            'code': 400,
            'message': e,
        });
    }
}

export async function forgotPin(req: any, res: any) {
    try {
        const _dealerCode: string | undefined = req.body.dealerCode;
        const _deviceId: string | undefined = req.body.deviceId;

        if (!_dealerCode || !_deviceId) throw "Bad Request";

        const _userDoc = await firestore().collection("servers").doc("dev").collection("users").doc(_dealerCode).get();

        if (!_userDoc.exists) throw "Builder not found";

        const _user = _userDoc?.data() as FirUser | undefined;
        if (_user == undefined) throw "Builder not found";

        res.send({
            'status': true,
            'code': 200,
            'message': 'Sending OTP for forgot pin',
            'data': {
                "mobileNumber": _user.mobile,
                "pincode": await beginOTP(_deviceId, _user.mobile, "FORGOT PIN"),
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

export async function resendForgotPin(req: any, res: any) {
    try {
        const _dealerCode: string | undefined = req.body.dealerCode;
        const _deviceId: string | undefined = req.body.deviceId;

        if (!_dealerCode || !_deviceId) throw "Bad Request";

        const _userDoc = await firestore().collection("servers").doc("dev").collection("users").doc(_dealerCode).get();

        if (!_userDoc.exists) throw "Builder not found";

        const _user = _userDoc?.data() as FirUser | undefined;
        if (_user == undefined) throw "Builder not found";

        res.send({
            'status': true,
            'code': 200,
            'message': 'Resending OTP Successful',
            'data': {
                "mobileNumber": _user.mobile,
                "pincode": await resendOTP(_deviceId, _user.mobile, "FORGOT PIN"),
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

export async function verifyForgotPin(req: any, res: any) {
    try {
        const _pincode: string | undefined = req.query.pincode;
        const _deviceId: string | undefined = req.query.deviceId;
        if (!_pincode || !_deviceId) throw "Bad Request";

        await verifyOTP(_deviceId, _pincode, "FORGOT PIN");

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