export interface Profile {
    nombre: string;
    apellidos: string;
    correo_electronico: string;
    direccion: string;
    telefonos: Telefono[];
  
}
export interface Telefono {
    numero: string;
  }