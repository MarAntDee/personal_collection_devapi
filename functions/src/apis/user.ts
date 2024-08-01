import { firestore } from "firebase-admin";
import { FirUser } from "../models/user";

export async function getUser(req: any, res: any) {
    try {
        const _dealerCode: string | undefined = req.query.dealerCode;
        const _deviceId: string | undefined = req.query.deviceId;
        const _pin: string | undefined = req.query.mpin;
        const _isLoggingIn: boolean = JSON.parse(req.query.isLoggingIn ?? "false");

        if (!_dealerCode || !_deviceId || !_pin) throw "Bad Request";

        const _userDoc = await firestore().collection("servers").doc("dev").collection("users").doc(_dealerCode).get();

        if (!_userDoc.exists) throw "Builder not found";

        const _user = _userDoc?.data() as FirUser | undefined;
        if (_user == undefined) throw "Builder not found";
        
        if (_user.pin == undefined) throw "Pin not yet set."
        if (_user.pin != _pin) throw "Invalid Pin";
        if (!_isLoggingIn && (_user.deviceId != _deviceId)) throw "Account used on another device";

        _user.deviceId = _deviceId!;
        
        if (_isLoggingIn) await _userDoc.ref.update(
            {'deviceId': _deviceId},
        );        

        res.send({
            'status': true,
            'code': 200,
            'message': _isLoggingIn ? 'Logging in Successful' : 'Getting User Successful',
            'data': {
                'dealerCode': _userDoc.id,
                'mobileNumber': _user.mobile,
                'dateCreated': _user.dateCreated,
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