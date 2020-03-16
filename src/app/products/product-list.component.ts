import { Component, ChangeDetectionStrategy } from '@angular/core';

import { Subscription, Observable, of, combineLatest, BehaviorSubject, Subject } from 'rxjs';

import { Product } from './product';
import { ProductService } from './product.service';
import { catchError, map, startWith } from 'rxjs/operators';
import { ProductCategoryService } from '../product-categories/product-category.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  pageTitle = 'Product List';
  private errorMessageSubject = new Subject<String>();
  errorMessage$ = this.errorMessageSubject.asObservable();

  private categorySelectedSubject = new BehaviorSubject<number>(0);
  categorySelectedAction$ = this.categorySelectedSubject.asObservable();
  
  products$ = combineLatest([
    this.productService.productsWithAdd$,
    this.categorySelectedAction$
  ]).pipe(
      map(([products, selectedCategoryId]) => 
        products.filter(product => 
          selectedCategoryId ? product.categoryId === selectedCategoryId : true  
        )
      ),
      catchError(err => {
        this.errorMessageSubject.next(err);
        return of([]);
      })
    );

    categories$ = this.productCategoryService.productCategories$
    .pipe(
      catchError(err => {
        this.errorMessageSubject.next(err);
        return of([]);
      })
    )


  sub: Subscription;

  constructor(
    private productService: ProductService,
    private productCategoryService: ProductCategoryService
  ) {}

  onAdd(): void {
    this.productService.addProduct();
  }

  onSelected(categoryId: string): void {
    this.categorySelectedSubject.next(+categoryId);
  }
}
