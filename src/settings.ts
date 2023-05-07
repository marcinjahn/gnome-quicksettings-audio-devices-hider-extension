import { Settings } from "@gi-types/gio2";
import { DisplayName } from "identification/display-name";

const ExtensionUtils = imports.misc.extensionUtils;

export const SettingsPath =
  "org.gnome.shell.extensions.quicksettings-audio-devices-hider";

export const ExcludedOutputNamesSetting = "excluded-output-names";
const AvailableOutputNames = "available-output-names";

export class SettingsUtils {
  private static settings: Settings | null = null;

  private static getSettings(): Settings {
    if (!this.settings) {
      this.settings = ExtensionUtils.getSettings(SettingsPath);
    }

    return this.settings;
  }

  static getExcludedOutputDeviceNames(): DisplayName[] {
    const settings = this.getSettings();
    const ids = settings.get_strv(ExcludedOutputNamesSetting);

    return ids;
  }

  static setExcludedOutputDeviceNames(displayNames: DisplayName[]) {
    const settings = this.getSettings();
    settings.set_strv(ExcludedOutputNamesSetting, displayNames);
  }

  static addToExcludedOutputDeviceNames(displayName: DisplayName) {
    const currentOutputs = SettingsUtils.getExcludedOutputDeviceNames();

    if (currentOutputs.includes(displayName)) {
      return;
    }

    const newOutputs = [...currentOutputs, displayName];
    const settings = this.getSettings();

    settings.set_strv(ExcludedOutputNamesSetting, newOutputs);
  }

  static removeFromExcludedOutputDeviceNames(displayName: DisplayName) {
    const outputs = SettingsUtils.getExcludedOutputDeviceNames();

    const index = outputs.indexOf(displayName);

    if (index === -1) {
      return;
    }

    outputs.splice(index, 1);

    const settings = this.getSettings();
    settings.set_strv(ExcludedOutputNamesSetting, outputs);
  }

  static getAvailableOutputs(): DisplayName[] {
    const settings = this.getSettings();
    const ids = settings.get_strv(AvailableOutputNames);

    return ids;
  }

  static setAvailableOutputs(displayNames: DisplayName[]) {
    const settings = this.getSettings();
    settings.set_strv(
      AvailableOutputNames,
      displayNames.map((id) => id.toString())
    );
  }

  static addToAvailableOutputs(displayName: DisplayName) {
    const currentOutputs = SettingsUtils.getAvailableOutputs();

    if (currentOutputs.includes(displayName)) {
      return;
    }

    const newAllOutputs = [...currentOutputs, displayName];

    const settings = this.getSettings();
    settings.set_strv(
      AvailableOutputNames,
      newAllOutputs.map((id) => id.toString())
    );
  }

  static removeFromAvailableOutputs(displayName: DisplayName) {
    const outputs = SettingsUtils.getAvailableOutputs();

    const index = outputs.indexOf(displayName);

    if (index === -1) {
      return;
    }

    outputs.splice(index, 1);

    const settings = this.getSettings();
    settings.set_strv(
      AvailableOutputNames,
      outputs.map((id) => id.toString())
    );
  }
}
