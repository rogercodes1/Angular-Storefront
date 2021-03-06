import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { ContactListComponent } from './contact-list/contact-list.component';
import { ProductListComponent } from './product-list/product-list.component';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { AddCouponComponent } from './add-coupon/add-coupon.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { AddProductComponent } from './add-product/add-product.component';
import { CartListComponent } from './cart-list/cart-list.component';
import { CouponListComponent } from './coupon-list/coupon-list.component';

import { AuthGuard } from './auth.guard';
import { VendorGuard } from './vendor.guard';



const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'sign-up',
    component: SignUpComponent
  },
  {
    path: 'products',
    component: ProductListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'add-product',
    component: AddProductComponent,
    canActivate: [VendorGuard]
  },
  {
    path: 'add-coupon',
    component: AddCouponComponent,
    canActivate: [VendorGuard]
  },
  {
    path: 'coupons',
    component: CouponListComponent,
    canActivate: [VendorGuard]
  },
  {
    path: 'cart',
    component: CartListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'checkout',
    component: CheckoutComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
