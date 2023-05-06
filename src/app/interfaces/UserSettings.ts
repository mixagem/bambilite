import { IUserFavourite } from "./BambiRoutes";
import { AppLanguage, AppTheme } from "./Generic";

export interface IUserSettings {
	name: string;
	username: string;
	language: AppLanguage;
	version: string;
	theme: AppTheme;
	email: string;
	profilepic: string;
	cookie: string;
	favourites: IUserFavourite[];
}