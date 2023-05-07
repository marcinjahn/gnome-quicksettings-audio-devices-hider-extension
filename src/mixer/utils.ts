import { MixerControl, MixerControlState } from "@gi-types/gvc1";
import { delay } from "../utils/delay";

export async function waitForMixerToBeReady(
  mixer: MixerControl
): Promise<void> {
  while (mixer.get_state() === MixerControlState.CONNECTING) {
    await delay(200);
  }

  const state = mixer.get_state();

  if (state === MixerControlState.FAILED) {
    throw new Error("MixerControl is in a failed state");
  } else if (state === MixerControlState.CLOSED) {
    throw new Error("MixerControl is in a closed state");
  }
}
