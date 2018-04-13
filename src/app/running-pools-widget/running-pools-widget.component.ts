import { Component, OnInit, NgZone } from '@angular/core';
import { Web3Service } from 'services/web3.service';
import { PoolListDaemon } from 'services/poolListDaemon.service';

@Component({
  selector: 'app-running-pools-widget',
  templateUrl: './running-pools-widget.component.html',
  styleUrls: ['./running-pools-widget.component.css']
})
export class RunningPoolsWidgetComponent implements OnInit {

  ownedPools: {
    name: string,
    address: string
  }[];



  constructor(
    private __web3Service: Web3Service,
    private __poolListDaemon: PoolListDaemon,
    private __ngZone: NgZone
  ) { }



  ngOnInit() {
    this.ownedPools = this.__poolListDaemon.getOwnedPools();

    this.__poolListDaemon.updateEventStream
      .subscribe(() => {
        this.__ngZone.run(() => {
          this.ownedPools = this.__poolListDaemon.getOwnedPools();
          console.log(this.ownedPools);
        });
      });
    this.__poolListDaemon.triggerRefresh.next();
  }

}
