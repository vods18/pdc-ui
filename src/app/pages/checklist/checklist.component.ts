// src/app/checklist/checklist.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { RequisitoService, Requisito, SubRequisito } from '../../services/requisito.service';
import { SoftwareService, Software } from '../../services/software.service';
import { GuiaRequisitosService, GuiaRequisito, TermoTecnico } from '../../services/guiaRequisitosService';
import { PdfReportService } from '../../services/pdf-report.service';
import { QuestionarioService } from '../../services/questionario.service';
import { RouterModule, Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-checklist',
    standalone: true,
    imports: [
        CommonModule,
        MatExpansionModule,
        MatCheckboxModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        FormsModule,
        RouterModule,
        MatIcon
    ],
    templateUrl: './checklist.component.html',
    styleUrls: ['./checklist.component.css'],
})
export class ChecklistComponent implements OnInit {
    requisitos: Requisito[] = [];
    totalSubRequisitos = 0;
    totalChecked = 0;
    colunaEsquerda: Requisito[] = [];
    colunaDireita: Requisito[] = [];
    softwares: Software[] = [];
    showScan = false;
    isGeneratingPdf = false;
    guiaRequisitosMap = new Map<number, GuiaRequisito>();
    termosMap = new Map<number, TermoTecnico[]>();

    constructor(
        private requisitoService: RequisitoService,
        private softwareService: SoftwareService,
        private pdfService: PdfReportService,
        private questionarioService: QuestionarioService,
        private guiaService: GuiaRequisitosService,
        private router: Router
    ) { }

    ngOnInit() {
        this.requisitoService.getRequisitos().subscribe(dados => {
            this.requisitos = dados.map(r => ({
                ...r,
                subRequisitos: r.subRequisitos.map(sr => ({
                    ...sr,
                    checked: sr.questionarioResposta === 'sim' || sr.checked,
                    showInfo: sr.questionarioResposta === 'nao_sei'
                }))
            }));

            this.totalSubRequisitos = this.requisitos.reduce(
                (sum, r) => sum + r.subRequisitos.length, 0
            );
            this.colunaEsquerda = this.requisitos.slice(0, Math.ceil(this.requisitos.length / 2));
            this.colunaDireita = this.requisitos.slice(Math.ceil(this.requisitos.length / 2));
            this.atualizarProgresso();

            this.requisitos.forEach(requisito => {
                requisito.subRequisitos.forEach(sub => {
                    this.guiaService.getGuiaBySubRequisito(sub.id).subscribe({
                        next: guia => {
                            this.guiaRequisitosMap.set(sub.id, guia);
                            this.guiaService.getTermosTecnicos(guia.id).subscribe({
                                next: termos => this.termosMap.set(guia.id, termos),
                                error: () => this.termosMap.set(guia.id, [])
                            });
                        },
                        error: () => {
                            this.guiaRequisitosMap.set(sub.id, {
                                id: 0,
                                subRequisitoId: sub.id,
                                significado: '',
                                importancia: '',
                                exemplo: ''
                            });
                        }
                    });
                });
            });
        });

        this.softwareService.getSoftware().subscribe(softwares => {
            this.softwares = softwares;
        });
    }

    onSubRequisitoToggle(sub: SubRequisito) {
        this.requisitoService.checkSubRequisito(sub.id, sub.checked).subscribe({
            next: () => this.atualizarProgresso(),
            error: () => sub.checked = !sub.checked
        });
    }

    atualizarProgresso() {
        this.totalChecked = this.requisitos.reduce(
            (total, r) => total + r.subRequisitos.filter(s => s.checked).length,
            0
        );
    }

    get totalProgress(): number {
        return this.totalSubRequisitos === 0
            ? 0
            : Math.round((this.totalChecked / this.totalSubRequisitos) * 100);
    }

    getProgressoPorRequisito(requisito: Requisito): number {
        const total = requisito.subRequisitos.length;
        const checked = requisito.subRequisitos.filter(s => s.checked).length;
        return total === 0 ? 0 : Math.round((checked / total) * 100);
    }

    getSoftwareBySubId(subRequisitoId: number): Software | undefined {
        return this.softwares.find(s => s.subRequisitoId === subRequisitoId);
    }

    async generatePdf() {
        this.isGeneratingPdf = true;
        this.showScan = true;

        try {
            await this.pdfService.generateReport(this.requisitos, this.softwares);
        } catch (err) {
            console.error('Erro ao gerar PDF:', err);
        } finally {
            this.showScan = false;
            this.isGeneratingPdf = false;
        }
    }

    resetQuestionario() {
        this.questionarioService.postReset().subscribe({
            next: () => this.router.navigate(['/questionario']),
            error: err => console.error('Erro no reset:', err)
        });
    }

    isExpanded(requisito: Requisito): boolean {
        return requisito.subRequisitos.some(sr => sr.showInfo);
    }
}
