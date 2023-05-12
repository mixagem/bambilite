
export interface IListSupplement {
	stamp: string;
	title: string;
	image: string;
	tags: string[];
}

export interface IDetailsSupplement extends IListSupplement {
	kcal: number;
	unit: string;
	unitvalue: number;
	price: number;
	owner: string;
	public: boolean;
	inactive: boolean;
	timestamp: number;
}
