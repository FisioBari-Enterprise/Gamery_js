import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompleteLevelComponent } from './complete-level.component';

describe('CompleteLevelComponent', () => {
  let component: CompleteLevelComponent;
  let fixture: ComponentFixture<CompleteLevelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompleteLevelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompleteLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
