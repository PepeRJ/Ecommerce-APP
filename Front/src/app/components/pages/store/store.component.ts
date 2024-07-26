import { Component, inject } from '@angular/core';
import { StoreService } from '../../../services/store/store.service';
import { LoginService } from '../../../services/login/login.service';
import { CarritoService } from '../../../services/carrito/carrito.service';
import { FormsModule } from '@angular/forms';
import { map, Observable} from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { DeleteComponent } from '../../shared/components/modals/delete/delete.component';





@Component({
  selector: 'app-store',
  standalone: true,
  imports: [FormsModule, AsyncPipe, MatButtonModule],
  templateUrl: './store.component.html',
  styleUrl: './store.component.scss'
})
export class StoreComponent {

  productos$!: Observable<any[]>;
  nuevoProducto: any = {};
  editando: boolean = false;
  productoEditado: any = {};
  mostrarFormularioCrear: boolean = false;
  esUsuarioPermitido: boolean = false;
  mensajeError: string = '';
  mostrarMensajeError: boolean = false;
  errorCreacion: string = '';
  errorEdicion: boolean = false;
  mostrarBotonEliminar: boolean = true;
  
  // private unsubscribe$ = new Subject<void>();

  private storeSvc= inject (StoreService)
  private carritoService= inject (CarritoService)
  private loginSvc= inject (LoginService)
  dialog = inject(MatDialog)


  ngOnInit() {
    this.productos$ = this.storeSvc.getListaProductos().pipe(
      map(data => data.map(producto => ({ ...producto, cantidadSeleccionada: 1, productoAgregado: false })))
    );

    const correoUsuario = this.loginSvc.obtenerCorreoUsuarioAutenticado();
    this.esUsuarioPermitido = correoUsuario === 'peperj7@gmail.com';
  }

  // ngOnDestroy() {
  //   this.unsubscribe$.next();
  //   this.unsubscribe$.complete();
  // }

  agregarAlCarrito(producto: any): void {
    const idUsuario = this.loginSvc.obtenerIdUsuarioAutenticado();
  
    if (idUsuario !== null) {
      this.mostrarMensajeError = false;
  
      if (producto.cantidadSeleccionada > producto.stock) {
        this.manejarErrorAgregarAlCarrito({ error: { error: 'No puedes agregar más productos de los disponibles en el stock' } }, producto);
        return;
      }
  
      this.carritoService.agregarAlCarrito(idUsuario, producto.id, producto.cantidadSeleccionada).
      // pipe(
      //   takeUntil(this.unsubscribe$)
      // ).
      subscribe({
        next: () => {
          console.log('Producto agregado al carrito con éxito');
          producto.productoAgregado = true;
          setTimeout(() => {
            producto.productoAgregado = false;
          }, 2000);
        },
        error: (error) => {
          console.error('Error al agregar el producto al carrito', error);
          this.manejarErrorAgregarAlCarrito(error, producto);
        }
      });
    } else {
      this.mostrarMensajeError = true;
      this.mensajeError = 'Tienes que iniciar sesión para añadir productos al carrito.';
  
      setTimeout(() => {
        this.mostrarMensajeError = false;
        this.loginSvc.redirigirALogin();
      }, 1000);
    }
  }

  manejarErrorAgregarAlCarrito(error: any, producto: any): void {
    if (error.error && error.error.message === 'Usuario no autenticado') {
      this.mensajeError = 'Tienes que iniciar sesión para añadir productos al carrito.';
      this.limpiarMensajeErrorDespuesDeDelay();
    } else if (error.error && error.error.error === 'No puedes agregar más productos de los disponibles en el stock') {
      this.mensajeError = 'No puedes agregar más productos de los disponibles en el stock.';
      producto.mostrarMensajeNoUnidades = true;

      setTimeout(() => {
        this.mensajeError = '';
        producto.mostrarMensajeNoUnidades = false;
      }, 5000);
    } else {
      this.mensajeError = 'Error al agregar el producto al carrito. Inténtelo de nuevo.';
      this.limpiarMensajeErrorDespuesDeDelay();
    }
  }

  private limpiarMensajeErrorDespuesDeDelay(): void {
    setTimeout(() => {
      this.mensajeError = '';
    }, 5000);
  }

  editarProducto(): void {
    if (!this.productoEditado.nombre || !this.productoEditado.descripcion || !this.productoEditado.precio || !this.productoEditado.stock || !this.productoEditado.imagen_url) {
      this.errorEdicion = true;

      setTimeout(() => {
        this.errorEdicion = false;
      }, 5000);

      return;
    }

    const camposEditados: any = {
      nombre: this.productoEditado.nombre,
      descripcion: this.productoEditado.descripcion,
      precio: this.productoEditado.precio,
      stock: this.productoEditado.stock,
      imagen_url: this.productoEditado.imagen_url
    };

    this.storeSvc.editProducto(this.productoEditado.id, camposEditados).
    // pipe(
    //   takeUntil(this.unsubscribe$)
    // ).
    subscribe({
      next: () => {
        this.productos$ = this.productos$.pipe(
          map(productos => productos.map(p => p.id === this.productoEditado.id ? { ...p, ...camposEditados } : p))
        );
        this.editando = false;
        this.productoEditado = {};
      },
      error: error => {
        console.error('Error al editar el producto', error);
      }
    });
  }

  iniciarCreacion(): void {
    this.mostrarFormularioCrear = true;
    this.nuevoProducto = {};
  }

  UsuarioPermitido(): boolean {
    const correoUsuario = this.loginSvc.obtenerCorreoUsuarioAutenticado();
    return correoUsuario === 'peperj7@gmail.com';
  }

  cancelarCreacion(): void {
    this.mostrarFormularioCrear = false;
    this.nuevoProducto = {};
  }

  iniciarEdicion(producto: any): void {
    this.editando = true;
    this.productoEditado = { ...producto };
    this.mostrarBotonEliminar = false;
  }

  cancelarEdicion(): void {
    this.editando = false;
    this.productoEditado = {};
    this.mostrarBotonEliminar = true;
  }

  eliminarProducto(idProducto: number): void {
  const dialogRef = this.dialog.open(DeleteComponent);
  dialogRef.afterClosed().subscribe((result) => {
    if (result) {
      this.storeSvc.deleteProducto(idProducto).subscribe({
        next: () => {
          this.productos$ = this.productos$.pipe(
            map(productos => productos.filter(p => p.id !== idProducto))
          );
          console.log('Producto eliminado correctamente');
        },
        error: error => {
          console.error('Error al eliminar el producto', error);
        }
      });
    }
  });
}

  crearProducto(): void {
    if (!this.nuevoProducto.nombre || !this.nuevoProducto.descripcion || !this.nuevoProducto.precio || !this.nuevoProducto.stock || !this.nuevoProducto.imagen_url) {
      this.errorCreacion = 'Todos los campos son obligatorios';

      setTimeout(() => {
        this.errorCreacion = '';
      }, 5000);
      return;
    }

    this.storeSvc.createProducto(this.nuevoProducto).
    // pipe(
    //   takeUntil(this.unsubscribe$)
    // ).
    subscribe({
      next: productoCreado => {
        this.productos$ = this.productos$.pipe(
          map(productos => [...productos, productoCreado])
        );
        this.mostrarFormularioCrear = false;
        this.nuevoProducto = {};
      },
      error: error => {
        console.error('Error al crear el producto', error);
      }
    });
  }

  guardarCambios(): void {
    if (this.editando) {
      this.editarProducto();
    } else {
      this.storeSvc.createProducto(this.productoEditado).
      // pipe(
      //   takeUntil(this.unsubscribe$)
      // ).
      subscribe({
        next: productoCreado => {
          this.productoEditado = {};
        },
        error: error => {
          console.error('Error al crear el producto', error);
        }
      });
    }
  }
}