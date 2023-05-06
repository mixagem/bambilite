import { Component } from '@angular/core';
import { FdService } from './fd.service';

@Component({
	selector: 'bl-food',
	templateUrl: './food.component.html',
	styleUrls: ['./food.component.scss']
})

export class FoodComponent {

	constructor(
		public fdService: FdService) { }

}
