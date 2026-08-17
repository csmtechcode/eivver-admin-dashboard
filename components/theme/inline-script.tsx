interface InlineScriptProps {
    html: string;
}

export default function InlineScript({ html }: InlineScriptProps) {
    return (
        <script
            type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}