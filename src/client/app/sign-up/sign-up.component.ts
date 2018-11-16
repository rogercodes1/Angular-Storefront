import { Component, OnInit } from '@angular/core';
import { ApiService } from '../shared/api.service';
import { AuthService } from '../shared/auth.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {

  constructor(private api: ApiService,
              private auth: AuthService,
              private router: Router) { }

  ngOnInit() {
  }
  onSubmit(form: NgForm) {
    const values = form.value;

    const payload = {
      username: values.username,
      password: values.password
    }

    this.api.post('authenticate', payload)
    .subscribe(data => {


      this.auth.setToken(data.token);
      this.auth.setID(data.id);
      this.auth.setVendor(data.vendor);


      this.router.navigate(['/products']);
    })
  }

}
