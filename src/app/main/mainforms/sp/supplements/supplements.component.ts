import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppService } from 'src/app/services/app.service';
import { SupplementsService } from './supplements.service';
import { IListSupplement } from 'src/app/interfaces/Sp';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SpService, SupplementChannelResult } from '../sp.service';
import { HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs';
import { AppSnackComponent } from 'src/app/components/snackbars/app-snack/app-snack.component';
import { DeleteConfirmationDialogComponent } from 'src/app/components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { SupplementDetailsComponent } from './supplement-details/supplement-details.component';

@Component({
	selector: 'bl-supplements',
	templateUrl: './supplements.component.html',
	styleUrls: ['./supplements.component.scss']
})

export class SupplementsComponent implements OnInit, OnDestroy {
	//progress bar control
	loadingComplete: boolean = false;

	// mainform list
	recordList: IListSupplement[] = [];
	dataSource: MatTableDataSource<IListSupplement> = new MatTableDataSource<IListSupplement>;
	displayedColumns: string[] = ['check', 'image', 'title', 'tags'];

	// checkboxes control
	selectedRecords: string[] = [];

	constructor(
		public appService: AppService,
		public supplementsService: SupplementsService,
		public spService: SpService,
		private _dialog: MatDialog,
		private _snackBar: MatSnackBar) { }

	ngOnInit(): void {
		// subs
		this.spService.supplementListChannel = new Subject<SupplementChannelResult>;
		this.spService.supplementDeleteChannel = new Subject<SupplementChannelResult>;

		this.spService.supplementListChannel.subscribe(result => { this.showRecordList(result); });
		this.spService.supplementDeleteChannel.subscribe(result => { this.refreshRecordListFromDelete(result); });

		this.supplementsService.API('getlist', new HttpParams().set('operation', 'getlist').set('owner', this.appService.userInfo.username).set('cookie', this.appService.userInfo.cookie));
	}

	ngOnDestroy(): void {
		// subs
		this.spService.supplementListChannel.complete();
		this.spService.supplementDeleteChannel.complete();
	}

	@ViewChild(MatPaginator) set matPaginator(paginator: MatPaginator) { this.dataSource.paginator = paginator; }

	// listing (triggered by load subject)
	showRecordList(result: SupplementChannelResult): void {
		if (result.sucess) {
			this.recordList = result.recordList!;
			this.dataSource = new MatTableDataSource<IListSupplement>(this.recordList);
		}

		if (!result.sucess) {
			switch (result.details) {
				case 'no-records-found':
					this.recordList = [];
					break;

				case 'offline': default:
					this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, panelClass: ['app-snackbar', `${this.appService.appTheme}-snack`], horizontalPosition: 'end', data: { label: 'SNACKS.UNREACHABLE-SERVER', emoji: '🚧' } });
					console.error('bambilite connection error: ' + result.details)
					break;
			}
		}

		this.loadingComplete = true;
	}

	// listing (triggered by delete subject)
	refreshRecordListFromDelete(result: SupplementChannelResult): void {
		// sucessfull deleted records
		if (result.sucess) {

			// snackbar fire
			this.selectedRecords.length > 1  ?
				this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, horizontalPosition: 'end', panelClass: ['app-snackbar', `${this.appService.appTheme}-snack`], data: { label: 'SNACKS.DELETED-SUPPLEMENTS', emoji: '🚮' } }) :
				this._snackBar.openFromComponent(AppSnackComponent, { duration: 5000, horizontalPosition: 'end', panelClass: ['app-snackbar', `${this.appService.appTheme}-snack`], data: { label: 'SNACKS.DELETED-SUPPLEMENT', emoji: '🚮' } })

			// reseting selection array
			this.appService.deleteSelection = [];
			this.selectedRecords = [];

			// fetch updated listing
			this.supplementsService.API('getlist',
				new HttpParams()
					.set('operation', 'getlist')
					.set('owner', this.appService.userInfo.username)
					.set('cookie', this.appService.userInfo.cookie));
		}

		// error deleting records
		if (!result.sucess) {
			switch (result.details) {
				case 'user-owns-none':
					this._snackBar.openFromComponent(AppSnackComponent, { duration: 5000, horizontalPosition: 'end', panelClass: ['app-snackbar', `${this.appService.appTheme}-snack`], data: { label: 'SNACKS.CANT-DELETE-SUPPLEMENT', emoji: '🚯' } });
					break;

				case 'offline': default:
					this._snackBar.openFromComponent(AppSnackComponent, { duration: 5000, horizontalPosition: 'end', panelClass: ['app-snackbar', `${this.appService.appTheme}-snack`], data: { label: 'SNACKS.UNREACHABLE-SERVER', emoji: '🚧' } });
					console.error('bambilite connection error: ' + result.details);
					break;
			}
		}
	}

	// product details dialog
	showDetails(productstamp: string): void {
		this._dialog.open(SupplementDetailsComponent, { width: '50vw', height: '400px', panelClass: [this.appService.appTheme + '-theme'] });
		this.supplementsService.API('getdetails',  new HttpParams().set('operation', 'getdetails').set('stamp', productstamp).set('owner', this.appService.userInfo.username).set('cookie', this.appService.userInfo.cookie));
	}

	// introduction mode
	addNewRecord(): void {
		this.spService.drawerOpen = true;
		this.supplementsService.recordDetails = {
			stamp: '',
			title: '',
			image: '',
			tags: [],
			kcal: 0,
			unit: 'g',
			unitvalue: 0,
			price: 0,
			owner: this.appService.userInfo.username,
			public: false,
			inactive: false,
			timestamp: Date.now()
		};
	}

	// update selected records
	selectItem(target: EventTarget, stamp: string): void {
		const newTarget = target as HTMLInputElement;

		// adding
		if (newTarget.checked && !this.selectedRecords.includes(stamp)) { this.selectedRecords.push(stamp); }

		// removing
		if (!newTarget.checked && this.selectedRecords.includes(stamp)) {
			const recordIndex = this.selectedRecords.indexOf(stamp);
			const slice1 = this.selectedRecords.slice(0, recordIndex);
			const slice2 = this.selectedRecords.slice(recordIndex + 1);
			this.selectedRecords = [...slice1, ...slice2];
		}
	}

	// delete selected records
	deleteSelected(): void {
		this.appService.deleteSelection = this.selectedRecords;
		this._dialog.open(DeleteConfirmationDialogComponent, { width: '500px', height: '220px', panelClass: [this.appService.appTheme + '-theme'] });
	}


}
