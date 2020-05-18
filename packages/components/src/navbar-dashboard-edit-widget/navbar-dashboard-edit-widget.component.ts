import { Component, NgModule, OnDestroy, OnInit, Type } from '@angular/core';
import {
    DashboardEditComponent,
    DashboardEditorService,
    DASHBOARDS_TRANSLATES,
    DashboardsExportService,
    DashboardsImportService,
    DashboardsManagerService,
    DashboardsModule,
} from '@xm-ngx/administration/dashboards-config-widget';
import { Dashboard, PageService } from '@xm-ngx/dynamic';
import { XmSharedModule } from '@xm-ngx/shared';
import { takeUntilOnDestroy, takeUntilOnDestroyDestroy } from '@xm-ngx/shared/operators';

@Component({
    selector: 'xm-navbar-dashboard-edit-widget',
    template: `
        <button mat-icon-button
                *permitted="'DASHBOARD.CREATE'"
                [style.visibility]="page ? 'visible' : 'hidden'"
                [color]="isEditing ? 'primary' : undefined"
                [matTooltip]="TRS.editDashboard | translate" (click)="onEdit()">
            <mat-icon>edit</mat-icon>
        </button>
    `,
    providers: [DashboardEditorService, DashboardsExportService, DashboardsImportService, DashboardsManagerService],
})
export class NavbarDashboardEditWidgetComponent implements OnInit, OnDestroy {
    public TRS: typeof DASHBOARDS_TRANSLATES = DASHBOARDS_TRANSLATES;

    public page: Dashboard;
    public isEditing: boolean;

    constructor(
        private pageService: PageService,
        private editorService: DashboardEditorService,
    ) {
    }

    public ngOnInit(): void {
        this.editorService.close$.pipe(takeUntilOnDestroy(this)).subscribe(() => this.isEditing = false);
        this.pageService.active$().pipe(takeUntilOnDestroy(this)).subscribe((i) => {
            this.page = i as Dashboard;
            if (this.isEditing) {
                this.editorService.editDashboard(DashboardEditComponent, this.page);
            }
        });
    }

    public onEdit(): void {
        if (this.page && !this.isEditing) {
            this.isEditing = true;
            this.editorService.editDashboard(DashboardEditComponent, this.page);
        } else {
            this.isEditing = false;
            this.editorService.close();
        }
    }

    public ngOnDestroy(): void {
        takeUntilOnDestroyDestroy(this);
    }

}

@NgModule({
    imports: [XmSharedModule, DashboardsModule],
    exports: [NavbarDashboardEditWidgetComponent],
    declarations: [NavbarDashboardEditWidgetComponent],
    providers: [],
})
export class NavbarDashboardEditWidgetModule {
    public static entry: Type<NavbarDashboardEditWidgetComponent> = NavbarDashboardEditWidgetComponent;
}