interface ExternalLinkProps {
    href: string;
    children: JSX.Element | string;
}

export default function ExternalLink({href, children}: ExternalLinkProps): JSX.Element {
    return (
        <a href={href} target="_blank" rel="noreferrer">
            {children}
        </a>
    );
}
