import { Component, OnInit, NgZone, Input } from '@angular/core';
import { Web3Service } from 'services/web3.service';
import { PoolListDaemon, IPoolIdentifier } from 'services/poolListDaemon.service';

@Component({
  selector: 'app-running-pools-widget',
  templateUrl: './running-pools-widget.component.html',
  styleUrls: ['./running-pools-widget.component.css']
})
export class RunningPoolsWidgetComponent implements OnInit {

  pools: IPoolIdentifier[];

  @Input()
  title: string;

  @Input()
  fnNameRetrievePoolList: string;



  constructor(
    private __web3Service: Web3Service,
    private __poolListDaemon: PoolListDaemon,
    private __ngZone: NgZone
  ) { }



  ngOnInit() {
    this.pools = this.__poolListDaemon[this.fnNameRetrievePoolList]();

    this.__poolListDaemon.updateEventStream
      .subscribe(() => {
        this.__ngZone.run(() => {
          this.pools = this.__poolListDaemon[this.fnNameRetrievePoolList]();
        });
      });
    this.__poolListDaemon.triggerRefresh.next();
  }

}
