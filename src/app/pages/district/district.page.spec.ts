import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DistrictPage } from './district.page';

describe('DistrictPage', () => {
  let component: DistrictPage;
  let fixture: ComponentFixture<DistrictPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DistrictPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DistrictPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
