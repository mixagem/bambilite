import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, retry, throwError } from 'rxjs';
import { IDetailsProduct, IListProduct } from 'src/app/interfaces/FdTypes';
import { BambiService } from 'src/app/services/bambi.service';
import { SubjectChannelsService } from 'src/app/services/subject-channels.service';

type ProductObject = { sucess: boolean; productList?: IListProduct[]; productDetails?: IDetailsProduct; details?: string }

@Injectable({
	providedIn: 'root'
})

export class FdService {

	drawerOpen: boolean = false;
	drawerFadeout: boolean = false;
	productDetails: IDetailsProduct = { stamp: '', title: '', image: '', tags: [], kcal: 0, unit: '', unitvalue: 0, price: 0, owner: '', public: false, inactive: false, timestamp: Date.now() };
	executingQuery: boolean = false;
	tempB64Img: string = '';
	loadingComplete: boolean = false;

	constructor(private _http: HttpClient, private _bambiService: BambiService, private _channelsService: SubjectChannelsService) {

	}

	API(operation: string, httpParameters: HttpParams | null = null) {

		this.executingQuery = true;

		const call = httpParameters ? this._http.post(this._bambiService.BACKEND_URL + 'fd/products.php', httpParameters, { responseType: 'json' }).pipe(
			retry(1), // retry a failed request
			catchError(this.handleError), // then handle the error
		) : this._http.get(this._bambiService.BACKEND_URL + 'fd/products.php').pipe(
			retry(1),
			catchError(this.handleError),
		);

		call.subscribe({
			next: (data) => {
				const productObject = data as ProductObject;
				switch (operation) {
					case 'getlist':
					case 'getqueriedlist':
						productObject.sucess ? this._channelsService.ProductListChannelFire(true, '', productObject.productList!) : this._channelsService.ProductListChannelFire(false, productObject.details)
						break;

					case 'getdetails':
						productObject.sucess ? this._channelsService.ProductDetailsChannelFire(true, '', productObject.productDetails!) : this._channelsService.ProductDetailsChannelFire(false, productObject.details)
						break;

					case 'update':
					case 'new':
						productObject.sucess ? this._channelsService.ProductUpdateChannelFire(true) : this._channelsService.ProductUpdateChannelFire(false, productObject.details)
						break;

					case 'delete':
						this._channelsService.ProductDeleteChannelFire(productObject.sucess, productObject.details!);
						break;
				}
				this.executingQuery = false;
			},
			error: () => {
				this.executingQuery = false;
				switch (operation) {
					case 'getlist':
					case 'getqueriedlist':
						this._channelsService.ProductListChannelFire(false, 'offline');
						return;

					case 'getdetails':
						this._channelsService.ProductDetailsChannelFire(false, 'offline');
						return;

					case 'update':
					case 'new':
						this._channelsService.ProductUpdateChannelFire(false, 'offline');
						return;

					case 'delete':
						this._channelsService.ProductDeleteChannelFire(false, 'offline');
						return;


				}
			}
		});
	}



	private handleError(error: HttpErrorResponse) {
		if (error.status === 0) {
			// A client-side or network error
			console.error('An error occurred:', error.error);
		} else {
			// The backend returned an unsuccessful response code.
			console.error(
				`Backend returned code ${error.status}, body was: `, error.error);
		}
		return throwError(() => new Error('Something bad happened; please try again later.'));
	}
}
