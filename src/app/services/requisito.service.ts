import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SubRequisito {
    id: number;
    titulo: string;
    explicacao: string;
    checked: boolean;
    requisitoId: number;
    questionarioId: number;
}

export interface Requisito {
    id: number;
    titulo: string;
    subRequisitos: SubRequisito[];
}

@Injectable({
    providedIn: 'root'
})
export class RequisitoService {
    private apiUrl = environment.apiUrl + '/api/requisitos';

    constructor(private http: HttpClient) { }

    getRequisitos(): Observable<Requisito[]> {
        return this.http.get<Requisito[]>(this.apiUrl);
    }

    checkSubRequisito(id: number, checked: boolean): Observable<{ id: number; checked: boolean }> {
        return this.http.post<{ id: number; checked: boolean }>(
            `${this.apiUrl}/subrequisitos/${id}/check`,
            { checked }
        );
    }
}
