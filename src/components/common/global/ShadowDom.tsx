import { useLayoutEffect, useRef } from "react";

export default function ShadowDom({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    // Create a <style> tag
    const style = document.createElement("style");
    style.textContent = `
    .keep-styles {
        background: #ffffff;
        color: #000000;
        font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.6;
        word-wrap: break-word;
    }
    
    /* Headings */
    .keep-styles h1 {
        font-size: 36px;
        font-weight: 700;
        margin: 1.2em 0 0.6em;
    }
    
    .keep-styles h2 {
        font-size: 30px;
        font-weight: 600;
        margin: 1.1em 0 0.6em;
    }
    
    .keep-styles h3 {
        font-size: 24px;
        font-weight: 600;
        margin: 1em 0 0.5em;
    }
    
    /* Paragraphs & Text */
    .keep-styles p {
        font-size: 16px;
        margin-bottom: 16px;
    }
    
    .keep-styles div {
        font-size: 16px;
        margin-bottom: 16px;
    }
    
    .keep-styles strong {
        font-weight: 700;
    }
    
    .keep-styles em {
        font-style: italic;
    }
    
    .keep-styles u {
        text-decoration: underline;
    }
    
    /* Lists */
    .keep-styles ul,
    .keep-styles ol {
        padding-left: 30px;
        margin-bottom: 16px;
        list-style: disc;
    }
    
    .keep-styles li {
        list-style-type: inherit;
        margin-bottom: 8px;
    }
    
    /* Links */
    .keep-styles a {
        color: inherit;
        text-decoration: underline;
        transition: color 0.2s ease, text-decoration 0.2s ease;
    }
    
    .keep-styles a:hover {
        text-decoration: none;
        color: #2563eb; /* subtle hover blue */
    }
    
    /* Images */
    .keep-styles img {
        max-width: 100%;
        height: auto;
        border-radius: 6px;
        margin: 1em 0;
    }
    
    /* Inline Code */
    .keep-styles code {
        font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
        background-color: rgba(27, 31, 35, 0.05);
        padding: 0.2em 0.4em;
        border-radius: 6px;
        font-size: 85%;
    }
    
    /* Blockquotes */
    .keep-styles blockquote {
        border-left: 4px solid #d1d5db;
        padding-left: 16px;
        color: #4b5563;
        margin: 1em 0;
        font-style: italic;
    }
    `;

    // Create wrapper and insert HTML
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;
    wrapper.classList.add("keep-styles");

    // Append style + content to shadow root
    wrapper.appendChild(style);
    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(wrapper);
  }, [html]);

  return <div ref={containerRef}></div>;
}
