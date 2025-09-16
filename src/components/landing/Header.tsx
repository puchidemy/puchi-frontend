import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import GithubSVG from "@public/images/github.svg";
import FacebookSVG from "@public/images/facebook.svg";
import LogoSVG from "@public/images/logo/logo.svg";
import ThemeToggle from "@/components/ThemeToggle";
import NavigationLocaleSwitcherPublic from "@/components/NavigationLocaleSwitcherPublic";

const LinkNav = () => {
  return (
    <div className="space-x-2">
      <ThemeToggle />
      <Button variant="ghost" size="icon" asChild>
        <a
          href="https://github.com/puchidemy/puchi-frontend"
          target="_blank"
          aria-label="GitHub repo"
          title="Github repo"
        >
          <GithubSVG className="size-6" />
        </a>
      </Button>
      <Button variant="ghost" size="icon" asChild>
        <a
          href="https://www.facebook.com/profile.php?id=61569075361529"
          target="_blank"
          aria-label="Facebook group"
          title="Facebook group"
        >
          <FacebookSVG className="size-6" />
        </a>
      </Button>
    </div>
  );
};

const Header = () => {
  return (
    <header className="relative flex justify-center">
      <div className="z-1 flex w-full items-center justify-between gap-2 px-2 sm:px-8">
        <div className="flex flex-1 max-sm:hidden">
          <LinkNav />
        </div>
        <Link
          href="/"
          className="focus-visible group flex h-16 w-14 flex-col items-center gap-1 rounded-b-3xl bg-secondary/30 px-[6px] pt-2 text-2xl transition-colors hover:bg-primary/25 dark:bg-card dark:hover:bg-border/70 sm:size-32 sm:rounded-b-4xl sm:pt-4 sm:text-3xl lg:w-36 lg:text-4xl"
          title="Puchi app"
        >
          <LogoSVG className="w-[1.5em] group-hover:animate-bounce" />
          <span className="font-display -tracking-widest max-sm:sr-only">
            Puchi
          </span>
        </Link>
        <div className="flex flex-1 items-center justify-end">
          <div className="sm:hidden">
            <LinkNav />
          </div>
          <NavigationLocaleSwitcherPublic />
        </div>
      </div>
    </header>
  );
};

export default Header;
