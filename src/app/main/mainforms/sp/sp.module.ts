import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PipesModule } from '../../../modules/pipes.module';
import { MaterialImportsModule } from '../../../modules/material-imports.module';
import { RouterModule } from '@angular/router';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { ConsumptionComponent } from './consumption/consumption.component';
import { SuplementationComponent } from './suplementation.component';
import { SupplementsComponent } from './supplements/supplements.component';

@NgModule({
	declarations: [
		SupplementsComponent,
		SuplementationComponent,
		ConsumptionComponent
	],
	imports: [
		CommonModule,
		PipesModule,
		MaterialImportsModule,
		RouterModule,
		NgScrollbarModule
	],
	exports: [
	]
})
export class SuppplementationModule { }
