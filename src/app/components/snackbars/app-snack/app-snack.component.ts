import { Component, Inject, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

type AppSnackbar = { label: string, emoji: string }

@Component({
	selector: 'bambi-app-snack',
	templateUrl: './app-snack.component.html',
	styleUrls: ['./app-snack.component.scss']
})

export class AppSnackComponent {

	snackBarRef = inject(MatSnackBarRef);

	constructor(
		@Inject(MAT_SNACK_BAR_DATA) public data: AppSnackbar) { }
}
