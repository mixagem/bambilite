import { IListProduct, IDetailsProduct } from "./Fd";

export type RecordOperation = 'update' | 'delete' | 'clone';
export type ProductObject = { sucess: boolean; productList?: IListProduct[]; productDetails?: IDetailsProduct; details?: string }