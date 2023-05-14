import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PipesModule } from '../../../modules/pipes.module';
import { MaterialImportsModule } from '../../../modules/material-imports.module';
import { RouterModule } from '@angular/router';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { BodybuildingComponent } from './bodybuilding.component';
import { ExercisesCategoryComponent } from './exercises/exercises-category/exercises-category.component';
import { ExercisesComponent } from './exercises/exercises.component';
import { ProgressComponent } from './progress/progress.component';
import { WorkoutsComponent } from './workouts/workouts.component';
import { SharedModule } from 'src/app/modules/shared.module';

@NgModule({
	declarations: [
		BodybuildingComponent,
		ExercisesComponent,
		ExercisesCategoryComponent,
		ProgressComponent,
		WorkoutsComponent
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
export class BodybuildingModule { }
