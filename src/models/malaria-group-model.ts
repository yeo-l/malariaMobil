export interface IMalariaGroupModel {
  code?: string;
  name?: string;
  parent?: string;
}
export class MalariaGroupModel implements IMalariaGroupModel{
  constructor(public code?: string,
              public name?: string,
              public parent?: string) {}
}
