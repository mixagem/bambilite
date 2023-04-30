import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './modules/app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialImportsModule } from './modules/material-imports.module';
import { MainModule } from './modules/main.module';
import { HttpClientModule } from '@angular/common/http';
import { PipesModule } from './modules/pipes.module';
import { LandingPageModule } from './landingpage/landing-page.module';
import { BodybuildingModule } from './main/mainforms/bb/bb.module';
import { SuppplementationModule } from './main/mainforms/sp/sp.module';
import { FoodModule } from './main/mainforms/fd/fd.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
	MaterialImportsModule,
	MainModule,
    HttpClientModule,
	PipesModule,
	LandingPageModule,
	BodybuildingModule,
	FoodModule,
	SuppplementationModule
  ],
  exports:[],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
