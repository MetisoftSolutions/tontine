import { Component, OnInit, NgZone } from '@angular/core';
import { ModalService } from 'services/modal.service';
import { Web3Service } from 'services/web3.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';

@Component({
  selector: 'app-switch-account-widget',
  templateUrl: './switch-account-widget.component.html',
  styleUrls: ['./switch-account-widget.component.css']
})
export class SwitchAccountWidgetComponent implements OnInit {

  isVisible = false;
  accounts: string[] = [];
  primaryAccount: string;



  constructor(
    private __modalService: ModalService,
    private __web3Service: Web3Service,
    private __router: Router,
    private __ngZone: NgZone
  ) { }



  ngOnInit() {
    Observable.combineLatest([
        this.__web3Service.getAccounts(),
        this.__web3Service.getPrimaryAccount()  
      ])

      .subscribe(([accounts, primaryAccount]: [string[], string]) => {
        this.accounts = accounts;
        this.primaryAccount = primaryAccount;
      });

    this.__modalService.isSwitchAccountModalActive
      .subscribe((active: boolean) => {
        this.isVisible = active;
      });
  }



  switchTo(account: string, accountIndex: number) {
    this.__ngZone.run(() => {
      this.__web3Service.setPrimaryAccount(account, accountIndex);
      this.__modalService.turnOffSwitchAccountModal();
      this.__updatePrimaryAccount();
      this.__router.navigate(['/']);
    });
  }




  private __updatePrimaryAccount() {
    this.__web3Service.getPrimaryAccount()
      .subscribe((primaryAccount: string) => {
        this.primaryAccount = primaryAccount;
      });
  }



  close() {
    this.__modalService.turnOffSwitchAccountModal();
  }

}
