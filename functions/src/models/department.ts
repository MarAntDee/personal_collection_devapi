import { firestore } from "firebase-admin";

export interface FirDepartment extends firestore.DocumentData {
    name: string,
    image?: string,
}