import { Component, OnInit } from '@angular/core';
import { CollectionService } from '../../../_services/collection/collection.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-learning-path-page',
  templateUrl: './learning-path-page.component.html',
  styleUrls: ['./learning-path-page.component.scss']
})
export class LearningPathPageComponent implements OnInit {

  public learningPath: any;
  public learningPathId: string;
  public learningPathUrl: string;
  private toOpenDialogName: string;
  private previewAs: boolean;

  constructor(
    private _collectionService: CollectionService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.initialiseVariables();
    this.getLearningPath();
  }

  private initialiseVariables() {
  }

  private getLearningPath() {
    this.activatedRoute.params.subscribe(params => {
      this.learningPathUrl = params['collectionCustomUrl'];
      this.toOpenDialogName = params['dialogName'];
    });
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['previewAs']) {
        this.previewAs = params['previewAs'];
        console.log('Previewing as ' + this.previewAs);
      }
      if (params['referredBy']) {
        this._collectionService.saveRefferedBY(params['referredBy']);
      }
    });
    const query = {};
    this._collectionService.getAllCollections(query);
  }

}
