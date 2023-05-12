import { Component } from '@angular/core';
import { FdService } from './fd.service';
import { Router } from '@angular/router';

@Component({
	selector: 'bl-food',
	templateUrl: './food.component.html',
	styleUrls: ['./food.component.scss']
})

export class FoodComponent {

	constructor(
		public fdService: FdService,
		public router: Router) { }

}
