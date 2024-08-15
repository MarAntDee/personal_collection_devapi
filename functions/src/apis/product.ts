import { firestore } from "firebase-admin";
import { FirDepartment } from "../models/department";
import Fuse from "fuse.js";

export async function getDepartments(req: any, res: any) {
    try {
        const _departmentCollections = await firestore().collection("servers").doc("dev").collection("departments").get();

        const _departments = _departmentCollections.docs.map((doc) => {
            const _department = doc.data() as FirDepartment;
            return {
                'id': doc.id,
                'name': _department.name,
                'image': _department.image,
            };
        });

        res.send({
            'status': true,
            'code': 200,
            'message': 'Getting Department Successful',
            'data': {
                'departments': _departments,
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

export async function getProducts(req: any, res: any) {
    try {
        const _department: string | undefined = req.query.department;
        const _searchPattern: string | undefined = req.query.searchPattern;
        const role: string = req.query.role;
        if (!role) throw "Bad Request";

        const _productReference = firestore().collection("servers").doc("dev").collection("products");
        var _initialProductDocs;
        if (_department != undefined) {
            const _productQuery = _productReference.where('category_ids', 'array-contains', _department);
            _initialProductDocs = (await _productQuery.get()).docs;
        }
        else _initialProductDocs = (await _productReference.get()).docs;

        const _initialProductList = _initialProductDocs.map((doc) => {
            return {
                'id': doc.id,
                'info': doc.data(),
            } ;
        },);

        var _filteredProductList = _initialProductList;

        if (_searchPattern != undefined) {
            console.log(`INITIAL PRODUCT LIST: ${_initialProductList}`);
            const fuseOptions = {
                // isCaseSensitive: false,
                // includeScore: true,
                // shouldSort: true,
                // includeMatches: true,
                // // findAllMatches: false,
                // minMatchCharLength: 3,
                keys: [
                    "info.name", "info.desc",
                ]
            };

            const fuse = new Fuse(_initialProductList, fuseOptions);

            const _searchResult = fuse.search(_searchPattern);
            console.log(_searchResult);

            // _filteredProductList = _searchResult.map((result) => result["item"]);
            res.send({
                'status': true,
                'code': 200,
                'message': 'Getting Products Successful',
                'data': {
                    'products': _searchResult,
                },
            });
        } 

        else res.send({
            'status': true,
            'code': 200,
            'message': 'Getting Products Successful',
            'data': {
                'products': _filteredProductList,
            },
        });
    } catch (e) {
        console.log("OOPS, ERROR");
        res.send({
            'status': false,
            'code': 400,
            'message': e,
        });
    }
}