import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginChannelResult, SubjectChannelsService } from 'src/app/services/subject-channels.service';
import { AppService } from 'src/app/services/app.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LandingPageSnackComponent } from 'src/app/components/snackbars/landing-page-snack/landing-page-snack.component';
import { LoginSnackComponent } from 'src/app/components/snackbars/login-snack/login-snack.component';

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
	versionMismatch: 'olduser' | 'oldbambi' | 'none';
	mismatchToggle: boolean;
	extraPanelFadeout: boolean;
	loginForm: FormGroup;

	constructor(
		public appService: AppService,
		private _router: Router,
		private _channelsService: SubjectChannelsService,
		private _snackBar: MatSnackBar) {

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

	startupAnimations(): void {
		// fade in
		setTimeout(() => { this.startupAnimationsHalfway = true }, 0); //1500
		// fade out and cookie login attempt
		setTimeout(() => { this.loginAttemptViaCookie() }, 0); //3000
	}

	manualLogin(): void {
		this.loginProgress = true;
		const httpParams = new HttpParams().set('username', this.loginForm.get('username')!.value).set('password', this.loginForm.get('password')!.value);
		this.appService.API('login', httpParams);
	}

	// triggered by login backend response
	loginAttempt(result: LoginChannelResult): void {
		this.loginProgress = false;
		if (result.sucess) {
			this._snackBar.openFromComponent(LoginSnackComponent, { duration: 3000, panelClass: ['landing-page-snackbar', `${this.appService.appTheme}-snack`], data: { beforeNameLabel: 'LANDINGPAGE.WELCOME-BEFORENAMELABEL', name: this.appService.userInfo.name, afterNameLabel: 'LANDINGPAGE.WELCOME-AFTERNAMELABEL', emoji: '🚀' } });
			return this.proceedToBambi('manual');
		}
		this.loginAnimation('invalid');

		let snackbarData = {}
		switch (result.details) {
			case 'invalid':
				snackbarData = { label: 'LANDINGPAGE.INVALIDLOGIN', emoji: '🚫' }
				break
			case 'locked':
				snackbarData = { label: 'LANDINGPAGE.ACCOUNTLOCKED', emoji: '🔐' }
				break
			case 'offline': default:
				snackbarData = { label: 'LANDINGPAGE.UNREACHABLESERVER', emoji: '🚧' }
				break
		}
		this._snackBar.openFromComponent(LandingPageSnackComponent, { duration: 5000, panelClass: ['landing-page-snackbar', `${this.appService.appTheme}-snack`], data: snackbarData });
	}

	// executed automatically if cached cookie found
	loginAttemptViaCookie(): void {
		this.introLogo = false;
		const COOKIE: string | null = localStorage.getItem('bambi_cookie');

		if (!COOKIE) {
			this._router.navigate(['/']);
			this.loginPanel = true;
			return;
		}

		const httpParams = new HttpParams().set('cookie', COOKIE!);
		this.appService.API('cookielogin', httpParams);
	}

	// triggered by cookie login backend response
	loginAttemptViaCookiePart2(result: LoginChannelResult): void {

		if (result.sucess) {
			this._snackBar.openFromComponent(LandingPageSnackComponent, { duration: 3000, panelClass: ['landing-page-snackbar', `${this.appService.appTheme}-snack`], data: { label: 'LANDINGPAGE.COOKIELOGIN', emoji: '🍪' } });
			return this.proceedToBambi('cookie');
		}

		switch (result.details) {
			case 'expired':
				this._snackBar.openFromComponent(LandingPageSnackComponent, { duration: 3000, panelClass: ['landing-page-snackbar', `${this.appService.appTheme}-snack`], data: { label: 'LANDINGPAGE.EXPIREDCOOKIE', emoji: '🍪' } });
				localStorage.removeItem('bambi_cookie');
				break;

			case 'offline': default:
				this._snackBar.openFromComponent(LandingPageSnackComponent, { duration: 5000, panelClass: ['landing-page-snackbar', `${this.appService.appTheme}-snack`], data: { label: 'LANDINGPAGE.UNREACHABLESERVER', emoji: '🚧' } });
		}

		this._router.navigate(['/']);
		this.loginAnimation('expired');
	}

	// triggered after an sucessfull login
	proceedToBambi(logintype: 'manual' | 'cookie' | 'anon'): void {

		// saving cookie
		if (logintype === 'cookie' || (logintype === 'manual' && this.loginForm.get('wantcookie')!.value)) { localStorage.setItem('bambi_cookie', this.appService.userInfo.cookie) }


		// setting theme / language from user
		if (logintype !== 'anon') {

			this.appService.appTheme = this.appService.userInfo.theme;
			if (this.appService.appLang !== this.appService.userInfo.language) {
				this.appService.appLang = this.appService.userInfo.language
				this.appService.GetLocales(this.appService.appLang)
			}
			localStorage.setItem('bambi_language', this.appService.appLang);
			localStorage.setItem('bambi_theme', this.appService.appTheme);
		}

		// no version mismatch
		if (parseInt(this.appService.userInfo.version) === parseInt(this.appService.APP_VER)) {
			//timeout to dashboard
			setTimeout(() => {
				this.appService.authorizedLogin = true;
				if (this._router.url === '/') { this._router.navigate([`/dashboard`]) }
				if (this.appService.userInfo.username !== 'anon') { this.appService.LiveSession(); }
			}, 0); //5000

			// end card and respective animations
			this.loginAnimation(logintype);
			return;
		};

		parseInt(this.appService.userInfo.version) < parseInt(this.appService.APP_VER) ? this.versionMismatch = 'olduser' : this.versionMismatch = 'oldbambi';
		this.extraPanelAnimation(logintype === 'cookie');
	}

	// login animations
	loginAnimation(cenario: string): void {
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

	// extra fadeout animations if case of a manual login
	extraPanelAnimation(cookieLogin: boolean): void {
		if (cookieLogin) { this.mismatchToggle = true; return; }
		this.loginFadeoutAnimations = true;
		setTimeout(() => { this.mismatchToggle = true; this.loginPanel = false; }, 1500);
	}

	// updates users app version and redirects him to the dashboard
	markAsRead(): void {
		this.extraPanelFadeout = true;
		setTimeout(() => {
			this.appService.authorizedLogin = true;
			this._router.navigate([`/dashboard`]);
		}, 2500);

		const httpParams = new HttpParams().set('username', this.appService.userInfo.username).set('cookie', this.appService.userInfo.cookie).set('version', this.appService.APP_VER);
		this.appService.API('versionupdate', httpParams);
	}
}