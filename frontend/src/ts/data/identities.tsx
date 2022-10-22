import { callRPC } from "../core/rpc";
import { base64ToBytes, bytesToBase64, setImmediate } from "../core/util";
import { Identity } from "../../proto/data";
import { LogDebug } from "../wailsjs/runtime/runtime";

let identities: Identity[] = [];

let updateCallbackIndex = 0;
let updateCallbacks = new Map<number, (identities: Identity[]) => void>();

export function listenForUpdate(
    callback: (identities: Identity[]) => void
): number {
    updateCallbackIndex++;
    updateCallbacks.set(updateCallbackIndex, callback);
    setImmediate(() => {
        callback(identities);
    });
    return updateCallbackIndex;
}

export function unlistenForUpdate(index: number) {
    updateCallbacks.delete(index);
}

export async function update() {
    LogDebug("Updating identities: " + updateCallbacks);
    identities = await getIdentities();
    updateCallbacks.forEach((callback) => {
        callback(identities);
    });
}

export async function getIdentities(): Promise<Identity[]> {
    const protosRaw = (await callRPC("getIdentities")) as string[];
    const identities = [];
    for (const protoRaw of protosRaw) {
        const protoBytes = base64ToBytes(protoRaw); // Wails events converts bytes to base64
        const id = Identity.fromBinary(protoBytes, {
            readUnknownField: "throw",
        });
        identities.push(id);
    }
    return identities;
}

export async function deleteIdentity(id: Uint8Array) {
    return await callRPC("deleteIdentity", bytesToBase64(id));
}

export async function getPassphrase(): Promise<string> {
    return await callRPC("getPassphrase");
}

export async function changePassphrase(passphrase: string): Promise<void> {
    return await callRPC("changePassphrase", passphrase);
}

export function validatePassphrases(
    passphrase1?: string,
    passphrase2?: string,
    oldPassphrase?: string
): string | undefined {
    if (passphrase1 === undefined || passphrase1 === "") {
        // Invalid passphrase
        return "No new passphrase specified.";
    }
    if (passphrase1 !== passphrase2) {
        // Passphrases do not match
        return "Passphrases do not match.";
    }
    if (passphrase1 === oldPassphrase) {
        // Passphrase did not change
        return "Passphrase cannot be the same as the old passphrase.";
    }
    if (passphrase1!.length < 8) {
        // Passphrase is not long enough
        return "Passphrase must be at least 8 characters long.";
    }
    return undefined;
}
