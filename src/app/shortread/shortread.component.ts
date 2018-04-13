import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'app-shortread',
	templateUrl: './shortread.component.html',
	styleUrls: ['./shortread.component.scss']
})
export class ShortreadComponent implements OnInit {
	
	pdfSrc = '../assets/files/peerbudsShortread.pdf';
	
	constructor() { }
	
	ngOnInit() {
	
	}
	
}
