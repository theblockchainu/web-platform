import { Component, OnInit, Input, ViewChild, Renderer2 } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { DialogsService } from '../../_services/dialogs/dialog.service';
import { Router } from '@angular/router';
import {environment} from '../../../environments/environment';
@Component({
  selector: 'app-profile-popup',
  templateUrl: './profile-popup.component.html',
  styleUrls: ['./profile-popup.component.scss']
})
export class ProfilePopupComponent implements OnInit {

  @Input() peer: any;
  @ViewChild('profilePic') profilePic;

  private dialogref: MatDialogRef<any>;
  public envVariable;

  constructor(
    public dialog: MatDialog,
    private _dialogsService: DialogsService,
    private _router: Router
  ) {
      this.envVariable = environment;
  }

  ngOnInit() {
  }

  openProfileDialog(event): void {
    console.log(event);
    const config = {
      hasBackdrop: false,
      width: '250px',
      data: this.peer,
      position: {
        left: (event.x + 20) + 'px',
        top: (event.y - 220) + 'px'
      }
    };
    this.dialogref = this._dialogsService.openProfilePopup(config);
  }

  public closeProfileDialog(): void {
    this.dialogref.close();
  }

  public openProfile() {
    this.dialogref.close();
    this._router.navigateByUrl('/profile/' + this.peer.id);
  }

}
