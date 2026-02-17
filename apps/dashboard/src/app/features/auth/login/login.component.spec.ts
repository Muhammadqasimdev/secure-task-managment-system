import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a form with email and password', () => {
    expect(component.form.get('email')).toBeTruthy();
    expect(component.form.get('password')).toBeTruthy();
  });

  it('should require email and password', () => {
    expect(component.form.valid).toBeFalsy();
    component.form.patchValue({ email: 'test@example.com', password: 'pass' });
    expect(component.form.valid).toBe(true);
  });
});
