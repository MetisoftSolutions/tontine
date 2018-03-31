import { Routes } from '@angular/router';
import { PageHomeComponent } from 'app/page-home/page-home.component';
import { PageCreatePoolComponent } from 'app/page-create-pool/page-create-pool.component';

export interface IRouteData {
    navbarName: string;
}

export const APP_ROUTES: Routes = [
    {
        path: 'home',
        component: PageHomeComponent,
        data: PageHomeComponent.ROUTE_DATA
    },
    {
        path:'create-pool',
        component: PageCreatePoolComponent,
        data: PageCreatePoolComponent.ROUTE_DATA
    },
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'prefix'
    }
]