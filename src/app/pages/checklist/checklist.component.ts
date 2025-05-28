import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion'; // ✅ necessário
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';

interface SubRequisito {
    id: number;
    titulo: string;
    explicacao: string;
    checked: boolean;
}

interface Requisito {
    id: number;
    titulo: string;
    subrequisitos: SubRequisito[];
}

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
        FormsModule
    ]
})
export class ChecklistComponent implements OnInit {
    requisitos: Requisito[] = [];
    totalSubRequisitos = 0;
    totalChecked = 0;

    ngOnInit() {
        this.requisitos = Array.from({ length: 12 }).map((_, i) => ({
            id: i + 1,
            titulo: `Requisito ${i + 1}`,
            subrequisitos: Array.from({ length: 3 }).map((_, j) => ({
                id: j + 1,
                titulo: `SubRequisito ${j + 1}`,
                explicacao: `Explicação detalhada do SubRequisito ${j + 1}`,
                checked: false
            }))
        }));

        this.totalSubRequisitos = this.requisitos.reduce(
            (sum, r) => sum + r.subrequisitos.length,
            0
        );
    }

    onSubRequisitoToggle() {
        this.totalChecked = this.requisitos.reduce(
            (total, r) => total + r.subrequisitos.filter(s => s.checked).length,
            0
        );
    }

    getProgressoGeral(): number {
        return Math.round((this.totalChecked / this.totalSubRequisitos) * 100);
    }

    getProgressoPorRequisito(requisito: Requisito): number {
        const checked = requisito.subrequisitos.filter(s => s.checked).length;
        return Math.round((checked / requisito.subrequisitos.length) * 100);
    }

    get totalProgress(): number {
        const totalSub = this.requisitos.reduce((acc, req) => acc + req.subrequisitos.length, 0);
        const checkedSub = this.requisitos.reduce((acc, req) => acc + req.subrequisitos.filter(s => s.checked).length, 0);
        return totalSub === 0 ? 0 : Math.round((checkedSub / totalSub) * 100);
    }

    getRequisitoProgress(requisito: Requisito): number {
        const total = requisito.subrequisitos.length;
        const checked = requisito.subrequisitos.filter(s => s.checked).length;
        return total === 0 ? 0 : Math.round((checked / total) * 100);
    }


    atualizarProgresso() {
        // Pode ficar vazio se não precisar de nada aqui.
        // Ou pode disparar algo, atualizar variáveis, emitir evento, etc.
    }


}
