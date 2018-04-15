import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable()
export class ModalService {

  isSwitchAccountModalActive: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);



  constructor() {

  }



  turnOnSwitchAccountModal() {
    this.isSwitchAccountModalActive.next(true);
  }



  turnOffSwitchAccountModal() {
    this.isSwitchAccountModalActive.next(false);
  }

}