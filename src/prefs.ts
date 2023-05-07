import { SettingsUtils } from "./settings";
import {
    PreferencesPage,
    PreferencesGroup,
    ActionRow,
    PreferencesWindow,
} from "@gi-types/adw1";
import { Switch, Align } from "@gi-types/gtk4";
import { DisplayName } from "identification";

function init() {
    log('INIT CALLED')
}

function fillPreferencesWindow(window: PreferencesWindow) {
    log('fillPreferencesWindow CALLED')
    const page = new PreferencesPage();
    window.add(page);
    
    log(SettingsUtils.getAvailableOutputs().length);
    log(SettingsUtils.getAvailableOutputs());

    const allDevices = SettingsUtils.getAvailableOutputs();
    const hiddenDevices = SettingsUtils.getExcludedOutputDeviceNames();

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

function createDeviceRow(displayName: DisplayName, active: boolean): ActionRow {
    const row = new ActionRow({ title: displayName });

    const toggle = new Switch({
        active,
        valign: Align.CENTER,
    });

    toggle.connect("state-set", (_, state) => {
        if (state) {
            SettingsUtils.removeFromExcludedOutputDeviceNames(displayName);
        } else {
            SettingsUtils.addToExcludedOutputDeviceNames(displayName);
        }

        return false;
    });

    row.add_suffix(toggle);
    row.activatable_widget = toggle;

    return row;
}

export default { init, fillPreferencesWindow };
