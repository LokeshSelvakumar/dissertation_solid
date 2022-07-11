import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestResubmitPageComponent } from './request-resubmit-page.component';

describe('RequestResubmitPageComponent', () => {
  let component: RequestResubmitPageComponent;
  let fixture: ComponentFixture<RequestResubmitPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequestResubmitPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestResubmitPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
