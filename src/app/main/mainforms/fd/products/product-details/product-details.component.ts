import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ProductsService } from '../products.service';
import { Subject } from 'rxjs';
import { BambiService } from 'src/app/services/bambi.service';
import { HttpParams } from '@angular/common/http';
import { RecordOperation } from 'src/app/interfaces/Generic';
import { FdService, ProductChannelResult } from '../../fd.service';

@Component({
	selector: 'bl-product-details',
	templateUrl: './product-details.component.html',
	styleUrls: ['./product-details.component.scss']
})

export class ProductDetailsComponent implements OnInit, OnDestroy {
	// progress bar control
	loadingComplete: boolean = false;

	// deleting status control
	deletingRecord: boolean = false;

	constructor(
		public productsService: ProductsService,
		private _dialogRef: MatDialogRef<any>,
		private _bambiService: BambiService,
		public fdService: FdService) { }

	ngOnInit(): void {
		// subs
		this.fdService.productDetailsChannel = new Subject<ProductChannelResult>;
		this.fdService.productDetailsChannel.subscribe(result => { this.showProductDetails(result); });
	}

	ngOnDestroy(): void {
		// subs
		this.fdService.productDetailsChannel.complete();
	}

	// fire details modal
	showProductDetails(result: ProductChannelResult): void {
		if (result.sucess) { this.productsService.productDetails = result.product!; }
		this.loadingComplete = true;
	}

	// details modal actions
	recordOperation(operation: RecordOperation): void {
		switch (operation) {
			case 'update': case 'clone':
				if (operation === 'clone') { this.productsService.productDetails.stamp = '' }
				this.fdService.drawerOpen = true;
				this._dialogRef.close();
				break;
			case 'delete':
				this.deletingRecord = true;
				break;
		}
	}

	// delete confirmed
	deleteRecord(): void {
		this.productsService.API('delete',
			new HttpParams()
				.set('operation', 'delete')
				.set('owner', this._bambiService.userInfo.username)
				.set('cookie', this._bambiService.userInfo.cookie)
				.set('stamps', this.productsService.productDetails.stamp))
	}

}

