import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms'; 
import { HttpClientModule } from '@angular/common/http'; 
import { AppComponent } from './app.component';
import { StateTypeaheadComponent } from './state-typeahead/state-typeahead.component'; 
import { StateService } from './state.service'
import { GraphQLModule } from './graphql.module'; 
import { GoogleMapsModule } from '@angular/google-maps';

@NgModule({
  declarations: [
    AppComponent, 
    StateTypeaheadComponent 
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule, 
    HttpClientModule, 
    GraphQLModule,
    GoogleMapsModule
  ],
  providers: [StateService],
  bootstrap: [AppComponent] 
})
export class AppModule { }
