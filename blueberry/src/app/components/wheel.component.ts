import { Component, Input as AngularInput, Output as AngularOutput, AfterContentInit, ElementRef, ViewChild, EventEmitter } from '@angular/core';

import { Preset } from '../objects/objects';
import { Display, Input, AudioDevice } from '../objects/status.objects';
import { CommandService } from '../services/command.service';

@Component({
	selector: 'wheel',
	templateUrl: './wheel.component.html',
	styleUrls: ['./wheel.component.scss', '../colorscheme.scss'],
})

export class WheelComponent implements AfterContentInit {
	private static TITLE_ANGLE: number =  100;
	private static TITLE_ANGLE_ROTATE: number = WheelComponent.TITLE_ANGLE / 2;

	@AngularInput() preset: Preset; 
    @AngularInput() blur: boolean;
    @AngularOutput() init: EventEmitter<any> = new EventEmitter();

	arcpath: string;
	titlearcpath: string;
	rightoffset: string;
	topoffset: string;
    translate: string;
	circleOpen: boolean;
    thumbLabel: boolean = true;
    newSelection: boolean = false;

	@ViewChild("wheel") wheel: ElementRef;

	constructor(public command: CommandService) {
		this.circleOpen = false;
	}

	ngAfterContentInit() {
		setTimeout(() => {
            this.render(); 
            this.init.emit(true)
        }, 0);
	}

	public toggle() {
        if (this.circleOpen) {
            this.close();
        } else {
            this.open(true);
        }
	}

    public open(togglePower: boolean) {
        if (togglePower && this.getPower() != "on")
            this.command.setPower('on', this.preset.displays);

        this.circleOpen = true;
    }

    public close() {
        this.circleOpen = false;
    }
	
	private render() {
        this.setTranslate();

		let numOfChildren = this.preset.inputs.length;	
		let children = this.wheel.nativeElement.children;
		let angle = (360 - WheelComponent.TITLE_ANGLE) / numOfChildren;

		this.arcpath = WheelComponent.getArc(.5, .5, .5, 0, angle);
		this.titlearcpath = WheelComponent.getArc(.5, .5, .5, 0, WheelComponent.TITLE_ANGLE);

		let rotate = "rotate(" + String(-(WheelComponent.TITLE_ANGLE_ROTATE)) + "deg)";
		children[0].style.transform = rotate;
		children[0 + numOfChildren + 1].style.transform = rotate; //rotate the line the corrosponds to this slice
	    rotate = "rotate(" + String(WheelComponent.TITLE_ANGLE_ROTATE) + "deg)";
        children[0].firstElementChild.style.transform = rotate;

		for (let i = 1; i <= numOfChildren; ++i) {
			rotate = "rotate(" + String((angle * -i) - WheelComponent.TITLE_ANGLE_ROTATE) + "deg)";
			children[i].style.transform = rotate;
			children[i + numOfChildren + 1].style.transform = rotate; // rotate the line that corrosponds to this slice

			rotate = "rotate(" + String((angle * i) + WheelComponent.TITLE_ANGLE_ROTATE) + "deg)";
			children[i].firstElementChild.style.transform = rotate;
		}

		this.setInputOffset();
	}

    private setTranslate() {
        let offsetX: number = parseInt(this.preset.right);
        let offsetY: number = parseInt(this.preset.top);

        let x = 50 - offsetX;
        let y = 50 - offsetY;

        this.translate = String("translate("+x+"vw,"+y+"vh)");
    }

	private setInputOffset() {
		let top: number;
		let right: number;

		switch (this.preset.inputs.length) {
			case 4:
				top = 4;
				right = 17.5;
				break;
			case 3: 
				top = 13;
				right = 16;
				break;
			case 2:
				top = 26;
				right = 10;
				break;
			case 1:
				top = 64;
				right = 15;
				break;	
			default:
				break;
		}

		this.topoffset = String(top) + "%";
		this.rightoffset = String(right) + "%";
	}

	private static getArc(x, y, radius, startAngle, endAngle): string {
		let start = WheelComponent.polarToCart(x, y, radius, endAngle);
		let end = WheelComponent.polarToCart(x, y, radius, startAngle);

		let largeArc = endAngle - startAngle <= 180 ? "0" : "1";

		let d = [
			"M", start.x, start.y,
			"A", radius, radius, 0, largeArc, 0, end.x, end.y,
			"L", x, y,
			"L", start.x, start.y
		].join(" ");

		return d;
	}

	private static polarToCart(cx, cy, r, angle) {
		let angleInRad = (angle - 90) * Math.PI / 180.0;

		return {
			x: cx + (r * Math.cos(angleInRad)),
			y: cy + (r * Math.sin(angleInRad))	
		}
	}

    public closeThumb() {
        setTimeout(() => {
            document.getElementById('slider').blur();
        }, 750);
    }

    private getInput(): Input {
        return Display.getInput(this.preset.displays);
    }

    private getVolume(): number {
        return AudioDevice.getVolume(this.preset.audioDevices); 
    }

    private getBlank(): boolean {
        return Display.getBlank(this.preset.displays); 
    }

    private getPower(): string {
        return Display.getPower(this.preset.displays); 
    }

    private getMute(): boolean {
        return AudioDevice.getMute(this.preset.audioDevices); 
    }

    public displayToAll(displays: Display[], audioDevices: AudioDevice[]) {
        let input: Input = Display.getInput(this.preset.displays);

        this.command.displayToAll(input, displays, audioDevices);
    }
}
