export interface IPosition {
  id: number
  color: string
  from: Date
  to: Date
}
export class Position implements IPosition {
  id: number
  color: string
  from: Date
  to: Date
  constructor(data: IPosition) {
    this.id = data.id
    this.color = data.color
    this.from = data.from
    this.to = data.to
  }
}

export enum EDirection {
  Left = 1,
  Right = 2,
}
