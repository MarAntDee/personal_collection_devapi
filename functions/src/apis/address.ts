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
        const _dealerCode: string | undefined = req.body.dealerCode;
        const _name: string | undefined = req.body.name;
        const _full: string | undefined = req.body.full;
        const _landmark: string | undefined = req.body.landmark;
        if (!_dealerCode || !_name || !_full || !req.body.coordinates) throw "Bad Request";

        const _addressRef = firestore().collection("servers").doc("dev").collection('users').doc(_dealerCode).collection('addresses').doc();

        console.log(`latitude: ${req.body.coordinates['latitude']}\nlongitude: ${req.body.coordinates['longitude']}`);

        const _coordinates = JSON.parse(req.body.coordinates)
        const _geopoint: firestore.GeoPoint = new firestore.GeoPoint(_coordinates['latitude'], _coordinates['longitude']);

        var _address: {[k: string]: any} = {
            'name': _name,
            'full': _full,
            'coordinates': _geopoint,
        };
        if (_landmark) _address['landmark'] = _landmark;

        await _addressRef.create(_address);

        res.send({
            'status': true,
            'code': 200,
            'message': 'Adding Address Successful',
            'data': {
                'address': {
                    'id': _addressRef.id,
                    'info': _address,
                },
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
        const _dealerCode: string | undefined = req.body.dealerCode;
        const _addressId: string | undefined = req.body.id;
        const _name: string | undefined = req.body.name;
        const _full: string | undefined = req.body.full;
        const _landmark: string | undefined = req.body.landmark;
        if (!_dealerCode || !_addressId) throw "Bad Request";

        const _userRef = firestore().collection("servers").doc("dev").collection('users').doc(_dealerCode);
        const _addressRef = _userRef.collection('addresses').doc(_addressId);

        const _addressSnap = await _addressRef.get();

        if (!_addressSnap.exists) throw "Address not found";

        var _address: {[k: string]: any} = {};
        if (_name) _address['name'] = _name;
        if (_full) _address['full'] = _full;
        if (_landmark) _address['landmark'] = _landmark;

        if (req.body.coordinates) {
            console.log(`latitude: ${req.body.coordinates['latitude']}\nlongitude: ${req.body.coordinates['longitude']}`);
            const _geopoint: firestore.GeoPoint = new firestore.GeoPoint(req.body.coordinates['latitude'], req.body.coordinates['longitude']);
            console.log(`GEOPOINT LAT: ${_geopoint.latitude} LONG: ${_geopoint.longitude}`);
            _address['coordinates'] = _geopoint;
            console.log(_address);
        }

        _addressRef.update(_address);

        const _userSnap = await _userRef.get();
        if (!_userSnap.exists) throw "User not found";
        const _mainAddressId = _userSnap.data()!.address?.id;

        if (_mainAddressId == _addressId) {
            _userRef.update({
                "address": _address
            });
        }
        
        res.send({
            'status': true,
            'code': 200,
            'message': 'Editing Address Successful',
            'data': {
                'address': {
                    'id': _addressId,
                    'info': _address,
                    'setToMain': _mainAddressId == _addressId
                },
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