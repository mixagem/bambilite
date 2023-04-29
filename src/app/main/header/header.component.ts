import { HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { AppLanguage, AppTheme, BambiService } from 'src/app/services/bambi.service';

@Component({
	selector: 'lg2-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

	constructor(public bambiService: BambiService) {}

	themeSwap(theme: AppTheme) {
		if(this.bambiService.appTheme === theme){return}
		this.bambiService.appTheme = theme
		this.bambiService.userInfo.theme = theme;
		localStorage.setItem('bambi_theme', theme);
		const httpParams = new HttpParams().set('theme', theme).set('username', this.bambiService.userInfo.username).set('cookie', this.bambiService.userInfo.cookie);
		this.bambiService.API('theme', httpParams)
	}

	languageSwap(language: AppLanguage) {
		if(this.bambiService.appLang === language){return}
		this.bambiService.appLang = language
		this.bambiService.userInfo.language = language;
		this.bambiService.GetLocales(language);
		localStorage.setItem('bambi_language', language);
		const httpParams = new HttpParams().set('language', language).set('username', this.bambiService.userInfo.username).set('cookie', this.bambiService.userInfo.cookie);
		this.bambiService.API('language', httpParams);
	}
}
