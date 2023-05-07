import { AudioDevice } from "./audio-device.dto";
import { DisplayName } from "./display-name";

/**
 * Display name format copied from
 * https://gitlab.gnome.org/GNOME/gnome-shell/-/blob/main/js/ui/status/volume.js#L132
 * @param device AudioDevice
 */
export function getAudioDevice(
    id: number, 
    description: string | null, 
    origin: string | null): AudioDevice 
{
    if (!description) description = 'unknown description';
    if (!origin) origin = 'unknown origin';

    return {
        id,
        displayName: `${description} - ${origin}`
    };
}