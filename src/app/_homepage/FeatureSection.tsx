"use client";

import { Lottie } from "xtreme-ui";

import { getAnimSrc } from "#utils/constants/common";

import "./featureSection.scss";

const getHSL = (hue: number, light: number) => `hsl(${hue}, 70%, ${light}%)`;

const FeatureList = ({ items }: { items: string[] }) =>
	items.map((item, i) => {
		const hue = i * (360 / items.length);
		return (
			<div
				className="featureListItem"
				key={i}
				style={{
					["--lightFeatureColor" as string]: getHSL(hue, 80),
					["--darkFeatureColor" as string]: getHSL(hue, 40),
				}}
			>
				<span className="featureLetter">{item.charAt(0)}</span>
				<p>{item}</p>
			</div>
		);
	});

const FeatureSection = () => (
	<section className="featureSection" id="homepage-features">
		<div className="featuresContent">
			<h2>Features</h2>
			<FeatureList
				items={[
					"Bring down your operating and logistics cost",
					"Eliminate any third parties between your customer and kitchen",
					"Track history of all your customer orders",
					"Time to get a professional edge",
					"Enhance the dining experience for your own customers",
					"Remove any scope of human error in your restaurant management",
				]}
			/>
		</div>
		<div className="featuresAnim">
			<Lottie className="whyUsAnim" speed={0.5} src={getAnimSrc("FoodMeal")} />
		</div>
	</section>
);

export default FeatureSection;
