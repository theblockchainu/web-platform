import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { MediaUploaderService } from '../../_services/mediaUploader/media-uploader.service';
import { MatSnackBar } from '@angular/material';
import { environment } from '../../../environments/environment';
import { DialogsService } from '../../_services/dialogs/dialog.service';
import { FileUpload } from 'primeng/fileupload';
import * as _ from 'lodash';

@Component({
  selector: 'app-custom-certificate-form',
  templateUrl: './custom-certificate-form.component.html',
  styleUrls: ['./custom-certificate-form.component.scss']
})

export class CustomCertificateFormComponent implements OnInit {

  public customCertificateForm: FormGroup;
  public uploadingImage: boolean;
  public urlForImages: Array<any>;
  public envVariable: any;
  public text_align: Array<string>;
  public fieldsArray: Array<FormGroup>;
  public expandedPanelIndex: number;
  public availableVariables: Array<string>;
  public logoFile: any;

  constructor(
    private _fb: FormBuilder,
    private mediaUploader: MediaUploaderService,
    private matSnackBar: MatSnackBar,
    private dialogsService: DialogsService
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
        font_size: [23],
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
        font_size: [15],
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
        font_size: [15],
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
        font_size: [15],
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
        font_size: [15],
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
        font_size: [15],
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
        font_size: [15],
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
        font_size: [100],
        name: ['logo'],
        icon: ['add_a_photo'],
        bold: [false],
        italic: [false],
        underline: [false],
        meta: ['']
      })
    ]);

    this.availableVariables = [
      'participantName',
      'topics',
      'assessmentResult',
      'issuerName',
      'difficultyLevel',
      'gyanEarned',
      'expiryDate'
    ];
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
      this.uploadingImage = false;
    };
    myReader.readAsDataURL(file);
  }

  deleteImage(controlIndex) {
    const groupArray = <FormArray>this.customCertificateForm.controls['groupArray'];
    const formGroup = <FormGroup>groupArray.controls[controlIndex];
    formGroup.controls['value'].reset();
  }

}
