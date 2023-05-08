import { SettingsUtils } from "./settings";
import {
  PreferencesPage,
  PreferencesGroup,
  ActionRow,
  PreferencesWindow,
} from "@gi-types/adw1";
import { Switch, Align } from "@gi-types/gtk4";
import { DisplayName } from "identification";

function init() {}

function fillPreferencesWindow(window: PreferencesWindow) {
  const page = new PreferencesPage();
  window.add(page);

  let settings: SettingsUtils | null = new SettingsUtils();

  window.connect("close-request", () => {
    settings?.dispose();
    settings = null;
  });

  const allDevices = settings.getAvailableOutputs();
  const hiddenDevices = settings.getExcludedOutputDeviceNames();

  var visibleDevices = allDevices.filter(
    (device) => !hiddenDevices.includes(device)
  );

  const group = new PreferencesGroup({
    title: "Output Audio Devices",
    description:
      "Choose which devices should be visible in the Quick Setting panel",
  });
  page.add(group);

  visibleDevices.forEach((device) => {
    group.add(createDeviceRow(device, true, settings!));
  });
  hiddenDevices.forEach((device) => {
    group.add(createDeviceRow(device, false, settings!));
  });
}

function createDeviceRow(
  displayName: DisplayName,
  active: boolean,
  settings: SettingsUtils
): ActionRow {
  const row = new ActionRow({ title: displayName });

  const toggle = new Switch({
    active,
    valign: Align.CENTER,
  });

  toggle.connect("state-set", (_, state) => {
    if (state) {
      settings.removeFromExcludedOutputDeviceNames(displayName);
    } else {
      settings.addToExcludedOutputDeviceNames(displayName);
    }

    return false;
  });

  row.add_suffix(toggle);
  row.activatable_widget = toggle;

  return row;
}

export default { init, fillPreferencesWindow };
