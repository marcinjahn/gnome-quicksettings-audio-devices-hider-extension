import Gio from "@gi-ts/gio2";
import { DisplayName, DeviceType } from "identification";

export const SettingsPath =
  "org.gnome.shell.extensions.quicksettings-audio-devices-hider";

export const ExcludedOutputNamesSetting = "excluded-output-names";
export const ExcludedInputNamesSetting = "excluded-input-names";
const AvailableOutputNames = "available-output-names";
const AvailableInputNames = "available-input-names";

export class SettingsUtils {
  private settings: Gio.Settings;

  constructor(settings: Gio.Settings) {
    this.settings = settings;
  }

  getExcludedOutputDeviceNames(): DisplayName[] {
    const ids = this.settings.get_strv(ExcludedOutputNamesSetting);

    return ids;
  }
  getExcludedInputDeviceNames(): DisplayName[] {
    const ids = this.settings.get_strv(ExcludedInputNamesSetting);

    return ids;
  }

  setExcludedOutputDeviceNames(displayNames: DisplayName[]) {
    this.settings.set_strv(ExcludedOutputNamesSetting, displayNames);
  }

  addToExcludedDeviceNames(displayName: DisplayName, deviceType: DeviceType) {
    const currentDevices =
      deviceType === "output"
        ? this.getExcludedOutputDeviceNames()
        : this.getExcludedInputDeviceNames();

    if (currentDevices.includes(displayName)) {
      return;
    }

    const newDevices = [...currentDevices, displayName];

    const setting =
      deviceType === "output"
        ? ExcludedOutputNamesSetting
        : ExcludedInputNamesSetting;

    this.settings.set_strv(setting, newDevices);
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

    this.settings.set_strv(setting, devices);
  }

  getAvailableOutputs(): DisplayName[] {
    const ids = this.settings.get_strv(AvailableOutputNames);

    return ids;
  }

  getAvailableInputs(): DisplayName[] {
    const ids = this.settings.get_strv(AvailableInputNames);

    return ids;
  }

  setAvailableOutputs(displayNames: DisplayName[]) {
    this.settings.set_strv(
      AvailableOutputNames,
      displayNames.map((id) => id.toString())
    );
  }

  setAvailableInputs(displayNames: DisplayName[]) {
    this.settings.set_strv(
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

    const newAllDevices = [...currentDevices, displayName];

    this.settings.set_strv(
      type === "output" ? AvailableOutputNames : AvailableInputNames,
      newAllDevices.map((id) => id.toString())
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

    this.settings.set_strv(
      type === "output" ? AvailableOutputNames : AvailableInputNames,
      devices.map((id) => id.toString())
    );
  }

  connectToChanges(settingName: string, func: () => void): number {
    return this.settings.connect(`changed::${settingName}`, func);
  }

  disconnect(subscriptionId: number) {
    this.settings.disconnect(subscriptionId);
  }
}
