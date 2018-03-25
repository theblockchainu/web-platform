import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { Location } from '@angular/common';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../../_services/authentication/authentication.service';
import { CollectionService } from '../../_services/collection/collection.service';
import { RequestHeaderService } from '../../_services/requestHeader/request-header.service';
import { MatDialog } from '@angular/material';
import * as moment from 'moment';
import {environment} from '../../../environments/environment';
import { DialogsService } from '../../_services/dialogs/dialog.service';
@Component({
  selector: 'app-workshop-content',
  // We need to tell Angular's Dependency Injection which providers are in our app.
  providers: [],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: './workshop-content.component.html',
  styleUrls: ['./workshop-content.component.scss']

})

export class WorkshopContentComponent implements OnInit {
  @Input()
  public myForm: FormGroup;

  @Input()
  public collection: any;

  @Input()
  public status: string;

  @Input()
  public calendar: any;

  @Output()
  days = new EventEmitter<any>();

  private options;
  public envVariable;
  constructor(
    public authenticationService: AuthenticationService,
    private http: HttpClient,
    private _fb: FormBuilder,
    private requestHeaders: RequestHeaderService,
    private dialog: MatDialog,
    public router: Router,
    public _collectionService: CollectionService,
    private location: Location,
    private _dialogsService: DialogsService
  ) {
      this.envVariable = environment;
    this.options = requestHeaders.getOptions();
  }

  ngOnInit() {
    this.myForm.addControl('itenary', this._fb.array([this.initItenary()]));
  }

  initItenary() {
    return this._fb.group({
      date: [null],
      startDay: [null],
      contents: this._fb.array([])
    });
  }

  addItenary() {
    this.checkWorkshopActive();
  }

  removeItenary(i: number) {
    const itenaries = <FormArray>this.myForm.controls.itenary;
    const itenaryGroup = <FormGroup>itenaries.controls[i];
    const contents = <Array<any>>itenaryGroup.value.contents;

    let deleteIndex = 0;

    while (deleteIndex !== contents.length) {
      this.http.delete(environment.apiUrl + '/api/contents/' + contents[deleteIndex].id, this.options)
        .map((response: any) => {
          console.log(response);
        })
        .subscribe();
      deleteIndex++;
    }
    itenaries.removeAt(i);
    this.days.emit(itenaries);
  }

  save(myForm: FormGroup) {
    console.log(myForm.value);
  }
  /**
   * numberOfdays
  */
  public numberOfdays(currentDate, startDate) {
    const current = moment(currentDate);
    const start = moment(startDate);
    return current.diff(start, 'days');
  }

  checkWorkshopActive() {
    if (this.collection.status === 'active') {
      this.showDialogForActiveWorkshop(false);
    } else {
      const itenaries = <FormArray>this.myForm.controls['itenary'];
      itenaries.push(this.initItenary());
      this.days.emit(itenaries);
    }
  }

  reload(collectionId, step) {
    window.location.href = '/workshop/' + collectionId + '/edit/' + step;
  }

  private executeSubmitWorkshop(collection) {
    const calendars = collection.calendars;
    const timeline = collection.contents;
    delete collection.calendars;
    delete collection.contents;
    const body = collection;
    this._collectionService.patchCollection(collection.id, body).map(
      (response: any) => {
        const result = response;
        let collectionId;
        if (result.isNewInstance) {
          collectionId = result.id;
          this.reload(collectionId, 13);
        } else {
          window.location.reload();
        }
      }).subscribe();
  }

  showDialogForActiveWorkshop(isContent) {
    this._dialogsService.openCollectionCloneDialog({
      type: 'workshop'
    }).subscribe((result) => {
      if (result === 'accept') {
        if (!isContent) {
          this.executeSubmitWorkshop(this.collection);
        }
      } else if (result === 'reject') {
        // Do nothing
        this.router.navigate(['console', 'teaching', 'workshops']);
      }
    });
  }

  saveTriggered(event, i) {
    console.log(this.myForm);
    if (event.action === 'add') {
      if (this.collection.status === 'active') {
        this._dialogsService.openCollectionCloneDialog({
          type: 'workshop'
        }).subscribe((result) => {
          if (result === 'accept') {
            this.postContent(event, i);
          } else if (result === 'reject') {
            // Do nothing
            this.router.navigate(['console', 'teaching', 'workshops']);
          }
        });
      } else {
        this.postContent(event, i);
      }

    } else if (event.action === 'update') {
      if (this.collection.status === 'active') {
        this._dialogsService.openCollectionCloneDialog({
          type: 'workshop'
        }).subscribe((result) => {
          if (result === 'accept') {
            this.patchContent(event, i);
          } else if (result === 'reject') {
            // Do nothing
            this.router.navigate(['console', 'teaching', 'workshops']);
          }
        });
      } else {
        this.patchContent(event, i);
      }
    } else if (event.action === 'delete') {
      if (this.collection.status === 'active') {
        this._dialogsService.openCollectionCloneDialog({ type: 'workshop' }).subscribe((result) => {
          if (result === 'accept') {
            this.deleteContent(event.value, i);
          } else if (result === 'reject') {
            // Do nothing
            this.router.navigate(['console', 'teaching', 'workshops']);
          }
        });
      } else {
        this.deleteContent(event.value, i);
      }
    } else if (event.action === 'deleteDay') {
      if (this.collection.status === 'active') {
        this._dialogsService.openCollectionCloneDialog({ type: 'workshop' })
          .subscribe((result) => {
            if (result === 'accept') {
              this.deleteContent(null, i);
              const itenary = <FormArray>this.myForm.controls.itenary;
              itenary.removeAt(i);
            } else if (result === 'reject') {
              // Do nothing
              this.router.navigate(['console', 'teaching', 'workshops']);
            }
          });
      } else {
        this.deleteContent(null, i);
        const itenary = <FormArray>this.myForm.controls.itenary;
        itenary.removeAt(i);
      }
    } else {
      console.log('unhandledEvent Triggered');
    }
    // }
  }

  postContent(event, i) {
    let collectionId;
    const itenaryObj = this.myForm.value.itenary[i];
    const scheduleDate = itenaryObj.date;
    const contentObj = _.cloneDeep(itenaryObj.contents[event.value]);
    const schedule = contentObj.schedule;
    delete schedule.id;
    delete contentObj.id;
    delete contentObj.schedule;
    delete contentObj.pending;

    let contentId;
    const itenary = <FormArray>this.myForm.controls.itenary;
    const form = <FormGroup>itenary.controls[i];
    const contentsArray = <FormArray>form.controls.contents;
    const contentGroup = <FormGroup>contentsArray.controls[event.value];

    if (contentObj.type === 'project' || contentObj.type === 'video') {
      if (contentObj.type === 'video') {
        schedule.endDay = 0;
      } else {
        const endDate = new Date(schedule.endDay);
        schedule.endDay = this.numberOfdays(endDate, this.calendar.startDate);
      }
      schedule.startTime = new Date(0, 0, 0, 1, 0, 0, 0);
      schedule.endTime = new Date(0, 0, 0, 1, 0, 0, 0);
    } else if (contentObj.type === 'online') {
      const startTimeArr = schedule.startTime.toString().split(':');
      const startHour = startTimeArr[0];
      const startMin = startTimeArr[1];
      schedule.startTime = new Date(0, 0, 0, startHour, startMin, 0, 0);

      const endTimeArr = schedule.endTime.toString().split(':');
      const endHour = endTimeArr[0];
      const endMin = endTimeArr[1];
      schedule.endTime = new Date(0, 0, 0, endHour, endMin, 0, 0);
      schedule.endDay = 0;
    }
    schedule.startDay = this.numberOfdays(scheduleDate, this.calendar.startDate);

    console.log(schedule);
    this.http.post(environment.apiUrl + '/api/collections/' + this.collection.id + '/contents', contentObj, this.options)
      .map((response: any) => {
        const result = response;
        if (result.isNewInstance) {
          collectionId = result.id;
          result.contents.forEach((content) => {
            if (content.isNewInstance) {
              contentId = content.id;
            }
          });
        } else {
          contentId = result.id;
        }
        contentGroup.controls.id.setValue(contentId);

        this.http.patch(environment.apiUrl + '/api/contents/' + contentId + '/schedule', schedule, this.options)
          .map((resp: any) => {
            if (resp.status === 200) {
              const Itenary = <FormArray>this.myForm.controls.itenary;
              const Form = <FormGroup>Itenary.controls[i];
              const ContentsArray = <FormArray>Form.controls.contents;
              const ContentGroup = <FormGroup>ContentsArray.controls[event.value];
              /*const ContentSchedule = <FormGroup>ContentGroup.controls.schedule;
              ContentSchedule.controls.startTime.patchValue('');
              ContentSchedule.controls.endTime.patchValue('');*/
              ContentGroup.controls.pending.setValue(false);
              Form.controls['startDay'].patchValue(resp.startDay);
            }
            console.log(response);
            if (collectionId) {
              this.reload(collectionId, 13);
            }
          })
          .subscribe();
      })
      .subscribe();
  }

  patchContent(event, i) {
    let collectionId;
    const itenary = <FormArray>this.myForm.controls.itenary;
    const form = <FormGroup>itenary.controls[i];
    const contentsArray = <FormArray>form.controls.contents;
    const contentGroup = <FormGroup>contentsArray.controls[event.value];
    const ContentSchedule = <FormGroup>contentGroup.controls.schedule;
    contentGroup.controls.pending.setValue(true);

    const itenaryObj = this.myForm.value.itenary[i];
    const scheduleDate = itenaryObj.date;
    const contentObj = _.cloneDeep(itenaryObj.contents[event.value]);
    const schedule = contentObj.schedule;
    delete schedule.id;
    let contentId = contentObj.id;
    delete contentObj.id;
    delete contentObj.schedule;
    delete contentObj.pending;
    if (contentObj.type === 'project') {
      const endDay = new Date(schedule.endDay);
      schedule.endDay = endDay;
    }
    if (contentObj.type === 'online' || contentObj.type === 'video') {
      schedule.endDay = 0;
    }
    schedule.startDay = this.numberOfdays(scheduleDate, this.calendar.startDate);
    if (schedule.startTime === '') {
      schedule.startTime = new Date(0, 0, 0, 1, 0, 0, 0);
    } else {
      const startTimeArr = schedule.startTime.toString().split(':');
      const startHour = startTimeArr[0];
      const startMin = startTimeArr[1];
      schedule.startTime = new Date(0, 0, 0, startHour, startMin, 0, 0);
    }
    if (schedule.endTime === '') {
      schedule.endTime = new Date(0, 0, 0, 23, 0, 0, 0);
    } else {
      const endTimeArr = schedule.endTime.toString().split(':');
      const endHour = endTimeArr[0];
      const endMin = endTimeArr[1];
      schedule.endTime = new Date(0, 0, 0, endHour, endMin, 0, 0);
    }
    // this.http.patch(environment.apiUrl + '/api/contents/' + contentId, contentObj, this.options)
    this.http.put(environment.apiUrl + '/api/collections/' + this.collection.id + '/contents/' + contentId, contentObj, this.options)
      .map((response: any) => {
        const result = response;
        if (result.isNewInstance) {
          collectionId = result.id;
          result.contents.forEach((content) => {
            if (content.isNewInstance) {
              contentId = content.id;
            }
          });
        }
        this.http.patch(environment.apiUrl + '/api/contents/' + contentId + '/schedule', schedule, this.options)
          .map((resp: any) => {
            if (resp.status === 200) {
              /*ContentSchedule.controls.startTime.patchValue('');
              ContentSchedule.controls.endTime.patchValue('');*/
              contentGroup.controls.pending.setValue(false);

            }
            if (collectionId) {
              this.reload(collectionId, 13);
            }
          })
          .subscribe();
      })
      .subscribe();
  }

  deleteContent(eventIndex, index) {
    const itenaryObj = this.myForm.value.itenary[index];
    const scheduleDate = itenaryObj.date;
    let collectionId;
    if (eventIndex) {
      const contentObj = itenaryObj.contents[eventIndex];
      const contentId = contentObj.id;
      // this.http.delete(environment.apiUrl + '/api/contents/' + contentId, this.options)
      this.http.delete(environment.apiUrl + '/api/collections/' + this.collection.id + '/contents/' + contentId, this.options)
        .map((response: any) => {
          console.log(response);
          if (response !== null) {
            const result = response;
            if (result.isNewInstance) {
              collectionId = result.id;
              this.reload(collectionId, 13);
            } else {
              const itenary = <FormArray>this.myForm.controls.itenary;
              const form = <FormGroup>itenary.controls[index];
              const contentsArray = <FormArray>form.controls.contents;
              contentsArray.removeAt(eventIndex);
            }
          } else {
            const itenary = <FormArray>this.myForm.controls.itenary;
            const form = <FormGroup>itenary.controls[index];
            const contentsArray = <FormArray>form.controls.contents;
            contentsArray.removeAt(eventIndex);
          }
        })
        .subscribe();
    } else {
      const contentArray = itenaryObj.contents;
      contentArray.forEach(content => {
        this.http.delete(environment.apiUrl + '/api/collections/' + this.collection.id + '/contents/' + content.id, this.options)
          .map((response: any) => {
            console.log(response);
            if (response !== null) {
              const result = response;
              if (result && result.isNewInstance) {
                collectionId = result.id;
                this.reload(collectionId, 13);
              } else {
                const itenary = <FormArray>this.myForm.controls.itenary;
              }
            } else {
              const itenary = <FormArray>this.myForm.controls.itenary;
            }
          })
          .subscribe();
      });
    }
  }

  getCalendarStartDate() {
    return new Date(this.calendar.startDate);
  }

  getCalendarEndDate() {
    return new Date(this.calendar.endDate);
  }

}
