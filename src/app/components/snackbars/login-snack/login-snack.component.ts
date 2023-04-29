import { Component, Inject, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

type LoginSnack = { beforeNameLabel: string, name:string, afterNameLabel:string, emoji: string }

@Component({
  selector: 'lg2-login-snack',
  templateUrl: './login-snack.component.html',
  styleUrls: ['./login-snack.component.scss']
})

export class LoginSnackComponent {
	snackBarRef = inject(MatSnackBarRef);
	constructor(@Inject(MAT_SNACK_BAR_DATA) public data : LoginSnack) { }
}
