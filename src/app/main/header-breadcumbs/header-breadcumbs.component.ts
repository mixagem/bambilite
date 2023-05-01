import { Component } from '@angular/core';
import { BambiService } from 'src/app/services/bambi.service';
import { HeaderBreadcumbsService } from './header-breadcumbs.service';

@Component({
	selector: 'bambi-header-breadcumbs',
	templateUrl: './header-breadcumbs.component.html',
	styleUrls: ['./header-breadcumbs.component.scss']
})

export class HeaderBreadcumbsComponent {

	constructor(public breadcumbsService: HeaderBreadcumbsService, public bambiService:BambiService) {

	}
}
