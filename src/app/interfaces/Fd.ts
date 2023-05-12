
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
}

export interface IDetailsRecipe extends IListRecipe {
	kcal: number;
	unit: string;
	unitvalue: number;
	price: number;
	owner: string;
	public: boolean;
	inactive: boolean;
	timestamp: number;
}


export interface IListRecipe {
	stamp: string;
	title: string;
	image: string;
	tags: string[];
}
