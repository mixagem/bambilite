import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/internal/Observable';
import { IDetailsSupplement } from 'src/app/interfaces/Sp';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavigationStart, Router } from '@angular/router';
import { HeaderService } from 'src/app/main/header/header.service';
import { AppService } from 'src/app/services/app.service';
import { SupplementsService } from '../supplements.service';
import { SpService, SupplementChannelResult } from '../../sp.service';
import { Subject } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { MatChipInputEvent, MatChipEditedEvent } from '@angular/material/chips';
import { ImageUploadComponent } from 'src/app/components/image-upload/image-upload.component';
import { AppSnackComponent } from 'src/app/components/snackbars/app-snack/app-snack.component';
import { RecordMeasuringType } from 'src/app/interfaces/Generic';

@Component({
	selector: 'bl-supplement-edit',
	templateUrl: './supplement-edit.component.html',
	styleUrls: ['./supplement-edit.component.scss']
})

export class SupplementEditComponent {
	// product details clone (so we can freely change and discard changes without BD calls)
	recordDetailsDraft: IDetailsSupplement

	// form
	recordForm: FormGroup = new FormGroup({});

	// progress bar control
	loadingComplete: boolean = true;

	// operation type (new / update) control
	isNewRecord: boolean = false;

	// discard control
	isDiscarding: boolean = false;

	// measure type autocomplete
	defaultOptions: RecordMeasuringType[] = [];
	filteredOptions: Observable<RecordMeasuringType[]> = new Observable<RecordMeasuringType[]>;

	// mat-chips input separator
	readonly separatorKeysCodes = [ENTER, COMMA] as const;

	constructor(
		private _supplementsService: SupplementsService,
		private _router: Router,
		private _appService: AppService,
		private _dialog: MatDialog,
		private _snackBar: MatSnackBar,
		private _spService: SpService,
		private _headerService: HeaderService) {

		this.recordDetailsDraft = this._supplementsService.recordDetails
	}

	ngOnInit(): void {

		this._spService.supplementUpdateChannel = new Subject<SupplementChannelResult>;
		this._spService.supplementUpdateChannel.subscribe(result => { this.saveFinished(result); });

		this._router.events.forEach((event) => { if (event instanceof NavigationStart) { this.closeEditMode(); } });

		this._supplementsService.tempB64Img = this.recordDetailsDraft.image;

		this.defaultOptions = this._appService.GetDefaultMeasuringTypeOptions()

		this._generateFormControls();

		this._formControlsUpdate();

		this._headerService.inputsForm.get('simpleQueryFormControl')!.disable({ emitEvent: false });

		this.recordForm.get('price')!.valueChanges.subscribe(_ => {
			if (!_ || isNaN(Number(_)) || _ == 0) { return }
			this.recordForm.get('pricebyratio')!.setValue(this._spService.GetPriceByRatio(_, this.recordForm.get('unitvalue')!.value, this.recordForm.get('unit')!.value), { emitEvent: false })
		})

		this.recordForm.get('pricebyratio')!.valueChanges.subscribe(_ => {
			if (!_ || isNaN(Number(_)) || _ == 0) { return }
			this.recordForm.get('price')!.setValue(this._spService.GetPrice(_, this.recordForm.get('unitvalue')!.value, this.recordForm.get('unit')!.value), { emitEvent: false })
		})

		this.recordForm.get('unit')!.valueChanges.subscribe(_ => {
			this.recordForm.get('pricebyratio')!.setValue(this._spService.GetPriceByRatio(this.recordForm.get('price')!.value, this.recordForm.get('unitvalue')!.value, _), { emitEvent: false })
			this.recordForm.get('kcalby100')!.setValue(this._spService.GetKcalBy100(this.recordForm.get('kcal')!.value, this.recordForm.get('unitvalue')!.value, _), { emitEvent: false })
		})

		this.recordForm.get('unitvalue')!.valueChanges.subscribe(_ => {
			if (!_ || isNaN(Number(_)) || _ == 0) { return }
			this.recordForm.get('pricebyratio')!.setValue(this._spService.GetPriceByRatio(this.recordForm.get('price')!.value, _, this.recordForm.get('unit')!.value), { emitEvent: false })
			this.recordForm.get('kcalby100')!.setValue(this._spService.GetKcalBy100(this.recordForm.get('kcal')!.value, _, this.recordForm.get('unit')!.value), { emitEvent: false })
		})

		this.recordForm.get('kcal')!.valueChanges.subscribe(_ => {
			if (!_ || isNaN(Number(_)) || _ == 0) { return }
			this.recordForm.get('kcalby100')!.setValue(this._spService.GetKcalBy100(_, this.recordForm.get('unitvalue')!.value, this.recordForm.get('unit')!.value), { emitEvent: false })
		})

		this.recordForm.get('kcalby100')!.valueChanges.subscribe(_ => {
			if (!_ || isNaN(Number(_)) || _ == 0) { return }
			this.recordForm.get('kcal')!.setValue(this._spService.GetKcal(_, this.recordForm.get('unitvalue')!.value, this.recordForm.get('unit')!.value), { emitEvent: false })
		})

	}

	ngOnDestroy(): void {
		// subs
		this._spService.supplementUpdateChannel.complete();
		// wise to clean any images that are not used
		this._supplementsService.tempB64Img = '';
		// re-enabling header search input
		this._headerService.inputsForm.get('simpleQueryFormControl')!.enable({ emitEvent: false });
	}

	router(property: string): any { return this._router[`${property}` as keyof typeof this._router] };

	supplementsService(property: string): any { return this._supplementsService[`${property}` as keyof typeof this._supplementsService] };

	getOperationLabel(title: string, stamp: string): string { return this._appService.GetOperationLabel(title, stamp); }

	discardPrompt(operation: 'open' | 'close'): void {

		switch (operation) {
			case 'open':
				this.recordForm.disable({ emitEvent: false })
				this.isDiscarding = true;
				break;
			case 'close':
				this.recordForm.enable({ emitEvent: false })
				this.isDiscarding = false;
				break;
		}
	}

	saveRecord(): void {
		this.loadingComplete = false;
		this.isNewRecord = !this.recordDetailsDraft.stamp

		this.recordDetailsDraft.timestamp = Date.now();
		this.recordDetailsDraft.image = this._supplementsService.tempB64Img;
		this.recordDetailsDraft.kcal = this.recordForm.get('kcal')!.value
		this.recordDetailsDraft.title = this.recordForm.get('title')!.value
		this.recordDetailsDraft.unit = this.recordForm.get('unit')!.value
		this.recordDetailsDraft.unitvalue = this.recordForm.get('unitvalue')!.value
		this.recordDetailsDraft.price = this.recordForm.get('price')!.value
		this.recordDetailsDraft.public = this.recordForm.get('public')!.value
		this.recordDetailsDraft.inactive = this.recordForm.get('inactive')!.value

		const operation = !!this.recordDetailsDraft.stamp ? 'update' : 'new'
		const httpParams =
			new HttpParams()
				.set('operation', operation)
				.set('cookie', this._appService.userInfo.cookie)
				.set('owner', this._appService.userInfo.username)
				.set('record', JSON.stringify(this.recordDetailsDraft))

		this._supplementsService.API(operation, httpParams)
	}

	// triggered by the response from the update product call
	saveFinished(result: SupplementChannelResult): void {
		this.loadingComplete = true;
		// disparar snackbars aqui?
		if (result.sucess) {
			this.closeEditMode(true);
			this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, panelClass: ['app-snackbar', `${this._appService.appTheme}-snack`], horizontalPosition: 'end', data: { label: this.isNewRecord ? 'SNACKS.NEW-SUPPLEMENT' : 'SNACKS.UPDATED-SUPPLEMENT', emoji: '🥝' } });
		}
		else {
			switch (result.details) {
				case 'user-not-owner':
					this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, panelClass: ['app-snackbar', `${this._appService.appTheme}-snack`], horizontalPosition: 'end', data: { label: 'SNACKS.USER-NOT-OWNER', emoji: '🚫' } });
					return;
				case 'offline': default:
					this._snackBar.openFromComponent(AppSnackComponent, { duration: 5000, panelClass: ['app-snackbar', `${this._appService.appTheme}-snack`], horizontalPosition: 'end', data: { label: 'SNACKS.UNREACHABLE-SERVER', emoji: '🚧' } });
					console.error('bambilite connection error: ' + result.details);
					return;
			}
		}

	}

	// triggered when update product api call is over, and also when discarding changes
	closeEditMode(updatedProduct: boolean = false): void {
		// drawer closing animation
		this._spService.drawerFadeout = true;
		setTimeout(() => {
			this._spService.drawerOpen = false;
			this._spService.drawerFadeout = false;
		}, 1000);

		if (updatedProduct) {
			this._supplementsService.API('getlist',
				new HttpParams()
					.set('operation', 'getlist')
					.set('owner', this._appService.userInfo.username)
					.set('cookie', this._appService.userInfo.cookie));
		}
	}

	// imagepicker
	newPicUpload(): void {
		this._dialog.open(ImageUploadComponent, { width: '50vw', height: '400px', panelClass: [this._appService.appTheme + '-theme'] });
	}

	// tags
	addTag(event: MatChipInputEvent): void {
		const value = (event.value || '').trim();

		if (!this.recordDetailsDraft.tags) { this.recordDetailsDraft.tags = [] }
		if (value && !this.recordDetailsDraft.tags.includes(value)) { this.recordDetailsDraft.tags.push(value) }

		event.chipInput!.clear();
	}

	removeTag(tag: string): void {
		const index = this.recordDetailsDraft.tags.indexOf(tag);
		this.recordDetailsDraft.tags = [...this.recordDetailsDraft.tags.slice(0, index), ...this.recordDetailsDraft.tags.slice(index + 1)];
	}

	editTag(tag: string, event: MatChipEditedEvent): void {
		const value = event.value.trim();

		if (!value) { this.removeTag(tag); return; }

		const index = this.recordDetailsDraft.tags.indexOf(tag);
		if (index >= 0) { this.recordDetailsDraft.tags[index] = value; }
	}

	private _generateFormControls(): void {
		Object.keys(this.recordDetailsDraft).forEach(key => {
			switch (key) {
				case 'stamp':
				case 'owner':
				case 'tags':
				case 'image':
					// fields not to create form control
					break;
				case 'unit':
				case 'title':
					// required fields
					this.recordForm.addControl(key, new FormControl(this.recordDetailsDraft[key], [Validators.required]));
					break;
				case 'kcal':
				case 'unitvalue':
				case 'price':
					// number patterns validator
					this.recordForm.addControl(key, new FormControl(this.recordDetailsDraft[key], [Validators.pattern("^[0-9]*([,.]{1}[0-9]{1,3}){0,1}$")]));
					break;
				default:
					this.recordForm.addControl(key, new FormControl(this.recordDetailsDraft[key as keyof typeof this.recordDetailsDraft]));
			}
		});

		const pbr = this._spService.GetPriceByRatio(this.recordForm.get('price')!.value, this.recordForm.get('unitvalue')!.value, this.recordForm.get('unit')!.value);
		const kb1 = this._spService.GetKcalBy100(this.recordForm.get('kcal')!.value, this.recordForm.get('unitvalue')!.value, this.recordForm.get('unit')!.value);

		this.recordForm.addControl('pricebyratio', new FormControl(isNaN(pbr) ? 0 : pbr, [Validators.pattern("^[0-9]*([,.]{1}[0-9]{1,3}){0,1}$")]));
		this.recordForm.addControl('kcalby100', new FormControl(isNaN(kb1) ? 0 : kb1, [Validators.pattern("^[0-9]*([,.]{1}[0-9]{1,3}){0,1}$")]))
		this.recordForm.addControl('chipgrid', new FormControl())
	}
	// disabling checkboxes for shared records
	private _formControlsUpdate(): void {
		if (this.recordDetailsDraft.public) {
			this.recordForm.get('public')!.disable()
			this.recordForm.get('inactive')!.disable()
		}
	}
}