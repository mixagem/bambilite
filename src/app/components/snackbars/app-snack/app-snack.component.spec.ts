import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppSnackComponent } from './app-snack.component';

describe('AppSnackComponent', () => {
  let component: AppSnackComponent;
  let fixture: ComponentFixture<AppSnackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppSnackComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppSnackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
