import { DisplayName } from "identification";
import { delay, disposeDelayTimeouts } from "utils/delay";

import { AudioPanel } from "./audio-panel";
import {
  AudioPanelMixerSource,
  MixerEvent,
  MixerSubscription,
  MixerWrapper,
} from "./mixer";
import { ExcludedOutputNamesSetting, SettingsUtils } from "./settings";

const ExtensionUtils = imports.misc.extensionUtils;

class Extension {
  private _uuid: string | null;
  private _mixer: MixerWrapper | null;
  private _mixerSubscription: MixerSubscription | null;
  private _audioPanel: AudioPanel | null;
  private _settings: SettingsUtils | null;
  private _settingsSubscription: number | null;
  private _lastExludedDevices: DisplayName[] | null;

  constructor(uuid: string) {
    this._uuid = uuid;
  }

  enable() {
    log(`Enabling extension ${this._uuid}`);

    this._audioPanel = new AudioPanel();
    this._settings = new SettingsUtils();
    this._lastExludedDevices = this._settings.getExcludedOutputDeviceNames();

    new AudioPanelMixerSource().getMixer().then((mixer) => {
      this._mixer = mixer;

      this.setAllOutputsInSettings();
      this.setupOutputChangesSubscription();
      this.hideExcludedDevices();
      this.setupExludedDevicesHandling();
    });
  }

  hideExcludedDevices() {
    var devices = this._mixer?.getAudioDevicesFromDisplayNames(
      this._lastExludedDevices!
    );
    devices?.forEach((device) => {
      if (device) {
        this._audioPanel!.removeDevice(device!.id);
      }
    });
  }

  setupExludedDevicesHandling() {
    this._settingsSubscription = this._settings!.connectToChanges(
      ExcludedOutputNamesSetting,
      () => {
        const newExcludedDevices =
          this._settings?.getExcludedOutputDeviceNames();

        if (!newExcludedDevices) {
          return;
        }

        const devicesToShowIds = this.getDeviceIdsToShow(newExcludedDevices);
        const devicesToHideIds = this.getDeviceIdsToHide(newExcludedDevices);

        devicesToShowIds?.forEach((id) => this._audioPanel?.addDevice(id));
        devicesToHideIds?.forEach((id) => this._audioPanel?.removeDevice(id));

        this._lastExludedDevices = newExcludedDevices ?? [];
      }
    );
  }

  private getDeviceIdsToHide(newExcludedDevices: DisplayName[]) {
    const devicesToHide = newExcludedDevices.filter(
      (current) => !this._lastExludedDevices!.includes(current)
    );

    const devicesToHideIds = this._mixer
      ?.getAudioDevicesFromDisplayNames(devicesToHide)
      .filter((n) => n)
      .map((n) => n!.id);
    return devicesToHideIds;
  }

  private getDeviceIdsToShow(newExcludedDevices: DisplayName[]) {
    const devicesToShow = this._lastExludedDevices!.filter(
      (last) => !newExcludedDevices.includes(last)
    );
    const devicesToShowIds = this._mixer
      ?.getAudioDevicesFromDisplayNames(devicesToShow)
      .filter((n) => n)
      .map((n) => n!.id);

    return devicesToShowIds;
  }

  setupOutputChangesSubscription() {
    this._mixerSubscription =
      this._mixer?.subscribeToOutputChanges((event) => {
        this.updateAvailableOutputsInSettings(event);

        if (event.type === "output-added") {
          this.hideDeviceIfExcluded(event.deviceId);
        }
      }) ?? null;
  }

  hideDeviceIfExcluded(deviceId: number) {
    if (!this._mixer) {
      return;
    }

    const deviceName = this._mixer.getAudioDevicesFromIds([deviceId])[0]
      .displayName;

    const excludedOutputs = this._settings?.getExcludedOutputDeviceNames();

    if (excludedOutputs?.includes(deviceName)) {
      delay(200).then(() => {
        // delay due to potential race condition with Quick Setting panel's code
        this._audioPanel!.removeDevice(deviceId);
      });
    }
  }

  setAllOutputsInSettings() {
    const allDisplayedDevices = this._audioPanel!.getDisplayedDevices();
    this._settings!.setAvailableOutputs(
      allDisplayedDevices.map((i) => i.displayName)
    );
  }

  updateAvailableOutputsInSettings(event: MixerEvent) {
    if (!this._mixer) {
      return;
    }

    const displayName = this._mixer.getAudioDevicesFromIds([event.deviceId])[0]
      .displayName;

    if (event.type === "output-added") {
      this._settings!.addToAvailableOutputs(displayName);
    } else if (event.type === "output-removed") {
      this._settings!.removeFromAvailableOutputs(displayName);
    } else {
      log(`WARN: Received an unsupported MixerEvent: ${event.type}`);
    }
  }

  disable() {
    log(`Disabling extension ${this._uuid}`);

    if (this._mixerSubscription) {
      this._mixer?.unsubscribe(this._mixerSubscription);
    }
    this._mixer?.dispose();

    if (this._settingsSubscription) {
      this._settings?.disconnect(this._settingsSubscription!);
      this._settingsSubscription = null;
    }

    this.enableAllDevices();

    disposeDelayTimeouts();

    this._settings?.dispose();

    this._settings = null;
    this._audioPanel = null;
    this._lastExludedDevices = null;
    this._mixer = null;
    this._mixerSubscription = null;
  }

  enableAllDevices() {
    const allDevices = this._settings!.getAvailableOutputs();
    const devicesToShowIds = this._mixer
      ?.getAudioDevicesFromDisplayNames(allDevices)
      .filter((n) => n)
      .map((n) => n!.id);

    devicesToShowIds?.forEach((id) => this._audioPanel!.addDevice(id));
  }
}

export default function (meta: { uuid: string }): Extension {
  return new Extension(meta.uuid);
}
