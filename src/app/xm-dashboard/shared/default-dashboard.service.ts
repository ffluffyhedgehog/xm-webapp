import { Injectable } from '@angular/core';
import { XmUiConfigService } from '@xm-ngx/core';
import { DashboardWrapperService } from './dashboard-wrapper.service';
import { Dashboard } from './dashboard.model';
import * as _ from 'lodash';
import { Observable, zip } from 'rxjs';
import { map, take } from 'rxjs/operators';

function getWithConfig(idOrSlug: number | string | null, dashboards: Dashboard[]): Dashboard | null {
    if (!idOrSlug || !dashboards) {
        return null;
    }
    return dashboards.find((d) => (d.config && d.config.slug === idOrSlug));
}

@Injectable({providedIn: 'root'})
export class DefaultDashboardService {

    constructor(
        private xmConfigService: XmUiConfigService,
        private dashboardWrapperService: DashboardWrapperService,
    ) {
    }

    public getFromConfig(): Observable<Dashboard | null> {
        return this.getDefaultAndDashboards$().pipe(
            map(([c, d]) => getWithConfig(c, d)),
        );
    }

    public getDefaultOrFirstAvailable(): Observable<Dashboard | null> {
        const getWithOrderIndex = (dashboards: Dashboard[]): Dashboard | null => {
            if (!dashboards) {
                return null;
            }
            const sorted = _.sortBy(dashboards, (d) => d.config?.orderIndex);
            return sorted[0] || null;
        };

        return this.getDefaultAndDashboards$().pipe(
            map(([config, dashboards]) => {
                const withConfig = getWithConfig(config, dashboards);
                if (withConfig) {
                    return withConfig;
                }

                return getWithOrderIndex(dashboards);
            }),
        );
    }

    private getDefaultAndDashboards$(): Observable<[number | string | null, Dashboard[] | null]> {
        const config$ = this.xmConfigService.config$().pipe(
            take(1),
            map(c => c && c.defaultDashboard ? c.defaultDashboard : null),
        );
        const dashboards$ = this.dashboardWrapperService.dashboards$().pipe(take(1));

        return zip(config$, dashboards$);
    }

}