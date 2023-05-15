# Quick Settings Audio Devices Hider Gnome Extension

<a href="https://extensions.gnome.org/extension/5964/quick-settings-audio-devices-hider/">
<img src="https://raw.githubusercontent.com/marcinjahn/gnome-quicksettings-audio-devices-hider-extension/8e9404e349a0cf6c235cf69394a6292c6eef4cae/img/get-it-on-ego.svg" height="100" alt="Get it on GNOME Extensions"/>
</a>

This is a Gnome Shell Extension that allows you to hide the devices that you do
not need in the Quick Settings Audio Panel. It supports both output and input devices. It makes it easier to switch fast
between your audio devices when the panel is decluttered from the entries you're
not going to ever choose anyway.

![Gnome Outputs in Quick Settings](./img/audio-panel.png)

## Configuration

The shown/hidden devices may be configured via preferences window.

### Output Devices

<img alt="Output Settings" src="https://github.com/marcinjahn/gnome-quicksettings-audio-devices-hider-extension/blob/main/img/outputs-preferences.png?raw=true" width="80%">

### Input Devices

<img alt="Input Settings" src="https://github.com/marcinjahn/gnome-quicksettings-audio-devices-hider-extension/blob/main/img/inputs-preferences.png?raw=true" width="80%">

## Remarks

Note that the extension does not disable the device in the system. All the devices
are still going to be visible in the Control Panel. All this extension does is
to hide the unneeded devices from the Quick Settings panel.

This extension does not play well with the [Quick Settings Audio
Panel](https://extensions.gnome.org/extension/5940/quick-settings-audio-panel/)
extension. Its option to "Always show microphone volume slider" might not work
when Quick Settings Audio Devices Hider is enabled. A workaround could be to
install [[QSTweak] Quick Setting
Tweaker](https://extensions.gnome.org/extension/5446/quick-settings-tweaker/),
which has a similar functionality under the toggle "Always show input" under
the "Input/Output" tab.
