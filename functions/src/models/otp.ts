import { firestore } from "firebase-admin";

export interface OtpContext extends firestore.DocumentData {
    deviceId: string,
    mobile: string,
    purpose: string,
    otps: string[],
    used: boolean,
    dateCreated: firestore.Timestamp,
    dateExpired: firestore.Timestamp,
}