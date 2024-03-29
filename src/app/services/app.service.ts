import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IUserSettings } from '../interfaces/UserSettings';
import { LoginChannelResult, SubjectChannelsService } from './subject-channels.service';
import { Observable, Subject, catchError, retry, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LandingPageSnackComponent } from '../components/snackbars/landing-page-snack/landing-page-snack.component';
import { Router } from '@angular/router';
import { AppSnackComponent } from '../components/snackbars/app-snack/app-snack.component';
import { Locales, AppTheme, AppLanguage, RecordMeasuringType, AppMaterialLocales } from '../interfaces/Generic';

type LoginObject = { validLogin: boolean; userSettings?: IUserSettings; details?: string };

@Injectable({ providedIn: 'root' })

export class AppService {

	// cons
	BACKEND_URL: string = 'http://localhost/bambiapi/';
	APP_VER: string = '2000';
	LOCALES: Locales;
	SESSION_LOOP: ReturnType<typeof setInterval> | null;

	// vars
	appTheme: AppTheme;
	appLang: AppLanguage;
	authorizedLogin: boolean = false;
	userInfo: IUserSettings;

	// middlemans
	tempB64Img: string = "";
	deleteSelection: string[] = [];

	menuOpen: boolean;

	constructor(
		private _http: HttpClient,
		private _channelsService: SubjectChannelsService,
		private _snackBar: MatSnackBar,
		private _router: Router) {

		this.LOCALES = {};
		this.appTheme = this.LastThemeUsed();
		this.appLang = this.LastLanguageUsed();
		this.GetLocales(this.appLang);
		this.SESSION_LOOP = null;
		this.menuOpen = false;
		this.userInfo = {
			name: 'Anonymous user',
			language: this.appLang,
			version: this.APP_VER,
			theme: this.appTheme,
			email: '',
			username: 'anon',
			profilepic: '',
			cookie: '',
			favourites: [],
		};
	};


	LastLanguageUsed(): AppLanguage {
		const lastLanguageUsed = localStorage.getItem('bambi_language') as AppLanguage | null;
		return lastLanguageUsed ? lastLanguageUsed : 'pt';
	};

	LastThemeUsed(): AppTheme {
		const lastThemeUsed = localStorage.getItem('bambi_theme') as AppTheme | null;
		return lastThemeUsed ? lastThemeUsed : 'waikiki';
	};

	GetLocales(lang: AppLanguage): void {
		const call = this._http.get(`./assets/locales/bambi-locales-${lang}.json`);
		call.subscribe({
			next: (locales) => {
				const receivedLocales = locales as Locales;
				this.LOCALES = receivedLocales;

			}, error: () => {
				this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, panelClass: ['app-snackbar', `${this.appTheme}-snack`], horizontalPosition: 'end', data: { label: 'Error obtaining bambi locales', emoji: '🚧' } });
			}
		});
	};

	GetMaterialLocale(): string {
		let locale: AppMaterialLocales = 'pt-PT';

		switch (this.appLang) {
			case 'es':
				locale = 'es-ES';
				break;
			case 'uk':
				locale = 'en-GB';
				break;
			case 'pt': default:
				locale = 'pt-PT';
		}
		return locale
	}

	API(endpoint: string, httpParameters: HttpParams | null = null, extraParameters?: { [key: string]: string | number | boolean }): void {

		const call = httpParameters ? this._http.post(this.BACKEND_URL + endpoint + '.php', httpParameters, { responseType: 'json' }).pipe(
			retry(1), // retry a failed request
			catchError(this.handleError), // then handle the error
		) : this._http.get(this.BACKEND_URL + endpoint + '.php').pipe(
			retry(1),
			catchError(this.handleError),
		);

		call.subscribe({
			next: (data) => {
				switch (endpoint) {
					case 'login':
						const loginObject = data as LoginObject;

						if (!loginObject.validLogin) { this._channelsService.LoginChannelFire(false, loginObject.details); return };

						this.userInfo = Object.create(loginObject.userSettings!);
						this._channelsService.LoginChannelFire(true);
						return;

					case 'cookielogin':
						const cookieLoginObject = data as LoginObject;

						if (!cookieLoginObject.validLogin) { this._channelsService.CookieLoginChannelFire(false, cookieLoginObject.details); return };

						this.userInfo = Object.create(cookieLoginObject.userSettings!);
						this._channelsService.CookieLoginChannelFire(true);
						return;

					case 'versionupdate':
						const sucessfullOperation = data as boolean;
						if (!sucessfullOperation) {
							this._snackBar.openFromComponent(LandingPageSnackComponent, { duration: 3000, panelClass: ['landing-page-snackbar', `${this.appTheme}-snack`], data: { label: 'LANDINGPAGE.USERVERSIONUPDATEERROR', emoji: '🌐' } });
						}
						return;

					case 'livesession':
						const tickUpdated = data as boolean;
						if (!tickUpdated) { this.Disconnect() };
						return;

					case 'theme':
						const themeUpdated = data as boolean;
						if (themeUpdated) {
							this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, panelClass: ['app-snackbar', `${this.appTheme}-snack`], horizontalPosition: 'end', data: { label: `SNACKS.THEMECHANGED-${this.appTheme.toUpperCase()}`, emoji: '🎨' } });
							return;
						};
						this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, panelClass: ['app-snackbar', `${this.appTheme}-snack`], horizontalPosition: 'end', data: { label: 'SNACKS.THEMECHANGED-ERROR', emoji: '🚧' } }); return;

					case 'language':
						const languageUpdated = data as boolean;
						if (languageUpdated) {
							this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, panelClass: ['app-snackbar', `${this.appTheme}-snack`], horizontalPosition: 'end', data: { label: `SNACKS.LANGCHANGED-${this.appLang.toUpperCase()}`, emoji: '🌐' } });
							return;
						};
						this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, panelClass: ['app-snackbar', `${this.appTheme}-snack`], horizontalPosition: 'end', data: { label: 'SNACKS.LANGCHANGED-ERROR', emoji: '🚧' } }); return;

					case 'favourite':
						const favouritesUpdated = data as boolean;
						if (favouritesUpdated) {
							extraParameters!['addingFavourite'] ? this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, panelClass: ['app-snackbar', `${this.appTheme}-snack`], horizontalPosition: 'end', data: { label: 'SNACKS.NEWFAVOURITE', emoji: '🌟' } }) : this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, panelClass: ['app-snackbar', `${this.appTheme}-snack`], horizontalPosition: 'end', data: { label: 'SNACKS.REMOVEFAVOURITE', emoji: '🌠' } })
							return;
						};
						this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, panelClass: ['app-snackbar', `${this.appTheme}-snack`], horizontalPosition: 'end', data: { label: 'SNACKS.NEWFAVOURITE-ERROR', emoji: '🚧' } });
						return;


				};
			},
			error: () => {
				switch (endpoint) {
					case 'login':
						return this._channelsService.LoginChannelFire(false, 'offline');

					case 'cookielogin':
						return this._channelsService.CookieLoginChannelFire(false, 'offline');

					case 'versionupdate':
						return this._snackBar.openFromComponent(LandingPageSnackComponent, { duration: 3000, panelClass: ['landing-page-snackbar', `${this.appTheme}-snack`], data: { label: 'LANDINGPAGE.USERVERSIONUPDATEERROR', emoji: '🚧' } });

					case 'livesession':
						return this.Disconnect();

					case 'theme':
						return this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, panelClass: ['app-snackbar', `${this.appTheme}-snack`], horizontalPosition: 'end', data: { label: 'SNACKS.THEMECHANGED-ERROR', emoji: '🚧' } });

					case 'language':
						return this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, panelClass: ['app-snackbar', `${this.appTheme}-snack`], horizontalPosition: 'end', data: { label: 'SNACKS.LANGCHANGED-ERROR', emoji: '🚧' } });

					case 'favourite':
						return this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, panelClass: ['app-snackbar', `${this.appTheme}-snack`], horizontalPosition: 'end', data: { label: 'SNACKS.NEWFAVOURITE-ERROR', emoji: '🚧' } });
				};
			}
		});
	};

	ImageUpload(file: File): void {
		const formData = new FormData();
		formData.append('file', file);
		const call = this._http.post(this.BACKEND_URL + 'imgupload.php', formData, { responseType: 'text' }).pipe(
			retry(1), // retry a failed request
			catchError(this.handleError), // then handle the error
		);
		call.subscribe({
			next: (data) => {
				this._channelsService.ImageUploadChannelFire(true, data);
			},
			error: () => { return this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, panelClass: ['app-snackbar', `${this.appTheme}-snack`], horizontalPosition: 'end', data: { label: 'SNACKS.IMAGEUPLOAD-ERROR', emoji: '🚧' } }); }
		});
	};

	Disconnect(softDisconnect: boolean = false): void {
		this.appLang = 'pt';
		this.appTheme = 'waikiki';
		this.userInfo = {
			name: 'Anonymous user',
			language: this.appLang,
			version: this.APP_VER,
			theme: this.appTheme,
			email: '',
			username: 'anon',
			profilepic: '',
			cookie: '',
			favourites: [],
		};
		localStorage.removeItem('bambi_cookie');
		this._router.navigate(['/']);
		this.authorizedLogin = false;
		clearInterval(this.SESSION_LOOP!);
		this._channelsService.loginChannel = new Subject<LoginChannelResult>;
		this._snackBar.openFromComponent(LandingPageSnackComponent, { duration: 3000, panelClass: ['landing-page-snackbar', `${this.appTheme}-snack`], data: { label: softDisconnect ? 'SNACKS.SOFT-DISCONNECT' : 'SNACKS.HARD-DISCONNECT', emoji: '🪂' } });
	};

	LiveSession(): void {
		const httpParams = new HttpParams().set('username', this.userInfo.username).set('cookie', this.userInfo.cookie);
		this.SESSION_LOOP = setInterval(() => { this.API('livesession', httpParams); }, 10000);
	};

	GetOperationLabel(title: string, stamp: string): string {
		return !!title ? !!stamp ? 'GENERIC.EDITRECORD' : 'GENERIC.CLONERECORD' : 'GENERIC.NEWRECORD';
	};


	GetDefaultMeasuringTypeOptions(): RecordMeasuringType[] {
		return [
			{ title: "Grama (g)", value: "g" },
			{ title: "Kilograma (kg)", value: "kg" },
			{ title: "Mililitro (ml)", value: "ml" },
			{ title: "Litro (L)", value: "L" }
		]
	}

	private handleError(error: HttpErrorResponse): Observable<never> {
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