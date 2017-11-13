import { Component, ViewChild,  EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';
import { deserialize } from 'serializer.ts/Serializer';

import { WheelComponent } from './wheel.component';
import { DataService } from '../services/data.service';
import { APIService } from '../services/api.service';
import { SocketService, MESSAGE, Event } from '../services/socket.service';
import { HelpDialog } from '../dialogs/help.dialog';

import { Preset } from '../objects/objects';
import { Display, AudioDevice, INPUT, Input } from '../objects/status.objects';

@Component({
    selector: 'home',
    templateUrl: 'home.component.html',
    styleUrls: ['home.component.scss', '../colorscheme.scss']
})
export class HomeComponent {
    
    constructor(private data: DataService, private dialog: MatDialog, private socket: SocketService) {
        this.updateFromEvents();
    }

    @ViewChild(WheelComponent)
    public wheel: WheelComponent;

    private dtaPreset: Preset;
    private oldPreset: Preset;
    
    private oldDisplayData: Display[];
    private oldAudioDevicesData: AudioDevice[];

    private onWheelInit() {
        this.wheel.preset.top = "50vh";
        this.wheel.preset.right = "50vw";

        this.oldPreset = this.wheel.preset;

        this.dtaPreset = new Preset("All Displays", "subscriptions", this.data.displays, this.data.audioDevices.filter(a => a.roomWideAudio), this.wheel.preset.inputs);
        this.dtaPreset.top = this.wheel.preset.top;
        this.dtaPreset.right = this.wheel.preset.right;
    }

    public turnOn(): EventEmitter<boolean> {
        let ret: EventEmitter<boolean> = this.wheel.command.setPower('on', this.wheel.preset.displays);

        ret.subscribe(success => {
            if (success) {
                this.wheel.open(false, 400);
            }
        });

        return ret;
    }

    public help() {
        let dialogRef = this.dialog.open(HelpDialog, {
            width: '50vw',
            backdropClass: 'dialog-backdrop'
        });

        dialogRef.afterClosed().subscribe(result => {
        });
    }

    public displayToAll() {
        this.oldDisplayData = deserialize<Display[]>(Display, this.data.displays);
        this.oldAudioDevicesData = deserialize<AudioDevice[]>(AudioDevice, this.data.audioDevices);

        this.wheel.displayToAll(this.data.displays, this.data.audioDevices);
        this.wheel.preset = this.dtaPreset;
    }

    public unDisplayToAll() {
        this.wheel.unDisplayToAll(this.oldDisplayData, this.oldAudioDevicesData);

        this.wheel.preset = this.oldPreset;
    }

    private updateFromEvents() {
        this.socket.getEventListener().subscribe(event => {
            if (event.type == MESSAGE) {
                let e: Event = event.data;

                if (e.requestor.includes(APIService.hostname)) {
                    switch(e.eventInfoKey) {
                        case INPUT: {
                            let input: Input = Input.getInput(e.eventInfoValue, this.data.inputs); 
                            this.wheel.preset.extraInputs.length = 0;

                            if (input != null && !this.wheel.preset.inputs.includes(input)) {
                                this.wheel.preset.extraInputs.push(input);
                            }

                            this.wheel.render()
                        }
                        default:
                           break; 
                    }
                }
            }
        }); 
    }
}
