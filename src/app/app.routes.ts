import { Routes } from '@angular/router';
import { QuestionarioComponent } from './pages/questionario/questionario.component';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
        path: 'questionario',
        component: QuestionarioComponent
    }
];
