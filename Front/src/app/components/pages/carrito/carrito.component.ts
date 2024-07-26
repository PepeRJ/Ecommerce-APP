import { Component, computed, inject, signal } from '@angular/core';
import { LoginService } from '../../../services/login/login.service';
import { CarritoService } from '../../../services/carrito/carrito.service';
import { CompraComponent } from '../../shared/components/modals/compra/compra.component';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CompraComponent, MatButtonModule],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.scss'
})
export class CarritoComponent {
  idUsuario: number | null = null;
  mostrarMensajeNoUnidades = signal(false);
  mostrarMensajeCompraRealizada = signal(false);
  carritoVacio = computed(() => this.carrito().carritoProductos.every((producto: any) => producto.cantidad === 0));
  
  dialog = inject(MatDialog)
  private carritoService= inject(CarritoService)
  private loginService= inject(LoginService) 

  carrito = this.carritoService.carrito;
  cantidadProductosEnCarrito = this.carritoService.cantidadProductosEnCarrito;
 

  ngOnInit(): void {
    this.idUsuario = this.loginService.obtenerIdUsuarioAutenticado();
    if (this.idUsuario !== null) {
      this.carritoService.initCarrito();
    }
  }

  modificarCantidad(idProducto: number, nuevaCantidad: number): void {
    if (this.idUsuario !== null) {
      if (nuevaCantidad >= 0) {
        this.carritoService.modificarCantidad(this.idUsuario, idProducto, nuevaCantidad).subscribe({
          next: () => console.log('Cantidad modificada con éxito'),
          error: (error) => {
            console.error('Error al modificar la cantidad', error);
            if (error.error && error.error.error === 'No puedes agregar más productos de los disponibles en el stock') {
              this.mostrarMensajeNoUnidades.set(true);
              setTimeout(() => this.mostrarMensajeNoUnidades.set(false), 5000);
            }
          }
        });
      }
    }
  }

  realizarCompra(): void {
    const dialogRef = this.dialog.open(CompraComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.idUsuario !== null) {
        this.carritoService.realizarCompra(this.idUsuario).subscribe({
          next: () => {
            console.log('Compra realizada con éxito');
            this.mostrarMensajeCompraRealizada.set(true);
            setTimeout(() => this.mostrarMensajeCompraRealizada.set(false), 2000);
            this.vaciarCarrito();
          },
          error: (error) => console.error('Error al realizar la compra', error)
        });
      }
    });
  }


  vaciarCarrito(): void {
    if (this.idUsuario !== null) {
      this.carritoService.vaciarCarrito(this.idUsuario).subscribe({
        next: () => console.log('Carrito vaciado con éxito'),
        error: (error) => console.error('Error al vaciar el carrito', error)
      });
    }
  }

  esUltimoProducto(): boolean {
    return this.carrito().carritoProductos.length === 1 && this.carrito().carritoProductos[0].cantidad === 1;
  }
}