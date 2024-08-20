import { firestore } from "firebase-admin";
import { FirDepartment } from "../models/department";
// import Fuse from "fuse.js";

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
        // const _searchPattern: string | undefined = req.query.searchPattern;
        const role: string = req.query.role;
        if (!role) throw "Bad Request";

        const _productReference = firestore().collection("servers").doc("dev").collection("products");
        const _departmentReference = firestore().collection("servers").doc("dev").collection("departments");
        const _discountReference = firestore().collection("servers").doc("dev").collection("discounts").where('role', '==', role);

        const _departments = (await _departmentReference.get()).docs;
        const _departmentPayload = _departments.map((dept) => {
            return {
                'id': dept.id,
                'name': dept.data()['name'],
                'image': dept.data()['image'],
            };
        });
        const _discountPayload = (await _discountReference.get()).docs.map((discount) => {
            return {
                'id': discount.id,
                'name': discount.data()['name'],
                'desc': discount.data()['desc'],
                'percent': +(discount.data()['percent'] ?? '0'),
            };
        });

        var _initialProductDocs;
        if (_department != undefined) {
            const _productQuery = _productReference.where('category_ids', 'array-contains', _department);
            _initialProductDocs = (await _productQuery.get()).docs;
        }
        else _initialProductDocs = (await _productReference.get()).docs;

        const _initialProductList = _initialProductDocs.map((doc) => {
            const _deptIds: string[] = doc.data()['category_ids'];
            const _depts = _deptIds.map((id) => {
                return _departmentPayload.find((dept) => dept.id == id);
            });

            const _discountIds: string[] = doc.data()['discount_ids'];
            const _discount = _discountPayload.find((discount) => _discountIds.indexOf(discount.id) > -1);
            return {
                'id': doc.id,
                'info': {
                    'name': doc.data()['name'],
                    'desc': doc.data()['desc'],
                    'image': doc.data()['Image'],
                    'price': +(doc.data()['price'] ?? "0"),
                    'departments': _depts,
                    'discount': _discount
                },
            } ;
        },);

        // if (_searchPattern != undefined) {
        //     console.log(`INITIAL PRODUCT LIST: ${_initialProductList}`);
        //     const fuseOptions = {
        //         // isCaseSensitive: false,
        //         // includeScore: true,
        //         // shouldSort: true,
        //         // includeMatches: true,
        //         // // findAllMatches: false,
        //         // minMatchCharLength: 3,
        //         keys: [
        //             "info.name", "info.desc",
        //         ]
        //     };

        //     const fuse = new Fuse(_initialProductList, fuseOptions);

        //     const _searchResult = fuse.search(_searchPattern);
        //     console.log(_searchResult);

        //     // _filteredProductList = _searchResult.map((result) => result["item"]);
        //     res.send({
        //         'status': true,
        //         'code': 200,
        //         'message': 'Getting Products Successful',
        //         'data': {
        //             'products': _searchResult,
        //         },
        //     });
        // } 

        res.send({
            'status': true,
            'code': 200,
            'message': 'Getting Products Successful',
            'data': {
                'products': _initialProductList,
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