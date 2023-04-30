import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { FoodComponent } from './food.component';
import { ProductsComponent } from './products/products.component';
import { RecipebookComponent } from './recipebook/recipebook.component';
import { MealsComponent } from './meals/meals.component';
import { MaterialImportsModule } from 'src/app/modules/material-imports.module';
import { PipesModule } from 'src/app/modules/pipes.module';

@NgModule({
	declarations: [
		FoodComponent,
		ProductsComponent,
		RecipebookComponent,
		MealsComponent
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
export class FoodModule { }