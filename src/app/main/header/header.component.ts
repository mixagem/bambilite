import { HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { BambiService } from 'src/app/services/bambi.service';
import { HeaderService } from './header.service';
import { FdService } from '../mainforms/fd/fd.service';
import { Router } from '@angular/router';
import { AppTheme, AppLanguage } from 'src/app/interfaces/Generic';

@Component({
	selector: 'bambi-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss']
})

export class HeaderComponent {

	constructor(
		public bambiService: BambiService,
		public headerService: HeaderService,
		public router: Router,
		private _fdService: FdService) {
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
				this._fdService.API('getqueriedlist', new HttpParams().set('operation', 'getqueriedlist').set('owner', this.bambiService.userInfo.username).set('cookie', this.bambiService.userInfo.cookie).set('query', this.headerService.inputsForm.get('simpleQueryFormControl')!.value));
				break;
		}
	}
}
