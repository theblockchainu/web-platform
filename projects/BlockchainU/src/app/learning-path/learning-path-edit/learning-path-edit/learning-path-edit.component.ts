import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, FormControl, AbstractControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CollectionService } from '../../../_services/collection/collection.service';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
import { MediaMatcher } from '@angular/cdk/layout';
import { Meta, Title } from '@angular/platform-browser';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { environment } from '../../../../environments/environment';
import { CertificateService } from '../../../_services/certificate/certificate.service';
import { EditService } from './edit-services/edit-services.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-learning-path-edit',
  templateUrl: './learning-path-edit.component.html',
  styleUrls: ['./learning-path-edit.component.scss']
})
export class LearningPathEditComponent implements OnInit, OnDestroy {

  learningPathId: string;
  learningPathData: any;
  userId: string;
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  selectedIndex: number;
  step: number;
  private _CANVAS;
  private _VIDEO;
  private _CTX;
  certificateLoaded: boolean;

  topicArray: FormArray;
  titleForm: FormGroup;
  certificateForm: FormGroup;
  descriptionForm: FormGroup;
  requirementsForm: FormGroup;
  mediaForm: FormGroup;
  courseArray: FormArray;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private _fb: FormBuilder,
    public _collectionService: CollectionService,
    private _cookieUtilsService: CookieUtilsService,
    private cd: ChangeDetectorRef,
    private media: MediaMatcher,
    private titleService: Title,
    private metaService: Meta,
    private certificateService: CertificateService,
    private editService: EditService,
    private location: Location
  ) {
    this.activatedRoute.params.subscribe(params => {
      this.learningPathId = params['collectionId'];
      editService.learningPathId = this.learningPathId;
      this.step = Number(params['step']);
      this.selectedIndex = this.step ? this.step : 0;
    });
    this.userId = _cookieUtilsService.getValue('userId');
  }

  ngOnInit() {
    this.initiateForms();
    this.setTags();
    this.initializeLearningPath();
    this.checkIfBrowser();
  }

  private checkIfBrowser() {
    if (this._cookieUtilsService.isBrowser) {
      this._CANVAS = <HTMLCanvasElement>document.querySelector('#video-canvas');
      this._VIDEO = document.querySelector('#main-video');
      this.mobileQuery = this.media.matchMedia('(max-width: 600px)');
      this._mobileQueryListener = () => this.cd.detectChanges();
      this.mobileQuery.addListener(this._mobileQueryListener);
    }
  }

  private initiateForms() {

    this.topicArray = this._fb.array([], Validators.minLength(3));

    this.titleForm = this._fb.group({
      title: ['', Validators.required],
      headline: ['', Validators.required]
    });

    this.certificateForm = this._fb.group({
      certificateHTML: ['', Validators.required],
      expiryDate: ['', Validators.required],
      formData: [null, Validators.required]
    });

    this.descriptionForm = this._fb.group({
      description: [null, Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(2000)])],
    });

    this.requirementsForm = this._fb.group({
      notes: ['', Validators.required],
      difficultyLevel: ['', Validators.required]
    });
    this.mediaForm = this._fb.group({
      imageUrls: this._fb.array([], Validators.minLength(1)),
      videoUrls: this._fb.array([]),
    });
    this.courseArray = this._fb.array([], Validators.minLength(1));
  }

  selectionChange(event: StepperSelectionEvent) {
    this.selectedIndex = event.selectedIndex;
    this.location.go('/learning-path/' + this.learningPathId + '/edit/' + this.selectedIndex);
  }

  private setTags() {
    this.titleService.setTitle('Create LearningPath');
    this.metaService.updateTag({
      property: 'og:title',
      content: 'Create new learningPath'
    });
    this.metaService.updateTag({
      property: 'og:site_name',
      content: 'theblockchainu.com'
    });
    this.metaService.updateTag({
      property: 'og:image',
      content: 'https://theblockchainu.com/bu_logo_square.png'
    });
    this.metaService.updateTag({
      property: 'og:url',
      content: environment.clientUrl + this.router.url
    });
  }
  ngOnDestroy(): void {
    if (this.mobileQuery) {
      this.mobileQuery.removeListener(this._mobileQueryListener);
    }
  }

  private initializeLearningPath() {
    if (this.learningPathId) {
      const query = {
        'include': [
          'topics',
          'calendars',
          { 'participants': [{ 'profiles': ['work'] }] },
          { 'owners': [{ 'profiles': ['phone_numbers'] }] },
          { 'contents': ['schedules', 'locations'] },
          'payoutrules',
          { 'assessment_models': ['assessment_na_rules', 'assessment_rules'] },
        ]
      };
      this._collectionService.getCollectionDetail(this.learningPathId, query)
        .subscribe((res: any) => {
          this.learningPathData = res;
          this.initializeFormValues(res);
          this.initializeCertificate();
        }, err => console.log('error'));

    } else {
      console.log('NO COLLECTION');
    }
  }

  initializeCertificate() {
    this.certificateService.getCertificateTemplate(this.learningPathId).subscribe((res: any) => {
      if (res && res.formData) {
        console.log('settingformdata');
        this.certificateForm.controls['formData'].patchValue(JSON.parse(res.formData));
        console.log(this.certificateForm.controls['formData'].value);
      }
      if (res && res.expiryDate) {
        this.certificateForm.controls['expiryDate'].patchValue(res.expiryDate);
        console.log('settingexpiryDay');
        console.log(this.certificateForm.controls['expiryDate'].value);
      }
    }, err => {
      console.log(err);
    });
  }

  private initializeFormValues(res) {
    // Topics
    console.log(res);

    if (res.topics) {
      res.topics.forEach(topic => {
        this.topicArray.push(
          this._fb.control(topic)
        );
      });
    }

    // Title
    this.titleForm.controls.title.patchValue(res.title);

    // Headline
    this.titleForm.controls.headline.patchValue(res.headline);

    // Description
    this.descriptionForm.controls.description.patchValue(res.description);

    // Difficulty Level
    this.requirementsForm.controls.difficultyLevel.patchValue(res.difficultyLevel);

    // Notes
    this.requirementsForm.controls.notes.patchValue(res.notes);

    // Photos and Videos
    if (res.videoUrls && res.videoUrls.length > 0) {
      const control = <FormArray>this.mediaForm.controls['videoUrls'];
      res.videoUrls.forEach(videoUrl => {
        control.push(
          this._fb.control(videoUrl)
        );
      });
    }
    if (res.imageUrls && res.imageUrls.length > 0) {
      const control = <FormArray>this.mediaForm.controls['imageUrls'];
      res.imageUrls.forEach(imageUrl => {
        control.push(
          this._fb.control(imageUrl)
        );
      });
    }

    if (res.contents && res.contents.length > 0) {
      res.contents.forEach(content => {
        this.courseArray.push(
          this._fb.group(content)
        );
      });
    }

  }

  initCourse(content?: any) {
    const group = this._fb.group({
      id: [''],
      title: ['', [Validators.required, Validators.minLength(10)]],
      type: [''],
      description: [''],
      supplementUrls: this._fb.array([]),
      imageUrl: [''],
      prerequisites: ['']
    });
    if (content) {
      group.patchValue(content);
    }
    return group;
  }
}
