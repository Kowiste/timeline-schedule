export interface IPosition {
  id: number
  color: string
  position: number
  duration: number
}
export class Position implements IPosition {
  id: number
  color: string
  position: number
  duration: number
  constructor(data: IPosition) {
    this.id = data.id
    this.color = data.color
    this.position = data.position
    this.duration = data.duration
  }
}
