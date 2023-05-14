import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Injectable({ providedIn: 'root' })

export class HeaderService {

	inputsForm: FormGroup = new FormGroup({
		simpleQueryFormControl: new FormControl(''),
	})

}
