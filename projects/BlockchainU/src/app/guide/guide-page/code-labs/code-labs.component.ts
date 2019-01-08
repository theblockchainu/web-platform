import { Component, OnInit, Input, ViewChild, ViewContainerRef, OnChanges } from '@angular/core';
import { MatButtonToggleChange, MatBottomSheet, MatSnackBar } from '@angular/material';
import { MatDialog } from '@angular/material/dialog';
import { CorestackService } from '../../../_services/corestack/corestack.service';
import { BlockchainKeysComponent } from './blockchain-keys/blockchain-keys.component';

@Component({
	selector: 'app-code-labs',
	templateUrl: './code-labs.component.html',
	styleUrls: ['./code-labs.component.scss']
})
export class CodeLabsComponent implements OnInit, OnChanges {

	@Input() lab_details: Array<any>;
	selectedTab: string;
	ice_coder_settings: any;
	terminal_settings: any;
	keys: any;
	@ViewChild('codeContainer', { read: ViewContainerRef }) codeContainer: ViewContainerRef;

	constructor(
		private bottomSheet: MatBottomSheet,
		private corestackService: CorestackService,
		private matDialog: MatDialog,
		private snackBar: MatSnackBar
	) { }

	ngOnInit() {
		this.selectedTab = 'code';
		console.log(this.codeContainer);
	}

	ngOnChanges() {
		this.selectedTab = 'code';
		if (this.lab_details) {
			this.processCorestackData();
		}
	}


	private processCorestackData() {
		this.lab_details.forEach(corestackConfig => {
			console.log(corestackConfig);

			switch (corestackConfig.application_name) {
				case 'Webconsole':
					this.terminal_settings = corestackConfig;
					break;

				case 'Web IDE':
					this.ice_coder_settings = corestackConfig;

					break;
				case 'Additional Information':
					if (corestackConfig.keys) {
						const corestackKeys = JSON.parse(corestackConfig.keys);
						this.keys = corestackKeys.private_keys;
					}
					break;

				default:
					break;
			}

		});
	}

	gotoTab(event: MatButtonToggleChange) {
		if (this.selectedTab !== event.value) {
			this.selectedTab = event.value;
		}
	}

	refreshPage() {
		console.log(this.selectedTab);
		switch (this.selectedTab) {
			case 'code':
				console.log('refresh ice coder');
				const iceCoderIFrame = <HTMLIFrameElement>document.getElementById('iframe-ice-coder');
				iceCoderIFrame.src += '';
				break;
			case 'compile':
				console.log('refresh terminal');
				const terminalIFrame = <HTMLIFrameElement>document.getElementById('iframe-terminal');
				terminalIFrame.src += '';
				break;
			default:
				break;
		}

	}

	openKeysDialog() {
		this.matDialog.open(BlockchainKeysComponent, {
			data: this.keys,
			width: '75vw',
			// backdropClass: 'invisible-backdrop'
		});
	}

	public onCopySuccess(field: string) {
		this.snackBar.open(field + ' copied to clipboard', 'Close', {
			duration: 5000
		});
	}
}
