import { firestore } from "firebase-admin";

//GET ADDRESSES
export async function getAddressBook(req: any, res: any) {
    try {
        const _dealerCode: string | undefined = req.query.dealerCode;
        if (!_dealerCode) throw "Bad Request";

        const _addressRef = firestore().collection("servers").doc("dev").collection('users').doc(_dealerCode).collection('addresses');
        const _addressDocs = (await _addressRef.get()).docs;

        const _addressBook = _addressDocs.map((doc) => {
            var _info: {[k: string]: any} = {
                'name': doc.data()['name'],
                'full': doc.data()['full'],
                'landmark': doc.data()['landmark'],
                'coordinates': {
                    'latitude': doc.data()['coordinates']['_latitude'],
                    'longitude': doc.data()['coordinates']['_longitude'],
                },
            };
            return {
                'id': doc.id,
                'info': _info,
            } ;
        },);
        res.send({
            'status': true,
            'code': 200,
            'message': 'Getting Address Book Successful',
            'data': {
                'addressBook': _addressBook,
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

//ADD ADDRESS
export async function addAddress(req: any, res: any) {
    try {
        //REQUEST BODY: DEALER CODE, NAME, COORDINATES, FULL, LANDMARK, ICON
        res.send({
            'status': true,
            'code': 200,
            'message': 'Adding Address Successful',
            'data': {
                'address': {},
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

//EDIT ADDRESS
export async function editAddress(req: any, res: any) {
    try {
        //IF ADDRESS IS MAIN, REPLACE VALUE IN ADDRESS COLLECTION AND USER DOCUMENT
        //REQUEST BODY: DEALER CODE, ID, NAME?, COORDINATES?, FULL?, LANDMARK?, ICON?
        res.send({
            'status': true,
            'code': 200,
            'message': 'Editing Address Successful',
            'data': {
                'address': {},
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

//DELETE ADDRESS
export async function removeAddress(req: any, res: any) {
    try {
        //IF ADDRESS IS MAIN: REPLACE MAIN WITH NEXT ADDRESS
        //IF ADDRESS IS ONLY ADDRESS: SEND ERROR
        //QUERY PARAMETER: DEALER CODE, ID
        res.send({
            'status': true,
            'code': 200,
            'message': 'Removing Address Successful',
        });
    } catch (e) {
        res.send({
            'status': false,
            'code': 400,
            'message': e,
        });
    }
}

//SET ADDRESS TO MAIN
export async function setAddressToMain(req: any, res: any) {
    try {
        //REQUEST BODY: DEALER CODE, ID
        res.send({
            'status': true,
            'code': 200,
            'message': 'Setting Address to Main Successful',
            'data': {
                'user': {},
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