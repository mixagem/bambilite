import { HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { HeaderService } from './header.service';
import { ProductsService } from '../mainforms/fd/products/products.service';
import { Router } from '@angular/router';
import { AppTheme, AppLanguage } from 'src/app/interfaces/Generic';
import { RecipesService } from '../mainforms/fd/recipes/recipes.service';
import { SupplementsService } from '../mainforms/sp/supplements/supplements.service';

@Component({
	selector: 'bambi-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss']
})

export class HeaderComponent {

	simpleQueryAllowedMainforms: string[] = ['/fd/recipes', '/fd/products', '/sp/supplements'];

	constructor(
		private _headerService: HeaderService,
		private _router: Router,
		private _appService: AppService,
		private _productsService: ProductsService,
		private _recipesService: RecipesService,
		private _supplementsService: SupplementsService) { };

	headerService(property: string): any { return this._headerService[`${property}` as keyof typeof this._headerService] };

	router(property: string): any { return this._router[`${property}` as keyof typeof this._router] };

	appService(property: string): any { return this._appService[`${property}` as keyof typeof this._appService] };

	disconnect() { this._appService.Disconnect(true); }

	themeSwap(theme: AppTheme): void {
		if (this._appService.appTheme === theme) { return };
		this._appService.appTheme = theme;
		this._appService.userInfo.theme = theme;
		localStorage.setItem('bambi_theme', theme);

		const httpParams = new HttpParams()
			.set('theme', theme)
			.set('username', this._appService.userInfo.username)
			.set('cookie', this._appService.userInfo.cookie);

		this._appService.API('theme', httpParams);
	};

	languageSwap(language: AppLanguage): void {
		if (this._appService.appLang === language) { return };

		this._appService.appLang = language;
		this._appService.userInfo.language = language;
		this._appService.GetLocales(language);
		localStorage.setItem('bambi_language', language);

		const httpParams = new HttpParams()
			.set('language', language)
			.set('username', this._appService.userInfo.username)
			.set('cookie', this._appService.userInfo.cookie);

		this._appService.API('language', httpParams);
	};

	inputSearch(): void {
		switch (this._router.url) {
			case '/fd/products':
				this._productsService.API('getqueriedlist',
					new HttpParams()
						.set('operation', 'getqueriedlist')
						.set('owner', this._appService.userInfo.username)
						.set('cookie', this._appService.userInfo.cookie)
						.set('query', this._headerService.inputsForm.get('simpleQueryFormControl')!.value));
				break;

			case '/fd/recipes':
				this._recipesService.API('getqueriedlist',
					new HttpParams()
						.set('operation', 'getqueriedlist')
						.set('owner', this._appService.userInfo.username)
						.set('cookie', this._appService.userInfo.cookie)
						.set('query', this._headerService.inputsForm.get('simpleQueryFormControl')!.value));
				break;

			case '/sp/supplements':
				this._supplementsService.API('getqueriedlist',
					new HttpParams()
						.set('operation', 'getqueriedlist')
						.set('owner', this._appService.userInfo.username)
						.set('cookie', this._appService.userInfo.cookie)
						.set('query', this._headerService.inputsForm.get('simpleQueryFormControl')!.value));
				break;
		};
	};
};
