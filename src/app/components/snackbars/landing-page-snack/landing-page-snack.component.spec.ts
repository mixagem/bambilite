import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingPageSnackComponent } from './landing-page-snack.component';

describe('LandingPageSnackComponent', () => {
	let component: LandingPageSnackComponent;
	let fixture: ComponentFixture<LandingPageSnackComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [LandingPageSnackComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(LandingPageSnackComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
