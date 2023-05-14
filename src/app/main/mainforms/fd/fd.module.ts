import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { FoodComponent } from './food.component';
import { ProductsComponent } from './products/products.component';
import { MealsComponent } from './meals/meals.component';
import { MaterialImportsModule } from 'src/app/modules/material-imports.module';
import { PipesModule } from 'src/app/modules/pipes.module';
import { ProductDetailsComponent } from './products/product-details/product-details.component';
import { ProductEditComponent } from './products/product-edit/product-edit.component';
import { RecipeDetailsComponent } from './recipes/recipe-details/recipe-details.component';
import { RecipeEditComponent } from './recipes/recipe-edit/recipe-edit.component';
import { RecipesComponent } from './recipes/recipes.component';
import { SharedModule } from 'src/app/modules/shared.module';

@NgModule({
	declarations: [
		FoodComponent,
		ProductsComponent,
		RecipesComponent,
		MealsComponent,
		ProductDetailsComponent,
		ProductEditComponent,
		RecipeDetailsComponent,
		RecipeEditComponent,
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
export class FoodModule { }
