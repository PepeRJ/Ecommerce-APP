
import { Injectable, inject} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class StoreService {

  private apiUrl = `${environment.backendUrl}/producto`;
  private http= inject(HttpClient)


  getListaProductos() {
    return this.http.get<any[]>(this.apiUrl);
  }

  createProducto(producto: any) {
    return this.http.post<any>(this.apiUrl, producto);
  }

  editProducto(id: number, camposEditados: any) {
    return this.http.put<any>(`${this.apiUrl}/${id}`, camposEditados);
  }

  deleteProducto(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
