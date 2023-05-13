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
		public headerService: HeaderService,
		public router: Router,
		public appService: AppService,
		private _productsService: ProductsService,
		private _recipesService: RecipesService,
		private _supplementsService: SupplementsService) { };

	themeSwap(theme: AppTheme): void {
		if (this.appService.appTheme === theme) { return };

		this.appService.appTheme = theme;
		this.appService.userInfo.theme = theme;
		localStorage.setItem('bambi_theme', theme);

		const httpParams = new HttpParams()
			.set('theme', theme)
			.set('username', this.appService.userInfo.username)
			.set('cookie', this.appService.userInfo.cookie);

		this.appService.API('theme', httpParams);
	};

	languageSwap(language: AppLanguage): void {
		if (this.appService.appLang === language) { return };

		this.appService.appLang = language;
		this.appService.userInfo.language = language;
		this.appService.GetLocales(language);
		localStorage.setItem('bambi_language', language);

		const httpParams = new HttpParams()
			.set('language', language)
			.set('username', this.appService.userInfo.username)
			.set('cookie', this.appService.userInfo.cookie);

		this.appService.API('language', httpParams);
	};

	inputSearch(): void {
		switch (this.router.url) {
			case '/fd/products':
				this._productsService.API('getqueriedlist',
					new HttpParams()
						.set('operation', 'getqueriedlist')
						.set('owner', this.appService.userInfo.username)
						.set('cookie', this.appService.userInfo.cookie)
						.set('query', this.headerService.inputsForm.get('simpleQueryFormControl')!.value));
				break;

			case '/fd/recipes':
				this._recipesService.API('getqueriedlist',
					new HttpParams()
						.set('operation', 'getqueriedlist')
						.set('owner', this.appService.userInfo.username)
						.set('cookie', this.appService.userInfo.cookie)
						.set('query', this.headerService.inputsForm.get('simpleQueryFormControl')!.value));
				break;

			case '/sp/supplements':
				this._supplementsService.API('getqueriedlist',
					new HttpParams()
						.set('operation', 'getqueriedlist')
						.set('owner', this.appService.userInfo.username)
						.set('cookie', this.appService.userInfo.cookie)
						.set('query', this.headerService.inputsForm.get('simpleQueryFormControl')!.value));
				break;
		};
	};
};
