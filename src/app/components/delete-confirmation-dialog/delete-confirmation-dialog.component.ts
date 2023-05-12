import { HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProductsService } from 'src/app/main/mainforms/fd/products/products.service';
import { BambiService } from 'src/app/services/bambi.service';

@Component({
	selector: 'bl-delete-confirmation-dialog',
	templateUrl: './delete-confirmation-dialog.component.html',
	styleUrls: ['./delete-confirmation-dialog.component.scss']
})

export class DeleteConfirmationDialogComponent {

	constructor(
		public bambiService: BambiService,
		private _productsService: ProductsService,
		private _router: Router) {
	}

	confirmDelete(): void {
		switch (this._router.url) {
			case '/fd/products':
				this._productsService.API('delete', new HttpParams().set('operation', 'delete').set('owner', this.bambiService.userInfo.username).set('cookie', this.bambiService.userInfo.cookie).set('stamps', this.bambiService.deleteSelection.toString()))
				break;
		}
	}
}
