import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IListProduct, IDetailsProduct, IListRecipe, IDetailsRecipe } from 'src/app/interfaces/Fd';

export type ProductChannelResult = { sucess: boolean, recordList?: IListProduct[], record?: IDetailsProduct, details?: string };
export type RecipeChannelResult = { sucess: boolean, recordList?: IListRecipe[], record?: IDetailsRecipe, details?: string };


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
		this.recipeDeleteChannel = new Subject<RecipeChannelResult>;
	};

	ProductListChannelFire(result: boolean, errorCode: string = '', productList?: IListProduct[],): void {
		this.productListChannel.next({ sucess: result, recordList: productList, details: errorCode });
	};

	ProductDetailsChannelFire(result: boolean, errorCode: string = '', productDetails?: IDetailsProduct): void {
		this.productDetailsChannel.next({ sucess: result, record: productDetails, details: errorCode });
	};

	ProductUpdateChannelFire(result: boolean, errorCode: string = ''): void {
		this.productUpdateChannel.next({ sucess: result, details: errorCode });
	};

	ProductDeleteChannelFire(result: boolean, code: string): void {
		this.productDeleteChannel.next({ sucess: result, details: code });
	};

	RecipeListChannelFire(result: boolean, errorCode: string = '', recipeList?: IListRecipe[]): void {
		this.recipeListChannel.next({ sucess: result, recordList: recipeList, details: errorCode });
	};

	RecipeDetailsChannelFire(result: boolean, errorCode: string = '', recipeDetails?: IDetailsRecipe): void {
		this.recipeDetailsChannel.next({ sucess: result, record: recipeDetails, details: errorCode });
	};

	RecipeUpdateChannelFire(result: boolean, errorCode: string = ''): void {
		this.recipeUpdateChannel.next({ sucess: result, details: errorCode });
	};

	RecipeDeleteChannelFire(result: boolean, code: string): void {
		this.recipeDeleteChannel.next({ sucess: result, details: code });
	};


	GetPriceByRatio(price: number, unitvalue: number, unit: string): number {

		let ajustedPriced = 0;

		if (isNaN(price)) { return ajustedPriced };

		switch (unit) {
			case 'L': case 'kg':
				ajustedPriced = price / unitvalue;
				break;
			case 'ml': case 'g':
				ajustedPriced = 1000 * price / unitvalue;
				break;
		}

		return Number(ajustedPriced.toFixed(3));

	};

	GetPrice(price: number, unitvalue: number, unit: string): number {

		let ajustedPriced = 0;

		if (isNaN(price)) { return ajustedPriced };

		switch (unit) {
			case 'L': case 'kg':
				ajustedPriced = unitvalue * price;
				break;
			case 'ml': case 'g':
				ajustedPriced = unitvalue / 1000 * price;
				break;
		};

		return Number(ajustedPriced.toFixed(3));

	};

	GetKcalBy100(kcal: number, unitvalue: number, unit: string): number {

		let ajustedKcals = 0;

		if (isNaN(kcal)) { return ajustedKcals };

		switch (unit) {
			case 'L': case 'kg':
				ajustedKcals = kcal / unitvalue / 10;
				break;
			case 'ml': case 'g':
				ajustedKcals = kcal / unitvalue * 100;
				break;
		};

		return Number(ajustedKcals.toFixed(3));
	};

	GetKcal(kcalby100: number, unitvalue: number, unit: string): number {

		let ajustedKcals = 0;

		if (isNaN(kcalby100)) { return ajustedKcals };

		switch (unit) {
			case 'L': case 'kg':
				ajustedKcals = kcalby100 * 10 * unitvalue;
				break;
			case 'ml': case 'g':
				ajustedKcals = kcalby100 / 100 * unitvalue;
				break;
		};

		return Number(ajustedKcals.toFixed(3));
	};
};
