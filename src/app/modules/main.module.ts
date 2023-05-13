import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from '../main/mainforms/dashboard/dashboard.component';
import { AppSnackComponent } from '../components/snackbars/app-snack/app-snack.component';
import { PipesModule } from './pipes.module';
import { MenuSidebarComponent } from '../main/menu/menu.component';
import { HeaderComponent } from '../main/header/header.component';
import { HeaderBreadcumbsComponent } from '../main/(header-breadcumbs)/header-breadcumbs.component';
import { MaterialImportsModule } from './material-imports.module';
import { RouterModule } from '@angular/router';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { ImageUploadComponent } from '../components/image-upload/image-upload.component';
import { DeleteConfirmationDialogComponent } from '../components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { FormsModule } from '@angular/forms';

@NgModule({
	declarations: [
		DashboardComponent,
		AppSnackComponent,
		HeaderComponent,
		MenuSidebarComponent,
		HeaderBreadcumbsComponent,
		ImageUploadComponent,
		DeleteConfirmationDialogComponent,
	],
	imports: [
		CommonModule,
		PipesModule,
		MaterialImportsModule,
		RouterModule,
		NgScrollbarModule,
		FormsModule
	],
	exports: [
		HeaderComponent,
		MenuSidebarComponent,
		HeaderBreadcumbsComponent
	]
})
export class MainModule { }
