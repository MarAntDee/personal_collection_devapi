import { firestore } from "firebase-admin";

export async function getFavoriteList(req: any, res: any) {}

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