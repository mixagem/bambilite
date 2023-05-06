import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AppLanguage, AppTheme, BambiService } from 'src/app/services/bambi.service';
import { HeaderService } from './header.service';
import { FormControl } from '@angular/forms';
import { FdService } from '../mainforms/fd/fd.service';
import {  Router } from '@angular/router';

@Component({
	selector: 'bambi-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {


	constructor(public bambiService: BambiService, public headerService: HeaderService, private _fdService: FdService, public router: Router) {
	}

	ngOnInit(): void {
	}

	themeSwap(theme: AppTheme) {
		if (this.bambiService.appTheme === theme) { return }
		this.bambiService.appTheme = theme
		this.bambiService.userInfo.theme = theme;
		localStorage.setItem('bambi_theme', theme);
		const httpParams = new HttpParams().set('theme', theme).set('username', this.bambiService.userInfo.username).set('cookie', this.bambiService.userInfo.cookie);
		this.bambiService.API('theme', httpParams)
	}

	languageSwap(language: AppLanguage) {
		if (this.bambiService.appLang === language) { return }
		this.bambiService.appLang = language
		this.bambiService.userInfo.language = language;
		this.bambiService.GetLocales(language);
		localStorage.setItem('bambi_language', language);
		const httpParams = new HttpParams().set('language', language).set('username', this.bambiService.userInfo.username).set('cookie', this.bambiService.userInfo.cookie);
		this.bambiService.API('language', httpParams);
	}

	inputSearch() {

		switch (this.router.url) {
			case '/fd/products':
				this._fdService.API('getqueriedlist', new HttpParams().set('operation', 'getqueriedlist').set('owner', this.bambiService.userInfo.username).set('cookie', this.bambiService.userInfo.cookie).set('query', this.headerService.inputsForm.get('simpleQueryFormControl')!.value));
				break;
		}

	}
}
