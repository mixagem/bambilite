import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExercisesCategoryComponent } from './exercises-category.component';

describe('ExercisesCategoryComponent', () => {
  let component: ExercisesCategoryComponent;
  let fixture: ComponentFixture<ExercisesCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExercisesCategoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExercisesCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
