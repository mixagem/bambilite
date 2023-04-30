import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuplementationComponent } from './suplementation.component';

describe('SuplementationComponent', () => {
  let component: SuplementationComponent;
  let fixture: ComponentFixture<SuplementationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SuplementationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuplementationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
