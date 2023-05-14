
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
	recipelist: IMaterialsSupplement[];
}

export interface IMaterialsSupplement {
	recipestamp: string,
	title: string,
	kcal: number;
	unit: string;
	unitvalue: number;
	price: number;
	owner: string;
}

export interface IMaterialsRecordOption {
	stamp: string;
	title: string;
	image: string;
}