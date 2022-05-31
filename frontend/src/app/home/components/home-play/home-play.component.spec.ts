import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomePlayComponent } from './home-play.component';

describe('HomePlayComponent', () => {
  let component: HomePlayComponent;
  let fixture: ComponentFixture<HomePlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomePlayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomePlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
