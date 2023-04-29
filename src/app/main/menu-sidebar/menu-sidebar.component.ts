import { Component } from '@angular/core';
import { BambiService } from 'src/app/services/bambi.service';
import { BambiMenuService } from './bambi-menu.service';

@Component({
	selector: 'lg2-menu-sidebar',
	templateUrl: './menu-sidebar.component.html',
	styleUrls: ['./menu-sidebar.component.scss']
})

export class MenuSidebarComponent {

	constructor(public menuService: BambiMenuService, public bambiService : BambiService) {

	}

}
