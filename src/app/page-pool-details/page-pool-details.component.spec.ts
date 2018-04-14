import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PagePoolDetailsComponent } from './page-pool-details.component';

describe('PagePoolDetailsComponent', () => {
  let component: PagePoolDetailsComponent;
  let fixture: ComponentFixture<PagePoolDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PagePoolDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PagePoolDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
