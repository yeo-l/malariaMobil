export interface IMalariaIndicatorModel {
    name: string;
    dhisID: string;
    dhisName: string;
    groupCode: string;
    type: string;
    target: number;
    achieved: number;
    notInTrack: number;
}

export class MalariaIndicatorModel implements IMalariaIndicatorModel {
    constructor(public name: string,
                public dhisID: string,
                public dhisName: string,
                public groupCode: string,
                public type: string,
                public target: number,
                public achieved: number,
                public notInTrack: number) {
    }
}
