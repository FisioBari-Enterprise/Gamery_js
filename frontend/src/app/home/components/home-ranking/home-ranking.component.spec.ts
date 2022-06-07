import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeRankingComponent } from './home-ranking.component';

describe('HomeRankingComponent', () => {
  let component: HomeRankingComponent;
  let fixture: ComponentFixture<HomeRankingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeRankingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeRankingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
