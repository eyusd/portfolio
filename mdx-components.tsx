import type { MDXComponents } from 'mdx/types';
import { Link } from '@/i18n/routing';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Customize heading components with IDs for anchor links
    h1: ({ children, id }) => (
      <h1 id={id} className="scroll-mt-20">
        {children}
      </h1>
    ),
    h2: ({ children, id }) => (
      <h2 id={id} className="scroll-mt-20">
        {children}
      </h2>
    ),
    h3: ({ children, id }) => (
      <h3 id={id} className="scroll-mt-20">
        {children}
      </h3>
    ),
    // Customize links to use Next.js Link for internal navigation
    a: ({ href, children }) => {
      const isExternal = href?.startsWith('http');
      
      if (isExternal) {
        return (
          <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            {children}
          </a>
        );
      }
      
      return (
        <Link href={href || '#'}>
          {children}
        </Link>
      );
    },
    // Customize code blocks
    pre: ({ children, ...props }) => (
      <pre className="overflow-x-auto" {...props}>
        {children}
      </pre>
    ),
    // Style inline code (backticks) as monospace and slightly highlighted
    code: ({ className, children, ...props }) => {
      const isCodeBlock = typeof className === 'string' && className.startsWith('language-');
      if (isCodeBlock) {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }
      return (
        <code className={`font-mono rounded px-1 text-sm bg-muted/10 ${className ?? ""}`} {...props}>
          {children}
        </code>
      );
    },
    ...components,
  };
}
