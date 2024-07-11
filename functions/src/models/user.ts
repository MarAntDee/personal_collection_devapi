import { firestore } from "firebase-admin";

export interface FirUser extends firestore.DocumentData {
    mobile: string,
    pin?: string,
    dateCreated: firestore.Timestamp,
    deviceId: string,
}