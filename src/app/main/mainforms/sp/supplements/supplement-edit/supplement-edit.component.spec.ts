import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplementEditComponent } from './supplement-edit.component';

describe('SupplementEditComponent', () => {
  let component: SupplementEditComponent;
  let fixture: ComponentFixture<SupplementEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupplementEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplementEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
