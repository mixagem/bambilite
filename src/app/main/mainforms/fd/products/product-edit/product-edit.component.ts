import { Component } from '@angular/core';
import { FdService } from '../../fd.service';
import { IDetailsProduct } from 'src/app/interfaces/FdTypes';
import { FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';

@Component({
	selector: 'bl-product-edit',
	templateUrl: './product-edit.component.html',
	styleUrls: ['./product-edit.component.scss']
})


export class ProductEditComponent {

	productDetailsDraft: IDetailsProduct
	productForm: FormGroup = new FormGroup({});

	constructor(public fdService: FdService) {
		this.productDetailsDraft = this.fdService.productDetails
		this.generateFormControls();
	}

	discardChanges() {
		this.fdService.drawerFadeout = true;
		setTimeout(() => {
			this.fdService.drawerOpen = false;
			this.fdService.drawerFadeout = false;
		}, 1000);
	}

	generateFormControls() {
		Object.keys(this.productDetailsDraft).forEach(key => {
			switch (key) {
				case 'stamp':
				case 'owner': //fields to ignore
					break;
				case 'title': //required fields
					this.productForm.addControl(key, new FormControl(this.productDetailsDraft[key], [Validators.required]));
					break;
				default:
					this.productForm.addControl(key, new FormControl(this.productDetailsDraft[key as keyof typeof this.productDetailsDraft]));
			}

		});
	}

	saveProduct(){
		alert("wip - save product")
	}


}
