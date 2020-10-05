import { HttpResponse } from '@angular/common/http';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { JhiDateUtils } from 'ng-jhipster';

import { Principal } from '../../shared/auth/principal.service';
import { I18nNamePipe } from '../../shared/language/i18n-name.pipe';
import { DEBUG_INFO_ENABLED } from '../../xm.constants';
import { CalendarEventDialogComponent } from '../calendar-event-dialog/calendar-event-dialog.component';
import { CalendarSpec } from '../shared/calendar-spec.model';
import { Calendar } from '../shared/calendar.model';
import { Event } from '../shared/event.model';
import { CalendarService } from '../shared/calendar.service';
import { EventService } from '../shared/event.service';
import { XmEntity } from '../shared/xm-entity.model';
import { XmEntityService } from '../shared/xm-entity.service';
import { LanguageService } from '../../modules/xm-translation/language.service';

declare const $: any;
declare const swal: any;

@Component({
    selector: 'xm-calendar-card',
    templateUrl: './calendar-card.component.html',
    styleUrls: ['./calendar-card.component.scss'],
})
export class CalendarCardComponent implements OnChanges {

    @Input() public xmEntityId: number;
    @Input() public calendarSpecs: CalendarSpec[];

    public xmEntity: XmEntity;
    public currentCalendar: Calendar;
    public calendars: Calendar[] = [];
    public calendarElements: any = {};

    constructor(private xmEntityService: XmEntityService,
                private calendarService: CalendarService,
                private eventService: EventService,
                private dateUtils: JhiDateUtils,
                private i18nNamePipe: I18nNamePipe,
                private translateService: TranslateService,
                private languageService: LanguageService,
                private modalService: NgbModal,
                public principal: Principal) {
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.xmEntityId && changes.xmEntityId.previousValue !== changes.xmEntityId.currentValue) {
            this.load();
        }
    }

    public onRemove(event: Event, calendarTypeKey: string, callback?: () => void): void {
        swal({
            title: this.translateService.instant('xm-entity.calendar-card.delete.title'),
            showCancelButton: true,
            buttonsStyling: false,
            confirmButtonClass: 'btn mat-raised-button btn-primary',
            cancelButtonClass: 'btn mat-raised-button',
            confirmButtonText: this.translateService.instant('xm-entity.calendar-card.delete.button'),
            cancelButtonText: this.translateService.instant('xm-entity.calendar-card.delete.button-cancel'),
        }).then((result) => {
            if (result.value) {
                this.eventService.delete(event.id).subscribe(
                    () => {
                        (typeof callback === 'function') && callback();
                        this.alert('success', 'xm-entity.calendar-card.delete.remove-success');
                        this.calendarElements[calendarTypeKey].fullCalendar('removeEvents', [event.id]);
                    },
                    () => this.alert('error', 'xm-entity.calendar-card.delete.remove-error'),
                );
            }
        });
    }

    public onCalendarChange(calendar: Calendar): void {
        this.currentCalendar = calendar;
        setTimeout(() => $(this.calendarElements[calendar.typeKey]).data('fullCalendar').render(), 50);
    }

    private load(): void {

        if (!this.calendarSpecs || !this.calendarSpecs.length) {
            if (DEBUG_INFO_ENABLED) {
                console.info('DBG: no spec no call');
            }
            return;
        }

        this.xmEntityService.find(this.xmEntityId, {embed: 'calendars'})
            .subscribe((xmEntity: HttpResponse<XmEntity>) => {
                this.xmEntity = xmEntity.body;
                if (xmEntity.body.calendars) {
                    this.calendars = [...xmEntity.body.calendars];
                }

                const notIncludedSpecs = this.calendarSpecs.filter((cs) => this.calendars
                    .filter((c) => c.typeKey === cs.key).length === 0);
                notIncludedSpecs.forEach((calendarSpec) => {
                    const calendar: Calendar = {};
                    calendar.name = this.i18nNamePipe.transform(calendarSpec.name, this.principal);
                    calendar.typeKey = calendarSpec.key;
                    calendar.startDate = new Date().toISOString();
                    calendar.xmEntity = {};
                    calendar.xmEntity.id = this.xmEntity.id;
                    calendar.xmEntity.typeKey = this.xmEntity.typeKey;
                    calendar.events = [];
                    this.calendars.push(calendar);
                });

                this.currentCalendar = this.calendars[0];
                for (const calendar of this.calendars) {
                    setTimeout(() => this.initCalendar(calendar), 50);
                }
            });
    }

    private onShowEventDialog(start: any, end: any, calendar: Calendar, event: Event) {
        const self = this;
        const calendarSpec = this.calendarSpecs.filter((c) => c.key === calendar.typeKey).shift();
        const modalRef = this.modalService.open(CalendarEventDialogComponent, {backdrop: 'static'});
        modalRef.componentInstance.xmEntity = self.xmEntity;
        modalRef.componentInstance.event = event;
        modalRef.componentInstance.calendar = calendar /* self.currentCalendar */;
        modalRef.componentInstance.startDate = `${start.format('YYYY-MM-DD')}T${start.format('HH:mm:ss')}`;
        modalRef.componentInstance.endDate = `${end.format('YYYY-MM-DD')}T${end.format('HH:mm:ss')}`;
        modalRef.componentInstance.calendarSpec = calendarSpec;
        modalRef.componentInstance.onAddEvent = (event: Event, isEdit?: boolean) => {
            self.currentCalendar.events = this.currentCalendar.events ? this.currentCalendar.events : [];
            if (isEdit) {
                const item = self.currentCalendar.events.find((el) => el.id === event.id);
                Object.assign(item, event);
                this.calendarElements[calendar.typeKey].fullCalendar('removeEvents', [event.id]);
            } else {
                self.currentCalendar.events.push(event);
            }
            self.calendarElements[calendar.typeKey]
                .fullCalendar('renderEvent', self.mapEvent(calendarSpec, event), true);
            self.calendarElements[calendar.typeKey].fullCalendar('unselect');
        };
        modalRef.componentInstance.onRemoveEvent = (event: Event, calendarTypeKey: string, callback?: () => void) =>  {
            self.onRemove(event, calendarTypeKey, callback);
        }
    }

    private initCalendar(calendar: Calendar): void {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        const calendarSpec = this.calendarSpecs.filter((c) => c.key === calendar.typeKey).shift();
        this.calendarElements[calendar.typeKey] = $('#xm-calendar-' + calendar.id);
        this.calendarElements[calendar.typeKey].fullCalendar({
            header: {
                left: 'title',
                center: 'month,agendaWeek,agendaDay,listDay,listWeek',
                right: 'prev,next,today',
            },
            locale: this.languageService.getUserLocale(),
            defaultDate: new Date(),
            selectable: true,
            selectHelper: true,
            views: {
                month: {
                    titleFormat: 'MMMM YYYY',
                },
                week: {
                    titleFormat: 'MMMM D YYYY',
                    timeFormat: 'H(:mm)',
                },
                day: {
                    titleFormat: 'D MMM, YYYY',
                    timeFormat: 'H(:mm)',
                },
                listDay: {
                    buttonText: this.translateService.instant('xm-entity.calendar-card.calendar.btn-list-day'),
                    timeFormat: 'H(:mm)',
                },
                listWeek: {
                    buttonText: this.translateService.instant('xm-entity.calendar-card.calendar.btn-list-week'),
                    timeFormat: 'H(:mm)',
                },
            },
            select: (start: any, end: any) => {
                self.onShowEventDialog(start, end, calendar, <Event> {});
            },
            editable: false,
            eventLimit: true,
            // events: calendar.events ? calendar.events.map((e) => this.mapEvent(calendarSpec, e)) : [],
            timeFormat: 'H(:mm)',
            renderEvent: (event: any, element: any) => {
                const content = $(element).find('.fc-content');
                if ($(element).find('.fc-title').is('div')) {
                    const description = $('<div></div>');
                    $(description).addClass('fc-title');
                    $(description).text(event.description);
                    content.append(description);
                }
            },
            events: (start, end, timezone, callback) => {
                this.calendarService.getEvents(calendar.id, {
                    'dateFrom.eq': start.format('YYYY-MM-DD'),
                    'dateTo.eq': end.format('YYYY-MM-DD'),
                })
                    .subscribe(
                        res => callback((res || []).map((e) => this.mapEvent(calendarSpec, e))),
                        () => callback([]),
                    );
            },
            eventClick: (event: any) => {
                // self.onRemove(event.originEvent, calendar.typeKey);
                self.onShowEventDialog(event.start, event.end, calendar, event.originEvent);
            },
        });
    }

    private mapEvent(calendarSpec: CalendarSpec, event: Event): any {
        const eventSpec = calendarSpec.events.filter((e) => e.key === event.typeKey).shift();
        return {
            id: event.id,
            title: event.title + '\n (' + this.i18nNamePipe.transform(eventSpec.name, this.principal) + ')',
            start: this.dateUtils.convertDateTimeFromServer(event.startDate),
            end: this.dateUtils.convertDateTimeFromServer(event.endDate),
            description: event.description,
            color: eventSpec.color,
            originEvent: event,
        };
    }

    private alert(type: string, key: string): void {
        swal({
            type,
            text: this.translateService.instant(key),
            buttonsStyling: false,
            confirmButtonClass: 'btn btn-primary',
        });
    }

}
