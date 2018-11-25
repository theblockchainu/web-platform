import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LearningPathEditRoutingModule } from './learning-path-edit-routing.module';
import { LearningPathEditComponent } from './learning-path-edit/learning-path-edit.component';
import {
  MatStepperModule, MatButtonModule, MatFormFieldModule, MatSidenavModule, MatToolbarModule,
  MatIconModule, MatListModule, MatDividerModule, MatTooltipModule, MatCheckboxModule, MatInputModule,
  MatExpansionModule
} from '@angular/material';
import { LMarkdownEditorModule } from 'ngx-markdown-editor';
import { ReactiveFormsModule } from '@angular/forms';
import { StepBasicComponent } from './learning-path-edit/edit-steps/step-basic/step-basic.component';
import { StepTopicComponent } from './learning-path-edit/edit-steps/step-topic/step-topic.component';
import { MultiselectAutocompleteModule } from '../../_shared/multiselect-autocomplete/multiselect-autocomplete.module';
import { SharedModule } from '../../_shared/shared-module/shared.module';
import { StepTitleComponent } from './learning-path-edit/edit-steps/step-title/step-title.component';
import { StepDescriptionComponent } from './learning-path-edit/edit-steps/step-description/step-description.component';
import { StepRequirementsComponent } from './learning-path-edit/edit-steps/step-requirements/step-requirements.component';
import { StepMediaComponent } from './learning-path-edit/edit-steps/step-media/step-media.component';
import { StepLearningPathComponent } from './learning-path-edit/edit-steps/step-learning-path/step-learning-path.component';
import { StepSelectCoursesComponent } from './learning-path-edit/edit-steps/step-select-courses/step-select-courses.component';
import { StepReviewSubmitComponent } from './learning-path-edit/edit-steps/step-review-submit/step-review-submit.component';
import { StepLearningPathPageComponent } from './learning-path-edit/edit-steps/step-learning-path-page/step-learning-path-page.component';
import { StepCertificateComponent } from './learning-path-edit/edit-steps/step-certificate/step-certificate.component';
import { EditService } from './learning-path-edit/edit-services/edit-services.service';
import { MatSelectModule } from '@angular/material/select';
import { FileUploadModule } from 'primeng/fileupload';
import { UploadFileModule } from '../../_shared/upload-file/upload-file.module';
import { CustomCertificateFormModule } from '../../_shared/custom-certificate-form/custom-certificate-form.module';
import { NgPipesModule } from 'ngx-pipes';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    LearningPathEditRoutingModule,
    MatStepperModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MultiselectAutocompleteModule,
    MatTooltipModule,
    LMarkdownEditorModule,
    MatSelectModule,
    FileUploadModule,
    MatCheckboxModule,
    UploadFileModule,
    CustomCertificateFormModule,
    MatInputModule,
    MatExpansionModule,
    NgPipesModule
  ],
  providers: [EditService],
  declarations: [
    LearningPathEditComponent,
    StepBasicComponent,
    StepTopicComponent,
    StepTitleComponent,
    StepDescriptionComponent,
    StepRequirementsComponent,
    StepMediaComponent,
    StepLearningPathComponent,
    StepSelectCoursesComponent,
    StepReviewSubmitComponent,
    StepLearningPathPageComponent,
    StepCertificateComponent
  ]
})
export class LearningPathEditModule { }
