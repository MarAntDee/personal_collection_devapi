import { firestore } from "firebase-admin";

export interface FirUser extends firestore.DocumentData {
    mobile: string,
    pin?: string,
    dateCreated: firestore.Timestamp,
    deviceId: string,
    firstName: string,
    lastName: string,
    role: string,
    address: {
        full: string,
        landmark?: string,
        coordinates: firestore.GeoPoint,
    }
}