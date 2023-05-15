import { Component } from '@angular/core';
import { Observable, Subject, map, startWith } from 'rxjs';
import { AppService } from 'src/app/services/app.service';
import { FdService, MaterialChannelResult } from '../../fd.service';
import { IMaterialsRecordOption } from 'src/app/interfaces/Sp';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IMaterialsRecipe } from 'src/app/interfaces/Fd';
import { RecipeMaterialDetailsService } from './recipe-material-details.service';
import { HttpParams } from '@angular/common/http';

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
		private _appService: AppService,
		private _fdService: FdService,
		public _materialsService: RecipeMaterialDetailsService) {

		this.recordDetailsDraft = this._materialsService.recordDetails
	}

	ngOnInit(): void {
		// subs
		this._fdService.materialProductListChannel = new Subject<MaterialChannelResult>;
		this._fdService.materialProductListChannel.subscribe(result => { this.showProductDetails(result); });
		this._fdService.materialProductDetailsChannel = new Subject<MaterialChannelResult>;
		this._fdService.materialProductDetailsChannel.subscribe(result => { this.updateFieldsWithSelectedRecord(result); });
		this.genctrl(this.recordForm);
	}

	ngOnDestroy(): void {
		// subs
		this._fdService.materialProductListChannel.complete();
		this._fdService.materialProductDetailsChannel.complete();
	}

	// resultado da chamada
	showProductDetails(result: MaterialChannelResult): void {
		if (result.sucess) {
			this.optionsList = result.matrecordList!
			this.filteredOptions = this.recordForm.get('title')!.valueChanges.pipe(
				startWith(this.recordForm.get('title')!.value),
				map(value => this._filter(value || ''))
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

	optionSelected(event: any) {
		this._materialsService.API('matrecorddetails',
			new HttpParams()
				.set('operation', 'matrecorddetails')
				.set('stamp', event.option.value)
				.set('owner', this._appService.userInfo.username)
				.set('cookie', this._appService.userInfo.cookie));
		//chamada api a pedir os detalhes do produto selecionado
	}

	updateFieldsWithSelectedRecord(result: MaterialChannelResult) {
		this._materialsService.previewImage = result.record!.image;

		Object.keys(this.recordForm.controls).forEach(control => {
			if (control === 'qtd') { this.recordForm.get('qtd')!.setValue(1); return }
			if (control === 'originstamp') { this.recordForm.get('originstamp')!.setValue(result.record!.stamp); return }
			if (control === 'stamp' || control === 'origin' || control === 'recipestamp') { return }
			if (control === 'qtdbyweight') { this.recordForm.get('qtdbyweight')!.setValue(false); return }
			this.recordForm.get(control)?.setValue(result.record![control as keyof typeof result.record], { emitEvent: false })

		});
	}

	focusOut() {
		// perda de foco no autocomplete. vai verificar se a opção selecionada existe. caso nao, mete o autocomplete invalido
		if (!this.optionsList.find(option => option.title === this.recordForm.get('title')!.value)) {
			this.recordForm.get('title')!.setErrors({ 'incorrect': true });
			return
		}
	}

	saveline() {
		const recipe: IMaterialsRecipe = { stamp: '', origin: '', originstamp: '', recipestamp: '', title: '', kcal: 0, unit: '', unitvalue: 0, price: 0, owner: '', qtd: 1, image: '' }

		recipe.stamp = this.recordForm.get('stamp')!.value
		recipe.origin = this.recordForm.get('origin')!.value
		recipe.originstamp = this.recordForm.get('originstamp')!.value
		recipe.recipestamp = this.recordForm.get('recipestamp')!.value
		recipe.title = this.recordForm.get('title')!.value
		recipe.kcal = this.recordForm.get('kcal')!.value
		recipe.unit = this.recordForm.get('unit')!.value
		recipe.unitvalue = this.recordForm.get('unitvalue')!.value
		recipe.price = this.recordForm.get('price')!.value
		recipe.owner = this.recordForm.get('owner')!.value
		recipe.qtd = this.recordForm.get('qtd')!.value
		recipe.image = this.recordForm.get('image')!.value

		this._fdService.RecipeMaterialEditChannelFire(recipe)
	}

	getUnitvalueLabel(unitvalue:string):string{
		let label = "";

		switch(unitvalue){
			case 'g':
			label = "gramas"
			break;
			case 'kg':
			label = "kilogramas"
			break;
			case 'l':
			label = "litros"
			break;
			case 'ml':
			label = "mililitros"
			break;
		}
		return label;
	}


	private _filter(value: string): IMaterialsRecordOption[] {
		const filterValue = value.toLowerCase();

		return this.optionsList.filter(option => option.title.toLowerCase().includes(filterValue));
	}


}
