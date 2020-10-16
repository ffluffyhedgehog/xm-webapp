import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';
import { BehaviorSubject, merge, Observable, of } from 'rxjs';
import { catchError, filter, finalize, share, tap } from 'rxjs/operators';
import { Principal } from '../../shared/auth/principal.service';
import { ContextService } from '../../shared/context/context.service';
import { getFileNameFromResponseContentDisposition, saveFile } from '../../shared/helpers/file-download-helper';
import { buildJsfAttributes } from '../../shared/jsf-extention/jsf-attributes-helper';
import { XM_EVENT_LIST } from '../../xm.constants';
import { FunctionSpec } from '../shared/function-spec.model';
import { FunctionService } from '../shared/function.service';
import { XmEntity } from '../shared/xm-entity.model';

declare let swal: any;
declare let $: any;

@Component({
    selector: 'xm-function-call-dialog',
    templateUrl: './function-call-dialog.component.html',
    styleUrls: ['./function-call-dialog.component.scss'],
})
export class FunctionCallDialogComponent implements OnInit, AfterViewInit {

    @Input() public xmEntity: XmEntity;
    @Input() public functionSpec: FunctionSpec;
    @Input() public dialogTitle: any;
    @Input() public buttonTitle: any;
    @Input() public onSuccess: any;
    @Input() public onError: any;
    @Input() public preSendHandler: any;

    public jsfAttributes: any;
    public formData: any = {};
    public isJsonFormValid: boolean = true;

    public showLoader$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public showSecondStep$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    constructor(private activeModal: NgbActiveModal,
                private functionService: FunctionService,
                private eventManager: JhiEventManager,
                private contextService: ContextService,
                public principal: Principal,
                private ref: ChangeDetectorRef,
                private router: Router) {
    }

    public ngOnInit(): void {
        // TODO: this is workaround to get eventManager from root injector
        this.eventManager = this.contextService.eventManager;
        // TODO think about correct way to work with context
        $.xmEntity = this.xmEntity;
        if (this.functionSpec) {
            this.jsfAttributes = buildJsfAttributes(this.functionSpec.inputSpec || {},
                this.functionSpec.inputForm || {});
        }
        $.xmEntity = null;
        console.info('ngOnInit');
    }

    public ngAfterViewInit(): void {
        this.ref.detectChanges();
    }

    public onConfirmFunctionCall(): void {
        if (this.preSendHandler) {
            if (!this.preSendHandler()) {
                return;
            }
        }

        this.showLoader$.next(true);
        // XXX think about this assignment
        this.formData.xmEntity = this.xmEntity;
        const eId = this.functionSpec.withEntityId ? this.xmEntity.id : null;

        const apiCall$ = this.functionService.callEntityFunction(this.functionSpec.key, eId, this.formData)
            .pipe(share());

        const isSaveContent = (r) => r.actionType && r.actionType === 'download';

        // Save attachment
        const saveContent$ = apiCall$.pipe(
            filter((response) => isSaveContent(response)),
            tap((response) => this.saveAsFile(response)),
        );

        // If !download xmEntity function, emit XM_ENTITY_DETAIL_MODIFICATION notification
        const sendModifyEvent$ = apiCall$.pipe(
            filter((response) => !isSaveContent(response) && !!eId),
            tap(() => this.eventManager.broadcast({name: XM_EVENT_LIST.XM_ENTITY_DETAIL_MODIFICATION})),
        );

        // If !download proceed with on success scenario and emit XM_FUNCTION_CALL_SUCCESS
        const sentCallSuccessEvent$ = apiCall$.pipe(
            filter((response) => !isSaveContent(response)),
            tap((response) => this.onSuccessFunctionCall(response)),
            tap(() => this.eventManager.broadcast({name: XM_EVENT_LIST.XM_FUNCTION_CALL_SUCCESS})),
        );

        merge(saveContent$, sendModifyEvent$, sentCallSuccessEvent$).pipe(
            finalize(() => this.cancelLoader()),
            catchError((response) => this.handleError(response)),
        ).subscribe();
    }

    public onCancel(): void {
        this.activeModal.dismiss('cancel');
    }

    public onChangeForm(data: any): void {
        this.formData = data;
    }

    private handleError(response: any): Observable<any> {
        this.cancelLoader();
        if (this.onError) {
            this.onError(response);
        }
        return of();
    }

    private cancelLoader(): void {
        this.showLoader$.next(false);
    }

    private onSuccessFunctionCall(r: any): void {
        const data = r.body && r.body.data;
        // If onSuccess handler passes, close popup and pass processing to function
        if (this.onSuccess) {
            this.activeModal.dismiss(true);
            this.onSuccess(data, this.formData);
            // If response should be shown but there are no form provided
        } else if (data && this.functionSpec.showResponse && !this.functionSpec.contextDataForm) {
            this.activeModal.dismiss(true);
            swal({
                type: 'success',
                html: `<pre style="text-align: left"><code>${JSON.stringify(data, null, '  ')}</code></pre>`,
                buttonsStyling: false,
                confirmButtonClass: 'btn btn-primary',
            });
        } else if (data && this.functionSpec.showResponse && this.functionSpec.contextDataForm) {
            this.showSecondStep$.next(true);
            this.jsfAttributes = buildJsfAttributes(
                this.functionSpec.contextDataSpec ? this.functionSpec.contextDataSpec : {},
                this.functionSpec.contextDataForm ? this.functionSpec.contextDataForm : {});
            this.jsfAttributes.data = data;
            // If contains a location header, go to location specified
        } else if (r.headers.get('location')) {
            this.activeModal.dismiss(true);
            const location = r.headers.get('location');
            if ('/api/function-contexts/' !== location) {
                this.router.navigate([location], {queryParams: data});
            }
        } else {
            this.activeModal.dismiss(true);
        }
    }

    private saveAsFile(r: any): void {
        const filename = JSON.parse(getFileNameFromResponseContentDisposition(r));
        saveFile(r.body, filename, r.headers.get('content-type'));
        this.activeModal.dismiss(true);
    }
}
