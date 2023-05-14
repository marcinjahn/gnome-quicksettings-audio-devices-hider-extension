import { Settings } from "@gi-types/gio2";
import { DisplayName, DeviceType } from "identification";

const ExtensionUtils = imports.misc.extensionUtils;

const SettingsPath =
  "org.gnome.shell.extensions.quicksettings-audio-devices-hider";

export const ExcludedOutputNamesSetting = "excluded-output-names";
export const ExcludedInputNamesSetting = "excluded-input-names";
const AvailableOutputNames = "available-output-names";
const AvailableInputNames = "available-input-names";

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
  getExcludedInputDeviceNames(): DisplayName[] {
    const settings = this.getSettings();
    const ids = settings.get_strv(ExcludedInputNamesSetting);

    return ids;
  }

  setExcludedOutputDeviceNames(displayNames: DisplayName[]) {
    const settings = this.getSettings();
    settings.set_strv(ExcludedOutputNamesSetting, displayNames);
  }

  addToExcludedDeviceNames(displayName: DisplayName, deviceType: DeviceType) {
    const currentDevices =
      deviceType === "output"
        ? this.getExcludedOutputDeviceNames()
        : this.getExcludedInputDeviceNames();

    if (currentDevices.includes(displayName)) {
      return;
    }

    const newOutputs = [...currentDevices, displayName];

    const setting =
      deviceType === "output"
        ? ExcludedOutputNamesSetting
        : ExcludedInputNamesSetting;

    const settings = this.getSettings();
    settings.set_strv(setting, newOutputs);
  }

  removeFromExcludedDeviceNames(
    displayName: DisplayName,
    deviceType: DeviceType
  ) {
    const devices =
      deviceType === "output"
        ? this.getExcludedOutputDeviceNames()
        : this.getExcludedInputDeviceNames();

    const index = devices.indexOf(displayName);

    if (index === -1) {
      return;
    }

    devices.splice(index, 1);

    const setting =
      deviceType === "output"
        ? ExcludedOutputNamesSetting
        : ExcludedInputNamesSetting;

    const settings = this.getSettings();
    settings.set_strv(deviceType, devices);
  }

  getAvailableOutputs(): DisplayName[] {
    const settings = this.getSettings();
    const ids = settings.get_strv(AvailableOutputNames);

    return ids;
  }

  getAvailableInputs(): DisplayName[] {
    const settings = this.getSettings();
    const ids = settings.get_strv(AvailableInputNames);

    return ids;
  }

  setAvailableOutputs(displayNames: DisplayName[]) {
    const settings = this.getSettings();
    settings.set_strv(
      AvailableOutputNames,
      displayNames.map((id) => id.toString())
    );
  }

  setAvailableInputs(displayNames: DisplayName[]) {
    const settings = this.getSettings();
    settings.set_strv(
      AvailableInputNames,
      displayNames.map((id) => id.toString())
    );
  }

  addToAvailableDevices(displayName: DisplayName, type: DeviceType) {
    const currentDevices =
      type === "output"
        ? this.getAvailableOutputs()
        : this.getAvailableInputs();

    if (currentDevices.includes(displayName)) {
      return;
    }

    const newAllOutputs = [...currentDevices, displayName];

    const settings = this.getSettings();
    settings.set_strv(
      type === "output" ? AvailableOutputNames : AvailableInputNames,
      newAllOutputs.map((id) => id.toString())
    );
  }

  removeFromAvailableDevices(displayName: DisplayName, type: DeviceType) {
    const devices =
      type === "output"
        ? this.getAvailableOutputs()
        : this.getAvailableInputs();

    const index = devices.indexOf(displayName);

    if (index === -1) {
      return;
    }

    devices.splice(index, 1);

    const settings = this.getSettings();
    settings.set_strv(
      type === "output" ? AvailableOutputNames : AvailableInputNames,
      devices.map((id) => id.toString())
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
