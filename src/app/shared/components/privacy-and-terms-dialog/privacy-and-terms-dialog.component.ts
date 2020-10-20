import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiLanguageService } from 'ng-jhipster';
import { AuthServerProvider } from '../../auth/auth-jwt.service';
import { finalize } from "rxjs/operators";

@Component({
    selector: 'xm-privacy-and-terms-dialog',
    templateUrl: './privacy-and-terms-dialog.component.html',
    styleUrls: ['./privacy-and-terms-dialog.component.scss'],
})
export class PrivacyAndTermsDialogComponent {

    @Input() public config: any;
    public iAgree: boolean = false;
    public lang: string;
    public termsToken: string;
    public showLoader: boolean;

    constructor(private activeModal: NgbActiveModal,
                private authServerProvider: AuthServerProvider,
                private languageService: JhiLanguageService) {
        this.languageService.getCurrent().then((lang) => {
            this.lang = lang;
        });
    }

    public onCancel(): void {
        this.activeModal.close('cancel');
    }

    public onAccept(): void {
        if (!this.termsToken) {
            this.activeModal.close('accept');
        } else {
            this.acceptTerms(this.termsToken);
        }
    }

    private acceptTerms(token: string): void {
        this.showLoader = true;
        this.authServerProvider
            .acceptTermsAndConditions(token)
            .pipe(finalize(() => this.showLoader = false))
            .subscribe(() => this.activeModal.close('accept'), () => this.onCancel());
    }
}
