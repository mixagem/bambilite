import { Component, OnInit } from '@angular/core';
import { BambiService } from 'src/app/services/bambi.service';
import { BambiMenuService } from './bambi-menu.service';

@Component({
	selector: 'bl-menu',
	templateUrl: './bambi-menu.component.html',
	styleUrls: ['./bambi-menu.component.scss']
})

export class MenuSidebarComponent implements OnInit {

	constructor(public menuService: BambiMenuService, public bambiService : BambiService) {

	}

	ngOnInit(): void {
		this.menuService.GetMenus();
	}

}
