import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppSnackComponent } from 'src/app/components/snackbars/app-snack/app-snack.component';
import { AppService } from 'src/app/services/app.service';

type MenuSubEntry = { title: string, id: string, route: string };
type MenuEntry = { title: string, id: string, icon: string, route: string, subEntries: MenuSubEntry[] };
type MenuObject = { sucess: boolean, menus?: MenuEntry[], details?: string };

@Injectable({ providedIn: 'root' })

export class MenuService {

	menuOpen: boolean = false;
	appMenu: MenuEntry[] = [];
	groupControl: { [key: string]: boolean } = {};

	constructor(
		private _http: HttpClient,
		private _appService: AppService,
		private _snackBar: MatSnackBar
	) { };

	ToggleMenu(operation: 'open' | 'close'): void { operation === 'open' ? this.menuOpen = true : this.menuOpen = false };

	ToggleGroup(groupID: string): void { this.groupControl[`${groupID}`] = !this.groupControl[`${groupID}`] };

	GetMenus(): void {

		const httpParams = new HttpParams()
			.set('username', this._appService.userInfo.username)
			.set('cookie', this._appService.userInfo.cookie);

		this._http
			.post(this._appService.BACKEND_URL + 'menus.php', httpParams, { responseType: 'json' })
			.subscribe({
				next: (menus) => {
					const receivedMenus = menus as MenuObject;

					if (receivedMenus.sucess) {
						this.appMenu = receivedMenus.menus!;
						return;
					}

					this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, panelClass: ['app-snackbar', `${this._appService.appTheme}-snack`], horizontalPosition: 'end', data: { label: 'SNACKS.ERROR-OBTAINING-MENUS', emoji: '🚧' } });
					console.error('bambilite connection error: ' + receivedMenus.details);

				}, error: () => {
					return this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, panelClass: ['app-snackbar', `${this._appService.appTheme}-snack`], horizontalPosition: 'end', data: { label: 'SNACKS.ERROR-OBTAINING-MENUS', emoji: '🚧' } });
				}
			});
	};
};
