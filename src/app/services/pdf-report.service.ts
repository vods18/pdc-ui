// src/app/services/pdf-report.service.ts
import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { lastValueFrom } from 'rxjs';
import { Requisito } from './requisito.service';
import { Software } from './software.service';
import { GuiaRequisito, GuiaRequisitosService } from './guiaRequisitosService';

const REPORT_VERSION = '1.0.0';

@Injectable({ providedIn: 'root' })
export class PdfReportService {
    constructor(private guiaService: GuiaRequisitosService) { }

    async generateReport(requisitos: Requisito[], softwares: Software[]) {
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 40;
        const usableWidth = pageWidth - margin * 2;
        let cursorY = 40;

        // 1) Preload guias
        const guiaMap = new Map<number, GuiaRequisito>();
        for (const req of requisitos) {
            for (const sub of req.subRequisitos) {
                try {
                    const guia = await lastValueFrom(
                        this.guiaService.getGuiaBySubRequisito(sub.id)
                    );
                    guiaMap.set(sub.id, guia);
                } catch {
                    guiaMap.set(sub.id, { id: 0, subRequisitoId: sub.id, significado: '', importancia: '', exemplo: '' });
                }
            }
        }

        // 2) Header
        doc.setFontSize(10);
        doc.text(`Emitido em: ${new Date().toLocaleString()}`, margin, cursorY);
        doc.text(`Versão do Checklist: ${REPORT_VERSION}`, pageWidth - margin, cursorY, { align: 'right' });
        cursorY += 30;

        doc.setFontSize(18);
        doc.text('Relatório de Compliance PCI DSS', pageWidth / 2, cursorY, { align: 'center' });
        cursorY += 30;

        // 3) Overall progress
        const totalSub = requisitos.reduce((sum, r) => sum + r.subRequisitos.length, 0);
        const totalChecked = requisitos.reduce((sum, r) => sum + r.subRequisitos.filter(s => s.checked).length, 0);
        const overallProgress = totalSub ? Math.round((totalChecked / totalSub) * 100) : 0;
        doc.setFontSize(12);
        doc.text(`Progresso Geral: ${overallProgress}% (${totalChecked}/${totalSub})`, margin, cursorY);
        cursorY += 20;

        // 4) Summary by requisito
        const summaryData = requisitos.map(r => {
            const count = r.subRequisitos.length;
            const done = r.subRequisitos.filter(s => s.checked).length;
            const prog = count ? Math.round((done / count) * 100) : 0;
            return [r.id.toString(), `${prog}%`];
        });
        doc.text('Resumo por Requisito:', margin, cursorY);
        cursorY += 10;
        autoTable(doc, {
            startY: cursorY,
            margin: { left: margin },
            head: [['Req', '% Concluído']],
            body: summaryData,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] },
            columnStyles: { 0: { cellWidth: usableWidth * 0.2 }, 1: { cellWidth: usableWidth * 0.2 } }
        });
        cursorY = (doc as any).lastAutoTable.finalY + 20;

        // 5) Completed items
        const completed = requisitos.flatMap(r =>
            r.subRequisitos.filter(s => s.checked).map(s => [r.id.toString(), s.titulo])
        );
        if (completed.length) {
            doc.text('Itens Concluídos:', margin, cursorY);
            cursorY += 10;
            autoTable(doc, {
                startY: cursorY,
                margin: { left: margin },
                head: [['Req', 'SubRequisito']],
                body: completed,
                columnStyles: { 0: { cellWidth: usableWidth * 0.1 }, 1: { cellWidth: usableWidth * 0.4 } },
                styles: { overflow: 'linebreak' }
            });
            cursorY = (doc as any).lastAutoTable.finalY + 20;
        }

        // 6) Missing items
        const missing = requisitos.flatMap(r =>
            r.subRequisitos.filter(s => !s.checked).map(s => {
                const guia = guiaMap.get(s.id)!;
                const signif = guia.significado || '—';
                const imp = guia.importancia || '—';
                const sw = softwares.find(f => f.subRequisitoId === s.id);
                const rec = sw ? `${sw.nome} – ${sw.justificativa} (Fonte: ${sw.fonte})` : '';
                const subCell = `${s.titulo}:
${signif}`;
                return [r.id.toString(), subCell, imp, rec];
            })
        );
        if (missing.length) {
            doc.text('Itens Faltantes:', margin, cursorY);
            cursorY += 10;
            autoTable(doc, {
                startY: cursorY,
                margin: { left: margin, right: margin },
                head: [['Req', 'SubRequisito', 'Importância', 'Software Recomendado']],
                body: missing,
                columnStyles: {
                    0: { cellWidth: usableWidth * 0.08 },
                    1: { cellWidth: usableWidth * 0.4 },
                    2: { cellWidth: usableWidth * 0.25 },
                    3: { cellWidth: usableWidth * 0.27 }
                },
                styles: { overflow: 'linebreak' }
            });
            cursorY = (doc as any).lastAutoTable.finalY + 20;
        }

        // 7) References
        doc.text('PCI DSS Official: https://www.pcisecuritystandards.org', margin, cursorY);
        cursorY += 20;

        // 8) Page footer
        const pageCount = doc.internal.pages.length;
        doc.setFontSize(10);
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
        }

        doc.save(`relatorio-pci-dss_v${REPORT_VERSION}.pdf`);
    }
}
