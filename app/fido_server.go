package main

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"runtime"
	"time"

	"github.com/bulwarkid/virtual-fido/virtual_fido"
	wails_runtime "github.com/wailsapp/wails/v2/pkg/runtime"
)

func startFIDOServer(ctx context.Context, client *Client) {
	log_fd, _ := os.Create("test.log")
	defer log_fd.Close()
	virtual_fido.SetLogOutput(log_fd)

	go attachUSBIPServer(ctx)
	virtual_fido.Start(client)
}

func attachUSBIPServer(ctx context.Context) {
	time.Sleep(250 * time.Millisecond)
	if runtime.GOOS == "windows" {
		attachUSBIPWindows()
	} else if runtime.GOOS == "linux" {
		attachUSBIPLinux()
	} else {
		wails_runtime.LogErrorf(ctx, "Could not find USBIP command for OS %s\n", runtime.GOOS)
		return
	}
}

func attachUSBIPLinux() {
	commandList := []string{"sudo", "usbip", "attach", "-r", "127.0.0.1", "-b", "2-2"}

	prog := exec.Command(commandList[0], commandList[1:]...)
	prog.Stdin = os.Stdin
	prog.Stdout = os.Stdout
	prog.Stderr = os.Stderr
	err := prog.Run()
	if err != nil {
		fmt.Printf("Error: %s\n", err)
	}
}

func attachUSBIPWindows() {
	commandList := []string{"./usbip/usbip.exe", "attach", "-r", "127.0.0.1", "-b", "2-2"}

	prog := exec.Command(commandList[0], commandList[1:]...)
	prog.Stdin = os.Stdin
	prog.Stdout = os.Stdout
	prog.Stderr = os.Stderr
	err := prog.Run()
	if err != nil {
		fmt.Printf("Error: %s\n", err)
	}
}
