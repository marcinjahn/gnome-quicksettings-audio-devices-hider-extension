import { addToAllOutputs, getExcludedOutputDeviceIds, removeFromAllOutputs, setAllOutputs } from './settings';
import { MixerEvent, MixerWrapper, MixerSubscription } from './mixer';
import { getDisplayedDevices } from 'audio-panel';

const Main = imports.ui.main;

class Extension {
    private uuid: string;
    private mixerWrapper: MixerWrapper;
    private mixerSubscription: MixerSubscription;

    constructor(uuid: string) {
        this.uuid = uuid;
        this.mixerWrapper = new MixerWrapper();
    }

    async enable() {
        log("--------------------------------------------------------ENABLING MY AWESOME EXTENSION------------------------------------------------------------------------------------------");
        log("--------------------------------------------------------------------------------------------------------------------------------------------------");
        log("--------------------------------------------------------------------------------------------------------------------------------------------------");
        log("--------------------------------------------------------------------------------------------------------------------------------------------------");
        log("--------------------------------------------------------------------------------------------------------------------------------------------------");
        log("--------------------------------------------------------------------------------------------------------------------------------------------------");
        // const settings = getExcludedOutputIds();
        // log(settings);

        // const devices = await getVisibleDevices();

        // devices.forEach(d => {
        //     log(d.displayName);
        // })

        // const visibleDevicesPromise = getVisibleDevices();
        // const hiddenDevicesPromise = getOutputDevicesInfo(getExcludedOutputDeviceIds());
        
        // const [visibleDevices, hiddenDevices] = await Promise.all([
        //     visibleDevicesPromise,
        //     hiddenDevicesPromise
        // ]);

        // log(visibleDevices.length);

        // visibleDevices.forEach(d => {
        //     log(d.displayName);
        // })

        const allDisplayedDevices = await getDisplayedDevices();
        setAllOutputs(allDisplayedDevices.map(i => i.id));

        this.mixerSubscription = await this.mixerWrapper.subscribeToOutputChanges(
            this.updateVisibleDevices);


        // this.mixer = await getMixer();
        // // TODO: Disconnect
        // this.mixer.connect('output-added', (_, id) => this.logDevice(id, 'ADDED'));
        // this.mixer.connect('output-removed', (_, id) => this.logDevice(id, "REMOVED"));
    }

    logDevice(id: number, event: string) {
        log('DEVICE ' + event + " " + id);
    }

    updateVisibleDevices(event: MixerEvent) {
        if (event.type === 'output-added') {
            addToAllOutputs(event.deviceId);
        } else if (event.type === 'output-removed') {
            removeFromAllOutputs(event.deviceId);
        } else {
            log(`WARN: Reveived an unsupported MixerEvent: ${event.type}`);
        }
    }

    disable() {
        log("--------------------------------------------------------DISABLNG MY AWESOME EXTENSION------------------------------------------------------------------------------------------");
        log("--------------------------------------------------------------------------------------------------------------------------------------------------");
        log("--------------------------------------------------------------------------------------------------------------------------------------------------");
        log("--------------------------------------------------------------------------------------------------------------------------------------------------");
        log("--------------------------------------------------------------------------------------------------------------------------------------------------");
        log("--------------------------------------------------------------------------------------------------------------------------------------------------");
    
        if (this.mixerSubscription) {
            this.mixerWrapper.unsubscribe(this.mixerSubscription);
        }
        
        this,this.mixerWrapper.dispose();
    }
}

export default function (meta: { uuid: string }): Extension {
    return new Extension(meta.uuid);
}

function listChildren(obj: any) {
    const klass = obj.constructor?.name
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