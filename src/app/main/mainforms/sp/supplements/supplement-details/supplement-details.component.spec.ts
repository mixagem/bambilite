import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplementDetailsComponent } from './supplement-details.component';

describe('SupplementDetailsComponent', () => {
  let component: SupplementDetailsComponent;
  let fixture: ComponentFixture<SupplementDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupplementDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplementDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
