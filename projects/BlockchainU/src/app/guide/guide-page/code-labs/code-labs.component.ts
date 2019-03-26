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
	@Input() corestack_student: any;
	selectedTab: string;
	ice_coder_settings: any;
	terminal_settings: any;
	additional_information: any;
	accountData = {};
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
					this.additional_information = corestackConfig;
					if (corestackConfig.keys) {
						const corestackKeys = JSON.parse(corestackConfig.keys);
						this.accountData['keys'] = corestackKeys.private_keys;
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
		this.accountData.blockchainUrl = this.ice_coder_settings.auth_url + ':8545';
		this.accountData.webAppUrl = this.ice_coder_settings.auth_url + '/client/src/';
			this.matDialog.open(BlockchainKeysComponent, {
			data: this.accountData,
			width: '75vw',
			height: '90vh',
			panelClass: 'responsive-dialog'
			// backdropClass: 'invisible-backdrop'
		});
	}

	stopInstance() {
		this.corestackService.stopInstance(this.corestack_student.student_id, this.corestack_student.course_id)
			.subscribe(res => {
				if (res.status === 'success') {
					this.snackBar.open('Your CodeLab is being stopped. You can always restart it by refreshing this page.', 'OK', {duration: 3000});
				} else {
					this.snackBar.open('Error stopping this CodeLab. Please try again.', 'OK', {duration: 3000});
				}
			}, err => {
				this.snackBar.open('Error stopping this CodeLab. Please try again.', 'OK', {duration: 3000});
			});
	}

	public onCopySuccess(field: string) {
		this.snackBar.open(field + ' copied to clipboard', 'Close', {
			duration: 5000
		});
	}
}
