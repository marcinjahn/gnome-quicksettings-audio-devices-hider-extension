import { AudioDevice } from "./identification";

const Main = imports.ui.main;
const QuickSettings = Main.panel.statusArea.quickSettings;

export class AudioPanel {
  getDisplayedDevices(): AudioDevice[] {
    const devices = QuickSettings._volume._output._deviceItems;

    return Array.from(devices, ([id, value]) => ({
      id,
      displayName: value.label.get_text() as string,
    }));
  }

  removeDevice(id: number) {
    QuickSettings._volume._output._removeDevice(id);
  }

  addDevice(id: number) {
    QuickSettings._volume._output._addDevice(id);
  }
}
