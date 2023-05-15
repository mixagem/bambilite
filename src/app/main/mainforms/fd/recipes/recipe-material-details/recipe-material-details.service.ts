import { HttpParams, HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { retry, catchError, throwError } from 'rxjs';
import { IMaterialsRecipe } from 'src/app/interfaces/Fd';
import { ProductObject } from 'src/app/interfaces/Generic';
import { AppService } from 'src/app/services/app.service';
import { FdService } from '../../fd.service';

@Injectable({
	providedIn: 'root'
})

export class RecipeMaterialDetailsService {
	executingQuery: boolean = false;

	context:string = "";

	// current previewd product
	recordDetails: IMaterialsRecipe = { stamp: '', origin: '', originstamp: '', recipestamp: '', title: '', kcal: 0, unit: '', unitvalue: 0, price: 0, owner: '', qtd: 1, image: '' }

	previewImage: string = "";

	constructor(
		private _appService: AppService,
		private _http: HttpClient,
		private _fdService: FdService
	) { }

	API(operation: string, httpParameters: HttpParams | null = null) {

		this.executingQuery = true;

		const call = httpParameters ?
			this._http.post(this._appService.BACKEND_URL + 'fd/recipes.php', httpParameters, { responseType: 'json' })
				.pipe(retry(1), catchError(this.handleError))

			: this._http.get(this._appService.BACKEND_URL + 'fd/recipes.php')
				.pipe(retry(1), catchError(this.handleError));

		call.subscribe({
			next: (data) => {
				this.executingQuery = false;
				const recordObject = data as ProductObject;
				switch (operation) {
					case 'matrecorddetails':
						recordObject.sucess ? this._fdService.MaterialProductDetailsChannelFire(true, '', recordObject.recordDetails!) : this._fdService.MaterialProductDetailsChannelFire(false, recordObject.details)
						break;

				};
			},
			error: () => {
				this.executingQuery = false;
				switch (operation) {

					case 'matrecorddetails':
						return this._fdService.MaterialProductDetailsChannelFire(false, 'offline');


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
}
