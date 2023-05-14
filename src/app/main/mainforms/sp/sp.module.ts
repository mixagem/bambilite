import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PipesModule } from '../../../modules/pipes.module';
import { MaterialImportsModule } from '../../../modules/material-imports.module';
import { RouterModule } from '@angular/router';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { ConsumptionComponent } from './consumption/consumption.component';
import { SuplementationComponent } from './suplementation.component';
import { SupplementsComponent } from './supplements/supplements.component';
import { SupplementDetailsComponent } from './supplements/supplement-details/supplement-details.component';
import { SupplementEditComponent } from './supplements/supplement-edit/supplement-edit.component';
import { SharedModule } from 'src/app/modules/shared.module';

@NgModule({
	declarations: [
		SupplementsComponent,
		SuplementationComponent,
		ConsumptionComponent,
		SupplementDetailsComponent,
		SupplementEditComponent,
	],
	imports: [
		CommonModule,
		PipesModule,
		MaterialImportsModule,
		RouterModule,
		NgScrollbarModule,
		SharedModule
	],
	exports: [
	]
})
export class SuppplementationModule { }
