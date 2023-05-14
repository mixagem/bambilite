import { Component, OnDestroy, OnInit } from '@angular/core';
import { IDetailsRecipe } from 'src/app/interfaces/Fd';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { AppService } from 'src/app/services/app.service';
import { FdService, RecipeChannelResult } from '../../fd.service';
import { Observable, Subject } from 'rxjs';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { NavigationStart, Router } from '@angular/router';
import { RecipesService } from '../recipes.service';
import { ImageUploadComponent } from 'src/app/components/image-upload/image-upload.component';
import { MatChipInputEvent, MatChipEditedEvent } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { HeaderService } from 'src/app/main/header/header.service';
import { AppSnackComponent } from 'src/app/components/snackbars/app-snack/app-snack.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RecordMeasuringType } from 'src/app/interfaces/Generic';

@Component({
	selector: 'bl-recipe-edit',
	templateUrl: './recipe-edit.component.html',
	styleUrls: ['./recipe-edit.component.scss']
})

export class RecipeEditComponent implements OnInit, OnDestroy {
	// record details clone (so we can freely change and discard changes without BD calls)
	recordDetailsDraft: IDetailsRecipe

	// form
	recordForm: FormGroup = new FormGroup({});

	// progress bar control
	loadingComplete: boolean = true;

	// operation type (new / update) control
	isNewRecord: boolean = false;

	// discard control
	isDiscarding: boolean = false;

	defaultOptions: RecordMeasuringType[] = [];
	filteredOptions: Observable<RecordMeasuringType[]> = new Observable<RecordMeasuringType[]>;

	// mat-chips input separator
	readonly separatorKeysCodes = [ENTER, COMMA] as const;

	constructor(
		private _appService: AppService,
		private _dialog: MatDialog,
		private _snackBar: MatSnackBar,
		private _router: Router,
		private _recipesService: RecipesService,
		private _fdService: FdService,
		private _headerService: HeaderService) {

		this.recordDetailsDraft = this._recipesService.recordDetails
	}

	ngOnInit(): void {

		// subs
		this._fdService.recipeUpdateChannel = new Subject<RecipeChannelResult>;
		this._fdService.recipeUpdateChannel.subscribe(result => { this.saveFinished(result); });

		// closing drawer on changing to a diffrent fd child
		this._router.events.forEach((event) => { if (event instanceof NavigationStart) { this.closeEditMode(); } });

		// _recipesService clone
		this._recipesService.tempB64Img = this.recordDetailsDraft.image;

		// autocompelte options
		this.defaultOptions = this._appService.GetDefaultMeasuringTypeOptions()

		// form control gen
		this._generateFormControls();

		this._formControlsUpdate();

		// disabling header search input
		this._headerService.inputsForm.get('simpleQueryFormControl')!.disable({ emitEvent: false });

	}

	ngOnDestroy(): void {
		// subs
		this._fdService.productUpdateChannel.complete();
		// wise to clean any images that are not used
		this._recipesService.tempB64Img = '';
		// re-enabling header search input
		this._headerService.inputsForm.get('simpleQueryFormControl')!.enable({ emitEvent: false });
	}

	router(property: string): any { return this._router[`${property}` as keyof typeof this._router] };

	recipesService(property: string): any { return this._recipesService[`${property}` as keyof typeof this._recipesService] };

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
		this.recordDetailsDraft.image = this._recipesService.tempB64Img;
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

		this._recipesService.API(operation, httpParams)
	}

	// triggered by the response from the update product call
	saveFinished(result: RecipeChannelResult): void {

		this.loadingComplete = true;
		// disparar snackbars aqui?
		if (result.sucess) {
			this.closeEditMode(true);
			this._snackBar.openFromComponent(AppSnackComponent, { duration: 3000, panelClass: ['app-snackbar', `${this._appService.appTheme}-snack`], horizontalPosition: 'end', data: { label: this.isNewRecord ? 'SNACKS.NEW-RECIPE' : 'SNACKS.UPDATED-RECIPE', emoji: '🥝' } });
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

	// triggered when update record api call is over, and also when discarding changes
	closeEditMode(updatedRecord: boolean = false): void {
		// drawer closing animation
		this._fdService.drawerFadeout = true;
		setTimeout(() => {
			this._fdService.drawerOpen = false;
			this._fdService.drawerFadeout = false;
		}, 1000);

		if (updatedRecord) {
			this._recipesService.API('getlist',
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

		const pbr = this._fdService.GetPriceByRatio(this.recordForm.get('price')!.value, this.recordForm.get('unitvalue')!.value, this.recordForm.get('unit')!.value);
		const kb1 = this._fdService.GetKcalBy100(this.recordForm.get('kcal')!.value, this.recordForm.get('unitvalue')!.value, this.recordForm.get('unit')!.value);

		this.recordForm.addControl('pricebyratio', new FormControl(isNaN(pbr) ? 0 : pbr, [Validators.pattern("^[0-9]*([,.]{1}[0-9]{1,3}){0,1}$")]));
		this.recordForm.addControl('kcalby100', new FormControl(isNaN(kb1) ? 0 : kb1, [Validators.pattern("^[0-9]*([,.]{1}[0-9]{1,3}){0,1}$")]))
		this.recordForm.addControl('chipgrid', new FormControl())
	}

	private _formControlsUpdate(): void {
		if (this.recordDetailsDraft.public) {
			this.recordForm.get('public')!.disable()
			this.recordForm.get('inactive')!.disable()
		}
	}
}
