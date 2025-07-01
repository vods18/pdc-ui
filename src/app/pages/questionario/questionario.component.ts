// src/app/pages/questionario/questionario.component.ts
import { Component, OnInit } from '@angular/core';
import { QuestionarioService, Questionario, RespostaDto } from '../../services/questionario.service';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { take, switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-questionario',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatRadioModule,
        MatButtonModule,
        RouterModule
    ],
    templateUrl: './questionario.component.html',
    styleUrls: ['./questionario.component.css'],
})
export class QuestionarioComponent implements OnInit {
    perguntas: Questionario[] = [];
    currentIndex = 0;
    respostaAtual: string | null = null;

    constructor(
        private questionarioService: QuestionarioService,
        private router: Router
    ) { }

    ngOnInit() {
        this.loadPerguntas();
    }

    private loadPerguntas() {
        this.questionarioService.getQuestionario()
            .pipe(take(1))
            .subscribe({
                next: data => {
                    this.perguntas = data;
                    this.respostaAtual = null;
                    if (this.currentIndex >= this.perguntas.length) {
                        this.currentIndex = this.perguntas.length - 1;
                    }
                },
                error: err => console.error('Erro ao carregar perguntas:', err)
            });
    }

    setResposta(value: string) {
        this.respostaAtual = value;
    }

    canGoNext(): boolean {
        return this.respostaAtual !== null;
    }

    next() {
        const pergunta = this.perguntas[this.currentIndex];
        if (!pergunta || this.respostaAtual === null) return;

        const dto: RespostaDto = {
            perguntaId: pergunta.id,
            resposta: this.respostaAtual
        };

        this.questionarioService.postResposta(dto).pipe(
            switchMap(() => this.questionarioService.getQuestionario()),
            take(1)
        ).subscribe({
            next: data => {
                this.perguntas = data;
                this.respostaAtual = null;
                if (this.currentIndex < this.perguntas.length - 1) {
                    this.currentIndex++;
                } else {
                    this.router.navigate(['/checklist']);
                }
            },
            error: err => console.error('Falha ao processar resposta:', err)
        });
    }
}
