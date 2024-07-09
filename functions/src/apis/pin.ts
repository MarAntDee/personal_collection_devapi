import { firestore } from "firebase-admin";
import { beginOTP, resendOTP, verifyOTP } from "./otp";

export async function setPin(req: any, res: any) {
    try {
        const _mobile: string | undefined = req.body.mobileNumber;
        const _deviceId: string | undefined = req.body.deviceId;
        const _pin: string | undefined = req.body.mpin;

        if (!_mobile || !_pin || !_deviceId) throw "Bad Request";

        const _usersRef = firestore().collection("servers").doc("dev").collection("users");
        const _savedUserDoc = (await _usersRef.where("mobile", "==", _mobile).limit(1).get()).docs[0];
        const _newUserDoc = _usersRef.doc();

        var _userObj: {[k: string]: any} = {
            'pin': _pin,
        };
        if (_savedUserDoc == undefined) {
            _userObj['mobile'] = _mobile;
            _userObj['dateCreated'] = firestore.FieldValue.serverTimestamp();
            _userObj['deviceId'] = _deviceId;
        }
        
        await (_savedUserDoc?.ref ?? _newUserDoc).set(
            _userObj, {merge: true},
        );        

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
        const _mobile: string | undefined = req.body.mobileNumber;
        const _deviceId: string | undefined = req.body.deviceId;

        if (!_mobile || !_deviceId) throw "Bad Request";

        const _usersRef = firestore().collection("servers").doc("dev").collection("users");
        const _savedUserDoc = (await _usersRef.where("mobile", "==", _mobile).limit(1).get()).docs[0];

        if (_savedUserDoc == undefined) throw "User not found";

        res.send({
            'status': true,
            'code': 200,
            'message': 'Sending OTP for forgot pin',
            'data': {
                "mobileNumber": _mobile,
                "pincode": await beginOTP(_deviceId, _mobile, "FORGOT PIN"),
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
        const _mobile: string | undefined = req.body.mobileNumber;
        const _deviceId: string | undefined = req.body.deviceId;

        if (!_mobile || !_deviceId) throw "Bad Request";

        res.send({
            'status': true,
            'code': 200,
            'message': 'Resending OTP Successful',
            'data': {
                "mobileNumber": _mobile,
                "pincode": await resendOTP(_deviceId, _mobile, "FORGOT PIN"),
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
        const _pincode: string | undefined = req.body.pincode;
        const _deviceId: string | undefined = req.body.deviceId;
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