import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable()
export class LoadingService {

  isLoading: BehaviorSubject<boolean>;
  message: BehaviorSubject<string>;



  constructor() {
    this.isLoading = new BehaviorSubject<boolean>(false);
    this.message = new BehaviorSubject<string>('');
  }



  turnOn(message?: string) {
    if (message) {
      this.message.next(message);
    }
    
    this.isLoading.next(true);
  }



  turnOff() {
    this.isLoading.next(false);
  }



  setMessage(message: string) {
    this.message.next(message);
  }

}