import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { QuestionarioComponent } from './pages/questionario/questionario.component';
import { ChecklistComponent } from './pages/checklist/checklist.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
        path: 'questionario',
        component: QuestionarioComponent
    },
    {
        path: 'checklist',
        component: ChecklistComponent
    }

];
