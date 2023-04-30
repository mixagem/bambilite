export interface IUserFavourite {
	name: string;
	route: string;
	order: number;
}

export interface IBambiRoute {
	title: string;
	id: string;
	icon: string;
	route: string;
	subEntries: IBambiSubRoute[]
}

export interface IBambiSubRoute {
	title: string;
	id: string;
	route: string;
}