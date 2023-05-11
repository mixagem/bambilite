import { HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FdService } from 'src/app/main/mainforms/fd/fd.service';
import { BambiService } from 'src/app/services/bambi.service';

@Component({
	selector: 'bl-delete-confirmation-dialog',
	templateUrl: './delete-confirmation-dialog.component.html',
	styleUrls: ['./delete-confirmation-dialog.component.scss']
})

export class DeleteConfirmationDialogComponent {

	constructor(
		public bambiService: BambiService,
		private _fdService: FdService,
		private _router: Router) {
	}

	confirmDelete(): void {
		switch (this._router.url) {
			case '/fd/products':
				this._fdService.API('delete', new HttpParams().set('operation', 'delete').set('owner', this.bambiService.userInfo.username).set('cookie', this.bambiService.userInfo.cookie).set('stamps', this.bambiService.deleteSelection.toString()))
				break;
		}
	}
}
