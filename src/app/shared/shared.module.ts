import { DatePipe } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CovalentTextEditorModule } from '@covalent/text-editor';
import { CookieOptions, CookieService } from 'angular2-cookie/core';
import { ReCaptchaModule } from 'angular2-recaptcha';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { MarkdownModule } from 'ngx-markdown';

import { MatModule } from '../mat.module';
import {
    AccountService,
    AuthServerProvider,
    AuthService,
    ClientService,
    ContextService,
    CSRFService,
    FocusDirective,
    HasAnyAuthorityDirective,
    I18nJsfPipe,
    I18nNamePipe,
    InputPreventPasteDirective,
    JhiSocialComponent,
    LoaderComponent,
    LoginComponent,
    LoginService,
    MaintenanceComponent,
    NoDataComponent,
    ParseByPathService,
    PermitDirective,
    PerPageComponent,
    PoweredByComponent,
    PrivilegeService,
    RegisterComponent,
    RegisterService,
    StateStorageService,
    UserLoginFormComponent,
    UserLoginService,
    UserService,
    WordAutocompleteDirective,
    XmConfigService,
    XmConfirmDialogComponent,
    XmGMapApiInitDirective,
    XmPasswordNeededComponent,
    XmPrivilegeDirective,
} from './';
import {
    PrivacyAndTermsDialogComponent,
} from './components/privacy-and-terms-dialog/privacy-and-terms-dialog.component';
import { AceEditorDirective } from './directives/ace-editor.directive';
import { DigitOnlyDirective } from './directives/digit-only.directive';
import { InputPatternDirective } from './directives/input-pattern.directive';
import { SafeNamePipe } from './helpers/safe-name.pipe';
import { XmCondition } from './helpers/xm-condition';
import { XmDateTimePipe } from './helpers/xm-date-time.pipe';
import { XmEntityIconPipe } from './helpers/xm-entity-icon.pipe';
import { XmEntityStateSpecPipe } from './helpers/xm-entity-state-spec.pipe';
import { CurrentLocationComponent } from './jsf-extention/widgets/current-location/current-location.component';
import { DatetimePickerComponent } from './jsf-extention/widgets/datetime-picker/datetime-picker.component';
import { DatetimeUtcComponent } from './jsf-extention/widgets/datetime-utc/datetime-utc.component';
import { EmailMatcherComponent } from './jsf-extention/widgets/email-matcher/email-matcher.component';
import { ExtAutocompleteService } from './jsf-extention/widgets/ext-autocomplete/ext-autocomplete-service';
import { ExtAutocompleteComponent } from './jsf-extention/widgets/ext-autocomplete/ext-autocomplete.component';
import { ExtMdEditorComponent } from './jsf-extention/widgets/ext-md-editor/ext-md-editor.component';
import { ExtMultiSelectComponent } from './jsf-extention/widgets/ext-multi-select/ext-multi-select.component';
import { ExtQuerySelectComponent } from './jsf-extention/widgets/ext-query-select/ext-query-select.component';
import { ExtSelectService } from './jsf-extention/widgets/ext-select/ext-select-service';
import { ExtSelectComponent } from './jsf-extention/widgets/ext-select/ext-select.component';
import { ExtTextareaComponent } from './jsf-extention/widgets/ext-textarea/ext-textarea.component';
import { FileUploadComponent } from './jsf-extention/widgets/file-upload/file-upload.component';
import { MultilingualInputComponent } from './jsf-extention/widgets/multilingual-input/multilingual-input.component';
import { TextSectionComponent } from './jsf-extention/widgets/text-section/text-section.component';
import { ValidationComponent } from './jsf-extention/widgets/validation-component/validation-component.component';
import { PasswordStrengthBarComponent } from './password-strength-bar/password-strength-bar.component';
import { PasswordPoliciesComponent } from './password-policies/password-policies.component';
import { RoleService } from './role/role.service';
import { GateSharedCommonModule } from './shared-common.module';
import { GateSharedLibsModule } from './shared-libs.module';

const PIPES = [
    XmEntityIconPipe,
];

@NgModule({
    imports: [
        GateSharedLibsModule,
        GateSharedCommonModule,
        ReCaptchaModule,
        MarkdownModule.forChild(),
        MatModule,
        CovalentTextEditorModule,
        OwlDateTimeModule,
        GooglePlaceModule,
        OwlNativeDateTimeModule,
    ],
    declarations: [
        AceEditorDirective,
        JhiSocialComponent,
        LoginComponent,
        RegisterComponent,
        HasAnyAuthorityDirective,
        I18nNamePipe,
        I18nJsfPipe,
        SafeNamePipe,
        XmCondition,
        XmEntityStateSpecPipe,
        XmDateTimePipe,
        UserLoginFormComponent,
        LoaderComponent,
        WordAutocompleteDirective,
        FocusDirective,
        InputPreventPasteDirective,
        DigitOnlyDirective,
        PerPageComponent,
        NoDataComponent,
        PoweredByComponent,
        MaintenanceComponent,
        PermitDirective,
        XmPrivilegeDirective,
        XmGMapApiInitDirective,
        PasswordStrengthBarComponent,
        PasswordPoliciesComponent,
        XmPasswordNeededComponent,
        XmConfirmDialogComponent,
        CurrentLocationComponent,
        ExtSelectComponent,
        ValidationComponent,
        ExtAutocompleteComponent,
        ExtMultiSelectComponent,
        ExtQuerySelectComponent,
        ExtTextareaComponent,
        ExtMdEditorComponent,
        MultilingualInputComponent,
        DatetimeUtcComponent,
        DatetimePickerComponent,
        EmailMatcherComponent,
        TextSectionComponent,
        FileUploadComponent,
        PrivacyAndTermsDialogComponent,
        PIPES,
        InputPatternDirective,
    ],
    entryComponents: [
        LoginComponent,
        RegisterComponent,
        UserLoginFormComponent,
        PasswordStrengthBarComponent,
        PasswordPoliciesComponent,
        CurrentLocationComponent,
        ExtSelectComponent,
        ExtAutocompleteComponent,
        ExtMultiSelectComponent,
        ExtQuerySelectComponent,
        ValidationComponent,
        ExtTextareaComponent,
        ExtMdEditorComponent,
        MultilingualInputComponent,
        DatetimeUtcComponent,
        DatetimePickerComponent,
        EmailMatcherComponent,
        TextSectionComponent,
        FileUploadComponent,
        PrivacyAndTermsDialogComponent,
    ],
    providers: [
        CookieService,
        {provide: CookieOptions, useValue: {}},
        ContextService,
        LoginService,
        RegisterService,
        AccountService,
        StateStorageService,
        CSRFService,
        AuthServerProvider,
        AuthService,
        UserService,
        ClientService,
        ExtSelectService,
        ExtAutocompleteService,
        UserLoginService,
        DatePipe,
        I18nNamePipe,
        I18nJsfPipe,
        SafeNamePipe,
        XmCondition,
        XmDateTimePipe,
        RoleService,
        PrivilegeService,
        ParseByPathService,
        PasswordStrengthBarComponent,
        PasswordPoliciesComponent,
        XmConfigService,
        PIPES,
    ],
    exports: [
        AceEditorDirective,
        GateSharedCommonModule,
        JhiSocialComponent,
        LoginComponent,
        UserLoginFormComponent,
        RegisterComponent,
        HasAnyAuthorityDirective,
        DatePipe,
        I18nNamePipe,
        I18nJsfPipe,
        SafeNamePipe,
        XmCondition,
        XmEntityStateSpecPipe,
        XmDateTimePipe,
        LoaderComponent,
        PerPageComponent,
        NoDataComponent,
        PoweredByComponent,
        MaintenanceComponent,
        WordAutocompleteDirective,
        FocusDirective,
        InputPreventPasteDirective,
        DigitOnlyDirective,
        PermitDirective,
        XmPrivilegeDirective,
        XmGMapApiInitDirective,
        PasswordStrengthBarComponent,
        PasswordPoliciesComponent,
        XmPasswordNeededComponent,
        XmConfirmDialogComponent,
        CurrentLocationComponent,
        ExtSelectComponent,
        ExtAutocompleteComponent,
        ExtMultiSelectComponent,
        ExtQuerySelectComponent,
        ValidationComponent,
        ExtTextareaComponent,
        ExtMdEditorComponent,
        MultilingualInputComponent,
        MatModule,
        DatetimeUtcComponent,
        DatetimePickerComponent,
        EmailMatcherComponent,
        TextSectionComponent,
        FileUploadComponent,
        GooglePlaceModule,
        PIPES,
        InputPatternDirective,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class XmSharedModule {
}
