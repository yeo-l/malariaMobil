export interface IMalariaOrgUnitModel {
  region?: string;
  district?: string;
  facility?: string;
  chw?: string;
}
export class MalariaOrgUnitModel implements IMalariaOrgUnitModel{
  constructor(public region?: string,
              public district?: string,
              public facility?: string,
              public chw?: string) {}
}
