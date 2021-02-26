import { Directive, Input, OnDestroy, Optional, Self } from '@angular/core';
import { FormControl, FormControlDirective, NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NgControlAccessor } from './ng-control-accessor';

@Directive()
/**
 * @beta
 */
export class NgFormAccessor<T> extends NgControlAccessor<T> implements OnDestroy {
    private valueSubscription: Subscription;

    constructor(@Optional() @Self() public ngControl: NgControl) {
        super(ngControl);
        if (this.ngControl instanceof FormControlDirective && this.ngControl.control) {
            this.control = this.ngControl.control;
        }
    }

    protected _control: FormControl = new FormControl();

    public get control(): FormControl {
        return this._control;
    }

    @Input()
    /**
     * @throws {@link TypeError}
     * This exception is thrown if the value is not present.
     *
     * @public
     */
    public set control(value: FormControl) {
        if (!value) {
            throw new TypeError('FormControl is required!');
        }
        if (value === this._control) {
            console.warn('FormControl applies twice! This control is already initialized.');
            return;
        }
        this._control = value;
        this.initControlChangeListeners();
    }

    public get value(): T {
        return this.control.value;
    }

    @Input()
    public set value(value: T) {
        if (value === this.control.value) {
            return;
        }
        this.control.patchValue(value, { emitEvent: false });
    }

    public get disabled(): boolean {
        return this.control.disabled;
    }

    @Input()
    public set disabled(value: boolean) {
        if (value) {
            this.control.disable();
        } else {
            this.control.enable();
        }
    }

    public writeValue(obj: T): void {
        this.value = obj;
    }

    public setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    public ngOnDestroy(): void {
        this.valueSubscription?.unsubscribe();
    }

    public change(value: T): void {
        this.value = value;
        this._onChange(value);
        this.valueChange.next(value);
    }

    /**
     * Emits {@link change} when the {@link control} value changes
     *
     * @throws {@link TypeError}
     * This exception is thrown if the {@link control} is not present.
     *
     * @internal
     */
    protected initControlChangeListeners(): void {
        if (!this.control) {
            throw new TypeError('FormControl is required to emit changes!');
        }
        this.valueSubscription?.unsubscribe();
        this.valueSubscription = this.control.valueChanges
            .subscribe((value) => this.change(value));
    }
}