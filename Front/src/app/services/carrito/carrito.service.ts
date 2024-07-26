import { effect, inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { LoginService } from '../login/login.service';
import { signal } from '@angular/core';
import { Carrito } from '../../interfaces/carrito/carrito';
import { environment } from '../../../environments/environment';



@Injectable({
  providedIn: 'root'
})
export class CarritoService {

  private apiUrl = `${environment.backendUrl}/carrito`;

  carrito = signal<Carrito>({
    carritoProductos: [],
    precioTotal: 0,
    carritoId: null,
  });

  carritoModificadoSignal = signal<void>(undefined);
  cantidadProductosEnCarrito = signal<number>(0);

  private http=inject(HttpClient)
  private loginService=inject(LoginService)

  constructor() {

    effect(
      () => {
        const carritoActual = this.carrito();
        const cantidadTotalProductos = carritoActual.carritoProductos.reduce(
          (total: number, producto: any) => total + producto.cantidad,
          0
        );
        this.cantidadProductosEnCarrito.set(cantidadTotalProductos);
      },
      { allowSignalWrites: true } // Habilitar escritura en señales dentro del efecto
    );
    this.initCarrito();
  }

  initCarrito(): void {
    const idUsuario = this.loginService.obtenerIdUsuarioAutenticado();

    if (idUsuario !== null) {
      this.obtenerCarrito(idUsuario).subscribe({
        next: (carrito) => {
          this.carrito.set(carrito);
          this.actualizarCantidadProductosEnCarrito(carrito);
        },
        error: (error) => {
          console.error('Error al obtener el carrito', error);
        }
      });
    } else {
      this.carrito.set({ carritoProductos: [], precioTotal: 0, carritoId: null });
      this.cantidadProductosEnCarrito.set(0); // Inicializar en 0 si el usuario no está autenticado
    }
  }

  private actualizarCantidadProductosEnCarrito(carrito: Carrito): void {
    const cantidadTotalProductos = carrito.carritoProductos.reduce((total: number, producto: any) => total + producto.cantidad, 0);
    this.cantidadProductosEnCarrito.set(cantidadTotalProductos);
  }

  agregarAlCarrito(idUsuario: number, idProducto: number, cantidad: number): Observable<any> {
    const payload = { id_usuario: idUsuario, id_producto: idProducto, cantidad: cantidad };

    return this.http.post<Carrito>(`${this.apiUrl}/add`, payload).pipe(
      switchMap(() => this.obtenerCarrito(idUsuario)),
      tap((carrito) => {
        console.log('Carrito actualizado:', carrito);
        this.carrito.set(carrito);
        this.carritoModificadoSignal.set(undefined);
      }),
      catchError(this.handleError)
    );
  }

  obtenerCarrito(idUsuario: number): Observable<Carrito> {
    return this.http.get<Carrito>(`${this.apiUrl}/${idUsuario}`).pipe(
      tap((carrito) => {
        this.carrito.set(carrito || { carritoProductos: [], precioTotal: 0, carritoId: null });
        this.actualizarCantidadProductosEnCarrito(carrito);
      }),
      catchError(this.handleError)
    );
  }

  modificarCantidad(idUsuario: number, idProducto: number, nuevaCantidad: number): Observable<any> {
    const payload = { id_usuario: idUsuario, id_producto: idProducto, cantidad: nuevaCantidad };

    console.log('Enviando solicitud HTTP para modificar cantidad...', payload);

    return this.http.put<Carrito>(`${this.apiUrl}/modificar-cantidad/${idUsuario}`, payload).pipe(
      switchMap(() => this.obtenerCarrito(idUsuario)),
      tap((carrito) => {
        console.log('Carrito actualizado:', carrito);
        this.carrito.set(carrito);

        if (nuevaCantidad <= 0) {
          const carritoActualizado = { ...carrito };
          carritoActualizado.carritoProductos = carritoActualizado.carritoProductos.filter(producto => producto.producto.id !== idProducto);
          this.carrito.set(carritoActualizado);
          this.cantidadProductosEnCarrito.set(carritoActualizado.carritoProductos.reduce((total, producto) => total + producto.cantidad, 0));
        }
        
        this.carritoModificadoSignal.set(undefined);
      }),
      catchError(this.handleError)
    );
  }

  realizarCompra(idUsuario: number): Observable<any> {
    if (this.carrito().carritoId === null) {
      return throwError(() => new Error('ID del carrito no disponible'));
    }

    const payload = { id_usuario: idUsuario, id_carrito: this.carrito().carritoId };
    console.log('Realizando solicitud HTTP para realizar la compra...', payload);

    return this.http.post<any>(`${environment.backendUrl}/pedido`, payload).pipe(
      tap(() => {
        console.log('Compra realizada con éxito');
        this.carrito.set({ carritoProductos: [], precioTotal: 0, carritoId: null });
        this.carritoModificadoSignal.set(undefined);
        this.cantidadProductosEnCarrito.set(0);
      }),
      catchError(this.handleError)
    );
  }

  vaciarCarrito(idUsuario: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/vaciar/${idUsuario}`).pipe(
      tap(() => {
        this.carrito.set({ carritoProductos: [], precioTotal: 0, carritoId: null });
        this.cantidadProductosEnCarrito.set(0);
        console.log('Carrito vaciado con éxito');
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error en la solicitud:', error);
    let errorMessage = 'Ocurrió un error en la solicitud. Por favor, inténtalo de nuevo.';
    if (error.error instanceof ErrorEvent) {
      console.error('Error del lado del cliente:', error.error.message);
      errorMessage = 'Error del lado del cliente. Por favor, inténtalo de nuevo.';
    } else {
      console.error('Error del lado del servidor:', error.status, error.error);
      errorMessage = `Error del lado del servidor (estado ${error.status}): ${error.error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}