import { Component, OnInit, Input, ViewChild, ViewContainerRef, OnChanges } from '@angular/core';
import { MatButtonToggleChange, MatBottomSheet } from '@angular/material';
import { MatDialog } from '@angular/material/dialog';
import { CorestackService } from '../../../_services/corestack/corestack.service';
import { BlockchainKeysComponent } from './blockchain-keys/blockchain-keys.component';
import { LabCredentialsComponent } from './lab-credentials/lab-credentials.component';


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
    private matDialog: MatDialog
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
          if (corestackConfig.keys && corestackConfig.keys.private_keys) {
            this.keys = corestackConfig.keys.private_keys;
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

  openBottomSheet() {
    this.matDialog.open(BlockchainKeysComponent, {
      data: this.keys,
      width: '75vw',
      // backdropClass: 'invisible-backdrop'
    });
  }

  openLoginInfo() {
    let userAccessDetails;
    switch (this.selectedTab) {
      case 'code':
        console.log('refresh ice coder');
        userAccessDetails = this.ice_coder_settings;
        break;
      case 'compile':
        userAccessDetails = this.ice_coder_settings;
        break;
      default:
        break;
    }

    this.matDialog.open(LabCredentialsComponent, {
      data: userAccessDetails,
      width: '30vw'
      // backdropClass: 'invisible-backdrop'
    });
  }

}
