export default function SiteFooter() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(window.location.hostname || "diniverse");

  return (
    <footer className="border-t border-border bg-background py-4 px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
        <p>© {year} Dini.Verse. All rights reserved.</p>
        <p>
          Built with <span className="text-red-500">♥</span> using{" "}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}
