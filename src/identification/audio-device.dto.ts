import { DisplayName } from "./display-name";
import { DeviceType } from "./device-type";

export interface AudioDevice {
  id: number;
  displayName: DisplayName;
  type: DeviceType;
}
