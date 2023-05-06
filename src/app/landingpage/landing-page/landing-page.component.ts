import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginChannelResult, SubjectChannelsService } from 'src/app/services/subject-channels.service';
import { BambiService } from 'src/app/services/bambi.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LandingPageSnackComponent } from 'src/app/components/snackbars/landing-page-snack/landing-page-snack.component';
import { LoginSnackComponent } from 'src/app/components/snackbars/login-snack/login-snack.component';

type AppVersionMismatch = 'olduser' | 'oldbambi' | 'none'

@Component({
	selector: 'bl-landing-page',
	templateUrl: './landing-page.component.html',
	styleUrls: ['./landing-page.component.scss']
})

export class LandingPageComponent implements OnInit {

	loginProgress: boolean;
	introLogo: boolean;
	startupAnimationsHalfway: boolean;
	loginPanel: boolean;
	anonLogin: boolean;
	invalidLogin: boolean;
	hidePassword: boolean;
	loginFadeoutAnimations: boolean;
	finalLoginCard: boolean;
	versionMismatch: AppVersionMismatch;
	mismatchToggle: boolean;
	extraPanelFadeout: boolean;
	loginForm: FormGroup;

	constructor(private _router: Router, private _channelsService: SubjectChannelsService, public bambiService: BambiService, private _snackBar: MatSnackBar) {
		this.loginProgress = false;
		this.introLogo = true;
		this.startupAnimationsHalfway = false;
		this.loginPanel = false;
		this.anonLogin = false;
		this.invalidLogin = false;
		this.hidePassword = true;
		this.loginFadeoutAnimations = false;
		this.finalLoginCard = false;
		this.versionMismatch = 'none';
		this.mismatchToggle = false;
		this.extraPanelFadeout = false;
		this.loginForm = new FormGroup({
			username: new FormControl('', [Validators.required]),
			password: new FormControl('', [Validators.required]),
			wantcookie: new FormControl(false)
		});
	}

	ngOnInit(): void {
		this._channelsService.cookieLoginChannel.subscribe(result => { this.loginAttemptViaCookiePart2(result); });
		this._channelsService.loginChannel.subscribe(result => { this.loginAttempt(result); });
		this.startupAnimations();
	}

	startupAnimations() {
		// fade in
		setTimeout(() => { this.startupAnimationsHalfway = true }, 0 ); //1500
		// fade out and cookie login attempt
		setTimeout(() => { this.loginAttemptViaCookie() }, 0); //3000
	}

	manualLogin() {
		this.loginProgress = true;
		const httpParams = new HttpParams().set('username', this.loginForm.get('username')!.value).set('password', this.loginForm.get('password')!.value);
		this.bambiService.API('login', httpParams);
	}

	loginAttempt(result: LoginChannelResult) {
		this.loginProgress = false;
		if (result.sucess) {
			this._snackBar.openFromComponent(LoginSnackComponent, { duration: 3000, panelClass: ['landing-page-snackbar', `${this.bambiService.appTheme}-snack`], data: { beforeNameLabel: 'LANDINGPAGE.WELCOME-BEFORENAMELABEL', name: this.bambiService.userInfo.name, afterNameLabel: 'LANDINGPAGE.WELCOME-AFTERNAMELABEL', emoji: '🚀' } });
			return this.proceedToBambi('manual');
		}
		this.loginAnimation('invalid');

		switch (result.details) {
			case 'invalid':
				return this._snackBar.openFromComponent(LandingPageSnackComponent, { duration: 3000, panelClass: ['landing-page-snackbar', `${this.bambiService.appTheme}-snack`], data: { label: 'LANDINGPAGE.INVALIDLOGIN', emoji: '🚫' } });

			case 'locked':
				return this._snackBar.openFromComponent(LandingPageSnackComponent, { duration: 5000, panelClass: ['landing-page-snackbar', `${this.bambiService.appTheme}-snack`], data: { label: 'LANDINGPAGE.ACCOUNTLOCKED', emoji: '🔐' } });

			case 'offline': default:
				return this._snackBar.openFromComponent(LandingPageSnackComponent, { duration: 5000, panelClass: ['landing-page-snackbar', `${this.bambiService.appTheme}-snack`], data: { label: 'LANDINGPAGE.UNREACHABLESERVER', emoji: '🚧' } });
		}
	}

	loginAttemptViaCookie() {
		this.introLogo = false;
		const COOKIE: string | null = localStorage.getItem('bambi_cookie');

		if (!COOKIE) {
			this._router.navigate(['/']);
			this.loginPanel = true;
			return;
		}

		const httpParams = new HttpParams().set('cookie', COOKIE!);
		this.bambiService.API('cookielogin', httpParams);
	}

	loginAttemptViaCookiePart2(result: LoginChannelResult) {

		if (result.sucess) {
			this._snackBar.openFromComponent(LandingPageSnackComponent, { duration: 3000, panelClass: ['landing-page-snackbar', `${this.bambiService.appTheme}-snack`], data: { label: 'LANDINGPAGE.COOKIELOGIN', emoji: '🍪' } });
			return this.proceedToBambi('cookie');
		}

		switch (result.details) {
			case 'expired':
				this._snackBar.openFromComponent(LandingPageSnackComponent, { duration: 3000, panelClass: ['landing-page-snackbar', `${this.bambiService.appTheme}-snack`], data: { label: 'LANDINGPAGE.EXPIREDCOOKIE', emoji: '🍪' } });
				localStorage.removeItem('bambi_cookie');
				break;

			case 'offline': default:
				this._snackBar.openFromComponent(LandingPageSnackComponent, { duration: 5000, panelClass: ['landing-page-snackbar', `${this.bambiService.appTheme}-snack`], data: { label: 'LANDINGPAGE.UNREACHABLESERVER', emoji: '🚧' } });
		}

		this._router.navigate(['/']);
		this.loginAnimation('expired');
	}

	proceedToBambi(logintype: 'manual' | 'cookie' | 'anon') {

		// saving cookie
		if (logintype === 'cookie' || (logintype === 'manual' && this.loginForm.get('wantcookie')!.value)) { localStorage.setItem('bambi_cookie', this.bambiService.userInfo.cookie) }


		// setting theme / language from user
		if (logintype !== 'anon') {

			this.bambiService.appTheme = this.bambiService.userInfo.theme;
			if (this.bambiService.appLang !== this.bambiService.userInfo.language) {
				this.bambiService.appLang = this.bambiService.userInfo.language
				this.bambiService.GetLocales(this.bambiService.appLang)
			}
			localStorage.setItem('bambi_language', this.bambiService.appLang);
			localStorage.setItem('bambi_theme', this.bambiService.appTheme);
		}

		// no version mismatch
		if (parseInt(this.bambiService.userInfo.version) === parseInt(this.bambiService.APP_VER)) {
			//timeout to dashboard
			setTimeout(() => {
				this.bambiService.authorizedLogin = true;
				if (this._router.url === '/') { this._router.navigate([`/dashboard`]) }
				if (this.bambiService.userInfo.username !== 'anon') { this.bambiService.LiveSession(); }
			}, 0); //5000
			// end card and respective animations
			this.loginAnimation(logintype);
			return;
		};

		parseInt(this.bambiService.userInfo.version) < parseInt(this.bambiService.APP_VER) ? this.versionMismatch = 'olduser' : this.versionMismatch = 'oldbambi';
		this.extraPanelAnimation(logintype === 'cookie');
	}

	loginAnimation(cenario: string) {
		this.invalidLogin = false;//reseting previous color palette
		switch (cenario) {
			case 'expired': // cookie expired, toggling login panels
				this.loginPanel = true;
				return;
			case 'invalid': // color change and timeout to revert back
				this.invalidLogin = true; setTimeout(() => { this.invalidLogin = false; }, 3000);
				return;
			case 'cookie': // shows last card without any futher delays (due to no need to hide login panels)
				this.finalLoginCard = true;
				return;
			default: // anon and manual
				if (cenario === 'anon') { this.anonLogin = true; } // same as default, but with color change
				this.loginFadeoutAnimations = true;
				setTimeout(() => { this.finalLoginCard = true; this.loginPanel = false; }, 1500);
		}

	}

	extraPanelAnimation(cookieLogin: boolean) {
		if (cookieLogin) { this.mismatchToggle = true; return; }
		this.loginFadeoutAnimations = true;
		setTimeout(() => { this.mismatchToggle = true; this.loginPanel = false; }, 1500);
	}

	markAsRead() {
		this.extraPanelFadeout = true;
		setTimeout(() => {
			this.bambiService.authorizedLogin = true;
			this._router.navigate([`/dashboard`]);
		}, 2500);

		const httpParams = new HttpParams().set('username', this.bambiService.userInfo.username).set('cookie', this.bambiService.userInfo.cookie).set('version', this.bambiService.APP_VER);
		this.bambiService.API('versionupdate', httpParams);
	}
}