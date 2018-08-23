import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'app-tokenflow',
	templateUrl: './tokenflow.component.html',
	styleUrls: ['./tokenflow.component.scss']
})
export class TokenflowComponent implements OnInit {
	
	pdfSrc = '../assets/files/peerbudsTokenFlow.pdf';
	
	constructor() { }
	
	ngOnInit() {
	}
	
}
