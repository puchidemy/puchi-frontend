type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AuthLayout({ children }: Props) {
  return <div className="mx-auto my-10">{children}</div>;
}
