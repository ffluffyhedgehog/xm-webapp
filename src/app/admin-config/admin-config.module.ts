import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { JhiEventManager, JhiLanguageService } from 'ng-jhipster';
import { XmSharedModule } from '../shared/shared.module';
import { XmDashboardModule } from '../xm-dashboard/xm-dashboard.module';
import { XM_EVENT_LIST } from '../xm.constants';
import { adminConfigState } from './admin-config.route';
import {
    DashboardDetailDialogComponent,
} from './dashboard-mng/dashboard-detail-dialog/dashboard-detail-dialog.component';
import { DashboardListCardComponent } from './dashboard-mng/dashboard-list-card/dashboard-list-card.component';
import { DashboardResolvePagingParams } from './dashboard-mng/dashboard-mng.route';
import { WidgetDetailDialogComponent } from './dashboard-mng/widget-detail-dialog/widget-detail-dialog.component';
import { WidgetListCardComponent } from './dashboard-mng/widget-list-card/widget-list-card.component';
import {
    ConfigVisualizerDialogComponent,
} from './specification-mng/config-visualizer-dialog/config-visualizer-dialog.component';
import { SpecificationMngComponent } from './specification-mng/specification-mng.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(adminConfigState),
        XmSharedModule,
        XmDashboardModule,
    ],
    declarations: [
        DashboardDetailDialogComponent,
        DashboardListCardComponent,
        ConfigVisualizerDialogComponent,
        SpecificationMngComponent,
        WidgetDetailDialogComponent,
        WidgetListCardComponent,
    ],
    entryComponents: [
        DashboardDetailDialogComponent,
        ConfigVisualizerDialogComponent,
        SpecificationMngComponent,
        WidgetDetailDialogComponent,
    ],
    providers: [
        DashboardResolvePagingParams,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class XmAdminConfigModule {
    constructor(private eventManager: JhiEventManager, private jhiLanguageService: JhiLanguageService) {
        this.eventManager.subscribe(XM_EVENT_LIST.XM_CHANGE_LANGUAGE, (event) => {
            this.jhiLanguageService.changeLanguage(event.content);
        });
    }
}
