import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
})
export class Footer {
  public currentYear = new Date().getFullYear();
  public currentDate = new Date().toLocaleDateString();
}
