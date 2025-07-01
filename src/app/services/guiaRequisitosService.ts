import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface GuiaRequisito {
    id: number;
    significado: string;
    importancia: string;
    exemplo: string;
    subRequisitoId: number;
}

export interface TermoTecnico {
    id: number;
    nome: string;
    texto: string;
}

@Injectable({
    providedIn: 'root'
})
export class GuiaRequisitosService {
    private apiUrl = `${environment.apiUrl}/api/guiarequisitos`;

    constructor(private http: HttpClient) { }

    getGuiaBySubRequisito(subId: number): Observable<GuiaRequisito> {
        return this.http.get<GuiaRequisito>(`${this.apiUrl}/by-subrequisito/${subId}`);
    }

    getTermosTecnicos(guiaId: number): Observable<TermoTecnico[]> {
        return this.http.get<TermoTecnico[]>(`${this.apiUrl}/${guiaId}/termos`);
    }
}
