import { useEffect, useRef, useState } from "react";

export const useInView = (options?: { threshold?: number; triggerOnce?: boolean }) => {
	const { threshold = 0, triggerOnce = false } = options ?? {};
	const ref = useRef<HTMLDivElement>(null);
	const [inView, setInView] = useState(false);

	useEffect(() => {
		const node = ref.current;
		if (!node) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setInView(true);
					if (triggerOnce) observer.disconnect();
				} else if (!triggerOnce) setInView(false);
			},
			{ threshold }
		);

		observer.observe(node);
		return () => observer.disconnect();
	}, [threshold, triggerOnce]);

	return [ref, inView] as const;
};
