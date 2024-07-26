import { HttpInterceptorFn, HttpRequest, HttpResponse, HttpHandlerFn } from '@angular/common/http';

export const httpInterceptorInterceptor: HttpInterceptorFn = (req, next: HttpHandlerFn) => {
  const modifiedReq = req.clone({ withCredentials: true });

  // Puedes verificar el tipo de next para asegurarte de que es una función antes de llamarla
  if (typeof next === 'function') {
    return next(modifiedReq) as any;
  }

  // En caso de que next no sea una función válida, puedes devolver una respuesta por defecto
  return new HttpResponse({ status: 200, body: 'Response from interceptor' });
};