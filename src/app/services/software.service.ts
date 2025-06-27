import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Software {
    id: number;
    nome: string;
    justificativa: string;
    fonte: string;
    subRequisitoId: number;
}

@Injectable({
    providedIn: 'root',
})
export class SoftwareService {
    private apiUrl = environment.apiUrl + '/api/software';

    constructor(private http: HttpClient) { }

    getSoftware(): Observable<Software[]> {
        return this.http.get<Software[]>(this.apiUrl);
    }
}
