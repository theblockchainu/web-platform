import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-console-teaching-accreditation',
  templateUrl: './console-teaching-accreditation.component.html',
  styleUrls: ['./console-teaching-accreditation.component.scss']
})
export class ConsoleTeachingAccreditationComponent implements OnInit {

  loaded: boolean;
  accreditationArray: Array<any>;

  constructor() { }

  ngOnInit() {
  }

}
