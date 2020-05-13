export interface IMalariaIndicatorModel {
    name: string;
    dhisID: string;
    dhisName: string;
    groupCode: string;
    type: string;
}

export class MalariaIndicatorModel implements IMalariaIndicatorModel {
    constructor(public name: string,
                public dhisID: string,
                public dhisName: string,
                public groupCode: string,
                public type: string) {
    }
}
