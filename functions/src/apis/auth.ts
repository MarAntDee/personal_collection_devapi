import { firestore } from "firebase-admin";
import { User } from "../models/user";
import { beginOTP, resendOTP } from "./otp";

export const checkMobile = async (req: any, res: any) => {
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
};

export const resendCheckMobile = async (req: any, res: any) => {
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
};