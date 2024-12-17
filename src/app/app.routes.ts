import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { ToDoListComponent } from './components/to-do-list/to-do-list.component';
import { UpdateComponent } from './components/update/update.component';
import { PuzzleGameComponent } from './components/puzzle-game/puzzle-game.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'to-do-list', component: ToDoListComponent },
    { path: 'update', component: UpdateComponent},
    { path: 'puzzle-game', component: PuzzleGameComponent}
  ];  

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
