import { Component, Inject, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

type LandingPageSnackbar = { label: string, emoji: string }

@Component({
	selector: 'bl-landing-page-snack',
	templateUrl: './landing-page-snack.component.html',
	styleUrls: ['./landing-page-snack.component.scss']
})

export class LandingPageSnackComponent {

	snackBarRef = inject(MatSnackBarRef);

	constructor(
		@Inject(MAT_SNACK_BAR_DATA) public data: LandingPageSnackbar) { }
}
