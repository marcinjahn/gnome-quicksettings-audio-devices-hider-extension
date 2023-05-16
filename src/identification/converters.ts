import { AudioDevice } from "./audio-device.dto";
import { DeviceType } from "./device-type";

/**
 * Display name format copied from
 * https://gitlab.gnome.org/GNOME/gnome-shell/-/blob/main/js/ui/status/volume.js#L132
 * The "-" is U+2013 on purpose
 * @param id
 * @param description
 * @param origin
 * @param type
 */
export function getAudioDevice(
  id: number,
  description: string | null,
  origin: string | null,
  type: DeviceType
): AudioDevice {
  if (!description) description = "unknown device";

  return {
    id,
    displayName: origin ? `${description} – ${origin}` : description,
    type,
  };
}
