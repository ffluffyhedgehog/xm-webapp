import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';
import { Observable, ReplaySubject, Subscription } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { Account, AuthServerProvider, LoginService, Principal } from '../shared';
import { XmConfigService } from '../shared/spec/config.service';
import { Widget } from '../xm-dashboard';
import { DEFAULT_AUTH_TOKEN, DEFAULT_CONTENT_TYPE, XM_EVENT_LIST } from '../xm.constants';

@Component({
    selector: 'xm-home',
    templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit, OnDestroy {

    public account: Account;
    public modalRef: NgbModalRef;
    public defaultWidget: Widget;
    public defaultLayout: any;
    public signWidget: Widget;
    private eventAuthSubscriber: Subscription;
    private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

    constructor(private principal: Principal,
                private eventManager: JhiEventManager,
                private xmConfigService: XmConfigService,
                private http: HttpClient,
                protected loginService: LoginService,
                private authServerProvider: AuthServerProvider) {
    }

    public ngOnInit(): void {
        this.signWidget = this.getWidgetComponent({selector: 'ext-common/xm-widget-sign-in-up'});

        this.principal.getAuthenticationState().subscribe((state) => {
            if (state) {
                this.principal.identity().then((account) => {
                    this.account = account;
                });
            }
        });

        this.registerAuthenticationSuccess();

        if (!this.isAuthenticated()) {
            this.getAccessToken().subscribe(() => {
                this.getConfigAndNavigate();
            });
        } else if (this.isAuthenticated()) {
            this.loginService.checkAvailableUrlsAndNavigate();
        }
    }

    public ngOnDestroy(): void {
        this.eventManager.destroy(this.eventAuthSubscriber);
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }

    public registerAuthenticationSuccess(): void {
        this.eventAuthSubscriber = this.eventManager.subscribe(XM_EVENT_LIST.XM_SUCCESS_AUTH, () => {
            this.principal.identity().then((account) => {
                this.account = account;
            });
        });
    }

    public isAuthenticated(): boolean {
        return this.principal.isAuthenticated();
    }

    private getConfigAndNavigate(): void {
        this.xmConfigService.getUiConfig()
            .pipe(takeUntil(this.destroyed$))
            .subscribe((result) => {
                if (result) {
                    if (result.defaultLayout) {
                        this.defaultLayout = result.defaultLayout.map((row) => {
                            row.content = row.content.map((el) => {
                                el.widget = this.getWidgetComponent(el.widget);
                                return el;
                            });
                            return row;
                        });
                    } else {
                        this.defaultWidget = this.getWidgetComponent(result.defaultWidget);
                    }
                } else {
                    this.defaultWidget = this.getWidgetComponent();
                }
            }, (err) => {
                console.warn(err);
                this.defaultWidget = this.getWidgetComponent();
            });
    }

    private getAccessToken(): Observable<void> {
        const data = new HttpParams().set('grant_type', 'client_credentials');
        const headers = {
            'Content-Type': DEFAULT_CONTENT_TYPE,
            'Authorization': DEFAULT_AUTH_TOKEN,
        };
        return this.http.post<any>('uaa/oauth/token', data, {headers, observe: 'response'})
            .pipe(map((resp) => {
                this.authServerProvider.loginWithToken(resp.body.access_token, false);
            }));
    }

    private getWidgetComponent(widget: Widget = {}): Widget {
        widget.selector = widget.selector ? widget.selector : 'ext-common/xm-widget-welcome';
        const mapComponents = {
            'xm-widget-available-offerings': 'ext-common-entity/xm-widget-available-offerings',
            'xm-widget-clock': 'ext-common/xm-widget-clock',
            'xm-widget-general-map': 'ext-common-entity/xm-widget-general-map',
            'xm-widget-stats': 'ext-common-entity/xm-widget-stats',
            'xm-widget-tasks': 'ext-common-entity/xm-widget-tasks',
            'xm-widget-weather': 'ext-common/xm-widget-weather',
            'xm-widget-exchange-calculator': 'ext-common/xm-widget-exchange-calculator',
            'xm-widget-md': 'ext-common/xm-widget-md',
            'xm-widget-lots': 'ext-auction/xm-widget-lots',
            'xm-widget-welcome': 'ext-common/xm-widget-welcome',
            'xm-widget-sign-in-up': 'ext-common/xm-widget-sign-in-up',
            'xm-widget-iframe': 'ext-common/xm-widget-iframe',
        };
        if (typeof mapComponents[widget.selector] === 'string' || mapComponents[widget.selector] instanceof String) {
            widget.selector = mapComponents[widget.selector];
        } else {
            widget.component = mapComponents[widget.selector];
        }
        if (widget.selector.indexOf('/') > 0) {
            widget.module = widget.selector.split('/')[0];
            widget.selector = widget.selector.split('/')[1];
        }
        widget.config = widget.config || {};
        Object.assign(widget.config, {
            id: widget.id,
            name: widget.name,
        });
        return widget;
    }

}
