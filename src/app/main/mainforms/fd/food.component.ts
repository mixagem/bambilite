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
		public router: Router,
		private _fdService: FdService) { };

	fdService(property: string): any { return this._fdService[`${property}` as keyof typeof this._fdService] };

};
