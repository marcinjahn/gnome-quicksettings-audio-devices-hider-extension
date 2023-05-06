import { MixerControl, MixerControlState } from '@gi-types/gvc1';
import { delay, delaySync } from './utils';
import { AudioDevice } from './AudioDevice';


export class MixerWrapper {
    // async getVisibleDevices(): Promise<AudioDevice[]> {    
    //     var mixer = await this.getMixer();
    
    //     const devices = mixer.get_sources();
    
    //     return devices.map(device => ({
    //         id: device.get_id(),
    //         displayName: device.description
    //     }));
    // }
    
    async getOutputDevicesInfo(ids: number[]): Promise<AudioDevice[]> {    
        var mixer = await this.getMixer();
    
        return ids.map(id => ({
            id,
            displayName: mixer.lookup_output_id(id).description
        }));
    }

    getOutputDevicesInfoSync(ids: number[]): AudioDevice[] {    
        var mixer = this.getMixerSync();
    
        return ids.map(id => ({
            id,
            displayName: mixer.lookup_output_id(id).description
        }));
    }
    
    /**
     * Only for the use of getMixer(), getMixerSync(), 
     * unsubscribe(subscription), and dispose() functions
     */
    private mixer: MixerControl | null = null;

    async getMixer(): Promise<MixerControl> {
        if (this.mixer) {
            return this.mixer
        }
    
        this.mixer = this.createMixerControl();
        await waitForMixerToBeReady(this.mixer);
    
        return this.mixer;
    }

    getMixerSync(): MixerControl {
        if (this.mixer) {
            return this.mixer
        }

        this.mixer = this.createMixerControl();
    

        waitForMixerToBeReadySync(this.mixer);
    
        return this.mixer;
    }

    private createMixerControl() {
        const mixer = new MixerControl({ name: 'MJ Extension Mixer' });
        mixer.open();

        return mixer; 
    }

    async subscribeToOutputChanges(callback: (event: MixerEvent) => void): Promise<MixerSubscription> {
        const mixer = await this.getMixer();

        const addId = mixer.connect(
            'output-added', 
            (_, deviceId) => callback({deviceId, type: 'output-added'}));
        const removeId = mixer.connect(
            'output-removed', 
            (_, deviceId) => callback({deviceId, type: 'output-removed'}));

        return { ids: [addId, removeId] };
    }

    unsubscribe(subscription: MixerSubscription) {
        if (!this.mixer) {
            log('WARN: Unsubscribe was invoked even though mixer was not yet created');
            return;
        }

        subscription.ids.forEach(id => {
            this.mixer!.disconnect(id);
        })
    }

    dispose() {
        if (!this.mixer) {
            return;
        }

        this.mixer.close();
        this.mixer.run_dispose();
    }
}

export async function waitForMixerToBeReady(mixer: MixerControl): Promise<void> {
    while (mixer.get_state() === MixerControlState.CONNECTING) {
        await delay(200);
    }

    const state = mixer.get_state();

    if (state === MixerControlState.FAILED) {
        throw new Error('MixerControl is in a failed state');
    } else if (state === MixerControlState.CLOSED) {
        throw new Error('MixerControl is in a closed state');
    }
}

export function waitForMixerToBeReadySync(mixer: MixerControl) {
    while (mixer.get_state() === MixerControlState.CONNECTING) {
        log('STILL WAITING...')
	    delaySync(200);
    }

    const state = mixer.get_state();

    if (state === MixerControlState.FAILED) {
        throw new Error('MixerControl is in a failed state');
    } else if (state === MixerControlState.CLOSED) {
        throw new Error('MixerControl is in a closed state');
    }
}

export interface MixerEvent {
    type: 'output-added' | 'output-removed';
    deviceId: number;
}

export interface MixerSubscription {
    ids: number[];
}