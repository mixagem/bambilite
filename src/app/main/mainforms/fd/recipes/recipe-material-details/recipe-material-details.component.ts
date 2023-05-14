import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable, Subject, map, startWith } from 'rxjs';
import { AppService } from 'src/app/services/app.service';
import { FdService, MaterialDetailsChannelResult, RecipeChannelResult } from '../../fd.service';
import { RecipesService } from '../recipes.service';
import { IMaterialsRecordOption } from 'src/app/interfaces/Sp';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IMaterialsRecipe } from 'src/app/interfaces/Fd';
import { RecipeMaterialDetailsService } from './recipe-material-details.service';

@Component({
	selector: 'bl-recipe-material-details',
	templateUrl: './recipe-material-details.component.html',
	styleUrls: ['./recipe-material-details.component.scss']
})

export class RecipeMaterialDetailsComponent {
	recordDetailsDraft: IMaterialsRecipe;

	// progress bar control
	loadingComplete: boolean = false;

	// deleting status control
	deletingRecord: boolean = false;

	// form
	recordForm: FormGroup = new FormGroup({});

	optionsList: IMaterialsRecordOption[] = [];
	filteredOptions: Observable<IMaterialsRecordOption[]> = new Observable<IMaterialsRecordOption[]>;


	constructor(
		private _recipesService: RecipesService,
		private _dialogRef: MatDialogRef<any>,
		private _appService: AppService,
		private _fdService: FdService,
		private _materialsService: RecipeMaterialDetailsService) {

		this.recordDetailsDraft = this._materialsService.recordDetails

	}

	ngOnInit(): void {
		// subs
		this._fdService.materialDetailsChannel = new Subject<MaterialDetailsChannelResult>;
		this._fdService.materialDetailsChannel.subscribe(result => { this.showProductDetails(result); });

		this.genctrl(this.recordForm);
	}

	ngOnDestroy(): void {
		// subs
		this._fdService.materialDetailsChannel.complete();
	}

	// fire details modal
	showProductDetails(result: MaterialDetailsChannelResult): void {

		if (result.sucess) {
			this.optionsList = result.recordList!
			this.filteredOptions = this.recordForm.get('title')!.valueChanges.pipe(
				startWith(''),
				map(value => this._filter(value || '')),
			);
		} else {
			console.error('bambilite connection error: ' + result.details);
		}

		this.loadingComplete = true;
	}

	genctrl(form: FormGroup) {
		Object.keys(this.recordDetailsDraft).forEach(key => {
			switch (key) {
				case 'title':
					// required fields
					form.addControl(key, new FormControl(this.recordDetailsDraft[key], [Validators.required]));
					break;
				case 'kcal':
				case 'price':
					// number patterns validator
					form.addControl(key, new FormControl(this.recordDetailsDraft[key], [Validators.pattern("^[0-9]*([,.]{1}[0-9]{1,3}){0,1}$")]));
					break;
				case 'qtd':
					form.addControl(key, new FormControl(this.recordDetailsDraft[key], [Validators.required, Validators.pattern("^[0-9]*([,.]{1}[0-9]{1,3}){0,1}$")]));
					break;
				default:
					form.addControl(key, new FormControl(this.recordDetailsDraft[key as keyof typeof this.recordDetailsDraft]));
			}
		});
		form.addControl('qtdbyweight', new FormControl(false))
	}

	private _filter(value: string): IMaterialsRecordOption[] {
		const filterValue = value.toLowerCase();

		return this.optionsList.filter(option => option.title.toLowerCase().includes(filterValue));
	}
}
