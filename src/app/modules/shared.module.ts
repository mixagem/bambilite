import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecordDetailsMatsTableComponent } from '../components/record-details-mats-table/record-details-mats-table.component';

@NgModule({
	declarations: [
		RecordDetailsMatsTableComponent
	],

	imports: [
		CommonModule
	],

	exports: [
		RecordDetailsMatsTableComponent
	]
})

export class SharedModule { }
