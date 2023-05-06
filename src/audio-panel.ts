import { AudioDevice } from "AudioDevice";
import { waitForMixerToBeReady } from "mixer";
import { delay } from "utils";

const Main = imports.ui.main;
const Volume = imports.ui.status.volume;
const QuickSettings = Main.panel.statusArea.quickSettings;

export async function getDisplayedDevices(): Promise<AudioDevice[]> {
    const mixer = Volume.getMixerControl();

    await waitForMixerToBeReady(mixer);
    await delay(200);

    const devices = QuickSettings._volume._output._deviceItems;

    return Array.from(devices, ([id, value]) => ({
        id,
        displayName: value.label.get_text() as string
    }));
}

export function removeDevice(id: number) {
    QuickSettings._volume._output._removeDevice(id);
}

export function addDevice(id: number) {
    QuickSettings._volume._output._addDevice(id);
}