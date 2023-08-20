import { ExtensionPreferences } from "gnomejs://prefs.js";
import Adw from "@gi-ts/adw1";
import Gtk from "@gi-ts/gtk4";

import { SettingsPath, SettingsUtils } from "./settings";
import { DisplayName, DeviceType } from "identification";

export default class Preferences extends ExtensionPreferences {
  fillPreferencesWindow(window: Adw.PreferencesWindow) {
    const settings = new SettingsUtils(this.getSettings(SettingsPath));

    window.add(this.createOutputsPage(settings));
    window.add(this.createInputsPage(settings));
  }

  createOutputsPage(settings: SettingsUtils): Adw.PreferencesPage {
    const page = new Adw.PreferencesPage({
      title: "Outputs",
      iconName: "audio-speakers-symbolic",
    });

    const allOutputDevices = settings.getAvailableOutputs();
    const hiddenOutputDevices = settings.getExcludedOutputDeviceNames();

    const visibleOutputDevices = allOutputDevices.filter(
      (device) => !hiddenOutputDevices.includes(device)
    );

    const outputs = new Adw.PreferencesGroup({
      title: "Output Audio Devices",
      description:
        "Choose which output devices should be visible in the Quick Setting panel",
    });
    page.add(outputs);

    visibleOutputDevices.forEach((device) => {
      outputs.add(this.createDeviceRow(device, true, settings!, "output"));
    });
    hiddenOutputDevices.forEach((device) => {
      outputs.add(this.createDeviceRow(device, false, settings!, "output"));
    });

    return page;
  }

  createInputsPage(settings: SettingsUtils): Adw.PreferencesPage {
    const page = new Adw.PreferencesPage({
      title: "Inputs",
      iconName: "audio-input-microphone-symbolic",
    });

    const allInputDevices = settings.getAvailableInputs();
    const hiddenInputDevices = settings.getExcludedInputDeviceNames();

    const visibleInputDevices = allInputDevices.filter(
      (device) => !hiddenInputDevices.includes(device)
    );

    const inputs = new Adw.PreferencesGroup({
      title: "Input Audio Devices",
      description:
        "Choose which input devices should be visible in the Quick Setting panel",
    });
    page.add(inputs);

    visibleInputDevices.forEach((device) => {
      inputs.add(this.createDeviceRow(device, true, settings!, "input"));
    });
    hiddenInputDevices.forEach((device) => {
      inputs.add(this.createDeviceRow(device, false, settings!, "input"));
    });

    return page;
  }

  createDeviceRow(
    displayName: DisplayName,
    active: boolean,
    settings: SettingsUtils,
    type: DeviceType
  ): Adw.ActionRow {
    const row = new Adw.ActionRow({ title: displayName });

    const toggle = new Gtk.Switch({
      active,
      valign: Gtk.Align.CENTER,
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
}
