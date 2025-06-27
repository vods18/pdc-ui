import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Questionario {
    id: number;
    pergunta: string;
}

export interface RespostaDto {
    perguntaId: number;
    resposta: string;
}

@Injectable({
    providedIn: 'root',
})
export class QuestionarioService {
    private apiUrl = `${environment.apiUrl}/api/questionario`;

    constructor(private http: HttpClient) { }

    getQuestionario(): Observable<Questionario[]> {
        return this.http.get<Questionario[]>(this.apiUrl);
    }

    postResposta(dto: RespostaDto): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/${dto.perguntaId}/resposta`, dto);
    }

    postReset(): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/reset`, {});
    }

}
