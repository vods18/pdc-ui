import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-questionario',
    standalone: true,
    imports: [
        CommonModule,
        MatCheckboxModule,
        MatButtonModule,
        RouterModule
    ],
    templateUrl: './questionario.component.html',
    styleUrls: ['./questionario.component.css']
})
export class QuestionarioComponent {
    pergunta = 'Sua organização armazena dados de cartão de crédito?';

    // Armazena a resposta selecionada
    check: string | null = null;

    setResposta(valor: string): void {
        this.check = valor;
    }

    isChecked(valor: string): boolean {
        return this.check === valor;
    }
}
