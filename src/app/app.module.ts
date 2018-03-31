import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';

import {MetaCoinService, Web3Service} from '../services/services'
import { RouterModule } from '@angular/router';
import { APP_ROUTES } from 'app/app.routes';
import { NavigationPaneComponent } from './navigation-pane/navigation-pane.component';
import { PageHomeComponent } from './page-home/page-home.component';
import { PageCreatePoolComponent } from './page-create-pool/page-create-pool.component';
import { RunningPoolsWidgetComponent } from './running-pools-widget/running-pools-widget.component';
import { PoolInvitationsWidgetComponent } from './pool-invitations-widget/pool-invitations-widget.component';

const SERVICES = [
  MetaCoinService,
  Web3Service,
]


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
    PoolInvitationsWidgetComponent
  ],
  providers: [SERVICES],
  bootstrap: [AppComponent]
})
export class AppModule { }
