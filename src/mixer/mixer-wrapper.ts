import { MixerControl, MixerUIDevice } from "@gi-types/gvc1";
import { AudioDevice, DeviceType } from "../identification";
import { MixerEvent, MixerSubscription } from "./models";
import { range } from "utils/array";
import { getAudioDevice } from "identification/converters";
import { DisplayName } from "identification/display-name";

export class MixerWrapper {
  constructor(private mixer: MixerControl, private disposal: () => void) {}

  getAudioDevicesFromIds(
    ids: number[],
    type: DeviceType = "output"
  ): AudioDevice[] {
    return ids.map((id) => {
      const lookup =
        type === "output"
          ? this.mixer.lookup_output_id(id)
          : this.mixer.lookup_input_id(id);

      return getAudioDevice(
        id,
        lookup?.get_description(),
        lookup?.get_origin(),
        type
      );
    });
  }

  /**
   * Uses a Dummy Device "trick" from
   * https://github.com/kgshank/gse-sound-output-device-chooser/blob/master/sound-output-device-chooser@kgshank.net/base.js#LL299C20-L299C20
   * @param displayNames display names
   * @param type
   * @returns A list of matching audio devices. If a given display name is not found,
   * undefined is returned in its place.
   */
  getAudioDevicesFromDisplayNames(
    displayNames: DisplayName[],
    type: DeviceType
  ): (AudioDevice | undefined)[] {
    const dummyDevice = new MixerUIDevice();

    const devices = this.getAudioDevicesFromIds(
      range(dummyDevice.get_id()),
      type
    );

    return displayNames.map((name) =>
      devices.find((device) => device.displayName === name)
    );
  }

  subscribeToDeviceChanges(
    callback: (event: MixerEvent) => void
  ): MixerSubscription {
    const addOutputId = this.mixer.connect("output-added", (_, deviceId) =>
      callback({ deviceId, type: "output-added" })
    );
    const removeOutputId = this.mixer.connect("output-removed", (_, deviceId) =>
      callback({ deviceId, type: "output-removed" })
    );
    const addInputId = this.mixer.connect("input-added", (_, deviceId) =>
      callback({ deviceId, type: "input-added" })
    );
    const removeInputId = this.mixer.connect("input-removed", (_, deviceId) =>
      callback({ deviceId, type: "input-removed" })
    );

    return { ids: [addOutputId, removeOutputId, addInputId, removeInputId] };
  }

  unsubscribe(subscription: MixerSubscription) {
    subscription.ids.forEach((id) => {
      this.mixer.disconnect(id);
    });
  }

  dispose() {
    this.disposal();
  }
}
