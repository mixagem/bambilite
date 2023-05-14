import { Component, Input } from '@angular/core';
import { IMaterialsProduct, IMaterialsRecipe } from 'src/app/interfaces/Fd';

@Component({
  selector: 'bl-record-details-mats-table',
  templateUrl: './record-details-mats-table.component.html',
  styleUrls: ['./record-details-mats-table.component.scss']
})

export class RecordDetailsMatsTableComponent {
	@Input() tableContent: IMaterialsRecipe[] | IMaterialsProduct[] = [];
}
