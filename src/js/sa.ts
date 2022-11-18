interface saObj {
    saNodes: NodeListOf<HTMLElement> | [];
    threshold: number;
    setThreshold: Function;
    intersection: Function;
    init: Function;
}

const sa: saObj = {
    saNodes: [],
    threshold: .1,
    setThreshold: function (param: string | number): number | null {
        if (!isNaN(<number>param)) {
            return Number(param);
        } else if ((/[0-9]+%/).test(param.toString())) {
            return Number(100 * (+param / 100));
        }
        return null;
    },
    intersection: function (): void {
        this.saNodes.forEach((saNode : HTMLElement) => io.observe(saNode));
    },
    init: function (el: string, threshold?: number | string): void {
        this.saNodes = document.querySelectorAll(el);
        if (threshold) this.setThreshold(threshold);
        this.intersection();
    }
}

const io = new IntersectionObserver((nodes : IntersectionObserverEntry[]) => {
    nodes.forEach((node : IntersectionObserverEntry)=> {
        const target : Element = node.target;
        // @ts-ignore
        const onceBool = target.dataset.saOnce === 'false';

        if (onceBool)  {
            console.log(node.isIntersecting)
            if (node.isIntersecting) {
                target.classList.add('saShow');
            } else if (!node.isIntersecting && target.classList.contains('saShow')) {
                target.classList.remove('saShow');
            }
        } else {
            if (node.isIntersecting) {
                target.classList.add('saShow');
                io.unobserve(target);
            }
        }
    })
}, {
    threshold: sa.threshold
});

window.addEventListener('DOMContentLoaded', (): void => {
    sa.init('[data-sa]');
});