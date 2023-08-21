import { Extension } from "gnomejs://extension.js";

import { DeviceType, DisplayName } from "identification";
import { delay, disposeDelayTimeouts } from "utils/delay";
import { AudioPanel } from "./audio-panel";
import {
  AudioPanelMixerSource,
  MixerEvent,
  MixerSubscription,
  MixerWrapper,
} from "./mixer";
import {
  ExcludedInputNamesSetting,
  ExcludedOutputNamesSetting,
  SettingsPath,
  SettingsUtils,
} from "./settings";

export default class QuickSettingsAudioDevicesHiderExtension extends Extension {
  private _mixer: MixerWrapper | null;
  private _mixerSubscription: MixerSubscription | null;
  private _audioPanel: AudioPanel | null;
  private _settingsUtils: SettingsUtils | null;
  private _outputSettingsSubscription: number | null;
  private _inputSettingsSubscription: number | null;
  private _lastExcludedOutputDevices: DisplayName[] | null;
  private _lastExcludedInputDevices: DisplayName[] | null;

  enable() {
    console.log(`Enabling extension ${this.uuid}`);

    this._audioPanel = new AudioPanel();
    this._settingsUtils = new SettingsUtils(this.getSettings(SettingsPath));
    this._lastExcludedOutputDevices =
      this._settingsUtils.getExcludedOutputDeviceNames();
    this._lastExcludedInputDevices =
      this._settingsUtils.getExcludedInputDeviceNames();

    new AudioPanelMixerSource().getMixer().then((mixer) => {
      this._mixer = mixer;

      this.setAvailableDevicesInSettings();
      this.setupDeviceChangesSubscription();
      this.hideExcludedDevices();
      this.setupExcludedDevicesHandling();
    });
  }

  hideExcludedDevices() {
    const devices = this._mixer
      ?.getAudioDevicesFromDisplayNames(
        this._lastExcludedOutputDevices!,
        "output"
      )
      .concat(
        this._mixer?.getAudioDevicesFromDisplayNames(
          this._lastExcludedInputDevices!,
          "input"
        )
      );

    devices?.forEach((device) => {
      if (device) {
        this._audioPanel?.removeDevice(device!.id, device.type);
      }
    });
  }

  setupExcludedDevicesHandling() {
    const listenerFactory = (type: DeviceType) => {
      return () => {
        const newExcludedDevices =
          type === "output"
            ? this._settingsUtils?.getExcludedOutputDeviceNames()
            : this._settingsUtils?.getExcludedInputDeviceNames();

        if (!newExcludedDevices) {
          return;
        }

        const devicesToShowIds = this.getDeviceIdsToShow(
          newExcludedDevices,
          type
        );
        const devicesToHideIds = this.getDeviceIdsToHide(
          newExcludedDevices,
          type
        );

        devicesToShowIds?.forEach((id) =>
          this._audioPanel?.addDevice(id, type)
        );
        devicesToHideIds?.forEach((id) =>
          this._audioPanel?.removeDevice(id, type)
        );

        if (type === "output") {
          this._lastExcludedOutputDevices = newExcludedDevices ?? [];
        } else {
          this._lastExcludedInputDevices = newExcludedDevices ?? [];
        }
      };
    };

    this._inputSettingsSubscription = this._settingsUtils!.connectToChanges(
      ExcludedInputNamesSetting,
      listenerFactory("input")
    );
    this._outputSettingsSubscription = this._settingsUtils!.connectToChanges(
      ExcludedOutputNamesSetting,
      listenerFactory("output")
    );
  }

  private getDeviceIdsToHide(
    newExcludedDevices: DisplayName[],
    type: DeviceType
  ) {
    const devicesToHide = newExcludedDevices.filter(
      (current) =>
        !(
          type === "output"
            ? this._lastExcludedOutputDevices!
            : this._lastExcludedInputDevices!
        ).includes(current)
    );

    return this._mixer
      ?.getAudioDevicesFromDisplayNames(devicesToHide, type)
      .filter((n) => n)
      .map((n) => n!.id);
  }

  private getDeviceIdsToShow(
    newExcludedDevices: DisplayName[],
    type: DeviceType
  ) {
    const devicesToShow = (
      type === "output"
        ? this._lastExcludedOutputDevices!
        : this._lastExcludedInputDevices!
    ).filter((last) => !newExcludedDevices.includes(last));

    return this._mixer
      ?.getAudioDevicesFromDisplayNames(devicesToShow, type)
      .filter((n) => n)
      .map((n) => n!.id);
  }

  setupDeviceChangesSubscription() {
    this._mixerSubscription =
      this._mixer?.subscribeToDeviceChanges((event) => {
        this.updateAvailableDevicesInSettings(event);

        if (event.type === "output-added") {
          this.hideDeviceIfExcluded(event.deviceId, "output");
        } else if (event.type === "input-added") {
          this.hideDeviceIfExcluded(event.deviceId, "input");
        }
      }) ?? null;
  }

  hideDeviceIfExcluded(deviceId: number, type: DeviceType) {
    if (!this._mixer || !this._settingsUtils) {
      return;
    }

    const deviceName = this._mixer.getAudioDevicesFromIds([deviceId], type)[0]
      .displayName;

    const excludedDevices =
      type === "output"
        ? this._settingsUtils.getExcludedOutputDeviceNames()
        : this._settingsUtils.getExcludedInputDeviceNames();

    if (excludedDevices.includes(deviceName)) {
      delay(300).then(() => {
        // delay due to potential race condition with Quick Setting panel's code
        this._audioPanel?.removeDevice(deviceId, type);
      });
    }
  }

  setAvailableDevicesInSettings() {
    if (!this._audioPanel || !this._mixer || !this._settingsUtils) {
      return;
    }

    const allOutputIds = this._audioPanel.getDisplayedDeviceIds("output");
    const allOutputNames = this._mixer
      .getAudioDevicesFromIds(allOutputIds, "output")
      ?.map(({ displayName }) => displayName);
    if (allOutputNames) {
      this._settingsUtils.setAvailableOutputs(allOutputNames);
    }

    const allInputIds = this._audioPanel.getDisplayedDeviceIds("input");
    const allInputNames = this._mixer
      .getAudioDevicesFromIds(allInputIds, "input")
      ?.map(({ displayName }) => displayName);
    if (allInputNames) {
      this._settingsUtils.setAvailableInputs(allInputNames);
    }
  }

  updateAvailableDevicesInSettings(event: MixerEvent) {
    if (!this._mixer || !this._settingsUtils) {
      return;
    }

    const deviceType = ["output-added", "output-removed"].includes(event.type)
      ? "output"
      : "input";

    const displayName = this._mixer.getAudioDevicesFromIds(
      [event.deviceId],
      deviceType
    )[0].displayName;

    if (["output-added", "input-added"].includes(event.type)) {
      this._settingsUtils.addToAvailableDevices(displayName, deviceType);
    } else if (["output-removed", "input-removed"].includes(event.type)) {
      this._settingsUtils.removeFromAvailableDevices(displayName, deviceType);
    } else {
      console.warn(`Received an unsupported MixerEvent: ${event.type}`);
    }
  }

  disable() {
    console.log(`Disabling extension ${this.uuid}`);

    if (this._mixerSubscription) {
      this._mixer?.unsubscribe(this._mixerSubscription);
    }
    this._mixer?.dispose();

    if (this._outputSettingsSubscription) {
      this._settingsUtils?.disconnect(this._outputSettingsSubscription!);
      this._outputSettingsSubscription = null;
    }

    if (this._inputSettingsSubscription) {
      this._settingsUtils?.disconnect(this._inputSettingsSubscription!);
      this._inputSettingsSubscription = null;
    }

    this.enableAllDevices();

    disposeDelayTimeouts();

    this._settingsUtils = null;
    this._audioPanel = null;
    this._lastExcludedOutputDevices = null;
    this._lastExcludedInputDevices = null;
    this._mixer = null;
    this._mixerSubscription = null;
  }

  enableAllDevices() {
    if (!this._settingsUtils || !this._mixer) {
      return;
    }

    const allOutputDevices = this._settingsUtils.getAvailableOutputs();
    const allInputDevices = this._settingsUtils.getAvailableInputs();

    this._mixer
      .getAudioDevicesFromDisplayNames(allOutputDevices, "output")
      .filter((n) => n)
      .map((n) => n!.id)
      .forEach((id) => this._audioPanel?.addDevice(id, "output"));

    this._mixer
      .getAudioDevicesFromDisplayNames(allInputDevices, "input")
      .filter((n) => n)
      .map((n) => n!.id)
      .forEach((id) => this._audioPanel?.addDevice(id, "input"));
  }
}
