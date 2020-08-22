import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceHomeFeaturesComponent } from './resource-home-features.component';

describe('ResourceHomeFeaturesComponent', () => {
  let component: ResourceHomeFeaturesComponent;
  let fixture: ComponentFixture<ResourceHomeFeaturesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ResourceHomeFeaturesComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResourceHomeFeaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
