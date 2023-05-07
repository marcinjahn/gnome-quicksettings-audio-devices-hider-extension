import { Settings } from "@gi-types/gio2";
import { DisplayName } from "identification";
import { delay } from "utils/delay";

import { AudioPanel } from "./audio-panel";
import {
  AudioPanelMixerSource,
  MixerEvent,
  MixerSubscription,
  MixerWrapper,
} from "./mixer";
import {
  ExcludedOutputNamesSetting,
  SettingsPath,
  SettingsUtils,
} from "./settings";

const ExtensionUtils = imports.misc.extensionUtils;

class Extension {
  private _uuid: string;
  private _mixer: MixerWrapper | null = null;
  private _mixerSubscription: MixerSubscription | null = null;
  private _audioPanel: AudioPanel;
  private _settings: Settings;
  private _settingsSubscription: number;
  private _lastExludedDevices: DisplayName[];

  constructor(uuid: string) {
    this._uuid = uuid;
    this._audioPanel = new AudioPanel();
    this._settings = ExtensionUtils.getSettings(SettingsPath);
    this._lastExludedDevices = SettingsUtils.getExcludedOutputDeviceNames();
  }

  async enable() {
    log(`Enabling extension ${this._uuid}`);

    this._mixer = await new AudioPanelMixerSource().getMixer();

    this.setAllOutputsInSettings();
    this.setupOutputChangesSubscription();
    this.hideExcludedDevices();
    this.setupExludedDevicesHandling();
  }

  hideExcludedDevices() {
    var devices = this._mixer!.getAudioDevicesFromDisplayNames(
      this._lastExludedDevices
    );
    devices.forEach((device) => {
      if (device) {
        this._audioPanel.removeDevice(device!.id);
      }
    });
  }

  setupExludedDevicesHandling() {
    this._settingsSubscription = this._settings.connect(
      `changed::${ExcludedOutputNamesSetting}`,
      () => {
        const newExcludedDevices = SettingsUtils.getExcludedOutputDeviceNames();

        const devicesToShowIds = this.getDeviceIdsToShow(newExcludedDevices);
        const devicesToHideIds = this.getDeviceIdsToHide(newExcludedDevices);

        devicesToShowIds.forEach((id) => this._audioPanel.addDevice(id));
        devicesToHideIds.forEach((id) => this._audioPanel.removeDevice(id));

        this._lastExludedDevices = newExcludedDevices;
      }
    );
  }

  private getDeviceIdsToHide(newExcludedDevices: DisplayName[]) {
    const devicesToHide = newExcludedDevices.filter(
      (current) => !this._lastExludedDevices.includes(current)
    );

    const devicesToHideIds = this._mixer!.getAudioDevicesFromDisplayNames(
      devicesToHide
    )
      .filter((n) => n)
      .map((n) => n!.id);
    return devicesToHideIds;
  }

  private getDeviceIdsToShow(newExcludedDevices: DisplayName[]) {
    const devicesToShow = this._lastExludedDevices.filter(
      (last) => !newExcludedDevices.includes(last)
    );
    const devicesToShowIds = this._mixer!.getAudioDevicesFromDisplayNames(
      devicesToShow
    )
      .filter((n) => n)
      .map((n) => n!.id);

    return devicesToShowIds;
  }

  setupOutputChangesSubscription() {
    this._mixerSubscription = this._mixer!.subscribeToOutputChanges((event) => {
      this.updateAvailableOutputsInSettings(event);

      if (event.type === "output-added") {
        this.hideDeviceIfExcluded(event.deviceId);
      }
    });
  }

  hideDeviceIfExcluded(deviceId: number) {
    const deviceName = this._mixer!.getAudioDevicesFromIds([deviceId])[0]
      .displayName;
    const excludedOutputs = SettingsUtils.getExcludedOutputDeviceNames();

    if (excludedOutputs.includes(deviceName)) {
      delay(200).then(() => {
        // delay due to potential race condition with Quick Setting panel's code
        this._audioPanel.removeDevice(deviceId);
      });
    }
  }

  setAllOutputsInSettings() {
    const allDisplayedDevices = this._audioPanel.getDisplayedDevices();
    SettingsUtils.setAvailableOutputs(
      allDisplayedDevices.map((i) => i.displayName)
    );
  }

  updateAvailableOutputsInSettings(event: MixerEvent) {
    const displayName = this._mixer!.getAudioDevicesFromIds([event.deviceId])[0]
      .displayName;

    if (event.type === "output-added") {
      SettingsUtils.addToAvailableOutputs(displayName);
    } else if (event.type === "output-removed") {
      SettingsUtils.removeFromAvailableOutputs(displayName);
    } else {
      log(`WARN: Received an unsupported MixerEvent: ${event.type}`);
    }
  }

  disable() {
    log(`Disabling extension ${this._uuid}`);

    if (this._mixerSubscription) {
      this._mixer!.unsubscribe(this._mixerSubscription);
    }
    if (this._mixer) {
      this._mixer!.dispose();
    }

    this._settings.disconnect(this._settingsSubscription);

    this.enableAllDevices();
  }

  enableAllDevices() {
    const allDevices = SettingsUtils.getAvailableOutputs();
    const devicesToShowIds = this._mixer!.getAudioDevicesFromDisplayNames(
      allDevices
    )
      .filter((n) => n)
      .map((n) => n!.id);

    devicesToShowIds.forEach((id) => this._audioPanel.addDevice(id));
  }
}

export default function (meta: { uuid: string }): Extension {
  return new Extension(meta.uuid);
}
