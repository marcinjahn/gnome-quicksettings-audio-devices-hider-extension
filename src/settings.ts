import { Settings } from "@gi-types/gio2";
import { DisplayName } from "identification/display-name";

const ExtensionUtils = imports.misc.extensionUtils;

const SettingsPath =
  "org.gnome.shell.extensions.quicksettings-audio-devices-hider";

export const ExcludedOutputNamesSetting = "excluded-output-names";
const AvailableOutputNames = "available-output-names";

export class SettingsUtils {
  private settings: Settings | null = null;

  private getSettings(): Settings {
    if (!this.settings) {
      this.settings = ExtensionUtils.getSettings(SettingsPath);
    }

    return this.settings;
  }

  getExcludedOutputDeviceNames(): DisplayName[] {
    const settings = this.getSettings();
    const ids = settings.get_strv(ExcludedOutputNamesSetting);

    return ids;
  }

  setExcludedOutputDeviceNames(displayNames: DisplayName[]) {
    const settings = this.getSettings();
    settings.set_strv(ExcludedOutputNamesSetting, displayNames);
  }

  addToExcludedOutputDeviceNames(displayName: DisplayName) {
    const currentOutputs = this.getExcludedOutputDeviceNames();

    if (currentOutputs.includes(displayName)) {
      return;
    }

    const newOutputs = [...currentOutputs, displayName];
    const settings = this.getSettings();

    settings.set_strv(ExcludedOutputNamesSetting, newOutputs);
  }

  removeFromExcludedOutputDeviceNames(displayName: DisplayName) {
    const outputs = this.getExcludedOutputDeviceNames();

    const index = outputs.indexOf(displayName);

    if (index === -1) {
      return;
    }

    outputs.splice(index, 1);

    const settings = this.getSettings();
    settings.set_strv(ExcludedOutputNamesSetting, outputs);
  }

  getAvailableOutputs(): DisplayName[] {
    const settings = this.getSettings();
    const ids = settings.get_strv(AvailableOutputNames);

    return ids;
  }

  setAvailableOutputs(displayNames: DisplayName[]) {
    const settings = this.getSettings();
    settings.set_strv(
      AvailableOutputNames,
      displayNames.map((id) => id.toString())
    );
  }

  addToAvailableOutputs(displayName: DisplayName) {
    const currentOutputs = this.getAvailableOutputs();

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

  removeFromAvailableOutputs(displayName: DisplayName) {
    const outputs = this.getAvailableOutputs();

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

  connectToChanges(settingName: string, func: () => void): number {
    return this.getSettings().connect(`changed::${settingName}`, func);
  }

  disconnect(subscriptionId: number) {
    this.getSettings().disconnect(subscriptionId);
  }

  dispose() {
    this.settings = null;
  }
}
