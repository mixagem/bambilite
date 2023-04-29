import { AppLanguage, AppTheme } from "../services/bambi.service";

export interface IUserSettings {
	name: string;
	username: string;
	language: AppLanguage;
	version: string;
	theme: AppTheme;
	email: string;
	profilepic: string;
	cookie: string;
	favourites: IUserFavourites[]
}

export interface IUserFavourites {
	name: string;
	route: string;
	order: number;
}