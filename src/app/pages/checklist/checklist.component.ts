import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { RequisitoService, Requisito, SubRequisito } from '../../services/requisito.service';
import { SoftwareService, Software } from '../../services/software.service';
import { RouterModule } from '@angular/router';
import { PdfReportService } from '../../services/pdf-report.service';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-checklist',
    templateUrl: './checklist.component.html',
    styleUrls: ['./checklist.component.css'],
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
    ]
})
export class ChecklistComponent implements OnInit {
    requisitos: Requisito[] = [];
    totalSubRequisitos = 0;
    totalChecked = 0;
    colunaEsquerda: Requisito[] = [];
    colunaDireita: Requisito[] = [];
    softwares: Software[] = [];
    showScan = false;

    constructor(
        private requisitoService: RequisitoService,
        private softwareService: SoftwareService,
        private pdfService: PdfReportService
    ) { }

    ngOnInit() {
        this.requisitoService.getRequisitos().subscribe(dados => {
            // usa exatamente o checked que veio do back
            this.requisitos = dados;

            this.totalSubRequisitos = this.requisitos.reduce(
                (sum, r) => sum + r.subRequisitos.length,
                0
            );
            this.colunaEsquerda = this.requisitos.slice(0, Math.ceil(this.requisitos.length / 2));
            this.colunaDireita = this.requisitos.slice(Math.ceil(this.requisitos.length / 2));
            this.atualizarProgresso();
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

    getDescricaoSoftware(subRequisitoId: number): string {
        const software = this.softwares.find(s => s.subRequisitoId === subRequisitoId);
        return software
            ? `${software.nome} - ${software.justificativa} (Fonte: ${software.fonte})`
            : '';
    }
    generatePdf() {
        this.showScan = true;
        setTimeout(() => (this.showScan = false), 3000);
        this.pdfService.generateReport(this.requisitos, this.softwares);
    }
}
