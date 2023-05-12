import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IListProduct, IDetailsProduct, IListRecipe, IDetailsRecipe } from 'src/app/interfaces/Fd';

export type ProductChannelResult = { sucess: boolean, products?: IListProduct[], product?: IDetailsProduct, details?: string }
export type RecipeChannelResult = { sucess: boolean, recipes?: IListRecipe[], recipe?: IDetailsRecipe, details?: string }


@Injectable({ providedIn: 'root' })

export class FdService {

	// drawer status control
	drawerOpen: boolean = false;
	// drawer animations control
	drawerFadeout: boolean = false;

	productListChannel: Subject<ProductChannelResult>;
	productDetailsChannel: Subject<ProductChannelResult>;
	productUpdateChannel: Subject<ProductChannelResult>;
	productDeleteChannel: Subject<ProductChannelResult>;

	recipeListChannel: Subject<RecipeChannelResult>;
	recipeDetailsChannel: Subject<RecipeChannelResult>;
	recipeUpdateChannel: Subject<RecipeChannelResult>;
	recipeDeleteChannel: Subject<RecipeChannelResult>;


	constructor() {
		this.productListChannel = new Subject<ProductChannelResult>;
		this.productDetailsChannel = new Subject<ProductChannelResult>;
		this.productUpdateChannel = new Subject<ProductChannelResult>;
		this.productDeleteChannel = new Subject<ProductChannelResult>;

		this.recipeListChannel = new Subject<RecipeChannelResult>;
		this.recipeDetailsChannel = new Subject<RecipeChannelResult>;
		this.recipeUpdateChannel = new Subject<RecipeChannelResult>;
		this.recipeDeleteChannel = new Subject<RecipeChannelResult>; }

	ProductListChannelFire(result: boolean, errorCode: string = '', productList?: IListProduct[],): void {
		this.productListChannel.next({ sucess: result, products: productList, details: errorCode });
	}

	ProductDetailsChannelFire(result: boolean, errorCode: string = '', productDetails?: IDetailsProduct): void {
		this.productDetailsChannel.next({ sucess: result, product: productDetails, details: errorCode });
	}

	ProductUpdateChannelFire(result: boolean, errorCode: string = ''): void {
		this.productUpdateChannel.next({ sucess: result, details: errorCode });
	}

	ProductDeleteChannelFire(result: boolean, code: string): void {
		this.productDeleteChannel.next({ sucess: result, details: code });
	}

	RecipeListChannelFire(result: boolean, errorCode: string = '', recipeList?: IListRecipe[]): void {
		this.recipeListChannel.next({ sucess: result, recipes: recipeList, details: errorCode });
	}

	RecipeDetailsChannelFire(result: boolean, errorCode: string = '', recipeDetails?: IDetailsRecipe): void {
		this.recipeDetailsChannel.next({ sucess: result, recipe: recipeDetails, details: errorCode });
	}

	RecipeUpdateChannelFire(result: boolean, errorCode: string = ''): void {
		this.recipeUpdateChannel.next({ sucess: result, details: errorCode });
	}

	RecipeDeleteChannelFire(result: boolean, code: string): void {
		this.recipeDeleteChannel.next({ sucess: result, details: code });
	}
}
