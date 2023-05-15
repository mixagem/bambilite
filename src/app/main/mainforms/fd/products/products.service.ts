import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, retry, throwError } from 'rxjs';
import { IDetailsProduct, IListProduct } from 'src/app/interfaces/Fd';
import { AppService } from 'src/app/services/app.service';
import { FdService } from '../fd.service';
import { ProductObject } from 'src/app/interfaces/Generic';

@Injectable({ providedIn: 'root' })

export class ProductsService {
	// progress bar control
	executingQuery: boolean = false;

	// current previewd product
	recordDetails: IDetailsProduct = { stamp: '', title: '', image: '', tags: [], kcal: 0, unit: 'g', unitvalue: 0, price: 0, owner: '', public: false, inactive: false, timestamp: Date.now(), recipelist:[] };

	// middleman beetween imagepicker and components)
	tempB64Img: string = '';

	constructor(
		private _http: HttpClient,
		private _appService: AppService,
		private _fdService: FdService) { };

	// db calls
	API(operation: string, httpParameters: HttpParams | null = null) {

		this.executingQuery = true;

		const call = httpParameters ?
			this._http.post(this._appService.BACKEND_URL + 'fd/products.php', httpParameters, { responseType: 'json' })
				.pipe(retry(1), catchError(this.handleError))

			: this._http.get(this._appService.BACKEND_URL + 'fd/products.php')
				.pipe(retry(1), catchError(this.handleError));

		call.subscribe({
			next: (data) => {
				this.executingQuery = false;
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
				};
			},
			error: () => {
				this.executingQuery = false;
				switch (operation) {
					case 'getlist':
					case 'getqueriedlist':
						return this._fdService.ProductListChannelFire(false, 'offline');

					case 'getdetails':
						return this._fdService.ProductDetailsChannelFire(false, 'offline');

					case 'update':
					case 'new':
						return this._fdService.ProductUpdateChannelFire(false, 'offline');

					case 'delete':
						return this._fdService.ProductDeleteChannelFire(false, 'offline');
				};
			}
		});
	};

	// error handler
	private handleError(error: HttpErrorResponse) {
		if (error.status === 0) {
			// A client-side or network error
			console.error('An error occurred:', error.error);
		} else {
			// The backend returned an unsuccessful response code.
			console.error(
				`Backend returned code ${error.status}, body was: `, error.error);
		};
		return throwError(() => new Error('Something bad happened; please try again later.'));
	};
};
