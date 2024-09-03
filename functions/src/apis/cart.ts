import { firestore } from "firebase-admin";

export async function getCart(req: any, res: any) {
    try {
        const _dealerCode: string | undefined = req.query.dealerCode;
        if (!_dealerCode) throw "Bad Request";

        const _cartRef = firestore().collection("servers").doc("dev").collection('users').doc(_dealerCode).collection('cart');
        const _cartDocs = (await _cartRef.get()).docs;

        const _productList = _cartDocs.map((doc) => {
            var _info: {[k: string]: any} = {
                'name': doc.data()['name'],
                'image': doc.data()['image'],
                'quantity': (doc.data()['quantity'] ?? "0"),
                'totalPrice': doc.data()['totalPrice'],
                'discountedPrice': doc.data()['discountedPrice'],
            };
            return {
                'id': doc.id,
                'info': _info,
            } ;
        },);
    
        res.send({
            'status': true,
            'code': 200,
            'message': 'Getting Cart Products Successful',
            'data': {
                'cart': _productList,
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
        if (_cartDoc.exists) _message = `Updated ${_productPayload!['name']} to cart.`;

        if (_quantity < 1) {
            await _cartRef.delete();
            _message = `Removed ${_productPayload!['name']} from cart.`;
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