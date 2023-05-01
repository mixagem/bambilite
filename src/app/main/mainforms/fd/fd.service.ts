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
	productDetails: IDetailsProduct = { stamp: '', title: '', image: '', tags: [], kcal: 0, unit: '', unitvalue: 0, price: 0, owner: '', public: false };
	executingQuery: boolean = false;

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
				switch (operation) {
					case 'getlist':
						const listObject = data as ProductObject;
						if (!listObject.sucess) {
							this._channelsService.ProductListChannelFire(false, listObject.details);
							return;
						}
						this._channelsService.ProductListChannelFire(true, '', listObject.productList!);
						this.executingQuery = false;
						return;

					case 'getqueriedlist':
						const queriedDetailsObject = data as ProductObject;
						if (!queriedDetailsObject.sucess) {
							this._channelsService.ProductListChannelFire(false, queriedDetailsObject.details);
							this.executingQuery = false;
							return;
						}
						this._channelsService.ProductListChannelFire(true, '', queriedDetailsObject.productList!);
						this.executingQuery = false;
						return;

					case 'getdetails':
						const detailsObject = data as ProductObject;
						if (!detailsObject.sucess) {
							this._channelsService.ProductDetailsChannelFire(false, detailsObject.details);
							return;
						}
						this._channelsService.ProductDetailsChannelFire(true, '', detailsObject.productDetails!);
						this.executingQuery = false;
						return;


				}
			},
			error: () => {
				switch (operation) {
					case 'getlist': case 'getqueriedlist':
						this._channelsService.ProductListChannelFire(false, 'offline');
						this.executingQuery = false;
						return;

					case 'getdetails':
						this._channelsService.ProductDetailsChannelFire(false, 'offline');
						this.executingQuery = false;
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
