import Lightings from "./Lightings";
import "./footerSection.scss";

const FooterSection = () => (
	<section className="footerSection" id="homepage-footer">
		<p>© {new Date().getFullYear()} ServeIQ. All rights reserved.</p>
		<Lightings />
	</section>
);

export default FooterSection;
