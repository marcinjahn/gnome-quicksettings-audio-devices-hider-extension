import { MixerControl } from "@gi-types/gvc1";
import { waitForMixerToBeReady } from "../utils";
import { delay } from "utils/delay";
import { MixerWrapper } from "../mixer-wrapper";

export class NewInstanceMixerSource {
  async getMixer(): Promise<MixerWrapper> {
    const mixer = this.createMixerControl();
    await waitForMixerToBeReady(mixer);
    await delay(200);

    return new MixerWrapper(mixer, this.disposal(mixer));
  }

  private createMixerControl() {
    const randomName = (Math.random() + 1).toString(36).substring(7);
    const mixer = new MixerControl({ name: randomName });
    mixer.open();

    return mixer;
  }

  disposal = (mixer: MixerControl) => () => {
    mixer.close();
  };
}
