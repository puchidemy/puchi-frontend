import { Link } from "@/i18n/routing";

const FooterLink = () => {
  return (
    <div className="w-full py-4 flex flex-wrap justify-center gap-4 text-sm text-gray-500 text-center font-bold font-din">
      <Link className="hover:text-sky-500" href="/about">ABOUT</Link>
      <Link className="hover:text-sky-500" href="/help">HELP</Link>
      <Link className="hover:text-sky-500" href="/attribution">ATTRIBUTION</Link>
      <Link className="hover:text-sky-500" href="/guidelines">GUIDELINES</Link>
      <Link className="hover:text-sky-500" href="/terms-of-service">TERMS</Link>
      <Link className="hover:text-sky-500" href="/privacy-policy">PRIVACY</Link>
    </div>
  );
};

export default FooterLink;
