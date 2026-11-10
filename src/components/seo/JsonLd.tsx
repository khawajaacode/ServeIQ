interface JsonLdProps {
	data: Record<string, unknown>;
}

export const serializeJsonLd = (data: Record<string, unknown>) => JSON.stringify(data).replace(/</g, "\\u003c");

export default function JsonLd({ data }: JsonLdProps) {
	return <script dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} type="application/ld+json" />;
}
