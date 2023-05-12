import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/internal/Observable';
import { IDetailsSupplement } from 'src/app/interfaces/Sp';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavigationStart, Router } from '@angular/router';
import { HeaderService } from 'src/app/main/header/header.service';
import { BambiService } from 'src/app/services/bambi.service';
import { FdService, ProductChannelResult } from '../../../fd/fd.service';
import { ProductsService } from '../../../fd/products/products.service';
import { SupplementsService } from '../supplements.service';
import { SpService, SupplementChannelResult } from '../../sp.service';
import { Subject } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { MatChipInputEvent, MatChipEditedEvent } from '@angular/material/chips';
import { ImageUploadComponent } from 'src/app/components/image-upload/image-upload.component';
import { AppSnackComponent } from 'src/app/components/snackbars/app-snack/app-snack.component';


type AutocompleteOption = {
	title: string,
	value: string
}

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

	defaultOptions: AutocompleteOption[] = [
		{ title: "Grama (g)", value: "g" },
		{ title: "Kilograma (kg)", value: "kg" },
		{ title: "Mililitro (ml)", value: "ml" },
		{ title: "Litro (L)", value: "L" }
	]

	filteredOptions: Observable<AutocompleteOption[]> = new Observable<AutocompleteOption[]>;

	// mat-chips input separator
	readonly separatorKeysCodes = [ENTER, COMMA] as const;

	constructor(
		public supplementsService: SupplementsService,
		public router: Router,
		public bambiService: BambiService,
		private _dialog: MatDialog,
		private _snackBar: MatSnackBar,
		public spService: SpService,
		private _headerService: HeaderService) {


		// closing drawer on changing to a diffrent fd child
		router.events.forEach((event) => {
			if (event instanceof NavigationStart) {
				this.closeEditMode();
			}
		});

		// cloning last preview product
		this.recordDetailsDraft = this.supplementsService.recordDetails

		// supplementsService clone
		this.supplementsService.tempB64Img = this.recordDetailsDraft.image;

		// form control gen
		this.generateFormControls();
	}

	ngOnInit(): void {
		this.formControlsUpdate();
		// disabling header search input
		this._headerService.inputsForm.get('simpleQueryFormControl')!.disable({ emitEvent: false });

		// subs
		this.spService.supplementUpdateChannel = new Subject<SupplementChannelResult>;
		this.spService.supplementUpdateChannel.subscribe(result => { this.saveFinished(result); });


	}

	ngOnDestroy(): void {
		// subs
		this.spService.supplementUpdateChannel.complete();
		// wise to clean any images that are not used
		this.supplementsService.tempB64Img = '';
		// re-enabling header search input
		this._headerService.inputsForm.get('simpleQueryFormControl')!.enable({ emitEvent: false });
	}

	discardPrompt(operation: 'open' | 'close'): void {

		switch (operation) {
			case 'open':
				this.recordForm.disable({emitEvent:false})
				this.isDiscarding = true;
				break;
			case 'close':
				this.recordForm.enable({emitEvent:false})
				this.isDiscarding = false;
				break;
		}
	}

	generateFormControls(): void {
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

		let pbr = this.spService.GetPriceByRatio(this.recordForm.get('price')!.value, this.recordForm.get('unitvalue')!.value, this.recordForm.get('unit')!.value);
		let kb1 = this.spService.GetKcalBy100(this.recordForm.get('kcal')!.value, this.recordForm.get('unitvalue')!.value, this.recordForm.get('unit')!.value);

		this.recordForm.addControl('pricebyratio', new FormControl(isNaN(pbr) ? 0 : pbr, [Validators.pattern("^[0-9]*([,.]{1}[0-9]{1,3}){0,1}$")]));
		this.recordForm.addControl('kcalby100', new FormControl(isNaN(kb1) ? 0 : kb1, [Validators.pattern("^[0-9]*([,.]{1}[0-9]{1,3}){0,1}$")]))
		this.recordForm.addControl('chipgrid', new FormControl())
	}

	saveRecord(): void {
		this.loadingComplete = false;
		this.isNewRecord = !this.recordDetailsDraft.stamp

		this.recordDetailsDraft.timestamp = Date.now();
		this.recordDetailsDraft.image = this.supplementsService.tempB64Img;
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
				.set('cookie', this.bambiService.userInfo.cookie)
				.set('owner', this.bambiService.userInfo.username)
				.set('record', JSON.stringify(this.recordDetailsDraft))

		this.supplementsService.API(operation, httpParams)
	}

	// triggered by the response from the update product call
	saveFinished(result: ProductChannelResult): void {
		this.loadingComplete = true;
		// disparar snackbars aqui?
		if (result.sucess) {
			this.closeEditMode(true);
			this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, panelClass: ['app-snackbar', `${this.bambiService.appTheme}-snack`], horizontalPosition: 'end', data: { label: this.isNewRecord ? 'APPSNACKS.SUPPLEMENTCREATED' : 'APPSNACKS.SUPPLEMENTUPDATED', emoji: '🥝' } });
		}
		else {
			switch (result.details) {
				case 'product-not-found':
					this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, panelClass: ['app-snackbar', `${this.bambiService.appTheme}-snack`], horizontalPosition: 'end', data: { label: 'APPSNACKS.SUPPLEMENT-NOTFOUND', emoji: '🚫' } });
					return;
				case 'user-not-owner':
					this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, panelClass: ['app-snackbar', `${this.bambiService.appTheme}-snack`], horizontalPosition: 'end', data: { label: 'APPSNACKS.USER-NOTOWNER', emoji: '🚫' } });
					return;
				case 'offline': default:
					this._snackBar.openFromComponent(AppSnackComponent, { duration: 5000, panelClass: ['app-snackbar', `${this.bambiService.appTheme}-snack`], horizontalPosition: 'end', data: { label: 'APPSNACKS.UNREACHABLESERVER', emoji: '🚧' } });
					return;
			}
		}

	}

	// triggered when update product api call is over, and also when discarding changes
	closeEditMode(updatedProduct: boolean = false): void {
		// drawer closing animation
		this.spService.drawerFadeout = true;
		setTimeout(() => {
			this.spService.drawerOpen = false;
			this.spService.drawerFadeout = false;
		}, 1000);

		if (updatedProduct) {
			this.supplementsService.API('getlist',
				new HttpParams()
					.set('operation', 'getlist')
					.set('owner', this.bambiService.userInfo.username)
					.set('cookie', this.bambiService.userInfo.cookie));
		}
	}

	// disabling checkboxes for shared records
	formControlsUpdate(): void {
		if (this.recordDetailsDraft.public) {
			this.recordForm.get('public')!.disable()
			this.recordForm.get('inactive')!.disable()
		}
	}

	// imagepicker
	newPicUpload(): void {
		this._dialog.open(ImageUploadComponent, { width: '50vw', height: '400px', panelClass: [this.bambiService.appTheme + '-theme'] });
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


}






