import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {GenericMultiselectAutocompleteComponent} from './generic-multiselect-autocomplete.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
    ],
    exports: [
        GenericMultiselectAutocompleteComponent,
    ],
    declarations: [
        GenericMultiselectAutocompleteComponent,
    ],
    providers: [],
})
export class GenericMultiselectAutocompleteComponentModule { }
