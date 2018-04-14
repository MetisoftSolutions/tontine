import { Injectable } from "@angular/core";
import { ReplaySubject } from "rxjs";

/**
 * Provides a shared event stream to signal when the app is completely initialized.
 * Subscribers can use this to tell when it's okay to start making requests to the blockchain.
 */
@Injectable()
export class InitEventStreamService {

  stream: ReplaySubject<string> = new ReplaySubject<string>(1);



  constructor() {

  }



  init() {
    this.stream.next('complete');
  }

}