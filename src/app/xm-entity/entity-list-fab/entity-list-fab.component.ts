import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { JhiEventManager } from 'ng-jhipster';

import { XM_EVENT_LIST } from '../../xm.constants';
import { EntityDetailDialogComponent } from '../entity-detail-dialog/entity-detail-dialog.component';
import { Spec } from '../shared/spec.model';
import { XmEntitySpec } from '../shared/xm-entity-spec.model';
import { XmEntitySpecService } from '../shared/xm-entity-spec.service';
import { Principal } from '../../shared';
import { EntityUiConfig } from '../../shared/spec/xm-ui-config-model';

declare let swal: any;

@Component({
    selector: 'xm-entity-list-fab',
    templateUrl: './entity-list-fab.component.html',
    styleUrls: ['./entity-list-fab.component.scss'],
})
export class EntityListFabComponent implements OnChanges {

    public showAddButton: boolean;

    @Input() public xmEntitySpec: XmEntitySpec;
    @Input() public spec: Spec;
    @Input() public uiConfig: any;
    @Input() public entityType: any;

    constructor(private xmEntitySpecService: XmEntitySpecService,
                private eventManager: JhiEventManager,
                private modalService: NgbModal,
                private translateService: TranslateService,
                private principal: Principal,
    ) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.showAddButton = true;

        const currentKey = changes.xmEntitySpec.currentValue.key;
        const entities: EntityUiConfig[] = this.uiConfig.applications
            && this.uiConfig.applications.config
            && this.uiConfig.applications.config.entities;

        if (currentKey && entities && entities.length > 0) {
            entities.forEach((el: EntityUiConfig) => {
                if (el.typeKey === currentKey) {
                    this.checkEntityAddPermission(el);
                }
            });
        }
    }

    private checkEntityAddPermission(config: EntityUiConfig): void {
        if (config.addButtonPermission) {
            this.showAddButton = false;
            this.principal.hasPrivileges([config.addButtonPermission]).then((result) => {
                if (result) {
                    this.showAddButton = true;
                }
            });
        }
    }

    public onRefresh(): void {
        this.eventManager.broadcast({name: XM_EVENT_LIST.XM_ENTITY_LIST_MODIFICATION});
    }

    public onGenerateNew(): void {
        this.xmEntitySpecService.generateXmEntity(this.xmEntitySpec.key).toPromise().then((value) => {
            this.eventManager.broadcast({name: XM_EVENT_LIST.XM_ENTITY_LIST_MODIFICATION});
            swal({
                title: 'New entity "' + value.body.name + '" generated!',
                buttonsStyling: false,
                confirmButtonClass: 'btn btn-success',
            });
            swal({
                type: 'success',
                text: this.translateService.instant('xm-entity.entity-list-fab.new-generated'),
                buttonsStyling: false,
                confirmButtonClass: 'btn btn-primary',
            });
        });
    }

    public onAddNew(): void {
        const modalRef = this.modalService.open(EntityDetailDialogComponent, {backdrop: 'static'});
        modalRef.componentInstance.xmEntitySpec = this.xmEntitySpec;
        modalRef.componentInstance.spec = this.spec;
    }

}
