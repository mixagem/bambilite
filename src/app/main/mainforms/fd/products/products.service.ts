import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, retry, throwError } from 'rxjs';
import { IDetailsProduct,  IListProduct } from 'src/app/interfaces/Fd';
import { BambiService } from 'src/app/services/bambi.service';
import { FdService } from '../fd.service';

type ProductObject = { sucess: boolean; recordList?: IListProduct[]; recordDetails?: IDetailsProduct; details?: string }

@Injectable({ providedIn: 'root' })

export class ProductsService {
	// progress bar control
	executingQuery: boolean = false;

	// current previewd product
	recordDetails: IDetailsProduct = { stamp: '', title: '', image: '', tags: [], kcal: 0, unit: 'g', unitvalue: 0, price: 0, owner: '', public: false, inactive: false, timestamp: Date.now() };

	// middleman beetween imagepicker and components)
	tempB64Img: string = '';

	constructor(
		private _http: HttpClient,
		private _bambiService: BambiService,
		private _fdService: FdService) { }

	// db calls
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
				const recordObject = data as ProductObject;
				switch (operation) {
					case 'getlist':
					case 'getqueriedlist':
						recordObject.sucess ? this._fdService.ProductListChannelFire(true, '', recordObject.recordList!) : this._fdService.ProductListChannelFire(false, recordObject.details)
						break;

					case 'getdetails':
						recordObject.sucess ? this._fdService.ProductDetailsChannelFire(true, '', recordObject.recordDetails!) : this._fdService.ProductDetailsChannelFire(false, recordObject.details)
						break;

					case 'update':
					case 'new':
						recordObject.sucess ? this._fdService.ProductUpdateChannelFire(true) : this._fdService.ProductUpdateChannelFire(false, recordObject.details)
						break;

					case 'delete':
						this._fdService.ProductDeleteChannelFire(recordObject.sucess, recordObject.details!);
						break;
				}
				this.executingQuery = false;
			},
			error: () => {
				this.executingQuery = false;
				switch (operation) {
					case 'getlist':
					case 'getqueriedlist':
						this._fdService.ProductListChannelFire(false, 'offline');
						return;

					case 'getdetails':
						this._fdService.ProductDetailsChannelFire(false, 'offline');
						return;

					case 'update':
					case 'new':
						this._fdService.ProductUpdateChannelFire(false, 'offline');
						return;

					case 'delete':
						this._fdService.ProductDeleteChannelFire(false, 'offline');
						return;


				}
			}
		});
	}



	// error handler
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
