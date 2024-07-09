import { firestore } from "firebase-admin";
import { User } from "../models/user";

export async function getUser(req: any, res: any) {
    try {
        const _mobile: string | undefined = req.query.mobileNumber;
        const _deviceId: string | undefined = req.query.deviceId;
        const _pin: string | undefined = req.query.mpin;
        const _isLoggingIn: boolean = req.query.isLoggingin ?? false;

        if (!_mobile || _deviceId || !_pin) throw "Bad Request";

        const _usersRef = firestore().collection("servers").doc("dev").collection("users");
        const _savedUserDoc = (await _usersRef.where("mobile", "==", _mobile).limit(1).get()).docs[0];

        if (_savedUserDoc == undefined) throw "User not found";

        const _user = _savedUserDoc.data() as User;
        if (_user.pin == undefined) throw "Pin not yet set."
        if (_user.pin != _pin) throw "Invalid Pin";
        if (!_isLoggingIn && (_user.deviceId != _deviceId!)) throw "Account used on another device";

        _user.deviceId = _deviceId!;
        
        if (_isLoggingIn) await _savedUserDoc.ref.update(
            {'deviceId': _deviceId},
        );        

        res.send({
            'status': true,
            'code': 200,
            'message': _isLoggingIn ? 'Logging in Successful' : 'Getting User Successful',
            'data': _user,
        });

    } catch (e) {
        res.send({
            'status': false,
            'code': 400,
            'message': e,
        });
    }
}