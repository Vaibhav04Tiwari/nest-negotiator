const SiteFooter = () => (
  <footer className="border-t">
    <div className="container mx-auto py-8 text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-4">
      <p>© {new Date().getFullYear()} BuildMate. All rights reserved.</p>
      <nav className="flex items-center gap-6">
        <a href="#" className="hover:text-primary">Privacy</a>
        <a href="#" className="hover:text-primary">Terms</a>
        <a href="#" className="hover:text-primary">Contact</a>
      </nav>
    </div>
  </footer>
);

export default SiteFooter;
