import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Requisito } from './requisito.service';
import { Software } from './software.service';

const REPORT_VERSION = '1.0.0';
@Injectable({ providedIn: 'root' })
export class PdfReportService {
    generateReport(requisitos: Requisito[], softwares: Software[]) {
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 40;
        const usableWidth = pageWidth - margin * 2;
        let cursorY = 40;

        // Cabeçalho com título, data e versão
        doc.setFontSize(10);
        doc.text(`Emitido em: ${new Date().toLocaleString()}`, margin, cursorY);
        doc.text(`Versão do Checklist: ${REPORT_VERSION}`, pageWidth - margin, cursorY, { align: 'right' });
        cursorY += 20;

        doc.setFontSize(18);
        doc.text('Relatório de Compliance PCI DSS', pageWidth / 2, cursorY, { align: 'center' });
        cursorY += 30;

        // Progresso geral
        const totalSub = requisitos.reduce((sum, r) => sum + r.subRequisitos.length, 0);
        const checked = requisitos.reduce(
            (sum, r) => sum + r.subRequisitos.filter(s => s.checked).length,
            0
        );
        const progress = totalSub ? Math.round((checked / totalSub) * 100) : 0;
        doc.setFontSize(12);
        doc.text(`Progresso Geral: ${progress}% (${checked}/${totalSub})`, margin, cursorY);
        cursorY += 20;

        // Resumo por requisito
        const summaryData = requisitos.map(r => {
            const reqTotal = r.subRequisitos.length;
            const reqChecked = r.subRequisitos.filter(s => s.checked).length;
            const reqProgress = reqTotal ? Math.round((reqChecked / reqTotal) * 100) : 0;
            return [r.id.toString(), `${reqProgress}%`];
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

        // Itens concluídos
        const completedItems = requisitos.flatMap(r =>
            r.subRequisitos
                .filter(s => s.checked)
                .map(s => [r.id.toString(), s.titulo])
        );
        if (completedItems.length) {
            doc.text('Itens Concluídos:', margin, cursorY);
            cursorY += 10;
            autoTable(doc, {
                startY: cursorY,
                margin: { left: margin },
                head: [['Req', 'SubRequisito']],
                body: completedItems,
                columnStyles: { 0: { cellWidth: usableWidth * 0.1 }, 1: { cellWidth: usableWidth * 0.4 } },
                styles: { overflow: 'linebreak' }
            });
            cursorY = (doc as any).lastAutoTable.finalY + 20;
        }

        // Itens faltantes com software recomendado
        const missingItems = requisitos.flatMap(r =>
            r.subRequisitos
                .filter(s => !s.checked)
                .map(s => {
                    const sw = softwares.find(f => f.subRequisitoId === s.id);
                    const rec = sw ? `${sw.nome} - ${sw.justificativa} (Fonte: ${sw.fonte})` : '';
                    return [r.id.toString(), s.titulo, rec];
                })
        );
        if (missingItems.length) {
            doc.text('Itens Faltantes:', margin, cursorY);
            cursorY += 10;
            autoTable(doc, {
                startY: cursorY,
                margin: { left: margin, right: margin },
                head: [['Req', 'SubRequisito', 'Software Recomendado']],
                body: missingItems,
                columnStyles: {
                    0: { cellWidth: usableWidth * 0.1 },
                    1: { cellWidth: usableWidth * 0.3 },
                    2: { cellWidth: usableWidth * 0.6 }
                },
                styles: { overflow: 'linebreak' }
            });
            cursorY = (doc as any).lastAutoTable.finalY + 20;
        }

        // Referências
        doc.text('PCI DSS Official: https://www.pcisecuritystandards.org', margin, cursorY);
        cursorY += 20;

        // Rodapé com números de página
        const pageCount = doc.internal.pages.length;
        doc.setFontSize(10);
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.text(
                `Página ${i} de ${pageCount}`,
                pageWidth - margin,
                pageHeight - 10,
                { align: 'right' }
            );
        }

        doc.save(`relatorio-pci-dss_v${REPORT_VERSION}.pdf`);
    }
}
