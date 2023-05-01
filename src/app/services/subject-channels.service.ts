import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IDetailsProduct, IListProduct } from '../interfaces/FdTypes';

export type LoginChannelResult = { sucess: boolean, details?: string }
export type ProductChannelResult = { sucess: boolean, products?: IListProduct[], product?: IDetailsProduct, details?: string }

@Injectable({
	providedIn: 'root'
})

export class SubjectChannelsService {

	cookieLoginChannel: Subject<LoginChannelResult>;
	loginChannel: Subject<LoginChannelResult>;
	productListChannel: Subject<ProductChannelResult>;
	// productQueriedListChannel: Subject<ProductChannelResult>;
	productDetailsChannel: Subject<ProductChannelResult>;

	constructor() {
		this.cookieLoginChannel = new Subject<LoginChannelResult>;
		this.loginChannel = new Subject<LoginChannelResult>;
		this.productListChannel = new Subject<ProductChannelResult>;
		// this.productQueriedListChannel = new Subject<ProductChannelResult>;
		this.productDetailsChannel = new Subject<ProductChannelResult>;
	}

	CookieLoginChannelFire(result: boolean, errorCode: string = ''): void {
		this.cookieLoginChannel.next({ sucess: result, details: errorCode });
		this.cookieLoginChannel.complete();
		if (result) { this.loginChannel.complete(); }
	}

	LoginChannelFire(result: boolean, errorCode: string = ''): void {
		this.loginChannel.next({ sucess: result, details: errorCode });
		if (result) { this.loginChannel.complete(); }
	}

	ProductListChannelFire(result: boolean, errorCode: string = '', productList?: IListProduct[],): void {
		this.productListChannel.next({ sucess: result, products: productList, details: errorCode });
		// this.productListChannel.complete();
	}

	// ProductQueriedListChannelFire(result: boolean, errorCode: string = '', productList?: IListProduct[],): void {
	// 	this.productQueriedListChannel.next({ sucess: result, products: productList, details: errorCode });
	// }

	ProductDetailsChannelFire(result: boolean, errorCode: string = '', productDetails?: IDetailsProduct): void {
		this.productDetailsChannel.next({ sucess: result, product: productDetails, details: errorCode });
		this.productDetailsChannel.complete();
	}

}
