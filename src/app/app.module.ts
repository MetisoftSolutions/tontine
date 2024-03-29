import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { APP_ROUTES } from 'app/app.routes';
import { NavigationPaneComponent } from './navigation-pane/navigation-pane.component';
import { PageHomeComponent } from './page-home/page-home.component';
import { PageCreatePoolComponent } from './page-create-pool/page-create-pool.component';
import { RunningPoolsWidgetComponent } from './running-pools-widget/running-pools-widget.component';
import { PoolInvitationsWidgetComponent } from './pool-invitations-widget/pool-invitations-widget.component';
import { ContractDirectoryService } from 'services/contractDirectory.service';
import { Web3Service } from 'services/web3.service';
import { TontinePoolDirectoryService } from 'services/tontinePoolDirectory.service';
import { ContractService } from 'services/contract.service';
import { TontinePoolService } from 'services/tontinePool.service';
import { LoadingIndicatorComponent } from './loading-indicator/loading-indicator.component';
import { LoadingService } from 'services/loading.service';
import { PoolListDaemon } from 'services/poolListDaemon.service';
import { PagePoolDetailsComponent } from './page-pool-details/page-pool-details.component';
import { InitEventStreamService } from 'services/initEventStream.service';
import { ParticipantListWidgetComponent } from './participant-list-widget/participant-list-widget.component';
import { SwitchAccountWidgetComponent } from './switch-account-widget/switch-account-widget.component';
import { ModalService } from 'services/modal.service';

const SERVICES = [
  Web3Service,
  ContractDirectoryService,
  TontinePoolDirectoryService,
  ContractService,
  TontinePoolService,
  LoadingService,
  PoolListDaemon,
  InitEventStreamService,
  ModalService
];



@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(APP_ROUTES, { enableTracing: false, useHash: true }),
  ],
  declarations: [
    AppComponent,
    NavigationPaneComponent,
    PageHomeComponent,
    PageCreatePoolComponent,
    RunningPoolsWidgetComponent,
    PoolInvitationsWidgetComponent,
    LoadingIndicatorComponent,
    PagePoolDetailsComponent,
    ParticipantListWidgetComponent,
    SwitchAccountWidgetComponent
  ],
  providers: [SERVICES],
  bootstrap: [AppComponent]
})
export class AppModule { }
