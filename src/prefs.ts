import { AudioDevice } from "AudioDevice";
import { getExcludedOutputDeviceIds, getAllOutputs } from "./settings";
import { MixerWrapper } from "mixer";

import {
    PreferencesPage,
    PreferencesGroup,
    ActionRow,
    PreferencesWindow,
} from "@gi-types/adw1";
import { Switch, Align } from "@gi-types/gtk4";

function init() {}

async function fillPreferencesWindow(window: PreferencesWindow) {
    const mixer = new MixerWrapper();

    const allDevicesPromise = mixer.getOutputDevicesInfo(getAllOutputs());
    const hiddenDevicesPromise = mixer.getOutputDevicesInfo(
        getExcludedOutputDeviceIds()
    );

    const page = new PreferencesPage();

    window.add(page);

    const group = new PreferencesGroup();
    page.add(group);

    const [allDevices, hiddenDevices] = await Promise.all([
        allDevicesPromise,
        hiddenDevicesPromise,
    ]);

    // const allDevices = [{id: 4, displayName: 'abc'}];
    // const hiddenDevices: AudioDevice[] = [];

    mixer.dispose();

    var visibleDevices = allDevices.filter(
        (device) => !hiddenDevices.includes(device)
    );

    visibleDevices.forEach((device) => {
        group.add(createDeviceRow(device, true));
    });
    hiddenDevices.forEach((device) => {
        group.add(createDeviceRow(device, false));
    });
}

function createDeviceRow(device: AudioDevice, active: boolean): ActionRow {
    const row = new ActionRow({ title: device.displayName });

    const toggle = new Switch({
        active,
        valign: Align.CENTER,
    });

    row.add_suffix(toggle);
    row.activatable_widget = toggle;

    return row;
}

export default { init, fillPreferencesWindow };
