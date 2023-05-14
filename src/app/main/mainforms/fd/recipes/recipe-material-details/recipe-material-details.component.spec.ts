import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeMaterialDetailsComponent } from './recipe-material-details.component';

describe('RecipeMaterialDetailsComponent', () => {
  let component: RecipeMaterialDetailsComponent;
  let fixture: ComponentFixture<RecipeMaterialDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecipeMaterialDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeMaterialDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
