import { Component } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { HeaderBreadcumbsService } from './header-breadcumbs.service';

@Component({
	selector: 'bambi-header-breadcumbs',
	templateUrl: './header-breadcumbs.component.html',
	styleUrls: ['./header-breadcumbs.component.scss']
})

export class HeaderBreadcumbsComponent {

	constructor(
		public breadcumbsService: HeaderBreadcumbsService,
		public appService: AppService) {

	}
}
