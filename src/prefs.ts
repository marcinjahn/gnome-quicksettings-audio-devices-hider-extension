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
  const settings = new SettingsUtils();

  window.add(createOutputsPage(settings));
  window.add(createInputsPage(settings));
}

function createOutputsPage(settings: SettingsUtils): PreferencesPage {
  const page = new PreferencesPage({
    title: "Outputs",
    iconName: "audio-speakers-symbolic",
  });

  const allOutputDevices = settings.getAvailableOutputs();
  const hiddenOutputDevices = settings.getExcludedOutputDeviceNames();

  const visibleOutputDevices = allOutputDevices.filter(
    (device) => !hiddenOutputDevices.includes(device)
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

  return page;
}

function createInputsPage(settings: SettingsUtils): PreferencesPage {
  const page = new PreferencesPage({
    title: "Inputs",
    iconName: "audio-input-microphone-symbolic",
  });

  const allInputDevices = settings.getAvailableInputs();
  const hiddenInputDevices = settings.getExcludedInputDeviceNames();

  const visibleInputDevices = allInputDevices.filter(
    (device) => !hiddenInputDevices.includes(device)
  );

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

  const sliderVisibility = new PreferencesGroup({
    title: "Other",
  });

  page.add(sliderVisibility);
  sliderVisibility.add(
    createInputSliderVisibilityToggle("Always show input slider", settings)
  );

  return page;
}

function createInputSliderVisibilityToggle(
  title: string,
  settings: SettingsUtils
): ActionRow {
  const row = new ActionRow({ title: title });

  const toggle = new Switch({
    active: settings.getInputSliderAlwaysVisible(),
    valign: Align.CENTER,
  });

  toggle.connect("state-set", (_, state) => {
    settings.setInputSliderAlwaysVisible(state);
    return false;
  });

  row.add_suffix(toggle);
  row.activatable_widget = toggle;

  return row;
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
