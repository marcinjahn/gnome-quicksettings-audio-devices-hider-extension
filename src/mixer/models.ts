import { DeviceType } from "../identification";

export interface MixerEvent {
  type: "output-added" | "output-removed" | "input-added" | "input-removed";
  deviceId: number;
}

export interface MixerSubscription {
  ids: number[];
}
