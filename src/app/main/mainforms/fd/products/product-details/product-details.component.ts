import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ProductsService } from '../products.service';
import { Subject } from 'rxjs';
import { AppService } from 'src/app/services/app.service';
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
		private _productsService: ProductsService,
		private _fdService: FdService,
		private _dialogRef: MatDialogRef<any>,
		private _appService: AppService) { }

	ngOnInit(): void {
		// subs
		this._fdService.productDetailsChannel = new Subject<ProductChannelResult>;
		this._fdService.productDetailsChannel.subscribe(result => { this.showRecordDetails(result); });
	}

	ngOnDestroy(): void {
		// subs
		this._fdService.productDetailsChannel.complete();
	}

	productsService(property: string): any { return this._productsService[`${property}` as keyof typeof this._productsService] };

	getMaterialLocale(): string { return this._appService.GetMaterialLocale() }

	// fire details modal
	showRecordDetails(result: ProductChannelResult): void {
		this.loadingComplete = true;
		result.sucess ? this._productsService.recordDetails = result.record! : console.error('bambilite connection error: ' + result.details);
	}

	// details modal actions
	recordOperation(operation: RecordOperation): void {
		switch (operation) {
			case 'update': case 'clone':
				if (operation === 'clone') {
					this._productsService.recordDetails.stamp = ''
					this._productsService.recordDetails.public = false
					this._productsService.recordDetails.inactive = false
				}
				this._fdService.drawerOpen = true;
				this._dialogRef.close();
				break;
			case 'delete':
				this.deletingRecord = true;
				break;
		}
	}

	// delete confirmed
	deleteRecord(): void {
		this._productsService.API('delete',
			new HttpParams()
				.set('operation', 'delete')
				.set('owner', this._appService.userInfo.username)
				.set('cookie', this._appService.userInfo.cookie)
				.set('stamps', this._productsService.recordDetails.stamp))
	}

}