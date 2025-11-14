import Link from 'next/link';
import { Github, Twitter } from 'lucide-react';
import { config } from '@/lib/config';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/40">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* About */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">{config.app.name}</h3>
            <p className="text-sm text-muted-foreground">
              Professional blockchain explorer for {config.chain.name}. Fast, reliable, and open source.
            </p>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/blocks" className="text-muted-foreground hover:text-foreground">
                  Blocks
                </Link>
              </li>
              <li>
                <Link href="/tx" className="text-muted-foreground hover:text-foreground">
                  Transactions
                </Link>
              </li>
              <li>
                <Link href="/tokens" className="text-muted-foreground hover:text-foreground">
                  Tokens
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="text-muted-foreground hover:text-foreground">
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Developers */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Developers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={config.social.docs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href={`${config.api.baseUrl}/docs`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  API Docs
                </a>
              </li>
              <li>
                <a
                  href={config.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Community</h3>
            <div className="flex gap-4">
              <a
                href={config.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href={config.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              {config.app.version}
            </p>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>
            © {currentYear} {config.app.name}. Built with Next.js and BlockScout.
          </p>
        </div>
      </div>
    </footer>
  );
}
