import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdftronComponent } from './pdftron.component';

describe('PdftronComponent', () => {
  let component: PdftronComponent;
  let fixture: ComponentFixture<PdftronComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdftronComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdftronComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
