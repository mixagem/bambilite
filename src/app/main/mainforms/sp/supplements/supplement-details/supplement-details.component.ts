import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { AppService } from 'src/app/services/app.service';
import { SpService, SupplementChannelResult } from '../../sp.service';
import { RecordOperation } from 'src/app/interfaces/Generic';
import { HttpParams } from '@angular/common/http';
import { SupplementsService } from '../supplements.service';

@Component({
	selector: 'bl-supplement-details',
	templateUrl: './supplement-details.component.html',
	styleUrls: ['./supplement-details.component.scss']
})

export class SupplementDetailsComponent implements OnInit, OnDestroy {
	// progress bar control
	loadingComplete: boolean = false;

	// deleting status control
	deletingRecord: boolean = false;

	constructor(
		public supplementsService: SupplementsService,
		private _dialogRef: MatDialogRef<any>,
		private _appService: AppService,
		public spService: SpService) { }

	ngOnInit(): void {
		// subs
		this.spService.supplementDetailsChannel = new Subject<SupplementChannelResult>;
		this.spService.supplementDetailsChannel.subscribe(result => { this.showRecordDetails(result); });
	}

	ngOnDestroy(): void {
		// subs
		this.spService.supplementDetailsChannel.complete();
	}

	// fire details modal
	showRecordDetails(result: SupplementChannelResult): void {
		this.loadingComplete = true;
		result.sucess ? this.supplementsService.recordDetails = result.record! : console.error('bambilite connection error: ' + result.details);
	}

	// details modal actions
	recordOperation(operation: RecordOperation): void {
		switch (operation) {
			case 'update': case 'clone':
				if (operation === 'clone') {
					this.supplementsService.recordDetails.stamp = ''
					this.supplementsService.recordDetails.public = false
					this.supplementsService.recordDetails.inactive = false
				}
				this.spService.drawerOpen = true;
				this._dialogRef.close();
				break;
			case 'delete':
				this.deletingRecord = true;
				break;
		}
	}

	// delete confirmed
	deleteRecord(): void {
		this.supplementsService.API('delete',
			new HttpParams()
				.set('operation', 'delete')
				.set('owner', this._appService.userInfo.username)
				.set('cookie', this._appService.userInfo.cookie)
				.set('stamps', this.supplementsService.recordDetails.stamp))
	}

}
