import { firestore } from "firebase-admin";

export interface User extends firestore.DocumentData {
    mobile: string,
    pin?: string,
    dateCreated: firestore.Timestamp,
}