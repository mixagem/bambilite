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
		public spService: SpService,
		public router: Router) { }

}
