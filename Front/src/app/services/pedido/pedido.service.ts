import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, } from '@angular/common/http';
import { catchError, Observable, tap, throwError, of } from 'rxjs';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class PedidoService {

 
  private apiUrl = `${environment.backendUrl}/pedido`;

  constructor() {}

  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  private http = inject(HttpClient);

  private handleError(error: HttpErrorResponse) {
    console.error('Error en la solicitud:', error);
    this.isLoading.set(false);
    this.error.set('Ocurrió un error en la solicitud. Por favor, inténtalo de nuevo.');
    if (error.status === 404) {
      return of([]);  // Devuelve un arreglo vacío si el error es 404
    }
    return throwError(() => new Error('Ocurrió un error en la solicitud. Por favor, inténtalo de nuevo.'));
  }

  crearPedido(idUsuario: string, idCarrito: string): Observable<any> {
    const body = { id_usuario: idUsuario, id_carrito: idCarrito };
    this.isLoading.set(true);
    this.error.set(null);
    return this.http.post(`${this.apiUrl}/crear`, body).pipe(
      catchError(this.handleError),
      tap(() => this.isLoading.set(false))
    );
  }

  obtenerPedido(idPedido: string): Observable<any> {
    this.isLoading.set(true);
    this.error.set(null);
    return this.http.get(`${this.apiUrl}/${idPedido}`).pipe(
      catchError(this.handleError),
      tap(() => this.isLoading.set(false))
    );
  }

  obtenerPedidosUsuario(idUsuario: string): Observable<any> {
    this.isLoading.set(true);
    this.error.set(null);
    return this.http.get(`${this.apiUrl}/usuario/${idUsuario}`).pipe(
      catchError(this.handleError),
      tap(() => this.isLoading.set(false))
    );
  }

  actualizarPedido(idPedido: string, estado: string): Observable<any> {
    const body = { estado };
    this.isLoading.set(true);
    this.error.set(null);
    return this.http.put(`${this.apiUrl}/${idPedido}`, body).pipe(
      catchError(this.handleError),
      tap(() => this.isLoading.set(false))
    );
  }

  eliminarPedido(idPedido: string): Observable<any> {
    this.isLoading.set(true);
    this.error.set(null);
    return this.http.delete(`${this.apiUrl}/eliminar/${idPedido}`).pipe(
      catchError(this.handleError),
      tap(() => this.isLoading.set(false))
    );
  }
}
