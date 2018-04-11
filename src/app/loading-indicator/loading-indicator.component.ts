import { Component, OnInit } from '@angular/core';
import { LoadingService } from 'services/loading.service';

@Component({
  selector: 'app-loading-indicator',
  templateUrl: './loading-indicator.component.html',
  styleUrls: ['./loading-indicator.component.css']
})
export class LoadingIndicatorComponent implements OnInit {

  isLoading = false;
  message = '';



  constructor(
    private __loadingService: LoadingService
  ) {

  }



  ngOnInit() {
    this.__loadingService.isLoading.subscribe((isLoading: boolean) => {
      this.isLoading = isLoading;
    });

    this.__loadingService.message.subscribe((message: string) => {
      this.message = message;
    });
  }

}
