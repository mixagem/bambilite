import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AppLanguage, AppTheme, BambiService } from 'src/app/services/bambi.service';
import { HeaderService } from './header.service';
import { FormControl, FormGroup } from '@angular/forms';
import { FdService } from '../mainforms/fd/fd.service';

@Component({
	selector: 'bambi-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

	inputsForm: FormGroup = new FormGroup({})

	constructor(public bambiService: BambiService, public headerService: HeaderService, private _fdService: FdService) {

	}

	ngOnInit(): void {
		this.inputsForm.addControl('products', new FormControl(''))
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

		switch (this.headerService.currentRoute) {
			case 'products':
				this._fdService.API('getqueriedlist', new HttpParams().set('operation', 'getqueriedlist').set('owner', this.bambiService.userInfo.username).set('cookie', this.bambiService.userInfo.cookie).set('query', this.inputsForm.controls['products'].value));
				break;
		}

	}
}
