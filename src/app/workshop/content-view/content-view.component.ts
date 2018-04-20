import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CountryPickerService } from '../../_services/countrypicker/countrypicker.service';
import { MediaUploaderService } from '../../_services/mediaUploader/media-uploader.service';
import { MatDialog } from '@angular/material';
import { WorkshopContentOnlineComponent } from '../workshop-content-online/workshop-content-online.component';
import { WorkshopContentProjectComponent } from '../workshop-content-project/workshop-content-project.component';
import { WorkshopContentVideoComponent } from '../workshop-content-video/workshop-content-video.component';
import { CollectionService } from '../../_services/collection/collection.service';
import { environment } from '../../../environments/environment';

declare var moment: any;

@Component({
  selector: 'app-itenary',
  templateUrl: 'content-view.component.html',
  styleUrls: ['./content-view.component.scss']
})
export class ContentViewComponent implements OnInit {
  // we will pass in address from App component
  @Input()
  public itenaryForm: FormGroup;
  @Input()
  public itenaryId: number;
  @Input()
  public collectionStartDate: any;
  @Input()
  public collectionEndDate: any;
  @Input()
  public workshopStatus: string;

  @Output()
  triggerSave: EventEmitter<any> = new EventEmitter<any>();

  public tempForm: FormGroup;
  public lastIndex: number;
  public dontAllow: true;
  public editIndex: number;
  public countries: any[];
  public filesToUpload: number;
  public envVariable;
  public filesUploaded: number;

  constructor(
    private _fb: FormBuilder,
    private http: HttpClient,
    private countryPickerService: CountryPickerService,
    private mediaUploader: MediaUploaderService,
    private dialog: MatDialog,
    public _collectionService: CollectionService
  ) {
    this.envVariable = environment;
    this.countryPickerService.getCountries()
      .subscribe((countries) => this.countries = countries);
  }

  ngOnInit() {
    const content = <FormArray>this.itenaryForm.controls.contents;
    this.lastIndex = content.controls.length - 1;
  }

  addContent(contentType: string) {
    console.log('Adding Content');
    const contentArray = <FormArray>this.itenaryForm.controls['contents'];
    const contentObject = this.initContent();
    contentObject.controls.type.patchValue(contentType);
    contentObject.controls.pending.patchValue(true);
    contentArray.push(contentObject);
    console.log(contentObject);
    this.addIndex();
  }

  deleteDay(itenaryId) {
    this.triggerSave.emit({
      action: 'deleteDay',
      value: itenaryId
    });
  }

  initContent() {
    return this._fb.group({
      id: [''],
      title: ['', [Validators.required, Validators.minLength(10)]],
      type: [''],
      description: [''],
      supplementUrls: this._fb.array([]),
      requireRSVP: [''],
      itemsProvided: this._fb.array([]),
      notes: [''],
      imageUrl: [''],
      prerequisites: [''],
      schedule: this._fb.group({
        startDay: [''],
        endDay: [null],
        startTime: [null],
        endTime: [null]
      }),
      pending: ['']
    });
  }

  removeContentForm(i: number) {
    console.log('Discarding Form Content');
    const control = <FormArray>this.itenaryForm.controls['contents'];
    control.removeAt(i);
    this.resetIndex();
    this.resetProgressBar();
  }

  removeContent(i: number) {
    console.log('Discarding Content from database');
    this.triggerSave.emit({
      action: 'delete',
      value: i
    });
    console.log('removed!');
    this.resetProgressBar();
    this.resetIndex();
  }
  addIndex() {
    this.lastIndex++;
  }

  resetIndex() {
    this.lastIndex--;
  }


  saveTempForEditDate(content, index) {

    const contentsFArray = <FormArray>this.itenaryForm.controls['contents'];
    const contentForm = <FormGroup>contentsFArray.controls[index];
    contentForm.patchValue(content);
    this.triggerSave.emit({
      action: 'update',
      value: index
    });
    console.log('updated!');
    this.resetProgressBar();

  }

  saveContent(lastIndex) {
    this.triggerSave.emit({
      action: 'add',
      value: lastIndex
    });
    console.log('saved!');
    this.resetProgressBar();
  }

  resetProgressBar() {
    delete this.filesToUpload;
    delete this.filesUploaded;
  }

  editContent(index) {
    this.triggerSave.emit({
      action: 'update',
      value: index
    });
    console.log('updated!');
    this.resetProgressBar();
  }

  resetNewUrls(event) {
    console.log(event);
    const contentsFArray = <FormArray>this.itenaryForm.controls['contents'];
    const contentForm = <FormGroup>contentsFArray.controls[this.lastIndex];
    const supplementUrls = <FormArray>contentForm.controls.supplementUrls;
    supplementUrls.reset();
    this.resetProgressBar();
  }

  resetEditUrls(event) {
    const contentsFArray = <FormArray>this.itenaryForm.controls['contents'];
    const contentForm = <FormGroup>contentsFArray.controls[this.editIndex];
    const supplementUrls = <FormArray>contentForm.controls.supplementUrls;
    supplementUrls.reset();
    this.resetProgressBar();
  }

  itemNewRemoved(event) {
    delete this.filesToUpload;
    this.filesUploaded = 0;
  }

  itemEditRemoved(event) {
    delete this.filesToUpload;
    this.filesUploaded = 0;
    // this.deleteFromContainer(event);
  }

  triggerContentUpdate(form) {
    const date = moment(form.controls.date.value).toDate();
    const contentArray = <FormArray>form.controls['contents'].controls;
    for (let i = 0; i < contentArray.length; i++) {
      const type = contentArray[i].controls.type.value;
      contentArray[i].controls.schedule.controls.startDay.patchValue(date);
      contentArray[i].controls.schedule.controls.endDay.patchValue(date);
      this.saveTempForEditDate(contentArray[i], i);
    }
  }

  getContentTimeRange(content) {
    const startTime = moment('01-02-1990 ' + content.controls.schedule.controls.startTime.value).format('hh:mm a');
    const endTime = moment('01-02-1990 ' + content.controls.schedule.controls.endTime.value).format('hh:mm a');
    return startTime + ' - ' + endTime;
  }

  getDeadline(content) {
    return moment.utc(content.controls.schedule.controls.endDay.value).local().format('DD MMM');
  }

  public showItineraryDate(date) {
    if (date) {
      return moment(date).format('MM/DD/YYYY');
    } else {
      return 'Select date';
    }
  }

  /**
   * Open dialog for creating new online content
   */
  public findAndOpenDialog(index) {
    // if (this.workshopStatus === 'active') {
    //   this.triggerSave.emit({
    //     action: 'dialog',
    //     value: index
    //   });
    // }
    // else {
    let isEdit = true;
    const contentsFArray = <FormArray>this.itenaryForm.controls['contents'];
    if (index === -1) {
      index = contentsFArray.controls.length - 1;
      isEdit = false;
    }
    const contentForm = <FormGroup>contentsFArray.controls[index];
    const contentType = contentForm.value.type;
    let dialogRef: any;
    switch (contentType) {
      case 'online':
        dialogRef = this.dialog.open(WorkshopContentOnlineComponent,
          {
            panelClass: 'responsive-dialog',
            data: { itenaryForm: this.itenaryForm, index: index, isEdit: isEdit },
            disableClose: true, hasBackdrop: true, width: '45vw', height: '100vh'
          });
        break;
      case 'project':
        dialogRef = this.dialog.open(WorkshopContentProjectComponent,
          {
            panelClass: 'responsive-dialog',
            data: {
              itenaryForm: this.itenaryForm, index: index, isEdit: isEdit,
              collectionStartDate: this.collectionStartDate, collectionEndDate: this.collectionEndDate
            }, disableClose: true, hasBackdrop: true, width: '45vw', height: '100vh'
          });
        break;
      case 'video':
        dialogRef = this.dialog.open(WorkshopContentVideoComponent,
          {
            panelClass: 'responsive-dialog',
            data: { itenaryForm: this.itenaryForm, index: index, isEdit: isEdit },
            disableClose: true, hasBackdrop: true, width: '45vw', height: '100vh'
          });
        break;
      default:
        break;
    }

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        console.log(result);
        result = JSON.parse(result);
        if (result.status === 'save') {
          this.saveContent(result.data);
        } else if (result.status === 'edit') {
          this.editContent(result.data);
        } else if (result.status === 'delete') {
          this.removeContent(result.data);
        } else if (result.status === 'close') {
          // do nothing
        } else {
          this.removeContentForm(result.data);
        }
      }
    });
    // }
  }

  getCollectionStartDate() {
    if (this.collectionStartDate !== undefined) {
      return new Date(this.collectionStartDate);
    } else {
      return new Date(2000, 0, 1);
    }
  }

  getCollectionEndDate() {
    if (this.collectionEndDate !== undefined) {
      return new Date(this.collectionEndDate);
    } else {
      return new Date(2020, 0, 1);
    }
  }

  imgErrorHandler(event) {
    event.target.src = '/assets/images/placeholder-image.jpg';
  }

}
