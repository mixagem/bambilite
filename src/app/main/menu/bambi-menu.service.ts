import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppSnackComponent } from 'src/app/components/snackbars/app-snack/app-snack.component';
import { BambiService } from 'src/app/services/bambi.service';

type MenuSubEntry = { title: string, id: string, route: string }
type MenuEntry = { title: string, id: string, icon: string, route: string, subEntries: MenuSubEntry[] }
type MenuObject = { sucess: boolean, menus?: MenuEntry[], details?: string }

@Injectable({ providedIn: 'root' })

export class BambiMenuService {

	menuOpen: boolean;
	bambiMenu: MenuEntry[];
	groupControl: { [key: string]: boolean };

	constructor(
		private _http: HttpClient,
		private _bambiService: BambiService,
		private _snackBar: MatSnackBar
	) {
		this.menuOpen = false;

		// // to replace with backend generated menu
		// this.bambiMenu = [
		// 	{ title: 'APPMENU.DASHBOARD', id: 'dashboard', icon: 'space_dashboard', route: '/dashboard', subEntries: [] },
		// 	{
		// 		title: 'APPMENU.FOOD', id: 'food', icon: 'restaurant_menu', route: '/fd', subEntries: [
		// 			{ title: 'APPMENU.FOOD.PRODUCTS', id: 'products', route: '/fd/products' },
		// 			{ title: 'APPMENU.FOOD.RECIPEBOOK', id: 'recipebook', route: '/fd/recipes' },
		// 			{ title: 'APPMENU.FOOD.MEALS', id: 'meals', route: '/fd/meals' }
		// 		]
		// 	},
		// 	{
		// 		title: 'APPMENU.SUPPLEMENTATION', id: 'supplementation', icon: 'coffee_maker', route: '/sp', subEntries: [
		// 			{ title: 'APPMENU.SUPPLEMENTATION.SUPPLEMENTS', id: 'supplements', route: '/sp/supplements' },
		// 			{ title: 'APPMENU.SUPPLEMENTATION.CONSUMPTION', id: 'consumption', route: '/sp/consumption' }
		// 		]
		// 	},
		// 	{
		// 		title: 'APPMENU.BODYBUILDING', id: 'bodybuilding', icon: 'fitness_center', route: '/bb', subEntries: [
		// 			{ title: 'APPMENU.BODYBUILDING.EXERCISES', id: 'exercises', route: '/bb/exercises' },
		// 			{ title: 'APPMENU.BODYBUILDING.WORKOUTS', id: 'workouts', route: '/bb/workouts' },
		// 			{ title: 'APPMENU.BODYBUILDING.PROGRESS', id: 'progress', route: '/bb/progress' }
		// 		]
		// 	},
		// 	{ title: 'APPMENU.CALENDAR', id: 'calender', icon: 'calendar_month', route: '/dashboard', subEntries: [] },
		// 	{ title: 'APPMENU.SETTINGS', id: 'settings', icon: 'manage_accounts', route: '/dashboard', subEntries: [] },
		// ]
		this.bambiMenu = []
		// to replace with an foreach (received menus that need control from db)
		this.groupControl = { 'title': false, 'snippets': false }
	}

	ToggleMenu(operation: 'open' | 'close'): void {
		operation === 'open' ? this.menuOpen = true : this.menuOpen = false;
	}

	ToggleGroup(groupID: string): void {
		this.groupControl[`${groupID}`] = !this.groupControl[`${groupID}`]
	}

	GetMenus(): void {
		const httpParams = new HttpParams().set('username', this._bambiService.userInfo.username).set('cookie', this._bambiService.userInfo.cookie)
		const call = this._http.post(this._bambiService.BACKEND_URL + 'menus.php', httpParams, { responseType: 'json' })
		call.subscribe({
			next: (menus) => {
				const receivedMenus = menus as MenuObject;
				if (receivedMenus.sucess) {
					this.bambiMenu = receivedMenus.menus!;
					return;
				}
				this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, panelClass: ['app-snackbar', `${this._bambiService.appTheme}-snack`], horizontalPosition: 'end', data: { label: 'Error obtaining bambi menus - ' + receivedMenus.details!, emoji: '🚧' } });
			}, error: () => {
				this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, panelClass: ['app-snackbar', `${this._bambiService.appTheme}-snack`], horizontalPosition: 'end', data: { label: 'Error obtaining bambi menus', emoji: '🚧' } });
			}
		});
	}
}
