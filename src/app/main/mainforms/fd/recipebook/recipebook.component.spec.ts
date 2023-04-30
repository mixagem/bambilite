import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipebookComponent } from './recipebook.component';

describe('RecipebookComponent', () => {
  let component: RecipebookComponent;
  let fixture: ComponentFixture<RecipebookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecipebookComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipebookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
