import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-12">
        <div className="card p-6">
          <h1 className="text-xl font-semibold">Riverside Staff Login</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Employees only. New employee? Ask an existing staff member to invite you
            from the Supabase dashboard.
          </p>
          <LoginForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
