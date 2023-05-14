
export interface IListProduct {
	stamp: string;
	title: string;
	image: string;
	tags: string[];
}

export interface IDetailsProduct extends IListProduct {
	kcal: number;
	unit: string;
	unitvalue: number;
	price: number;
	owner: string;
	public: boolean;
	inactive: boolean;
	timestamp: number;
	recipelist: IMaterialsProduct[];
}

export interface IMaterialsProduct {
	recipestamp:string,
	title: string,
	kcal: number;
	unit: string;
	unitvalue: number;
	price: number;
	owner: string;
}



//


export interface IDetailsRecipe extends IListRecipe {
	kcal: number;
	unit: string;
	unitvalue: number;
	price: number;
	owner: string;
	public: boolean;
	inactive: boolean;
	timestamp: number;
	recipemats: IMaterialsRecipe[];
}

export interface IMaterialsRecipe {
	stamp:string,
	origin:string,
	originstamp:string,
	recipestamp:string,
	title: string,
	kcal: number;
	unit: string;
	unitvalue: number;
	price: number;
	owner: string;
}


export interface IListRecipe {
	stamp: string;
	title: string;
	image: string;
	tags: string[];
}

