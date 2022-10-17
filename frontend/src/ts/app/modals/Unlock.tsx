import React from "react";
import { TitleBar } from "../../components/TitleBar";
import { hideModal, showModal } from "../ModalContainer";

export async function requestPassphraseFromUser(): Promise<string> {
    return new Promise<string>((resolve) => {
        showModal(
            <UnlockModal
                onUnlock={(passphrase) => {
                    hideModal();
                    resolve(passphrase);
                }}
            />
        );
    });
}

type UnlockModalProps = {
    onUnlock: (passphrase: string) => void;
};

export class UnlockModal extends React.Component<UnlockModalProps> {
    private inputRef_ = React.createRef<HTMLInputElement>();

    componentDidMount() {
        this.inputRef_.current?.focus();
    }

    render() {
        return (
            <div className="w-screen h-screen flex flex-col">
                <TitleBar title="Unlock Vault" />
                <div className="grow flex flex-col items-center justify-center">
                    <input
                        ref={this.inputRef_}
                        onKeyUp={this.onKeyUp_}
                        type="password"
                        placeholder="Passphrase"
                        className="daisy-input w-full max-w-xs mx-4"
                    />
                    <div className="daisy-btn mt-2" onClick={this.onUnlock_}>
                        Unlock
                    </div>
                </div>
            </div>
        );
    }

    onKeyUp_ = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            this.onUnlock_();
        }
    };

    onUnlock_ = () => {
        this.props.onUnlock(this.inputRef_.current!.value);
    };
}
