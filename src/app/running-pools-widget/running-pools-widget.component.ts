import { Component, OnInit } from '@angular/core';
import { Web3Service } from 'services/web3.service';

@Component({
  selector: 'app-running-pools-widget',
  templateUrl: './running-pools-widget.component.html',
  styleUrls: ['./running-pools-widget.component.css']
})
export class RunningPoolsWidgetComponent implements OnInit {

  constructor(
    private __web3Service: Web3Service
  ) { }



  ngOnInit() {
  }

}
