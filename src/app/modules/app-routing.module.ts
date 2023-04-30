import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from '../main/mainforms/dashboard/dashboard.component';
import { FoodComponent } from '../main/mainforms/fd/food.component';
import { MealsComponent } from '../main/mainforms/fd/meals/meals.component';
import { ProductsComponent } from '../main/mainforms/fd/products/products.component';
import { RecipebookComponent } from '../main/mainforms/fd/recipebook/recipebook.component';
import { ConsumptionComponent } from '../main/mainforms/sp/consumption/consumption.component';
import { SuplementationComponent } from '../main/mainforms/sp/suplementation.component';
import { SupplementsComponent } from '../main/mainforms/sp/supplements/supplements.component';
import { BodybuildingComponent } from '../main/mainforms/bb/bodybuilding.component';
import { ExercisesComponent } from '../main/mainforms/bb/exercises/exercises.component';
import { ProgressComponent } from '../main/mainforms/bb/progress/progress.component';
import { WorkoutsComponent } from '../main/mainforms/bb/workouts/workouts.component';

const routes: Routes = [
	{
		path: `dashboard`, component: DashboardComponent, pathMatch: 'full'
	}, {
		path: 'fd', component: FoodComponent, children: [
			{
				path: 'products', component: ProductsComponent
			}, {
				path: 'recipes', component: RecipebookComponent
			}, {
				path: 'meals', component: MealsComponent
			}]
	}, {
		path: 'sp', component: SuplementationComponent, children: [
			{
				path: 'supplements', component: SupplementsComponent
			}, {
				path: 'consumption', component: ConsumptionComponent
			}]
	}, {
		path: 'bb', component: BodybuildingComponent, children: [
			{
				path: 'exercises', component: ExercisesComponent
			}, {
				path: 'progress', component: ProgressComponent
			}, {
				path: 'workouts', component: WorkoutsComponent
			}]
	}, {
		path: `**`, redirectTo: '', pathMatch: 'full'
	}
];


@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
