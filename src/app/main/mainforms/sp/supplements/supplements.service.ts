import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IListSupplement, IDetailsSupplement } from 'src/app/interfaces/Sp';
import { AppService } from 'src/app/services/app.service';
import { catchError, retry, throwError } from 'rxjs';
import { SpService } from '../sp.service';

type SupplementObject = { sucess: boolean; recordList?: IListSupplement[]; recordDetails?: IDetailsSupplement; details?: string }

@Injectable({ providedIn: 'root' })

export class SupplementsService {
	// progress bar control
	executingQuery: boolean = false;

	// current previewd product
	recordDetails: IDetailsSupplement = { stamp: '', title: '', image: '', tags: [], kcal: 0, unit: 'g', unitvalue: 0, price: 0, owner: '', public: false, inactive: false, timestamp: Date.now() };

	// middleman beetween imagepicker and components)
	tempB64Img: string = '';

	constructor(
		private _http: HttpClient,
		private _appService: AppService,
		private _spService: SpService) { }


	// db calls
	API(operation: string, httpParameters: HttpParams | null = null) {

		this.executingQuery = true;

		const call = httpParameters ? this._http.post(this._appService.BACKEND_URL + 'sp/supplements.php', httpParameters, { responseType: 'json' }).pipe(
			retry(1), // retry a failed request
			catchError(this.handleError), // then handle the error
		) : this._http.get(this._appService.BACKEND_URL + 'sp/supplements.php').pipe(
			retry(1),
			catchError(this.handleError),
		);

		call.subscribe({
			next: (data) => {
				const recordObject = data as SupplementObject;
				switch (operation) {
					case 'getlist':
					case 'getqueriedlist':
						recordObject.sucess ? this._spService.SupplementListChannelFire(true, '', recordObject.recordList!) : this._spService.SupplementListChannelFire(false, recordObject.details)
						break;

					case 'getdetails':
						recordObject.sucess ? this._spService.SupplementDetailsChannelFire(true, '', recordObject.recordDetails!) : this._spService.SupplementDetailsChannelFire(false, recordObject.details)
						break;

					case 'update':
					case 'new':
						recordObject.sucess ? this._spService.SupplementUpdateChannelFire(true) : this._spService.SupplementUpdateChannelFire(false, recordObject.details)
						break;

					case 'delete':
						this._spService.SupplementDeleteChannelFire(recordObject.sucess, recordObject.details!);
						break;
				}
				this.executingQuery = false;
			},
			error: () => {
				this.executingQuery = false;
				switch (operation) {
					case 'getlist':
					case 'getqueriedlist':
						this._spService.SupplementListChannelFire(false, 'offline');
						return;

					case 'getdetails':
						this._spService.SupplementDetailsChannelFire(false, 'offline');
						return;

					case 'update':
					case 'new':
						this._spService.SupplementUpdateChannelFire(false, 'offline');
						return;

					case 'delete':
						this._spService.SupplementDeleteChannelFire(false, 'offline');
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
