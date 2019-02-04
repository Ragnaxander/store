import {
  NgZone,
  PLATFORM_ID,
  Injectable,
  Injector,
  ɵNoopNgZone as NoopNgZone
} from '@angular/core';
import { isPlatformServer } from '@angular/common';

import { NgxsExecutionStrategy } from '../symbols';
import { ConfigValidator } from '../internal/config-validator';

@Injectable()
export class DispatchOutsideZoneNgxsExecutionStrategy implements NgxsExecutionStrategy {
  private _ngZone: NgZone;
  private _platformId: Object;

  constructor(_injector: Injector) {
    this._ngZone = _injector.get(NgZone);
    this._platformId = _injector.get(PLATFORM_ID);
    this.verifyZoneIsNotNooped(this._ngZone);
  }

  enter<T>(func: (...args: any[]) => T): T {
    if (isPlatformServer(this._platformId)) {
      return this.runInsideAngular(func);
    } else {
      return this.runOutsideAngular(func);
    }
  }

  leave<T>(func: (...args: any[]) => T): T {
    return this.runInsideAngular(func);
  }

  private runInsideAngular<T>(func: (...args: any[]) => T): T {
    if (NgZone.isInAngularZone()) {
      return func();
    }
    return this._ngZone.run(func);
  }

  private runOutsideAngular<T>(func: (...args: any[]) => T): T {
    if (NgZone.isInAngularZone()) {
      return this._ngZone.runOutsideAngular(func);
    }
    return func();
  }

  private verifyZoneIsNotNooped(ngZone: NgZone): void {
    if (ngZone instanceof NoopNgZone) {
      console.warn(
        'Your application was bootstrapped with nooped zone and your execution strategy requires an ngZone'
      );
    }
  }
}
