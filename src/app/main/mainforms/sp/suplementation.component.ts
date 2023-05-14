import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SpService } from './sp.service';

@Component({
	selector: 'bl-suplementation',
	templateUrl: './suplementation.component.html',
	styleUrls: ['./suplementation.component.scss']
})

export class SuplementationComponent {
	constructor(
		private _spService: SpService,
		private _router: Router) { }

	router(property: string): any { return this._router[`${property}` as keyof typeof this._router] };
	spService(property: string): any { return this._spService[`${property}` as keyof typeof this._spService] };

}
