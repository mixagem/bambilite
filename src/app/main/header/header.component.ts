import { HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { BambiService } from 'src/app/services/bambi.service';
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

	simpleQueryAllowedMainforms: string[] = ['/fd/recipes', '/fd/products', '/sp/supplements']

	constructor(
		public bambiService: BambiService,
		public headerService: HeaderService,
		public router: Router,
		private _productsService: ProductsService,
		private _recipesService: RecipesService,
		private _supplementsService: SupplementsService) {
	}

	themeSwap(theme: AppTheme): void {
		if (this.bambiService.appTheme === theme) { return }
		this.bambiService.appTheme = theme
		this.bambiService.userInfo.theme = theme;
		localStorage.setItem('bambi_theme', theme);
		const httpParams = new HttpParams().set('theme', theme).set('username', this.bambiService.userInfo.username).set('cookie', this.bambiService.userInfo.cookie);
		this.bambiService.API('theme', httpParams)
	}

	languageSwap(language: AppLanguage): void {
		if (this.bambiService.appLang === language) { return }
		this.bambiService.appLang = language
		this.bambiService.userInfo.language = language;
		this.bambiService.GetLocales(language);
		localStorage.setItem('bambi_language', language);
		const httpParams = new HttpParams().set('language', language).set('username', this.bambiService.userInfo.username).set('cookie', this.bambiService.userInfo.cookie);
		this.bambiService.API('language', httpParams);
	}

	inputSearch(): void {
		switch (this.router.url) {
			case '/fd/products':
				this._productsService.API('getqueriedlist', new HttpParams().set('operation', 'getqueriedlist').set('owner', this.bambiService.userInfo.username).set('cookie', this.bambiService.userInfo.cookie).set('query', this.headerService.inputsForm.get('simpleQueryFormControl')!.value));
				break;
			case '/fd/recipes':
				this._recipesService.API('getqueriedlist', new HttpParams().set('operation', 'getqueriedlist').set('owner', this.bambiService.userInfo.username).set('cookie', this.bambiService.userInfo.cookie).set('query', this.headerService.inputsForm.get('simpleQueryFormControl')!.value));
				break;
				 case '/sp/supplements':
				this._supplementsService.API('getqueriedlist', new HttpParams().set('operation', 'getqueriedlist').set('owner', this.bambiService.userInfo.username).set('cookie', this.bambiService.userInfo.cookie).set('query', this.headerService.inputsForm.get('simpleQueryFormControl')!.value));
				break;
		}
	}
}
