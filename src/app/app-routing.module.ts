import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FileListComponent } from './pages/file-list/file-list.component';
import { FileDragAndDropComponent } from './pages/file-drag-and-drop/file-drag-and-drop.component';

const routes: Routes = [
    { path: '', redirectTo: '/list', pathMatch: 'full'/*, canActivate: [AuthGuard]*/},
    { path: 'list', component: FileListComponent/*, canActivate: [AuthGuard]*/},
    { path: 'drag-and-drop', component: FileDragAndDropComponent/*, canActivate: [AuthGuard]*/},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
