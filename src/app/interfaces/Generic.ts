import { IDetailsProduct, IListProduct } from "./Fd";

export type RecordOperation = 'update' | 'delete' | 'clone';
export type AppTheme = 'waikiki' | 'vice'
export type AppLanguage = 'pt' | 'uk' | 'es'
export type AppMaterialLocales = 'pt-PT' | 'en-GB' | 'es-ES'
export type Locales = { [key: string]: string }
export type RecordMeasuringType = { title: string, value: string }
export type MenuSubEntry = { title: string, id: string, route: string };
export type MenuEntry = { title: string, id: string, icon: string, route: string, subEntries: MenuSubEntry[] };
export type MenuObject = { sucess: boolean, menus?: MenuEntry[], details?: string };
export type ProductObject = { sucess: boolean; recordList?: IListProduct[]; recordDetails?: IDetailsProduct; details?: string };
