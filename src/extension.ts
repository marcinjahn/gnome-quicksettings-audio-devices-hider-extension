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
  SettingsUtils,
} from "./settings";

const ExtensionUtils = imports.misc.extensionUtils;

class Extension {
  private _uuid: string | null;
  private _mixer: MixerWrapper | null;
  private _mixerSubscription: MixerSubscription | null;
  private _audioPanel: AudioPanel | null;
  private _settings: SettingsUtils | null;
  private _outputSettingsSubscription: number | null;
  private _inputSettingsSubscription: number | null;
  private _lastExcludedOutputDevices: DisplayName[] | null;
  private _lastExcludedInputDevices: DisplayName[] | null;

  constructor(uuid: string) {
    this._uuid = uuid;
  }

  enable() {
    log(`Enabling extension ${this._uuid}`);

    this._audioPanel = new AudioPanel();
    this._settings = new SettingsUtils();
    this._lastExcludedOutputDevices =
      this._settings.getExcludedOutputDeviceNames();
    this._lastExcludedInputDevices =
      this._settings.getExcludedInputDeviceNames();

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
        this._audioPanel!.removeDevice(device!.id, device.type);
      }
    });
  }

  setupExcludedDevicesHandling() {
    const listenerFactory = (type: DeviceType) => {
      return () => {
        const newExcludedDevices =
          type === "output"
            ? this._settings?.getExcludedOutputDeviceNames()
            : this._settings?.getExcludedInputDeviceNames();

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

    this._inputSettingsSubscription = this._settings!.connectToChanges(
      ExcludedInputNamesSetting,
      listenerFactory("input")
    );
    this._outputSettingsSubscription = this._settings!.connectToChanges(
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
    if (!this._mixer) {
      return;
    }

    const deviceName = this._mixer.getAudioDevicesFromIds([deviceId], type)[0]
      .displayName;

    const excludedDevices =
      type === "output"
        ? this._settings?.getExcludedOutputDeviceNames()
        : this._settings?.getExcludedInputDeviceNames();

    if (excludedDevices?.includes(deviceName)) {
      delay(200).then(() => {
        // delay due to potential race condition with Quick Setting panel's code
        this._audioPanel!.removeDevice(deviceId, type);
      });
    }
  }

  setAvailableDevicesInSettings() {
    const allDisplayedOutputDevices =
      this._audioPanel!.getDisplayedDevices("output");
    const allDisplayedInputDevices =
      this._audioPanel!.getDisplayedDevices("input");
    this._settings!.setAvailableOutputs(
      allDisplayedOutputDevices.map((i) => i.displayName)
    );
    this._settings!.setAvailableInputs(
      allDisplayedInputDevices.map((i) => i.displayName)
    );
  }

  updateAvailableDevicesInSettings(event: MixerEvent) {
    if (!this._mixer) {
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
      this._settings!.addToAvailableDevices(displayName, deviceType);
    } else if (["output-removed", "input-removed"].includes(event.type)) {
      this._settings!.removeFromAvailableDevices(displayName, deviceType);
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

    if (this._outputSettingsSubscription) {
      this._settings?.disconnect(this._outputSettingsSubscription!);
      this._outputSettingsSubscription = null;
    }

    if (this._inputSettingsSubscription) {
      this._settings?.disconnect(this._inputSettingsSubscription!);
      this._inputSettingsSubscription = null;
    }

    this.enableAllDevices();

    disposeDelayTimeouts();

    this._settings?.dispose();

    this._settings = null;
    this._audioPanel = null;
    this._lastExcludedOutputDevices = null;
    this._lastExcludedInputDevices = null;
    this._mixer = null;
    this._mixerSubscription = null;
  }

  enableAllDevices() {
    const allOutputDevices = this._settings!.getAvailableOutputs();
    const allInputDevices = this._settings!.getAvailableInputs();

    this._mixer
      ?.getAudioDevicesFromDisplayNames(allOutputDevices, "output")
      .filter((n) => n)
      .map((n) => n!.id)
      .forEach((id) => this._audioPanel!.addDevice(id, "output"));

    this._mixer
      ?.getAudioDevicesFromDisplayNames(allInputDevices, "input")
      .filter((n) => n)
      .map((n) => n!.id)
      .forEach((id) => this._audioPanel!.addDevice(id, "input"));
  }
}

export default function (meta: { uuid: string }): Extension {
  return new Extension(meta.uuid);
}
