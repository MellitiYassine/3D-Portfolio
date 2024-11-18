export const W = 'w'
export const A = 'a'
export const S = 's'
export const D = 'd'
export const SHIFT = 'shift'
export const DIRECTIONS = [W, A, S, D]

export class KeyDisplay {

    map: Map<string, HTMLDivElement> = new Map()

    constructor() {
        const w: HTMLDivElement = document.createElement("div")
        const a: HTMLDivElement = document.createElement("div")
        const s: HTMLDivElement = document.createElement("div")
        const d: HTMLDivElement = document.createElement("div")
        const shift: HTMLDivElement = document.createElement("div")

        this.map.set(W, w)
        this.map.set(A, a)
        this.map.set(S, s)
        this.map.set(D, d)
        this.map.set(SHIFT, shift)

        this.map.forEach( (v, k) => {
            v.style.color = 'blue'
            v.style.fontSize = '50px'
            v.style.fontWeight = '800'
            v.style.position = 'absolute'
            v.textContent = k
        })

        this.updatePosition()

        this.map.forEach( (v, _) => {
            document.body.append(v)
        })
    }

    public updatePosition() {
        const w = this.map.get(W);
        const a = this.map.get(A);
        const s = this.map.get(S);
        const d = this.map.get(D);
        const shift = this.map.get(SHIFT);

        if (w) w.style.top = `${window.innerHeight - 150}px`;
        if (a) a.style.top = `${window.innerHeight - 100}px`;
        if (s) s.style.top = `${window.innerHeight - 100}px`;
        if (d) d.style.top = `${window.innerHeight - 100}px`;
        if (shift) shift.style.top = `${window.innerHeight - 100}px`;

        if (w) w.style.left = `300px`;
        if (a) a.style.left = `200px`;
        if (s) s.style.left = `300px`;
        if (d) d.style.left = `400px`;
        if (shift) shift.style.left = `50px`;
    }

    public down(key: string) {
        const element = this.map.get(key.toLowerCase());
        if (element) {
            element.style.color = 'red';
        }
    }

    public up(key: string) {
        const element = this.map.get(key.toLowerCase());
        if (element) {
            element.style.color = 'blue';
        }
    }


}