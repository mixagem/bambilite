import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, retry, throwError } from 'rxjs';
import { IDetailsRecipe, IListRecipe } from 'src/app/interfaces/Fd';
import { AppService } from 'src/app/services/app.service';
import { FdService } from '../fd.service';

type RecipeObject = { sucess: boolean; recordList?: IListRecipe[]; recordDetails?: IDetailsRecipe; details?: string }

@Injectable({ providedIn: 'root' })

export class RecipesService {
	// progress bar control
	executingQuery: boolean = false;

	// current previewd product
	recordDetails: IDetailsRecipe = { stamp: '', title: '', image: '', tags: [], kcal: 0, unit: 'g', unitvalue: 0, price: 0, owner: '', public: false, inactive: false, timestamp: Date.now() };

	// middleman beetween imagepicker and components)
	tempB64Img: string = '';

	constructor(
		private _http: HttpClient,
		private _appService: AppService,
		private _fdService: FdService) { }

	// db calls
	API(operation: string, httpParameters: HttpParams | null = null) {

		this.executingQuery = true;

		const call = httpParameters ? this._http.post(this._appService.BACKEND_URL + 'fd/recipes.php', httpParameters, { responseType: 'json' }).pipe(
			retry(1), // retry a failed request
			catchError(this.handleError), // then handle the error
		) : this._http.get(this._appService.BACKEND_URL + 'fd/recipes.php').pipe(
			retry(1),
			catchError(this.handleError),
		);

		call.subscribe({
			next: (data) => {
				const recordObject = data as RecipeObject;
				switch (operation) {
					case 'getlist':
					case 'getqueriedlist':
						recordObject.sucess ? this._fdService.RecipeListChannelFire(true, '', recordObject.recordList!) : this._fdService.RecipeListChannelFire(false, recordObject.details)
						break;

					case 'getdetails':
						recordObject.sucess ? this._fdService.RecipeDetailsChannelFire(true, '', recordObject.recordDetails!) : this._fdService.RecipeDetailsChannelFire(false, recordObject.details)
						break;

					case 'update':
					case 'new':
						recordObject.sucess ? this._fdService.RecipeUpdateChannelFire(true) : this._fdService.RecipeUpdateChannelFire(false, recordObject.details)
						break;

					case 'delete':
						this._fdService.RecipeDeleteChannelFire(recordObject.sucess, recordObject.details!);
						break;
				}
				this.executingQuery = false;
			},
			error: () => {
				this.executingQuery = false;
				switch (operation) {
					case 'getlist':
					case 'getqueriedlist':
						this._fdService.RecipeListChannelFire(false, 'offline');
						return;

					case 'getdetails':
						this._fdService.RecipeDetailsChannelFire(false, 'offline');
						return;

					case 'update':
					case 'new':
						this._fdService.RecipeUpdateChannelFire(false, 'offline');
						return;

					case 'delete':
						this._fdService.RecipeDeleteChannelFire(false, 'offline');
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
