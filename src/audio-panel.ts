import * as Main from "gnomejs://main.js";

import { DeviceType } from "./identification";

const QuickSettings = Main.panel.statusArea.quickSettings;

export class AudioPanel {
  getDisplayedDeviceIds(type: DeviceType): number[] {
    const devices =
      type === "output"
        ? QuickSettings._volumeOutput._output._deviceItems
        : QuickSettings._volumeInput._input._deviceItems;

    return Array.from(devices, ([id]) => id);
  }

  removeDevice(id: number, type: DeviceType) {
    if (type === "output") {
      QuickSettings._volumeOutput._output._removeDevice(id);
    } else {
      QuickSettings._volumeInput._input._removeDevice(id);
    }
  }

  addDevice(id: number, type: DeviceType) {
    if (type === "output") {
      QuickSettings._volumeOutput._output._addDevice(id);
    } else {
      QuickSettings._volumeInput._input._addDevice(id);
    }
  }
}
