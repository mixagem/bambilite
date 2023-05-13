import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { MenuService } from './menu.service';

@Component({
	selector: 'bl-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.scss']
})

export class MenuSidebarComponent implements OnInit {

	constructor(
		public menuService: MenuService,
		private _appService: AppService) { };

	ngOnInit(): void {
		this.menuService.GetMenus();
	};

	appService(property: string): any { return this._appService[`${property}` as keyof typeof this._appService] };

};
