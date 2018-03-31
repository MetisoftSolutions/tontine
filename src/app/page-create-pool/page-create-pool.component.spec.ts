import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageCreatePoolComponent } from './page-create-pool.component';

describe('PageCreatePoolComponent', () => {
  let component: PageCreatePoolComponent;
  let fixture: ComponentFixture<PageCreatePoolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageCreatePoolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageCreatePoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
