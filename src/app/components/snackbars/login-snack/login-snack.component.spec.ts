import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginSnackComponent } from './login-snack.component';

describe('LoginSnackComponent', () => {
	let component: LoginSnackComponent;
	let fixture: ComponentFixture<LoginSnackComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [LoginSnackComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(LoginSnackComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
