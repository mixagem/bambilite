import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FdService } from '../../fd.service';
import { ProductChannelResult, SubjectChannelsService } from 'src/app/services/subject-channels.service';
import { Subject } from 'rxjs';
import { BambiService } from 'src/app/services/bambi.service';

type RecordOperation = 'edit' | 'delete' | 'clone'

@Component({
	selector: 'bl-product-details',
	templateUrl: './product-details.component.html',
	styleUrls: ['./product-details.component.scss']
})

export class ProductDetailsComponent implements OnInit, OnDestroy {

	loadingComplete: boolean = false;

	constructor(public dialogRef: MatDialogRef<any>, public fdService: FdService, private _channelsService: SubjectChannelsService, public bambiService: BambiService) {
	}

	ngOnInit(): void {
		this._channelsService.productDetailsChannel.subscribe(result => { this.showProductDetails(result); });
	}

	ngOnDestroy(): void {
		this._channelsService.productDetailsChannel = new Subject<ProductChannelResult>;
	}

	showProductDetails(result: ProductChannelResult) {
		if (result.sucess) { this.fdService.productDetails = result.product!; }
		this.loadingComplete = true;
	}

	enterEditMode(operation: RecordOperation) {
		switch (operation) {
			case 'edit': case 'clone':
				if (operation === 'clone') { this.fdService.productDetails.stamp = '' }
				this.fdService.drawerOpen = true;
				this.dialogRef.close();
				break;
			case 'delete':
				//mat dialog
				alert("wip - delete dialog fade")
				break;

		}
	}


}

