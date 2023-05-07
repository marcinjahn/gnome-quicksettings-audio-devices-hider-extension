import { MixerControl, MixerUIDevice } from "@gi-types/gvc1";
import { AudioDevice } from "../identification/audio-device.dto";
import { MixerEvent, MixerSubscription } from "./models";
import { range } from "utils/array";
import { getAudioDevice } from "identification/converters";
import { DisplayName } from "identification/display-name";

export class MixerWrapper {
  constructor(private mixer: MixerControl, private disposal: () => void) {}

  getAudioDevicesFromIds(ids: number[]): AudioDevice[] {
    return ids.map((id) => {
      const lookup = this.mixer.lookup_output_id(id);

      return getAudioDevice(
        id,
        lookup?.get_description(),
        lookup?.get_origin()
      );
    });
  }

  /**
   * Uses a Dummy Device "trick" from
   * https://github.com/kgshank/gse-sound-output-device-chooser/blob/master/sound-output-device-chooser@kgshank.net/base.js#LL299C20-L299C20
   * @param displayNames display names
   * @returns A list of matching audio devices. If a given display name is not found,
   * undefined is returned in its place.
   */
  getAudioDevicesFromDisplayNames(
    displayNames: DisplayName[]
  ): (AudioDevice | undefined)[] {
    const dummyDevice = new MixerUIDevice();

    const devices = this.getAudioDevicesFromIds(range(dummyDevice.get_id()));

    return displayNames.map((name) =>
      devices.find((device) => device.displayName === name)
    );
  }

  subscribeToOutputChanges(
    callback: (event: MixerEvent) => void
  ): MixerSubscription {
    const addId = this.mixer.connect("output-added", (_, deviceId) =>
      callback({ deviceId, type: "output-added" })
    );
    const removeId = this.mixer.connect("output-removed", (_, deviceId) =>
      callback({ deviceId, type: "output-removed" })
    );

    return { ids: [addId, removeId] };
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
