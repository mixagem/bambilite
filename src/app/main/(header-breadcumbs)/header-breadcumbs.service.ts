import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MenuService } from '../menu/menu.service';
import { AppService } from 'src/app/services/app.service';
import { HttpParams } from '@angular/common/http';
import { IUserFavourite } from 'src/app/interfaces/BambiRoutes';

type Breadcumb = { name: string, route: string }

@Injectable({
	providedIn: 'root'
})
export class HeaderBreadcumbsService {

	favourites: IUserFavourite[];
	breadcumbs: Breadcumb[];

	constructor(
		private _router: Router,
		private _menuService: MenuService,
		private _appService: AppService) {

		this.breadcumbs = this.GetHistoryFromCache();
		this.favourites = this._appService.userInfo.favourites
		this._router.events.pipe(
			filter((event) => event instanceof NavigationEnd)
		).subscribe(x => {
			const navigationEvent = x as NavigationEnd;
			this.AddBreadcumbs(navigationEvent.url);
			localStorage.setItem('bambi_breadcumbs', JSON.stringify(this.breadcumbs));
		})
	}

	GetHistoryFromCache(): Breadcumb[] {
		const historyFound = localStorage.getItem('bambi_breadcumbs');
		return historyFound ? JSON.parse(historyFound) : [];
	}

	BreadcumbClick(route: string): void {
		this._router.navigate([route]);
		this.AddBreadcumbs(route);
	}

	AddBreadcumbs(route: string): void {

		// checking for duplicates
		for (let k = 0; k < this.breadcumbs.length; k++) {
			if (this.breadcumbs[k].route !== route) { continue }

			// pushing the duplicated breadcumb to the top
			const arrayPart1 = this.breadcumbs.slice(0, k);
			const arrayPart2 = this.breadcumbs.slice(k + 1);
			arrayPart2.push(this.breadcumbs[k]);
			this.breadcumbs = arrayPart1.concat(arrayPart2);
			return;
		}

		// check for overflow (max 5)
		if (this.breadcumbs.length === 5) { this.breadcumbs = this.breadcumbs.slice(1) }

		// add to breadcumb list
		for (let i = 0; i < this._menuService.appMenu.length; i++) {
			if (this._menuService.appMenu[i].route !== route && this._menuService.appMenu[i].subEntries.length === 0) { continue }
			if (this._menuService.appMenu[i].route === route) {
				this.breadcumbs.push({ name: this._menuService.appMenu[i].title, route: this._menuService.appMenu[i].route })
				return
			}

			for (let j = 0; j < this._menuService.appMenu[i].subEntries.length; j++) {
				if (this._menuService.appMenu[i].subEntries[j].route !== route) { continue }
				this.breadcumbs.push({ name: this._menuService.appMenu[i].subEntries[j].title, route: this._menuService.appMenu[i].subEntries[j].route })
				return
			}
		}
	}

	IsEntityFavourited(): boolean {
		const currentRoute: string = this._router.url;
		for (let i = 0; i < this.favourites.length; i++) {
			if (this.favourites[i].route === currentRoute) { return true }
		}
		return false;
	}

	AddToFavourites(): void {
		const currentRoute: string = this._router.url;
		const favouriteObject = this._generateFavouriteObject(currentRoute);
		this.IsEntityFavourited() ? this._removeFromFavourites(favouriteObject) : this._addToFavourites(favouriteObject)
	}

	private _removeFromFavourites(favouriteObject: IUserFavourite): void {
		for (let i = 0; i < this.favourites.length; i++) {
			if (this.favourites[i].route !== favouriteObject.route) { continue }

			const arrayPart1 = this.favourites.slice(0, i);
			const arrayPart2 = this.favourites.slice(i + 1);

			this.favourites = arrayPart1.concat(arrayPart2);

			const httpParams = new HttpParams().set('username', this._appService.userInfo.username).set('cookie', this._appService.userInfo.cookie).set('favourite', JSON.stringify(this.favourites));
			this._appService.API('favourite', httpParams, { addingFavourite: false })
			return
		}
	}

	private _addToFavourites(favouriteObject: IUserFavourite): void {
		this.favourites.push(favouriteObject)
		const httpParams = new HttpParams().set('username', this._appService.userInfo.username).set('cookie', this._appService.userInfo.cookie).set('favourite', JSON.stringify(this.favourites));
		this._appService.API('favourite', httpParams, { addingFavourite: true })
	}

	private _generateFavouriteObject(route: string): IUserFavourite {
		let newFavourite: IUserFavourite = { name: '', route: '', order: 0 }
		for (let i = 0; i < this._menuService.appMenu.length; i++) {
			if (this._menuService.appMenu[i].route !== route && this._menuService.appMenu[i].subEntries.length === 0) { continue }
			if (this._menuService.appMenu[i].route === route) {
				newFavourite = { name: this._menuService.appMenu[i].title, route: this._menuService.appMenu[i].route, order: this.favourites.length }
				return newFavourite
			}

			for (let j = 0; j < this._menuService.appMenu[i].subEntries.length; j++) {
				if (this._menuService.appMenu[i].subEntries[j].route !== route) { continue }
				newFavourite = { name: this._menuService.appMenu[i].subEntries[j].title, route: this._menuService.appMenu[i].subEntries[j].route, order: this.favourites.length }
				return newFavourite
			}
		}
		return newFavourite
	}

}
