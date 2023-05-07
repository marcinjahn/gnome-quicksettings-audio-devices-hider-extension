export interface MixerEvent {
    type: 'output-added' | 'output-removed';
    deviceId: number;
}

export interface MixerSubscription {
    ids: number[];
}