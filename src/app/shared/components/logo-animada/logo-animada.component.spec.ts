import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoAnimadaComponent } from './logo-animada.component';

describe('LogoAnimadaComponent', () => {
  let component: LogoAnimadaComponent;
  let fixture: ComponentFixture<LogoAnimadaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogoAnimadaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogoAnimadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
