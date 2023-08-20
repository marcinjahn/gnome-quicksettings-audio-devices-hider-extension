import * as Volume from "gnomejs://volume.js";

import { delay } from "../../utils/delay";
import { waitForMixerToBeReady } from "../utils";
import { MixerWrapper } from "../mixer-wrapper";

export class AudioPanelMixerSource {
  async getMixer(): Promise<MixerWrapper> {
    const mixer = Volume.getMixerControl();

    await waitForMixerToBeReady(mixer);
    await delay(200);

    return new MixerWrapper(mixer, () => {});
  }
}
