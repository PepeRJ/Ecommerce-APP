export interface Login {
    username: string;
    password: string;
}

  export interface Usuario {
    id: number;
    nombre: string;
    apellidos: string;
    correo_electronico: string;
    contrasenya: string;
    direccion: string;
  }
  
  export interface DatosRegistro {
    nombre: string;
    apellidos: string;
    correo_electronico: string;
    direccion: string;
    contrasenya: string;
    numero: number[];
  }
  
  
  export interface RespuestaLogin {
    message: string;
    usuario: Usuario;
    token: string;
  }