import { Injectable } from '@angular/core';

type MenuSubEntry = { title: string, id: string, route: string }
type MenuEntry = { title: string, id: string, icon: string, route: string, subEntries: MenuSubEntry[] }

@Injectable({
	providedIn: 'root'
})
export class BambiMenuService {

	menuOpen: boolean;
	bambiMenu: MenuEntry[];
	groupControl: { [key: string]: boolean };

	constructor() {
		this.menuOpen = false;

		// dashboard - mostra vários cartões de evoluções (peso do user, peso que consegue levantar no exercício X, última vez que fez o exercício Y, última vez que comeu K, etc etc etc...)

		// bobybuilding - regimes - template de dias detalhados de treinos + suplementação (a 7, 14 ou 28 dias)

		// calendario - vista geral - mostra alimentações (imagem das categorias de piteu consumido), suplementação (imagens do tipo de suplementação) e musculação (imagens das categorias de musculos)
		// calendário - evolução - track diário de peso (registos á la c/c)

		// parâmetros - utilizador e app



		this.bambiMenu = [
			{ title: 'APPMENU.DASHBOARD', id: 'dashboard', icon: 'space_dashboard', route: '/dashboard', subEntries: [] },
			{
				title: 'APPMENU.FOOD', id: 'food', icon: 'restaurant_menu', route: '/fd', subEntries: [
					{ title: 'APPMENU.FOOD.PRODUCTS', id: 'products', route: '/fd/products' },
					{ title: 'APPMENU.FOOD.RECIPEBOOK', id: 'recipebook', route: '/fd/recipes' },
					{ title: 'APPMENU.FOOD.MEALS', id: 'meals', route: '/fd/meals' }
				]
			},
			{
				title: 'APPMENU.SUPPLEMENTATION', id: 'supplementation', icon: 'coffee_maker', route: '/sp', subEntries: [
					{ title: 'APPMENU.SUPPLEMENTATION.SUPPLEMENTS', id: 'supplements', route: '/sp/supplements' },
					{ title: 'APPMENU.SUPPLEMENTATION.CONSUMPTION', id: 'consumption', route: '/sp/consumption' }
				]
			},
			{
				title: 'APPMENU.BODYBUILDING', id: 'bodybuilding', icon: 'fitness_center', route: '/bb', subEntries: [
					{ title: 'APPMENU.BODYBUILDING.EXERCISES', id: 'exercises', route: '/bb/exercises' },
					{ title: 'APPMENU.BODYBUILDING.WORKOUTS', id: 'workouts', route: '/bb/workouts' },
					{ title: 'APPMENU.BODYBUILDING.PROGRESS', id: 'progress', route: '/bb/progress' }
				]
			},
			{ title: 'APPMENU.CALENDAR', id: 'calender', icon: 'calendar_month', route: '/dashboard', subEntries: [] },
			{ title: 'APPMENU.SETTINGS', id: 'settings', icon: 'manage_accounts', route: '/dashboard', subEntries: [] },
		]


		this.groupControl = { 'title': false, 'snippets': false } //for each main entry that has subEntries
	}

	ToggleMenu(operation: 'open' | 'close') {
		operation === 'open' ? this.menuOpen = true : this.menuOpen = false;
	}

	ToggleGroup(groupID: string) {
		this.groupControl[`${groupID}`] = !this.groupControl[`${groupID}`]
	}
}
