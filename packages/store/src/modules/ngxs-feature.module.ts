import { Inject, NgModule, Optional } from '@angular/core';

import { Store } from '../store';
import { InternalStateOperations } from '../internal/state-operations';
import { StateFactory } from '../internal/state-factory';
import { FEATURE_STATE_TOKEN } from '../symbols';
import { LifecycleStateManager } from '../internal/lifecycle-state-manager';
import { StateClass, StatesAndDefaults } from '../internal/internals';
import { UpdateState } from '../actions/actions';

/**
 * Feature module
 * @ignore
 */
@NgModule()
export class NgxsFeatureModule {
  constructor(
    store: Store,
    internalStateOperations: InternalStateOperations,
    factory: StateFactory,
    @Optional()
    @Inject(FEATURE_STATE_TOKEN)
    states: StateClass[][] = [],
    lifecycleStateManager: LifecycleStateManager
  ) {
    // Since FEATURE_STATE_TOKEN is a multi token, we need to
    // flatten it [[Feature1State, Feature2State], [Feature3State]]
    const flattenedStates: StateClass[] = NgxsFeatureModule.statesFlat(states);

    // add stores to the state graph and return their defaults
    const results: StatesAndDefaults = factory.addAndReturnDefaults(flattenedStates);

    internalStateOperations.setStateToTheCurrentWithNew(results);

    // dispatch the update action and invoke init and bootstrap functions after
    lifecycleStateManager.ngxsBootstrap(new UpdateState(), results);
  }

  private static statesFlat(states: StateClass[][] = []): StateClass[] {
    return states.reduce((acc, val) => acc.concat(val), []);
  }
}