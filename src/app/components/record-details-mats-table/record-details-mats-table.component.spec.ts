import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordDetailsMatsTableComponent } from './record-details-mats-table.component';

describe('RecordDetailsMatsTableComponent', () => {
  let component: RecordDetailsMatsTableComponent;
  let fixture: ComponentFixture<RecordDetailsMatsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecordDetailsMatsTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecordDetailsMatsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
