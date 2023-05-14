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
		private _supplementsService: SupplementsService,
		private _dialogRef: MatDialogRef<any>,
		private _appService: AppService,
		private _spService: SpService) { }

	ngOnInit(): void {
		// subs
		this._spService.supplementDetailsChannel = new Subject<SupplementChannelResult>;
		this._spService.supplementDetailsChannel.subscribe(result => { this.showRecordDetails(result); });
	}

	ngOnDestroy(): void {
		// subs
		this._spService.supplementDetailsChannel.complete();
	}

	supplementsService(property: string): any { return this._supplementsService[`${property}` as keyof typeof this._supplementsService] };

	getMaterialLocale(): string { return this._appService.GetMaterialLocale() }

	// fire details modal
	showRecordDetails(result: SupplementChannelResult): void {
		this.loadingComplete = true;
		result.sucess ? this._supplementsService.recordDetails = result.record! : console.error('bambilite connection error: ' + result.details);
	}

	// details modal actions
	recordOperation(operation: RecordOperation): void {
		switch (operation) {
			case 'update': case 'clone':
				if (operation === 'clone') {
					this._supplementsService.recordDetails.stamp = ''
					this._supplementsService.recordDetails.public = false
					this._supplementsService.recordDetails.inactive = false
				}
				this._spService.drawerOpen = true;
				this._dialogRef.close();
				break;
			case 'delete':
				this.deletingRecord = true;
				break;
		}
	}

	// delete confirmed
	deleteRecord(): void {
		this._supplementsService.API('delete',
			new HttpParams()
				.set('operation', 'delete')
				.set('owner', this._appService.userInfo.username)
				.set('cookie', this._appService.userInfo.cookie)
				.set('stamps', this._supplementsService.recordDetails.stamp))
	}

}
