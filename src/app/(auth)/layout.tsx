import { RoomeWordmark } from "@/components/ui/Wordmark";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-roome-deep via-roome-core to-roome-glow flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black tracking-tight font-heading">
            <RoomeWordmark />
          </h1>
          <p className="text-gray-500 text-sm mt-1">Find your place. Find your person.</p>
        </div>
        {children}
      </div>
    </div>
  );
}
