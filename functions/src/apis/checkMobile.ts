import { firestore } from "firebase-admin";
import { User } from "../models/user";
import { beginOTP, resendOTP } from "./otp";
import { OtpContext } from "../models/otp";

export async function checkMobile(req: any, res: any) {
    try {
        const _mobile: string | undefined = req.body.mobileNumber;
        const _deviceId: string | undefined = req.body.deviceId;

        if (!_mobile || !_deviceId) throw "Bad Request";
        const _userQuery = await firestore().collection("servers").doc("dev").collection("users").where("mobile", "==", _mobile).limit(1).get();

        const _userDoc = _userQuery.docs[0];
        const _user = _userDoc?.data() as User | undefined;
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
        const _user = _userDoc?.data() as User | undefined;
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
        const _pincode: string | undefined = req.body.pincode;
        const _deviceId: string | undefined = req.body.deviceId;
        if (!_pincode || !_deviceId) throw "Bad Request";

        const _otpQuery = firestore().collection("servers").doc("dev").collection("otps").where('deviceId', '==', _deviceId).where('purpose', '==', "CHECK MOBILE").orderBy('dateCreated', 'desc');
        const _otpDoc = (await _otpQuery.get()).docs.filter((doc) => {
            const _otpContext = doc.data() as OtpContext;
            return !_otpContext.used;
        })[0];
        if (_otpDoc == undefined) throw "OTP Transaction already used, please try again";

        const _otpContext = _otpDoc.data() as OtpContext;

        const _otps = _otpContext.otps;
        if (!_otps.some((otp) => otp == _pincode)) throw "Invalid OTP";
        if (_otps.reverse()[0] != _pincode) throw "Can not use expired OTP";

        const _isExpired = _otpContext.dateExpired.seconds < firestore.Timestamp.fromDate(new Date()).seconds;
        if (_isExpired) throw "OTP has expired";

        await _otpDoc.ref.update({
            'used': true
        });

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