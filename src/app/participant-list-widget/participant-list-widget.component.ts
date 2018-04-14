import { Component, OnInit, Input } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs/Rx';
import { IPoolDetails } from 'services/tontinePool.service';

@Component({
  selector: 'app-participant-list-widget',
  templateUrl: './participant-list-widget.component.html',
  styleUrls: ['./participant-list-widget.component.css']
})
export class ParticipantListWidgetComponent implements OnInit {

  @Input() isOwner: boolean;
  @Input() triggerPoolDetailsUpdate: Function;
  @Input() poolInstance: any;
  @Input() poolDetailsUpdateStream: ReplaySubject<IPoolDetails>;

  isUpdating = false;
  participants: string[];
  errorMessage: string;



  constructor() { }



  ngOnInit() {
    this.poolDetailsUpdateStream
      .subscribe((poolDetails: IPoolDetails) => {
        this.participants = poolDetails.participantAddresses;
      });
  }



  onClickAddParticipant(newParticipantAddress: string) {
    this.isUpdating = true;
    this.errorMessage = '';
    Observable.from(this.poolInstance.addParticipant(newParticipantAddress))
      .subscribe(
        () => {
          this.triggerPoolDetailsUpdate();
          this.isUpdating = false;
        },
        (err: any) => {
          this.isUpdating = false;
          this.errorMessage = "Error adding participant. Are they already in the pool?"
        });
  }

}
