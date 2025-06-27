import { Component, OnInit } from '@angular/core';
import { QuestionarioService, Questionario, RespostaDto } from '../../services/questionario.service';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';

@Component({
    selector: 'app-questionario',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatRadioModule,
        MatButtonModule,
        RouterModule],
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
        this.questionarioService.getQuestionario().subscribe({
            next: (data) => {
                this.perguntas = data;
                this.respostaAtual = null;
            },
            error: (err) => console.error('Erro ao carregar perguntas:', err),
        });
    }

    isChecked(perguntaId: number, resposta: string): boolean {
        return this.respostaAtual === resposta;
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

        this.questionarioService.postResposta(dto).subscribe({
            next: () => {
                if (this.currentIndex < this.perguntas.length - 1) {
                    this.currentIndex++;
                    this.respostaAtual = null;
                } else {
                    this.router.navigate(['/checklist']);
                }
            },
            error: (err) => {
                console.error('Falha ao enviar resposta:', err);
            }
        });
    }
}
