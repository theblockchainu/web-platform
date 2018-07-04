import { Component, OnInit, EventEmitter, Output, Input, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { MediaUploaderService } from '../../_services/mediaUploader/media-uploader.service';
import { MatSnackBar } from '@angular/material';
import { environment } from '../../../environments/environment';
import { DialogsService } from '../../_services/dialogs/dialog.service';
import { FileUpload } from 'primeng/fileupload';
import * as _ from 'lodash';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs/observable';
import { timer } from 'rxjs/observable/timer';
@Component({
	selector: 'app-custom-certificate-form',
	templateUrl: './custom-certificate-form.component.html',
	styleUrls: ['./custom-certificate-form.component.scss']
})

export class CustomCertificateFormComponent implements OnInit {
	busySavingData = false;
	public customCertificateForm: FormGroup;
	public uploadingImage: boolean;
	public urlForImages: Array<any>;
	public envVariable: any;
	public text_align: Array<string>;
	public fieldsArray: Array<FormGroup>;
	public expandedPanelIndex: number;
	public availableVariables: Array<VariableObject>;
	public qrcode = '/assets/images/peerbuds-qr.png';
	@Input() formData: any;

	@Output() back = new EventEmitter<any>();
	@Output() next = new EventEmitter<any>();

	@ViewChild('certificate') certificate: ElementRef;


	constructor(
		private _fb: FormBuilder,
		private mediaUploader: MediaUploaderService,
		private matSnackBar: MatSnackBar,
		private dialogsService: DialogsService,
		private renderer: Renderer2,
		private domSanitizer: DomSanitizer
	) {
		this.envVariable = environment;
	}

	ngOnInit() {
		this.customCertificateForm = this._fb.group({
			groupArray: this._fb.array([])
		});
		this.urlForImages = [];
		this.text_align = [
			'center', 'left', 'right', 'justify'
		];

		this.fieldsArray = ([
			this._fb.group({
				text_alignment: ['center'],
				color: ['#000000'],
				value: [''],
				font_size: [2],
				name: ['text'],
				icon: ['text_fields'],
				bold: [false],
				italic: [false],
				underline: [false],
				meta: ['']
			}),
			this._fb.group({
				text_alignment: ['center'],
				color: ['#000000'],
				value: [''],
				font_size: [1],
				name: ['multi-line'],
				icon: ['format_align_left'],
				bold: [false],
				italic: [false],
				underline: [false],
				meta: ['']
			}),
			this._fb.group({
				text_alignment: ['center'],
				color: ['#000000'],
				value: [''],
				font_size: [1],
				name: ['date'],
				icon: ['insert_invitation'],
				bold: [false],
				italic: [false],
				underline: [false],
				meta: ['']
			}),
			this._fb.group({
				text_alignment: ['center'],
				color: ['#000000'],
				value: ['', [Validators.email]],
				font_size: [1],
				name: ['email'],
				icon: ['email'],
				bold: [false],
				italic: [false],
				underline: [false],
				meta: ['']
			}),
			this._fb.group({
				text_alignment: ['center'],
				color: ['#000000'],
				value: [''],
				font_size: [1],
				name: ['url'],
				icon: ['link'],
				bold: [false],
				italic: [false],
				underline: [false],
				meta: ['']
			}),
			this._fb.group({
				text_alignment: ['center'],
				color: ['#000000'],
				value: [''],
				font_size: [1],
				name: ['number'],
				icon: ['looks_one'],
				bold: [false],
				italic: [false],
				underline: [false],
				meta: ['']
			}),
			this._fb.group({
				text_alignment: ['center'],
				color: ['#777777'],
				value: [''],
				font_size: [1],
				name: ['variable'],
				icon: ['code'],
				bold: [false],
				italic: [false],
				underline: [false],
				meta: [''],
			}),
			this._fb.group({
				text_alignment: ['center'],
				color: ['#000000'],
				value: [''],
				font_size: [6],
				name: ['logo'],
				icon: ['add_a_photo'],
				bold: [false],
				italic: [false],
				underline: [false],
				meta: ['']
			})
		]);

		this.availableVariables = [
			{
				name: 'Participant Name',
				value: '{{participantName}}'
			}, {
				name: 'Topics',
				value: '{{topics}}'
			}, {
				name: 'Assessment Result',
				value: '{{assessmentResult}}'
			}, {
				name: 'Issuer Name',
				value: '{{issuerName}}'
			}, {
				name: 'Difficulty Level',
				value: '{{difficultyLevel}}'
			}, {
				name: 'Gyan Earned',
				value: '{{gyanEarned}}'
			}, {
				name: 'Expiry Date',
				value: '{{expiryDate}}'
			}
		];

		if (this.formData) {
			console.log(this.formData);
			this.formData.groupArray.forEach(group => {
				const control = <FormGroup>this.fieldsArray.find((fg: FormGroup) => {
					console.log(fg);
					if (fg.controls['name'].value === group.name) {
						return true;
					}
				});
				control.patchValue(group);
				const groupArray = <FormArray>this.customCertificateForm.controls['groupArray'];
				groupArray.push(control);
			});
		}
	}

	add() {
		this.dialogsService.viewFields(this.fieldsArray).subscribe(
			(field: FormGroup) => {
				if (field) {
					const groupArray = <FormArray>this.customCertificateForm.controls['groupArray'];
					const fieldGroup = <FormGroup>_.cloneDeep(field);
					groupArray.push(fieldGroup);
					console.log(this.customCertificateForm);
				}
			}
		);
	}

	toggleButton(event: any, controlIndex: number, controlName: string) {
		const groupArray = <FormArray>this.customCertificateForm.controls['groupArray'];
		const formGroup = <FormGroup>groupArray.controls[controlIndex];
		formGroup.controls[controlName].patchValue(!event.value);
		// formGroup.controls['value'].invalid
		// console.log(this.customCertificateForm.value);
	}

	deleteField(event: any, controlIndex: number) {
		const groupArray = <FormArray>this.customCertificateForm.controls['groupArray'];
		groupArray.removeAt(controlIndex);
	}

	toggleExpansion(index: number) {
		if (this.expandedPanelIndex === index) {
			this.expandedPanelIndex = -1;
		} else {
			this.expandedPanelIndex = index;
		}
	}

	up(controlIndex: number) {
		const groupArray = <FormArray>this.customCertificateForm.controls['groupArray'];
		if (groupArray.length > 1 && controlIndex > 0) {
			const formGroup1 = groupArray.controls[controlIndex];
			const formGroup2 = groupArray.controls[controlIndex - 1];
			groupArray.removeAt(controlIndex);
			groupArray.removeAt(controlIndex - 1);
			groupArray.insert(controlIndex, formGroup2);
			groupArray.insert(controlIndex - 1, formGroup1);
			if (this.expandedPanelIndex === controlIndex) {
				this.expandedPanelIndex = controlIndex - 1;
			} else if (this.expandedPanelIndex === controlIndex - 1) {
				this.expandedPanelIndex = controlIndex;
			}
		}
	}

	down(controlIndex: number) {
		const groupArray = <FormArray>this.customCertificateForm.controls['groupArray'];
		if (groupArray.length > 1 && controlIndex < groupArray.length - 1) {
			const formGroup1 = groupArray.controls[controlIndex];
			const formGroup2 = groupArray.controls[controlIndex + 1];
			groupArray.removeAt(controlIndex + 1);
			groupArray.removeAt(controlIndex);
			groupArray.insert(controlIndex, formGroup2);
			groupArray.insert(controlIndex + 1, formGroup1);
			if (this.expandedPanelIndex === controlIndex) {
				this.expandedPanelIndex = controlIndex + 1;
			} else if (this.expandedPanelIndex === controlIndex + 1) {
				this.expandedPanelIndex = controlIndex;
			}
		}
	}

	encodeImageFileAsURL(event, controlIndex) {
		this.uploadingImage = true;
		const groupArray = <FormArray>this.customCertificateForm.controls['groupArray'];
		const formGroup = <FormGroup>groupArray.controls[controlIndex];
		const fileList: FileList = event.target.files;
		const file: File = fileList.item(0);
		const myReader: FileReader = new FileReader();
		myReader.onloadend = (e) => {
			formGroup.controls['value'].patchValue(myReader.result);
			formGroup.controls['meta'].patchValue(file.name);
			this.uploadingImage = false;
		};
		myReader.readAsDataURL(file);
	}

	deleteImage(controlIndex) {
		const groupArray = <FormArray>this.customCertificateForm.controls['groupArray'];
		const formGroup = <FormGroup>groupArray.controls[controlIndex];
		formGroup.controls['value'].reset();
		formGroup.controls['meta'].reset();
	}

	cancel() {
		this.back.next(true);
	}

	submitCertificate() {
		this.busySavingData = true;
		this.qrcode = '{{QRCode}}';
		timer(500).subscribe(res => {
			const nativeElement: Element = this.certificate.nativeElement;
			// console.log(nativeElement.outerHTML);
			this.next.emit({
				formData: this.customCertificateForm.value,
				htmlData: nativeElement.outerHTML
			});
			this.busySavingData = false;
		});
	}

}

interface VariableObject {
	name: string;
	value: string;
}
