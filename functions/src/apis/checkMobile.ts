import { firestore } from "firebase-admin";
import { FirUser } from "../models/user";
import { beginOTP, resendOTP, verifyOTP } from "./otp";

export async function checkMobile(req: any, res: any) {
    try {
        const _mobile: string | undefined = req.body.mobileNumber;
        const _deviceId: string | undefined = req.body.deviceId;

        if (!_mobile || !_deviceId) throw "Bad Request";
        const _userQuery = await firestore().collection("servers").doc("dev").collection("users").where("mobile", "==", _mobile).limit(1).get();

        const _userDoc = _userQuery.docs[0];
        const _user = _userDoc?.data() as FirUser | undefined;
        const hasAccount: boolean = _user != undefined;
        const hasPin: boolean = _user?.pin != undefined;

        res.send({
            'status': true,
            'code': 200,
            'message': 'Checking Mobile Successful',
            'data': {
                "needMobilePin": !hasPin,
                "hasAccount": hasAccount,
                "mobileNumber": _mobile,
                "pincode": await beginOTP(_deviceId, _mobile, "CHECK MOBILE"),
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

export async function resendCheckMobile(req: any, res: any) {
    try {
        const _mobile: string | undefined = req.body.mobileNumber;
        const _deviceId: string | undefined = req.body.deviceId;

        if (!_mobile || !_deviceId) throw "Bad Request";
        const _userQuery = await firestore().collection("servers").doc("dev").collection("users").where("mobile", "==", _mobile).limit(1).get();

        const _userDoc = _userQuery.docs[0];
        const _user = _userDoc?.data() as FirUser | undefined;
        const hasAccount: boolean = _user != undefined;
        const hasPin: boolean = _user?.pin != undefined;

        res.send({
            'status': true,
            'code': 200,
            'message': 'Resending OTP Successful',
            'data': {
                "needMobilePin": !hasPin,
                "hasAccount": hasAccount,
                "mobileNumber": _mobile,
                "pincode": await resendOTP(_deviceId, _mobile, "CHECK MOBILE"),
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

export async function verifyCheckMobile(req: any, res: any) {
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