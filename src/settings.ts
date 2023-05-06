const ExtensionUtils = imports.misc.extensionUtils;

export const SettingsPath = 'com.marcinjahn.exampleextension'
const ExcludedOutputsSetting = 'excluded-outputs';
const AllOutputsSetting = 'all-outputs';

export function getExcludedOutputDeviceIds(): number[] {
    const settings = ExtensionUtils.getSettings(SettingsPath);
    const ids = settings.get_strv(ExcludedOutputsSetting);

    return ids.map(id => parseInt(id));
}

export function setExcludedOutputDeviceIds(ids: number[]) {
    const settings = ExtensionUtils.getSettings(SettingsPath);
    settings.set_strv(ExcludedOutputsSetting, ids.map(id => id.toString()));
}

export function getAllOutputs(): number[] {
    const settings = ExtensionUtils.getSettings(SettingsPath);
    const ids = settings.get_strv(AllOutputsSetting);

    return ids.map(id => parseInt(id));
}

export function setAllOutputs(ids: number[]) {
    const settings = ExtensionUtils.getSettings(SettingsPath);
    settings.set_strv(AllOutputsSetting, ids.map(id => id.toString()));
}

export function addToAllOutputs(id: number) {
    const currentOutputs = getAllOutputs();

    if (currentOutputs.includes(id)) {
        return;
    }

    const newAllOutputs = [...currentOutputs, id];

    const settings = ExtensionUtils.getSettings(SettingsPath);
    settings.set_strv(AllOutputsSetting, newAllOutputs.map(id => id.toString()));
}

export function removeFromAllOutputs(id: number) {
    const outputs = getAllOutputs();

    const index = outputs.indexOf(id);

    if (index === -1) {
        return;
    }

    outputs.splice(index, 1);

    const settings = ExtensionUtils.getSettings(SettingsPath);
    settings.set_strv(AllOutputsSetting, outputs.map(id => id.toString()));
}