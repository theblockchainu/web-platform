import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {environment} from '../../../../environments/environment';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {RequestPasswordDialogComponent} from '../forgot-pwd-dialog/forgot-pwd-dialog.component';

@Component({
	selector: 'app-confirm-password-dialog',
	templateUrl: './confirm-password-dialog.component.html',
	styleUrls: ['./confirm-password-dialog.component.scss']
})
export class ConfirmPasswordDialogComponent implements OnInit {
	
	public envVariable;
	public passwordForm: FormGroup;
	
	constructor(
		public dialogRef: MatDialogRef<ConfirmPasswordDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public _fb: FormBuilder,
		private dialog: MatDialog
	) {
		this.envVariable = environment;
	}
	
	ngOnInit() {
		this.passwordForm = this._fb.group({
			password: ['', Validators.required]
		});
	}
	
	public confirmPassword() {
		this.dialogRef.close(this.passwordForm.value);
	}
	
	public openForgotPasswordDialog() {
		const dialogRef = this.dialog.open(RequestPasswordDialogComponent, {
			panelClass: 'responsive-dialog'
		});
		return dialogRef.afterClosed();
	}
	
}
