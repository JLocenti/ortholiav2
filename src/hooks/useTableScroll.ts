import { useCallback, useRef } from 'react';

interface ScrollState {
  direction: 'left' | 'right' | null;
  speed: number;
  isScrolling: boolean;
  mouseX: number;
  lastScrollTime: number;
}

export function useTableScroll(containerRef: React.RefObject<HTMLElement>, baseSpeed = 3) {
  const scrollState = useRef<ScrollState>({
    direction: null,
    speed: 0,
    isScrolling: false,
    mouseX: 0,
    lastScrollTime: 0
  });
  const rafId = useRef<number>();

  const scroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || !scrollState.current.isScrolling) return;

    const { direction, mouseX, lastScrollTime } = scrollState.current;
    if (!direction) return;

    const now = performance.now();
    const deltaTime = now - lastScrollTime;
    if (deltaTime < 16) {
      rafId.current = requestAnimationFrame(scroll);
      return;
    }

    const rect = container.getBoundingClientRect();
    const threshold = 100;
    let speed = baseSpeed;
    let shouldScroll = false;

    if (direction === 'left') {
      const distance = mouseX - rect.left;
      if (distance < threshold) {
        speed = Math.max(0.5, baseSpeed * (1 - distance / threshold));
        shouldScroll = container.scrollLeft > 0;
      }
    } else {
      const distance = rect.right - mouseX;
      if (distance < threshold) {
        speed = Math.max(0.5, baseSpeed * (1 - distance / threshold));
        shouldScroll = container.scrollLeft < container.scrollWidth - container.clientWidth;
      }
    }

    if (shouldScroll) {
      const scrollAmount = direction === 'left' ? -speed : speed;
      const newScrollLeft = container.scrollLeft + scrollAmount;
      
      // Ensure we don't scroll past boundaries
      if (direction === 'left' && newScrollLeft >= 0) {
        container.scrollLeft = newScrollLeft;
      } else if (direction === 'right' && newScrollLeft <= container.scrollWidth - container.clientWidth) {
        container.scrollLeft = newScrollLeft;
      }

      scrollState.current.lastScrollTime = now;
      rafId.current = requestAnimationFrame(scroll);
    } else {
      stopScrolling();
    }
  }, [containerRef, baseSpeed]);

  const startScrolling = useCallback((direction: 'left' | 'right', mouseX: number) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const threshold = 100;
    let shouldScroll = false;

    if (direction === 'left') {
      shouldScroll = container.scrollLeft > 0;
    } else {
      shouldScroll = container.scrollLeft < container.scrollWidth - container.clientWidth;
    }

    if (shouldScroll) {
      scrollState.current = {
        direction,
        speed: baseSpeed,
        isScrolling: true,
        mouseX,
        lastScrollTime: performance.now()
      };

      if (!rafId.current) {
        rafId.current = requestAnimationFrame(scroll);
      }
    }
  }, [containerRef, baseSpeed, scroll]);

  const updateScrolling = useCallback((mouseX: number) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const threshold = 100;

    if (mouseX < rect.left + threshold && container.scrollLeft > 0) {
      if (scrollState.current.direction !== 'left') {
        scrollState.current = {
          ...scrollState.current,
          direction: 'left',
          mouseX,
          lastScrollTime: performance.now()
        };
      } else {
        scrollState.current.mouseX = mouseX;
      }
    } else if (mouseX > rect.right - threshold && 
               container.scrollLeft < container.scrollWidth - container.clientWidth) {
      if (scrollState.current.direction !== 'right') {
        scrollState.current = {
          ...scrollState.current,
          direction: 'right',
          mouseX,
          lastScrollTime: performance.now()
        };
      } else {
        scrollState.current.mouseX = mouseX;
      }
    } else {
      stopScrolling();
    }
  }, [containerRef]);

  const stopScrolling = useCallback(() => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = undefined;
    }

    scrollState.current = {
      direction: null,
      speed: 0,
      isScrolling: false,
      mouseX: 0,
      lastScrollTime: 0
    };
  }, []);

  return { startScrolling, stopScrolling, updateScrolling };
}