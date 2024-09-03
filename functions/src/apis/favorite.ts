import { firestore } from "firebase-admin";

export async function getFavoriteList(req: any, res: any) {
    try {
        const _dealerCode: string | undefined = req.query.dealerCode;
        if (!_dealerCode) throw "Bad Request";

        const _dev = firestore().collection("servers").doc("dev");
        const _userDoc = _dev.collection('users').doc(_dealerCode);
        const _user = (await _userDoc.get()).data();

        const _favoriteDocs = (await (_userDoc.collection('favorites').get())).docs;
        const _discountReference = _dev.collection("discounts").where('role', '==', _user!['role']);
        const _discountPayload = (await _discountReference.get()).docs.map((discount) => {
            return {
                'id': discount.id,
                'name': discount.data()['name'],
                'desc': discount.data()['desc'],
                'percent': +(discount.data()['percent'] ?? '0'),
            };
        });

        const _productList = _favoriteDocs.map((doc) => {
            var _info: {[k: string]: any} = {
                'name': doc.data()['name'],
                'desc': doc.data()['desc'],
                'image': doc.data()['Image'],
                'price': +(doc.data()['price'] ?? "0"),
                'departmentIds': doc.data()['category_ids']
            };

            if (doc.data()['discount_ids'] != null) {
                const _discountIds: string[] = doc.data()['discount_ids'];
                const _discount = _discountPayload.find((discount) => _discountIds.indexOf(discount.id) > -1);
                _info['discount'] = _discount;
            }
            return {
                'id': doc.id,
                'info': _info,
            } ;
        },);
    
        res.send({
            'status': true,
            'code': 200,
            'message': 'Getting Favorites Successful',
            'data': {
                'favorites': _productList,
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

export async function addToFavorite(req: any, res: any) {
    //NEED: USER ID, PRODUCT ID
    //TODO: ADD/REMOVE PRODUCT TO USER'S FAVORITE COLLECTION

    try {
        const _dealerCode: string | undefined = req.body.dealerCode;
        const _productId: string | undefined = req.body.productId;
        const _remove: boolean = JSON.parse(req.body.remove ?? "false");
        if (!_dealerCode || !_productId) throw "Bad Request";

        const _productDoc = await firestore().collection("servers").doc("dev").collection("products").doc(_productId).get();
        if (!_productDoc.exists) throw "Product not Found";
        const _product = _productDoc.data();

        const _favoriteRef = firestore().collection("servers").doc("dev").collection("users").doc(_dealerCode).collection('favorites').doc(_productId);
        const _favoriteDoc = await _favoriteRef.get();

        var _message = `${_product!['name']} added to favorite.`;
        if (_favoriteDoc.exists) {
            if (!_remove) throw "Product already in your favorites.";
            var _message = `Removed ${_product!['name']} from favorite.`;
            await _favoriteRef.delete();
        } else if (!_remove) await _favoriteRef.set(_product!);
        else throw "Product already removed in your favorites.";

        res.send({
            'status': true,
            'code': 200,
            'message': _message,
        });
    } catch (e) {
        res.send({
            'status': false,
            'code': 400,
            'message': e,
        });
    }
}