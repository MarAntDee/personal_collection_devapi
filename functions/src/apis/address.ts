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

        const _geopoint: firestore.GeoPoint = new firestore.GeoPoint(req.body.coordinates['latitude'], req.body.coordinates['longitude']);

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
            _address['id'] = _addressId;
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
        const _dealerCode: string | undefined = req.query.dealerCode;
        const _addressId: string | undefined = req.query.id;

        if (!_dealerCode || !_addressId) throw "Bad Request";

        const _userRef = firestore().collection("servers").doc("dev").collection('users').doc(_dealerCode);
        const _userSnap = await _userRef.get();
        if (!_userSnap.exists) throw "User not found";

        const _addressesCollection = await _userRef.collection('addresses').get();

        if (!_addressesCollection.docs.some((element) => element.id == _addressId)) throw "Address not found";
        if (_addressesCollection.docs.length < 2) throw "Can not delete only address";
        
        const _addressRef = _userRef.collection('addresses').doc(_addressId);

        const _userAddressId = _userSnap.data()!['address']['id'];

        if (_userAddressId == _addressId) {
            const _nextAddress = _addressesCollection.docs.find((element) => element.id != _addressId);
            if (!_nextAddress) throw "Can not delete only address";

            const _geopoint: firestore.GeoPoint = new firestore.GeoPoint(_nextAddress.data()['coordinates']['latitude'], _nextAddress.data()['coordinates']['longitude']);

            var _newAddress: {[k: string]: any} = {
                "id": _nextAddress.id,
                "name": _nextAddress.data()['name'],
                "full": _nextAddress.data()['full'],
                "coordinates": _geopoint,
            };

            if (_nextAddress.data()['landmark'] != undefined) _newAddress['landmark'] = _nextAddress.data()['landmark'];

            await _userRef.update({
                'address': _newAddress,
            });
        } else {
            await _userRef.update({
                'address': firestore.FieldValue.delete(),
            });
        }
        await _addressRef.delete();

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
        const _dealerCode: string | undefined = req.body.dealerCode;
        const _addressId: string | undefined = req.body.id;

        if (!_dealerCode || !_addressId) throw "Bad Request";

        const _userRef = firestore().collection("servers").doc("dev").collection('users').doc(_dealerCode);
        const _addressRef = _userRef.collection('addresses').doc(_addressId);

        const _addressSnap = await _addressRef.get();
        if (!_addressSnap.exists) throw "Address not found";
        const _addressData = _addressSnap.data()!;

        console.log("ADDRESS DATA GET");

        if (!_addressData['name'] || !_addressData['full'] || !_addressData['coordinates']) throw "Incomplete Address Info";

        console.log("ADDRESS DATA COMPLETE");

        const _coordinates = _addressData['coordinates'];
        console.log(`latitude: ${_coordinates['_latitude']}\nlongitude: ${_coordinates['_longitude']}`);
        const _geopoint: firestore.GeoPoint = new firestore.GeoPoint(_coordinates['_latitude'], _coordinates['_longitude']);
        console.log(`GEOPOINT LAT: ${_geopoint.latitude} LONG: ${_geopoint.longitude}`);

        var _address: {[k: string]: any} = {
            "id": _addressId,
            "name": _addressData['name'],
            "full": _addressData['full'],
            "coordinates": _geopoint,
        };

        if (_addressData['landmark'] != undefined) _address['landmark'] = _addressData['landmark'];

        console.log(_address);

        await _userRef.update({
            'address': _address,
        });


        res.send({
            'status': true,
            'code': 200,
            'message': 'Setting Address to Main Successful',
            'data': {
                'user': (await _userRef.get()).data(),
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