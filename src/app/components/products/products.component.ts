import { Component, OnInit } from '@angular/core';

import { switchMap } from 'rxjs/operators'
import { zip } from 'rxjs'

import { createdProductDTO, Product, updatedProductDTO } from '../../models/product.model';

import { StoreService } from '../../services/store.service';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

  myShoppingCart: Product[] = [];
  total = 0;
  products: Product[] = [];
  showProductsDetail = false;
  productChoosen: Product = {
    id: '',
    price: 0,
    images: [],
    title: '',
    category: {
      id: '',
      name: ''
    },
    description: ''
  };
  limit = 10;
  offset = 0;
  statusDetail: 'loading' | 'success' | 'error' | 'init' = 'init';

  constructor(
    private storeService: StoreService,
    private productsService: ProductsService
  ) {
    this.myShoppingCart = this.storeService.getShoppingCart();
  }

  ngOnInit(): void {
    this.loadMore();
  }

  onAddToShoppingCart(product: Product) {
    this.storeService.addProduct(product);
    this.total = this.storeService.getTotal();
  }

  toggleProductDetail(){
    this.showProductsDetail = !this.showProductsDetail;
  }

  onShowDetail(id: string){
    this.statusDetail = 'loading';
    //this.toggleProductDetail();
    this.productsService.getProduct(id).subscribe(data => {
      //console.log("detalle" , data);
      this.toggleProductDetail();
      this.productChoosen = data;
      this.statusDetail = 'success';
    }, errMsg =>{
      window.alert(errMsg);
      alert()
      this.statusDetail = 'error';
    });
  }

  readAndUpdate(id: string){
    this.productsService.getProduct(id)
    .pipe(
      switchMap((product) => this.productsService.update(product.id, {title: 'change'}))
      ).subscribe(data =>{
        console.log(data);
    });
    this.productsService.fetchReadAndUpdate(id, {title: 'change'}).subscribe( res =>{
      const read = res[0];
      const update = res[1];
    });
  }

  createNewProduct(){
    const product: createdProductDTO = {
      title: 'Este es el titulo',
      description: 'bla bla bla bla',
      images: ['https://placeimg.com/640/480/any?random=$%7BMath.random()%7D'],
      price: 10000,
      categoryId: 1
    }
    this.productsService.create(product).subscribe( data =>{
      console.log('Created', data);
      this.products.unshift(data);
    });
  }

  updateProduct(){
    const changes: updatedProductDTO = {
      title: 'Nuevo titulo actualizado'
    }
    const id = this.productChoosen.id;
    this.productsService.update(id, changes).subscribe( data =>{
      console.log("Data actualizada", data);
      const productIndex = this.products.findIndex( item => item.id === this.productChoosen.id);
      this.products[productIndex] = data;
      this.productChoosen = data;
    });
  }

  deleteProduct(){
    const id = this.productChoosen.id;
    this.productsService.delete(id).subscribe( () => {
      const productIndex = this.products.findIndex( item => item.id === this.productChoosen.id);
      this.products.splice(productIndex, 1);
      this.showProductsDetail = false;
    })
  }

  loadMore(){
    this.productsService.getAllProducts(this.limit, this.offset)
    .subscribe(data => {
      this.products = this.products.concat(data);
      this.offset += this.limit;
    });
  }


}
