import { AppLanguage, AppTheme } from "../services/bambi.service";
import { IUserFavourite } from "./BambiRoutes";

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