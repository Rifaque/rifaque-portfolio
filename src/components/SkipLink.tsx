/** First tab stop on the page. Visible only when focused. */
const SkipLink = () => (
  <a
    href="#main"
    className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:border focus:border-aurora-teal/40 focus:bg-background focus:px-4 focus:py-2.5 focus:text-sm focus:text-foreground"
  >
    Skip to content
  </a>
);

export default SkipLink;
