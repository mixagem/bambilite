import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderBreadcumbsComponent } from './header-breadcumbs.component';

describe('HeaderBreadcumbsComponent', () => {
  let component: HeaderBreadcumbsComponent;
  let fixture: ComponentFixture<HeaderBreadcumbsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeaderBreadcumbsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderBreadcumbsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
