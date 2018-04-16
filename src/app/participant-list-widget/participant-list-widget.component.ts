import { Component, OnInit, Input, NgZone } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs/Rx';
import { IPoolDetails, TontinePoolService } from 'services/tontinePool.service';

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
  stateName: string;
  errorMessage: string;



  constructor(
    private __poolService: TontinePoolService
  ) { }



  ngOnInit() {
    this.poolDetailsUpdateStream
      .subscribe((poolDetails: IPoolDetails) => {
        this.participants = poolDetails.participantAddresses;
        this.stateName = poolDetails.stateName;
      });
  }



  onClickAddParticipant(newParticipantAddress: string) {
    this.isUpdating = true;
    this.errorMessage = '';

    this.__poolService.addParticipant(this.poolInstance, newParticipantAddress)
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



  onClickRemoveParticipant(participantAddress: string) {
    this.__poolService.removeParticipant(this.poolInstance, participantAddress)
      .subscribe(
        () => {
          this.triggerPoolDetailsUpdate();
        },
        (err: any) => {
          console.error(err);
        }
      );
  }

}
