import { AudioDevice } from "./identification/audio-device.dto";
import { Settings } from "./settings";
import { NewInstanceMixerSource } from "./mixer";
import {
    PreferencesPage,
    PreferencesGroup,
    ActionRow,
    PreferencesWindow,
} from "@gi-types/adw1";
import { Switch, Align } from "@gi-types/gtk4";

function init() {
    log('INIT CALLED')
}

async function fillPreferencesWindow(window: PreferencesWindow) {
    log('fillPreferencesWindow CALLED')
    const page = new PreferencesPage();
    window.add(page);

    const mixerSource = new NewInstanceMixerSource();

    var mixer = await mixerSource.getMixer();
    
    log(Settings.getAllOutputs().length);
    log(Settings.getAllOutputs());

    const allDevices = mixer.getAudioDevicesFromIds(
        Settings.getAllOutputs());
    const hiddenDevices = mixer.getAudioDevicesFromIds(
        Settings.getExcludedOutputDeviceIds()
    );

    mixer.dispose();

    var visibleDevices = allDevices.filter(
        (device) => !hiddenDevices.includes(device)
    );

    const group = new PreferencesGroup();
    page.add(group);

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
