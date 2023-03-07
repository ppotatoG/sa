interface saObj {
  saNodes: NodeListOf<Element> | null; // 교차점을 지나는 대상 요소들을 저장할 NodeList
  threshold: number; // Scroll 위치와 대상 요소의 교차점을 판단하는 기준값
  setThreshold: (threshold: any) => number; // threshold 값을 설정하는 함수
  intersection: () => void; // intersection observer 등록 함수
  init: (threshold?: number) => void; // 플러그인 초기화 함수
}

const sa: saObj = {
  /** 교차점을 지나는 대상 요소들을 저장할 NodeList */
  saNodes: null,

  /** Scroll 위치와 대상 요소의 교차점을 판단하는 기준값 */
  threshold: 0.1,

  /** threshold 값을 설정하는 함수 */
  setThreshold: function (threshold: any): number {
    if (typeof threshold === 'string') {
      threshold = threshold.trim();
      if (threshold === '') {
        console.warn('threshold value is empty, using default value 0.1');
        return 0.1;
      }
      if (isNaN(Number(threshold))) {
        console.warn(`invalid threshold value "${threshold}", using default value 0.1`);
        return 0.1;
      }
      threshold = Number(threshold);
    }

    if (typeof threshold !== 'number') {
      console.warn(`invalid threshold value "${threshold}", using default value 0.1`);
      return 0.1;
    }

    if (threshold > 1) {
      console.warn(
        `threshold value "${threshold}" cannot be greater than 1, using maximum value 1`,
      );
      threshold = 1;
    }

    return threshold;
  },

  /** intersection observer 등록 함수 */
  intersection: function (): void {
    if (this.saNodes && this.saNodes.length) {
      this.saNodes.forEach((saNode) => io.observe(saNode));
    }
  },

  /** 플러그인 초기화 함수 */
  init: function (threshold?: number): void {
    const nodes = document.querySelectorAll('[data-sa]');
    if (!nodes || nodes.length === 0) {
      throw new Error('No matching elements found');
    }
    this.saNodes = nodes;
    if (threshold !== undefined) {
      this.threshold = this.setThreshold(threshold);
    }
    this.intersection();
  },
};

/** js Observer API 커스텀 함수 */
const io = new IntersectionObserver(
  (nodes: IntersectionObserverEntry[]) => {
    nodes.forEach((node: IntersectionObserverEntry) => {
      const target: Element = node.target;

      if (!(target instanceof HTMLDivElement)) return false;

      /** 애니메이션을 한 번만 실행할 것인지 여부 */
      const once = target.dataset.saOnce === 'false';

      if (once) {
        if (node.isIntersecting) {
          target.classList.add('saShow'); // 애니메이션 클래스 추가
        } else if (!node.isIntersecting && target.classList.contains('saShow')) {
          target.classList.remove('saShow'); // 애니메이션 클래스 제거
        }
      } else {
        if (node.isIntersecting) {
          target.classList.add('saShow'); // 애니메이션 클래스 추가
          io.unobserve(target); // 교차점 감시 중지
        }
      }
    });
  },
  {
    threshold: sa.threshold, // 기준값 설정
  },
);
