import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { LoginSnackComponent } from '../components/snackbars/login-snack/login-snack.component';
import { LandingPageSnackComponent } from '../components/snackbars/landing-page-snack/landing-page-snack.component';
import { MaterialImportsModule } from '../modules/material-imports.module';
import { PipesModule } from '../modules/pipes.module';

@NgModule({
	declarations: [
		LandingPageComponent,
    	LandingPageSnackComponent,
		LoginSnackComponent],
	imports: [
		CommonModule,
		MaterialImportsModule,
		PipesModule
	],
	exports:[
		LandingPageComponent,
    	LandingPageSnackComponent,
		LoginSnackComponent
	]
})


export class LandingPageModule { }
