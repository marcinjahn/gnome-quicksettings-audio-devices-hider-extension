import { DisplayName } from "identification/display-name";

const ExtensionUtils = imports.misc.extensionUtils;

const SettingsPath = 'org.gnome.shell.extensions.quicksettings-audio-devices-hider'

const ExcludedOutputIdsSetting = 'excluded-output-ids';
const ExcludedOutputNamesSetting = 'excluded-output-names';
const AllOutputsSetting = 'all-output-ids';

export class Settings {
    static getExcludedOutputDeviceIds(): number[] {
        const settings = ExtensionUtils.getSettings(SettingsPath);
        const ids = settings.get_strv(ExcludedOutputIdsSetting);
    
        return ids.map(id => parseInt(id));
    }
    
    static setExcludedOutputDeviceIds(ids: number[]) {
        const settings = ExtensionUtils.getSettings(SettingsPath);
        settings.set_strv(ExcludedOutputIdsSetting, ids.map(id => id.toString()));
    }
    
    static getExcludedOutputDeviceNames(): DisplayName[] {
        const settings = ExtensionUtils.getSettings(SettingsPath);
        const ids = settings.get_strv(ExcludedOutputNamesSetting);
    
        return ids;
    }
    
    static setExcludedOutputDeviceNames(ids: DisplayName[]) {
        const settings = ExtensionUtils.getSettings(SettingsPath);
        settings.set_strv(ExcludedOutputNamesSetting, ids);
    }
    
    static getAllOutputs(): number[] {
        const settings = ExtensionUtils.getSettings(SettingsPath);
        const ids = settings.get_strv(AllOutputsSetting);
    
        return ids.map(id => parseInt(id));
    }
    
    static setAllOutputs(ids: number[]) {
        const settings = ExtensionUtils.getSettings(SettingsPath);
        settings.set_strv(AllOutputsSetting, ids.map(id => id.toString()));
    }
    
    static addToAllOutputs(id: number) {
        const currentOutputs = Settings.getAllOutputs();
    
        if (currentOutputs.includes(id)) {
            return;
        }
    
        const newAllOutputs = [...currentOutputs, id];
    
        const settings = ExtensionUtils.getSettings(SettingsPath);
        settings.set_strv(AllOutputsSetting, newAllOutputs.map(id => id.toString()));
    }
    
    static removeFromAllOutputs(id: number) {
        const outputs = Settings.getAllOutputs();
    
        const index = outputs.indexOf(id);
    
        if (index === -1) {
            return;
        }
    
        outputs.splice(index, 1);
    
        const settings = ExtensionUtils.getSettings(SettingsPath);
        settings.set_strv(AllOutputsSetting, outputs.map(id => id.toString()));
    }
}