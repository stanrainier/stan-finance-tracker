// import { cookies } from "next/headers";
// import { redirect } from "next/navigation";

export default async function transactionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="w-full px-0 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col gap-4">
        {children}
      </div>
    </section>
  );
}
