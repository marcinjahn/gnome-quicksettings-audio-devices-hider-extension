import Gvc from "@gi-types/gvc1";

import { delay } from "../utils/delay";

export async function waitForMixerToBeReady(
  mixer: Gvc.MixerControl
): Promise<void> {
  while (mixer.get_state() === Gvc.MixerControlState.CONNECTING) {
    await delay(200);
  }

  const state = mixer.get_state();

  if (state === Gvc.MixerControlState.FAILED) {
    throw new Error("MixerControl is in a failed state");
  } else if (state === Gvc.MixerControlState.CLOSED) {
    throw new Error("MixerControl is in a closed state");
  }
}
