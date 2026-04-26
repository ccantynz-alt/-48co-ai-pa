import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { PostJobForm } from "./PostJobForm";
import Link from "next/link";
import { Zap } from "lucide-react";

export default async function PostJobPage() {
  const session = await getSession();
  if (!session) redirect("/register-homeowner");

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="bg-white border-b border-zinc-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-zinc-900">48co</span>
          </Link>
          <Link href="/find-tradies" className="text-sm text-zinc-600 hover:text-zinc-900">Browse Tradies</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-zinc-900">Post a Job</h1>
          <p className="text-zinc-500 mt-1">Free to post. Get bids from verified local tradies in 24 hours.</p>
        </div>
        <PostJobForm />
      </div>
    </div>
  );
}
