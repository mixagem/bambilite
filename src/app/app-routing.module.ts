import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './main/mainforms/dashboard/dashboard.component';

const routes: Routes = [
	{
		path: `dashboard`, component: DashboardComponent, pathMatch: 'full'
	},{
		path: `**`, redirectTo: '', pathMatch: 'full'
	}
	// {
	//   path: 'editor', component: ManualEditComponent, children: [
	// 	{
	// 	  path: 'split-view', component: SplitViewComponent
	// 	}, {
	// 	  path: 'code-view', component: ManualSourceCodePreviewComponent
	// 	}
	//   ]
	// }, {
	//   path: 'colapsables', component: ColapsablesEditComponent, children: [
	// 	{
	// 	  path: 'split-view', component: ColapsSplitViewComponent
	// 	}, {
	// 	  path: 'code-view', component: ColapsablesSourceCodePreviewComponent
	// 	}, {
	// 	  path: 'parameters', component: ColapsablesParametersComponent
	// 	},
	//   ]
	// }, {
	//   path: 'images', component: ImagesEditComponent, pathMatch: 'full'
	// }, {
	//   path: 'export', component: ImportExportComponent, children: [
	// 	{
	// 	  path: 'preview', component: FullpagePreviewComponent
	// 	}, {
	// 	  path: 'import', component: ImportComponent
	// 	}, {
	// 	  path: 'export', component: ExportComponent
	// 	}]
	// }, {
	//   path: 'manuals', component: UserManualsComponent, pathMatch: 'full'
	// }, {
	//   path: 'settings', component: ParametersComponent, pathMatch: 'full'
	// }, {
	//   path: '404', component: PageNotFoundComponent, pathMatch: 'full'
	// },
	// {
	//   path: '**', redirectTo: '404', pathMatch: 'full'
	// }
];


@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
