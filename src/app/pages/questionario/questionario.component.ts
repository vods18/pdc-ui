import { Component, OnInit } from '@angular/core';
import { QuestionarioService, Questionario } from '../../services/questionario.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-questionario',
    standalone: true,
    imports: [CommonModule, FormsModule, MatRadioModule, MatButtonModule, RouterModule],
    templateUrl: './questionario.component.html',
    styleUrls: ['./questionario.component.css'],
})
export class QuestionarioComponent implements OnInit {
    perguntas: Questionario[] = [];
    currentIndex = 0;
    respostasMap = new Map<number, string>(); // perguntaId -> resposta
    respostaAtual: string | null = null;

    constructor(private questionarioService: QuestionarioService) { }

    ngOnInit() {
        this.questionarioService.getQuestionario().subscribe({
            next: (data) => {
                this.perguntas = data;
                this.atualizarRespostaAtual();
            },
            error: (err) => console.error('Erro ao carregar perguntas:', err),
        });


    }

    // Verifica se a resposta para a pergunta atual é igual à resposta passada
    isChecked(perguntaId: number, resposta: string): boolean {
        return this.respostasMap.get(perguntaId) === resposta;
    }

    // Salva resposta para pergunta
    setResposta(perguntaId: number, resposta: string) {
        this.respostasMap.set(perguntaId, resposta);
    }

    // Avança para a próxima pergunta se não estiver na última
    next() {
        const perguntaId = this.perguntas[this.currentIndex].id;
        if (this.respostaAtual != null) {
            this.respostasMap.set(perguntaId, this.respostaAtual);
        }
        if (this.currentIndex < this.perguntas.length - 1) {
            this.currentIndex++;
            this.atualizarRespostaAtual();
        }
    }


    // Verifica se a pergunta atual já foi respondida
    canGoNext(): boolean {
        return this.respostaAtual !== null;
    }

    atualizarRespostaAtual() {
        const perguntaId = this.perguntas[this.currentIndex]?.id;
        if (perguntaId != null) {
            this.respostaAtual = this.respostasMap.get(perguntaId) ?? null;
        } else {
            this.respostaAtual = null;
        }
    }
}
