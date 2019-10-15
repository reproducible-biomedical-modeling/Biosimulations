import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimulateComponent } from './simulate.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('SimulateComponent', () => {
  let component: SimulateComponent;
  let fixture: ComponentFixture<SimulateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SimulateComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimulateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
