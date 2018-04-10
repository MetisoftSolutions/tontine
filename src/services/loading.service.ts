import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable()
export class LoadingService {

  isLoading: BehaviorSubject<boolean>;



  constructor() {
    this.isLoading = new BehaviorSubject<boolean>(false);
  }



  turnOn() {
    this.isLoading.next(true);
  }



  turnOff() {
    this.isLoading.next(false);
  }

}