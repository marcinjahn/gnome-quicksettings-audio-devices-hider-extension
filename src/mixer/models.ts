export interface MixerEvent {
  type:
    | "output-added"
    | "output-removed"
    | "input-added"
    | "input-removed"
    | "stream-added"
    | "stream-removed";
  deviceId: number;
}

export interface MixerSubscription {
  ids: number[];
}
