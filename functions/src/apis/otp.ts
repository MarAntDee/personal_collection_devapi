import { firestore } from "firebase-admin";
import { OtpContext } from "../models/otp";

export const beginOTP = async (deviceId: string, mobile: string, purpose: string,): Promise<string> => {
    const _otpRef = await firestore().collection("servers").doc("dev").collection("otps").doc();
    const _otp = _generate(6);
    const _createdAt = firestore.Timestamp.fromDate(new Date());
    const _expiredAt = firestore.Timestamp.fromDate(new Date(_createdAt.toDate().getTime() + (5*60000)));
    await _otpRef.create({
        'deviceId': deviceId,
        'mobile': mobile,
        'purpose': purpose,
        'otps': firestore.FieldValue.arrayUnion(...[_otp]),
        'used': false,
        'dateCreated': firestore.FieldValue.serverTimestamp(),
        'dateExpired': _expiredAt,
    });
    return _otp;
}

export const resendOTP = async (deviceId: string, mobile: string, purpose: string,): Promise<string> => {
    const _otpQuery = await firestore().collection("servers").doc("dev").collection("otps").where('deviceId', '==', deviceId).where('purpose', '==', purpose).orderBy('dateCreated', 'desc');
    const _otpDocs = (await _otpQuery.get()).docs;
    const _otpDoc = _otpDocs.filter((doc) => {
        const _otpContext = doc.data() as OtpContext;
        return !_otpContext.used;
    })[0];
    if (!_otpDoc.exists || _otpDoc == undefined) return await beginOTP(deviceId, mobile, purpose);

    const _otp = _generate(6);
    const _expiredAt = firestore.Timestamp.fromDate(new Date(new Date().getTime() + (5*60000)));

    await _otpDoc.ref.update({
        'otps': firestore.FieldValue.arrayUnion(...[_otp]),
        'dateExpired': _expiredAt,
    });
    return _otp;
}

export const verifyOTP = async (deviceId: string, pincode: string, purpose: string,) => {
    const _otpQuery = firestore().collection("servers").doc("dev").collection("otps").where('deviceId', '==', deviceId).where('purpose', '==', purpose).orderBy('dateCreated', 'desc');
    const _otpDoc = (await _otpQuery.get()).docs.filter((doc) => {
        const _otpContext = doc.data() as OtpContext;
        return !_otpContext.used;
    })[0];
    if (_otpDoc == undefined) throw "OTP Transaction already used, please try again";

    const _otpContext = _otpDoc.data() as OtpContext;

    const _otps = _otpContext.otps;
    if (!_otps.some((otp) => otp == pincode)) throw "Invalid OTP";
    if (_otps.reverse()[0] != pincode) throw "Can not use expired OTP";

    const _isExpired = _otpContext.dateExpired.seconds < firestore.Timestamp.fromDate(new Date()).seconds;
    if (_isExpired) throw "OTP has expired";

    await _otpDoc.ref.update({
        'used': true
    });
}

function _generate(n: number) : string {
    var add = 1, max = 12 - add;   // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.   
    
    if ( n > max ) {
            return _generate(max) + _generate(n - max);
    }
    
    max        = Math.pow(10, n+add);
    var min    = max/10; // Math.pow(10, n) basically
    var number = Math.floor( Math.random() * (max - min + 1) ) + min;
    
    return ("" + number).substring(add); 
}