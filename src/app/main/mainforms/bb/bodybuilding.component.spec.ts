import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BodybuildingComponent } from './bodybuilding.component';

describe('BodybuildingComponent', () => {
  let component: BodybuildingComponent;
  let fixture: ComponentFixture<BodybuildingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BodybuildingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BodybuildingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
