import { Building2, Camera } from "lucide-react";

type UserRole = "COMMISSIONER" | "FIELD_ENGINEER";

function loginAs(role: UserRole, destination: string) {
  window.localStorage.setItem("urbanHeatAuth", JSON.stringify({ role }));
  window.location.assign(destination);
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f2eb] px-5 py-12 text-[#29352f]">
      <section className="w-full max-w-2xl">
        <header className="mb-12 text-center">
          <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#29352f] text-[#cbd5bd] shadow-lg shadow-[#29352f]/10">
            <Building2 size={30} strokeWidth={1.7} aria-hidden="true" />
          </div>
          <h1 className="font-serif text-4xl font-medium tracking-tight sm:text-5xl">
            UrbanHeat AI{" "}
            <span className="italic text-[#819572]">Command Center</span>
          </h1>
          <p className="mt-5 text-lg text-[#718078]">
            Select your role to continue
          </p>
        </header>

        <div className="space-y-5">
          <button
            type="button"
            onClick={() => loginAs("COMMISSIONER", "/page1")}
            className="group flex min-h-28 w-full items-center gap-5 rounded-xl border border-[#deded3] bg-[#fbfaf6] px-5 py-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#819572] hover:shadow-lg hover:shadow-[#29352f]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#819572] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f4f2eb] sm:px-7"
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#eeece3] text-[#657b58] transition group-hover:bg-[#819572] group-hover:text-white">
              <Building2 size={27} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1 text-lg font-semibold text-[#29352f] sm:text-xl">
                Login as Municipal Commissioner
            </span>
          </button>

          <button
            type="button"
            onClick={() => loginAs("FIELD_ENGINEER", "/page3")}
            className="group flex min-h-28 w-full items-center gap-5 rounded-xl border border-[#deded3] bg-[#fbfaf6] px-5 py-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#819572] hover:shadow-lg hover:shadow-[#29352f]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#819572] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f4f2eb] sm:px-7"
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#eeece3] text-[#657b58] transition group-hover:bg-[#819572] group-hover:text-white">
              <Camera size={27} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1 text-lg font-semibold text-[#29352f] sm:text-xl">
                Login as Field Engineer
            </span>
          </button>
        </div>
      </section>
    </main>
  );
}
