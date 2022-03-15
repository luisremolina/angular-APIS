import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { retry, catchError, map } from 'rxjs/operators';
import { throwError, zip } from 'rxjs';

import { environment } from './../../environments/environment'
import { createdProductDTO, Product, updatedProductDTO } from './../models/product.model';


@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private apiUrl =`${environment.API_URL}/api/products`;

  constructor(
    private http: HttpClient
  ) { }

  getAllProducts(limit?: number, offset?: number) {
    let params = new HttpParams();
    if(limit !== undefined && offset !== undefined){
      params = params.set('limit', limit);
      params = params.set('offset', offset);
    }
    return this.http.get<Product[]>(this.apiUrl, { params }).pipe(
      retry(3),
      map(productos => productos.map(item => {
        return {
          ...item,
          taxes: .19 * item.price
        }
      }))
    );
  }

  fetchReadAndUpdate(id: string, dto: updatedProductDTO){
    return zip(
      this.getProduct(id),
      this.update(id, dto)
    );

  }

  // getProductsByPage(limit: number, offset: number){
  //   return this.http.get<Product[]>(`${this.apiUrl}`, {
  //     params: {limit, offset}
  //   });
  // }

  getProduct(id: string){
    return this.http.get<Product>(`${this.apiUrl}/${id}`)
    .pipe( catchError((error : HttpErrorResponse) => {
      if(error.status === HttpStatusCode.Conflict){
        return throwError('Ups algo esta fallando en el servidor');
      }
      if(error.status === HttpStatusCode.NotFound){
        return throwError('El producto no existe');
      }
      if(error.status === HttpStatusCode.Unauthorized){
        return throwError('No tienes permiso para ingresar aca');
      }
      return throwError('Ups algo salio mal');
    })
    );
  }

  create(dto: createdProductDTO){
    return this.http.post<Product>(this.apiUrl, dto);
  }

  update(id: string, dto: updatedProductDTO){
    return this.http.put<Product>(`${this.apiUrl}/${id}`, dto)
  }

  delete(id: string){
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
  }

}
