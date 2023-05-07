import { delay } from "../../utils/delay";
import { waitForMixerToBeReady } from "../utils";
import { MixerWrapper } from "../mixer-wrapper";

export class AudioPanelMixerSource {
  async getMixer(): Promise<MixerWrapper> {
    const Volume = imports.ui.status.volume;
    const mixer = Volume.getMixerControl();

    await waitForMixerToBeReady(mixer);
    await delay(200);

    return new MixerWrapper(mixer, () => {});
  }
}
