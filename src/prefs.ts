import { SettingsUtils } from "./settings";
import {
  PreferencesPage,
  PreferencesGroup,
  ActionRow,
  PreferencesWindow,
} from "@gi-types/adw1";
import { Switch, Align } from "@gi-types/gtk4";
import { DisplayName, DeviceType } from "identification";

function init() {}

function fillPreferencesWindow(window: PreferencesWindow) {
  const page = new PreferencesPage();
  window.add(page);

  let settings = new SettingsUtils();

  const allOutputDevices = settings.getAvailableOutputs();
  const allInputDevices = settings.getAvailableInputs();
  const hiddenOutputDevices = settings.getExcludedOutputDeviceNames();
  const hiddenInputDevices = settings.getExcludedInputDeviceNames();

  let visibleOutputDevices = allOutputDevices.filter(
    (device) => !hiddenOutputDevices.includes(device)
  );
  let visibleInputDevices = allInputDevices.filter(
    (device) => !hiddenInputDevices.includes(device)
  );

  const outputs = new PreferencesGroup({
    title: "Output Audio Devices",
    description:
      "Choose which output devices should be visible in the Quick Setting panel",
  });
  page.add(outputs);

  visibleOutputDevices.forEach((device) => {
    outputs.add(createDeviceRow(device, true, settings!, "output"));
  });
  hiddenOutputDevices.forEach((device) => {
    outputs.add(createDeviceRow(device, false, settings!, "output"));
  });

  const inputs = new PreferencesGroup({
    title: "Input Audio Devices",
    description:
      "Choose which input devices should be visible in the Quick Setting panel",
  });
  page.add(inputs);

  visibleInputDevices.forEach((device) => {
    inputs.add(createDeviceRow(device, true, settings!, "input"));
  });
  hiddenInputDevices.forEach((device) => {
    inputs.add(createDeviceRow(device, false, settings!, "input"));
  });
}

function createDeviceRow(
  displayName: DisplayName,
  active: boolean,
  settings: SettingsUtils,
  type: DeviceType
): ActionRow {
  const row = new ActionRow({ title: displayName });

  const toggle = new Switch({
    active,
    valign: Align.CENTER,
  });

  toggle.connect("state-set", (_, state) => {
    if (state) {
      settings.removeFromExcludedDeviceNames(displayName, type);
    } else {
      settings.addToExcludedDeviceNames(displayName, type);
    }

    return false;
  });

  row.add_suffix(toggle);
  row.activatable_widget = toggle;

  return row;
}

export default { init, fillPreferencesWindow };
