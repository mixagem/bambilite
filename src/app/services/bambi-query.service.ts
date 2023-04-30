import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, retry, throwError } from 'rxjs';
import { BambiService } from './bambi.service';

@Injectable({
	providedIn: 'root'
})
export class BambiQueryService {

	constructor(private _http: HttpClient, private _bambiService: BambiService) {
	}

	LoremIpsum(operation: string, httpParameters: HttpParams) {
		const call = this._http.post(this._bambiService.BACKEND_URL + 'endpointname.php', httpParameters.set('operation', operation), { responseType: 'json' }).pipe(
			retry(1), // retry a failed request
			catchError(this.handleError), // then handle the error
		);

		call.subscribe({
			next: (data) => {


			},
			error: () => {


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
