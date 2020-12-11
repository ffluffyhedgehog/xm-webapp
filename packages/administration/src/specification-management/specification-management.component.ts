import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Principal } from '@xm-ngx/core/auth';
import { finalize } from 'rxjs/operators';

import { XmConfigService } from '../../../../src/app/shared/spec/config.service';
import { ConfigValidatorUtil } from './config-validator/config-validator.util';

const TENANT_SPEC_PATH = '/tenant-config.yml';

@Component({
    selector: 'xm-specification-management',
    templateUrl: './specification-management.component.html',
    styleUrls: ['./specification-management.component.scss'],
})
export class SpecificationManagementComponent implements OnInit {

    public specificationTypes: any[] = [
        {slug: 'ui', icon: 'view_quilt'},
        {slug: 'entity', icon: 'build'},
        {slug: 'timeline', icon: 'history'},
        {slug: 'uaa', icon: 'security'},
        {slug: 'uaa-login', icon: 'fingerprint'},
        {slug: 'tenant', icon: 'ballot'},
    ];
    public currentSpecificationSlug: string;

    public isUiSpecValid: boolean;
    public isTenantSpecValid: boolean;
    public isUaaSpecValid: boolean;
    public isUaaLoginSpecValid: boolean;

    public aceEditorOptions: any = {
        highlightActiveLine: true,
        maxLines: 50,
    };
    public line: number;

    public uiSpecificationProgress: boolean;

    public loginsSpecificationIn: string;
    public loginsSpecificationOut: string;
    public loginsValidation: any;

    public uiSpecificationIn: string;
    public uiSpecificationOut: string;
    public uiValidation: any;

    public uiPrivateSpecificationIn: string;
    public uiPrivateSpecificationOut: string;
    public uiPrivateValidation: any;
    public isUiPrivateSpecValid: boolean;
    public uiPrivateSpecificationProgress: boolean;

    public tenantSpecificationIn: string;
    public tenantSpecificationOut: string;
    public tenantValidation: any;
    public tenantSpecificationProgress: boolean;

    public uaaSpecificationIn: string;
    public uaaSpecificationOut: string;
    public uaaValidation: any;

    public readOnlyMode: boolean;

    constructor(private activatedRoute: ActivatedRoute,
                private principal: Principal,
                private service: XmConfigService) {
        this.activatedRoute.queryParams.subscribe((params) => {
            this.currentSpecificationSlug = params.slug || this.specificationTypes[0].slug;
            this.isTenantSpecValid = false;
            this.tenantValidation = null;
            this.isUiSpecValid = false;
            this.uiValidation = null;
        });
    }

    public ngOnInit(): void {
        this.service.getConfig('/uaa/logins.yml').subscribe((result) => {
            this.loginsSpecificationIn = result;
            this.loginsSpecificationOut = result;
        });
        this.service.getConfig('/uaa/uaa.yml').subscribe((result) => {
            this.uaaSpecificationIn = result;
            this.uaaSpecificationOut = result;
        });
        this.service.getConfig('/webapp/settings-public.yml').subscribe((result) => {
            this.uiSpecificationIn = result;
            this.uiSpecificationOut = result;
        });
        this.service.getConfig(TENANT_SPEC_PATH).subscribe((result) => {
            this.tenantSpecificationIn = result;
            this.tenantSpecificationOut = result;
        });
        this.principal.hasPrivileges(['CONFIG.CLIENT.WEBAPP.GET_LIST.ITEM']).then((allow) => {
            if (!allow) {
                return;
            }
            this.specificationTypes.push({slug: 'privateui', icon: 'view_quilt'});
            this.service.getConfig('/webapp/settings-private.yml').subscribe((result) => {
                this.uiPrivateSpecificationIn = result;
                this.uiPrivateSpecificationOut = result;
            });
        });
        this.service.getUiConfig().subscribe(result => {
            this.readOnlyMode = result.readOnlyConfig;
        });
    }

    public onUiSpecificationChange(textChanged: any): void {
        this.uiSpecificationOut = textChanged;
        this.isUiSpecValid = false;
        this.uiValidation = null;
    }

    public onPrivateUiSpecificationChange(textChanged: any): void {
        this.uiPrivateSpecificationOut = textChanged;
        this.isUiPrivateSpecValid = false;
        this.uiPrivateValidation = null;
    }

    public onTenantSpecificationChange(textChanged: any): void {
        this.tenantSpecificationOut = textChanged;
        this.isTenantSpecValid = false;
        this.tenantValidation = null;
    }

    public updateUiConfig(): void {
        this.uiSpecificationProgress = true;
        this.service
            .updateConfig('/webapp/settings-public.yml', this.uiSpecificationOut)
            .pipe(finalize(() => this.uiSpecificationProgress = false))
            .subscribe(() => window.location.reload());
    }

    public updatePrivateUiConfig(): void {
        this.uiPrivateSpecificationProgress = true;
        this.service
            .updateConfig('/webapp/settings-private.yml', this.uiPrivateSpecificationOut)
            .pipe(finalize(() => this.uiPrivateSpecificationProgress = false))
            .subscribe(() => window.location.reload());
    }

    public updateTenantConfig(): void {
        this.tenantSpecificationProgress = true;
        this.service
            .updateConfig(TENANT_SPEC_PATH, this.tenantSpecificationOut)
            .pipe(finalize(() => this.tenantSpecificationProgress = false))
            .subscribe(() => window.location.reload());
    }

    public validateUiSpecification(): void {
        const errors = ConfigValidatorUtil.validateYAML(this.uiSpecificationOut);
        if (errors && errors.length) {
            this.uiValidation = {errorMessage: ''};
            for (const err of errors) {
                this.uiValidation.errorMessage += err.message + (err.path ? ' path: ' + err.path : '') + '<br/>';
                if (err.line) {
                    this.line = err.line;
                }
            }
        } else {
            this.isUiSpecValid = true;
        }
    }

    public validateTenantSpecification(): void {
        const errors = ConfigValidatorUtil.validateYAML(this.tenantSpecificationOut);
        if (errors && errors.length) {
            this.tenantValidation = {errorMessage: ''};
            for (const err of errors) {
                this.tenantValidation.errorMessage += err.message + (err.path ? ' path: ' + err.path : '') + '<br/>';
                if (err.line) {
                    this.line = err.line;
                }
            }
        } else {
            this.isTenantSpecValid = true;
        }
    }

    public validatePrivateUiSpecification(): void {
        const errors = ConfigValidatorUtil.validateYAML(this.uiPrivateSpecificationOut);
        if (errors && errors.length) {
            this.uiPrivateValidation = {errorMessage: ''};
            for (const err of errors) {
                this.uiPrivateValidation.errorMessage += err.message + (err.path ? ' path: ' + err.path : '') + '<br/>';
                if (err.line) {
                    this.line = err.line;
                }
            }
        } else {
            this.isUiPrivateSpecValid = true;
        }
    }

    public onLoginsSpecificationChange(textChanged: any): void {
        this.isUaaLoginSpecValid = false;
        this.loginsValidation = null;
        this.loginsSpecificationOut = textChanged;
    }

    public validateLoginsSpecification(): void {
        this.service.validateLoginsSpec(this.loginsSpecificationOut).subscribe((result) => {
            this.loginsValidation = result;
            this.isUaaLoginSpecValid = !!this.loginsValidation.valid;
            SpecificationManagementComponent.renderValidationMessage(this.loginsValidation);
        });
    }

    public updateLoginsSpecification(): void {
        this.service.updateLoginsSpec(this.loginsSpecificationOut).subscribe(() => {
            this.isUaaLoginSpecValid = false;
            window.location.reload();
        });
    }

    public onUaaSpecificationChange(textChanged: any): void {
        this.isUaaSpecValid = false;
        this.uaaValidation = null;
        this.uaaSpecificationOut = textChanged;
    }

    public validateUaaSpecification(): void {
        this.service.validateUaaSpec(this.uaaSpecificationOut).subscribe((result) => {
            this.uaaValidation = result;
            this.isUaaSpecValid = !!this.uaaValidation.valid;
            SpecificationManagementComponent.renderValidationMessage(this.uaaValidation);
        });
    }

    public updateUaaSpecification(): void {
        this.service.updateUaaSpec(this.uaaSpecificationOut).subscribe(() => {
            this.isUaaSpecValid = false;
            window.location.reload();
        });
    }


    public static renderValidationMessage(validation: any): void {
        const errorMessage = validation.errorMessage;

        const regexp = new RegExp('^(.*)\\(class');
        const errors = regexp.exec(errorMessage);
        if (errors && errors.length > 1) {
            const error = errors[1];
            const line = new RegExp('line: (\\d)').exec(errorMessage);
            const column = new RegExp('column: (\\d)').exec(errorMessage);
            const lineNumber = line && line.length > 0 ? line[1] : '';
            const columnNumber = column && column.length > 0 ? column[1] : '';
            validation.errorMessage = `${error} | line: ${lineNumber} column: ${columnNumber}`;
        }
    }

}
