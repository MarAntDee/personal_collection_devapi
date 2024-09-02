import { firestore } from "firebase-admin";

// export async function getFavoriteList(req: any, res: any) {
//     try {
//         const _dealerCode: string | undefined = req.query.dealerCode;
//         if (!_dealerCode) throw "Bad Request";

//         const _dev = firestore().collection("servers").doc("dev");
//         const _userDoc = _dev.collection('users').doc(_dealerCode);
//         const _user = (await _userDoc.get()).data();

//         const _favoriteDocs = (await (_userDoc.collection('favorites').get())).docs;
//         const _discountReference = _dev.collection("discounts").where('role', '==', _user!['role']);
//         const _discountPayload = (await _discountReference.get()).docs.map((discount) => {
//             return {
//                 'id': discount.id,
//                 'name': discount.data()['name'],
//                 'desc': discount.data()['desc'],
//                 'percent': +(discount.data()['percent'] ?? '0'),
//             };
//         });

//         const _productList = _favoriteDocs.map((doc) => {
//             var _info: {[k: string]: any} = {
//                 'name': doc.data()['name'],
//                 'desc': doc.data()['desc'],
//                 'image': doc.data()['Image'],
//                 'price': +(doc.data()['price'] ?? "0"),
//                 'departmentIds': doc.data()['category_ids']
//             };

//             if (doc.data()['discount_ids'] != null) {
//                 const _discountIds: string[] = doc.data()['discount_ids'];
//                 const _discount = _discountPayload.find((discount) => _discountIds.indexOf(discount.id) > -1);
//                 _info['discount'] = _discount;
//             }
//             return {
//                 'id': doc.id,
//                 'info': _info,
//             } ;
//         },);
    
//         res.send({
//             'status': true,
//             'code': 200,
//             'message': 'Getting Product Groups Successful',
//             'data': {
//                 'favorites': _productList,
//             },
//         });
//     } catch (e) {
//         res.send({
//             'status': false,
//             'code': 400,
//             'message': e,
//         });
//     }
// }

export async function updateCart(req: any, res: any) {

    try {
        const _dealerCode: string | undefined = req.body.dealerCode;
        const _productId: string | undefined = req.body.productId;
        const _quantity: number = JSON.parse(req.body.quantity ?? "0");
        const _discountedPrice: number | undefined = JSON.parse(req.body.price);
        if (!_dealerCode || !_productId) throw "Bad Request";

        const _productDoc = await firestore().collection("servers").doc("dev").collection("products").doc(_productId).get();
        if (!_productDoc.exists) throw "Product not Found";
        const _productPayload = _productDoc.data();
        const _totalPrice: number = JSON.parse(_productPayload!['price']) * _quantity;

        const _cartRef = firestore().collection("servers").doc("dev").collection("users").doc(_dealerCode).collection('cart').doc(_productId);
        const _cartDoc = await _cartRef.get();

        var _product: {[k: string]: any} = {
            'name': _productPayload!['name'],
            'image': _productPayload!['Image'],
            'quantity': _quantity,
            'totalPrice': _totalPrice,
            'discountedPrice': _discountedPrice ?? _totalPrice,
        };

        var _message = `${_productPayload!['name']} added to cart.`;
        if (_cartDoc.exists) _message = `updated ${_productPayload!['name']} to cart.`;

        if (_quantity < 1) {
            await _cartRef.delete();
            _message = `removed ${_productPayload!['name']} from cart.`;
        }
        else await _cartRef.set(_product);

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