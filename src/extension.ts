import { MixerWrapper, MixerSubscription, AudioPanelMixerSource, MixerEvent } from './mixer';
import { Settings } from './settings';
import { AudioPanel } from './audio-panel';

const Main = imports.ui.main;

class Extension {
    private _uuid: string;
    private _mixer: MixerWrapper | null = null;
    private _mixerSubscription: MixerSubscription | null = null;
    private _audioPanel: AudioPanel;

    constructor(uuid: string) {
        this._uuid = uuid;
        this._audioPanel = new AudioPanel();
    }

    async enable() {
        log(`Enabling extension ${this._uuid}`);
        log("--------------------------------------------------------ENABLING MY AWESOME EXTENSION------------------------------------------------------------------------------------------");
        log("--------------------------------------------------------------------------------------------------------------------------------------------------");
        log("--------------------------------------------------------------------------------------------------------------------------------------------------");
        log("--------------------------------------------------------------------------------------------------------------------------------------------------");
        log("--------------------------------------------------------------------------------------------------------------------------------------------------");
        log("--------------------------------------------------------------------------------------------------------------------------------------------------");
        
        this._mixer = await new AudioPanelMixerSource().getMixer();

        this.setAllOutputsInSettings();
        this.setupAllOutputsSubscription();
        this.setExcludedOutputIdsInSettings();

        // const testDeviceId = allDisplayedDevices[0].id;
        // log(testDeviceId);
        // const info = MixerTools.getOutputDevicesInfo
        // log(info);
        // // listChildren(info);
        // log(info?.description);
        // log(info?.get_active_profile());
        // log(info?.get_description());
        // log(info?.get_origin());
        // log(info?.get_port());
        // log(info?.get_stream_id());
    }

    setupAllOutputsSubscription() {
        this._mixerSubscription = this._mixer!.subscribeToOutputChanges(
            this.updateVisibleDevices);
    }

    setAllOutputsInSettings() {
        const allDisplayedDevices = this._audioPanel.getDisplayedDevices();
        Settings.setAllOutputs(allDisplayedDevices.map(i => i.id));
    }

    setExcludedOutputIdsInSettings() {
        const excludedNames = Settings.getExcludedOutputDeviceNames();
        const excludedIds = this._mixer!.getAudioDevicesFromDisplayNames(excludedNames)
            .filter(n => n)
            .map(n => n!.id);

        Settings.setExcludedOutputDeviceIds(excludedIds);
    }

    logDevice(id: number, event: string) {
        log('DEVICE ' + event + " " + id);
    }

    updateVisibleDevices(event: MixerEvent) {
        if (event.type === 'output-added') {
            Settings.addToAllOutputs(event.deviceId);
        } else if (event.type === 'output-removed') {
            Settings.removeFromAllOutputs(event.deviceId);
        } else {
            log(`WARN: Received an unsupported MixerEvent: ${event.type}`);
        }
    }

    disable() {
        log(`Disabling extension ${this._uuid}`);
        log("--------------------------------------------------------DISABLNG MY AWESOME EXTENSION------------------------------------------------------------------------------------------");
        log("--------------------------------------------------------------------------------------------------------------------------------------------------");
        log("--------------------------------------------------------------------------------------------------------------------------------------------------");
        log("--------------------------------------------------------------------------------------------------------------------------------------------------");
        log("--------------------------------------------------------------------------------------------------------------------------------------------------");
        log("--------------------------------------------------------------------------------------------------------------------------------------------------");
    
        if (this._mixerSubscription) {
            this._mixer!.unsubscribe(this._mixerSubscription);
        }
        if (this._mixer) {
            this._mixer!.dispose();
        }

    }
}

export default function (meta: { uuid: string }): Extension {
    return new Extension(meta.uuid);
}

function listChildren(obj: any) {
    const klass = obj?.constructor?.name
    log(klass);

    if (klass === "Map") {
        log("It's a map");
        obj.forEach((value, key) => {
            log(`Key: ${key}, Value: ${value}`);
        });

        return;
    }

    // Get an array of property and method names
    const propertiesAndMethods = Object.getOwnPropertyNames(obj);

    log(propertiesAndMethods.length);
  
    // Sort the array alphabetically
    propertiesAndMethods.sort();
  
    // Iterate through the sorted array
    propertiesAndMethods.forEach((property) => {
      // Check if the property is a function (method)
      if (typeof obj[property] === 'function') {
        log(property + '()');
      } else {
        log(property);
      }
    });
  }