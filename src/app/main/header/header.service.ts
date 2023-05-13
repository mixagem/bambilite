import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })

export class HeaderService {

	inputsForm: FormGroup = new FormGroup({
		simpleQueryFormControl: new FormControl(''),
	})

	constructor(
		public router: Router) {
	}

}
