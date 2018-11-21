import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-intro-card',
  templateUrl: './intro-card.component.html',
  styleUrls: ['./intro-card.component.scss']
})
export class IntroCardComponent implements OnInit {

  @Input() learningPath: any;
  constructor() { }

  ngOnInit() {
  }

}
