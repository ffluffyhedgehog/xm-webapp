import { TestBed } from '@angular/core/testing';

import { XmLogger } from './xm-logger';

describe('XmLogger', () => {
    let service: XmLogger;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [XmLogger] });
        service = TestBed.inject(XmLogger);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});