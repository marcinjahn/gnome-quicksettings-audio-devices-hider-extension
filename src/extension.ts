import { MixerWrapper, MixerSubscription, AudioPanelMixerSource, MixerEvent } from './mixer';
import { ExcludedOutputNamesSetting, SettingsPath, SettingsUtils } from './settings';
import { AudioPanel } from './audio-panel';
import { Settings } from '@gi-types/gio2';
import { DisplayName } from 'identification';

const Main = imports.ui.main;
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
        this.setupAllOutputsSubscription();
        this.hideExludedDevices();
        this.setupExludedDevicesHandling();
    }

    hideExludedDevices() {
        var devices = this._mixer!.getAudioDevicesFromDisplayNames(this._lastExludedDevices);
        devices.forEach(device => {
            if (device) {
                this._audioPanel.removeDevice(device!.id);
            }
        })
    }

    setupExludedDevicesHandling() {
        this._settingsSubscription = this._settings.connect(
            `changed::${ExcludedOutputNamesSetting}`, () => 
        {
            const newExcludedDevices = SettingsUtils.getExcludedOutputDeviceNames();

            const devicesToShowIds = this.getDeviceIdsToShow(newExcludedDevices);
            const devicesToHideIds = this.getDeviceIdsToHide(newExcludedDevices);

            devicesToShowIds.forEach(id => this._audioPanel.addDevice(id));
            devicesToHideIds.forEach(id => this._audioPanel.removeDevice(id));

            this._lastExludedDevices = newExcludedDevices;
        });
    }

    private getDeviceIdsToHide(newExcludedDevices: DisplayName[]) {
        const devicesToHide = newExcludedDevices
            .filter(current => !this._lastExludedDevices.includes(current));

        const devicesToHideIds = this._mixer!.getAudioDevicesFromDisplayNames(devicesToHide)
            .filter(n => n)
            .map(n => n!.id);
        return devicesToHideIds;
    }

    private getDeviceIdsToShow(newExcludedDevices: DisplayName[]) {
        const devicesToShow = this._lastExludedDevices
            .filter(last => !newExcludedDevices.includes(last));
        const devicesToShowIds = this._mixer!.getAudioDevicesFromDisplayNames(devicesToShow)
            .filter(n => n)
            .map(n => n!.id);

        return devicesToShowIds;
    }

    setupAllOutputsSubscription() {
        this._mixerSubscription = this._mixer!.subscribeToOutputChanges(
            (e) => this.updateAvailableOutputsInSettings(e));
    }

    setAllOutputsInSettings() {
        const allDisplayedDevices = this._audioPanel.getDisplayedDevices();
        SettingsUtils.setAvailableOutputs(allDisplayedDevices.map(i => i.displayName));
    }

    updateAvailableOutputsInSettings(event: MixerEvent) {
        const displayNames = this._mixer!.getAudioDevicesFromIds([event.deviceId]);

        log(displayNames);
        const displayName = displayNames[0].displayName;
        
        log(displayName);

        if (event.type === 'output-added') {
            SettingsUtils.addToAvailableOutputs(displayName);
        } else if (event.type === 'output-removed') {
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
        const devicesToShowIds = this._mixer!.getAudioDevicesFromDisplayNames(allDevices)
            .filter(n => n)
            .map(n => n!.id);
        
        devicesToShowIds.forEach(id => this._audioPanel.addDevice(id));
    }
}

export default function (meta: { uuid: string }): Extension {
    return new Extension(meta.uuid);
}