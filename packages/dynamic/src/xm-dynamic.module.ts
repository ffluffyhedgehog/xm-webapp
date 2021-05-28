import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule, Provider } from '@angular/core';
import { XmDynamicControlDirective } from './control/xm-dynamic-control.directive';
import { XmDynamicFormControlDirective } from './control/xm-dynamic-form-control.directive';
import { XM_DYNAMIC_ENTRIES } from './dynamic.injectors';
import { XmDynamicEntries } from './interfaces';
import { DynamicLoader } from './loader/dynamic-loader';
import { DynamicMultiLoaderService } from './loader/dynamic-multi-loader.service';
import { DynamicMultiSearcherService } from './searcher/dynamic-multi-searcher.service';
import { DynamicSearcher } from './searcher/dynamic-searcher';
import { XmDynamicPresentationDirective, XmDynamicPresentationLayoutComponent } from './presentation';
import { XmDynamicWidgetDirective, XmDynamicWidgetLayoutComponent } from './widget';

export function dynamicModuleInitializer(components: XmDynamicEntries): Provider {
    return [{ provide: XM_DYNAMIC_ENTRIES, multi: true, useValue: components }];
}

@NgModule({
    imports: [CommonModule],
    exports: [
        XmDynamicPresentationDirective,
        XmDynamicControlDirective,
        XmDynamicWidgetDirective,
        XmDynamicWidgetLayoutComponent,
        XmDynamicPresentationLayoutComponent,
        XmDynamicFormControlDirective,
    ],
    declarations: [
        XmDynamicPresentationDirective,
        XmDynamicControlDirective,
        XmDynamicWidgetDirective,
        XmDynamicWidgetLayoutComponent,
        XmDynamicPresentationLayoutComponent,
        XmDynamicFormControlDirective,
    ],
    providers: [],
})
export class XmDynamicModule {
    public static forRoot(components: XmDynamicEntries): ModuleWithProviders<XmDynamicModule> {
        return {
            ngModule: XmDynamicModule,
            providers: [
                dynamicModuleInitializer(components),
                { provide: DynamicLoader, useClass: DynamicMultiLoaderService },
                { provide: DynamicSearcher, useClass: DynamicMultiSearcherService },
            ],
        };
    }

    public static forChild(components: XmDynamicEntries): ModuleWithProviders<XmDynamicModule> {
        return {
            ngModule: XmDynamicModule,
            providers: [dynamicModuleInitializer(components)],
        };
    }
}
