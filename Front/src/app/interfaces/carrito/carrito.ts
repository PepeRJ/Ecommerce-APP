export interface Carrito {
    carritoProductos: CarritoProducto[];
    precioTotal: number;
    carritoId: number | null;
  }


export interface CarritoProducto {
    producto: {
      id: number;
      nombre: string;
      precio: number;
    };
    cantidad: number;
  }
