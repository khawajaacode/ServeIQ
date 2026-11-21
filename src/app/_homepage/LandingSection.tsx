import { useRouter } from "next/navigation";
import { type MouseEvent, useRef } from "react";
import { Button, useXTheme } from "xtreme-ui";

import { scrollToSection } from "#utils/helper/common";

import "./landingSection.scss";

import clsx from "clsx";

const bgImg = "/backgrounds/landingCover.png";
const overlayImg = "/backgrounds/landingCoverOverlay.png";
const maxOverlayTranslate = 0.3;
const LandingSection = () => {
	const router = useRouter();
	const { isDarkTheme } = useXTheme();
	const ref = useRef<HTMLDivElement>(null);

	const onMouseMove = (event: MouseEvent) => {
		const target = event.target as HTMLDivElement;
		const width = target.clientWidth / 2;
		const height = target.clientHeight / 2;

		const overlayX = maxOverlayTranslate * ((event.pageX - width) / width);
		const overlayY = maxOverlayTranslate * ((event.pageY - height) / height);
		if (ref.current) ref.current.style.transform = `translate(${overlayX}%, ${overlayY}%)`;
	};

	return (
		<section className={clsx("landingSection", isDarkTheme && "dark")} id="homepage">
			<div className="coverBackground" style={{ backgroundImage: `url(${bgImg})` }} />
			<div className="coverOverlay" onMouseMove={onMouseMove} ref={ref} style={{ backgroundImage: `url(${overlayImg})` }} />
			<div className="overlay" />
			<div className="landingGreeting">
				<h1 className="head">Revolutionizing</h1>
				<p className="subHead">Dining Experience</p>
				<p className="desc">Gone are the days of complex ordering systems and outdated</p>
				<p className="desc">paper menus. It&apos;s time for the new normal, ServeIQ</p>
				<div className="greetingAction">
					<Button label="Learn more" onClick={() => scrollToSection("homepage-aboutus")} type="secondary" />
					<Button label="Order now" onClick={() => router.push("/scan")} />
				</div>
			</div>
		</section>
	);
};

export default LandingSection;
