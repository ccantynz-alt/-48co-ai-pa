import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./ProfileForm";
import Link from "next/link";
import { ExternalLink, ShieldCheck } from "lucide-react";

export default async function ProfilePage() {
  const session = await getSession();
  const user = await prisma.user.findUnique({ where: { id: session!.userId } });
  if (!user) return null;

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">My Profile</h1>
          <p className="text-zinc-500 text-sm mt-0.5">This is what homeowners see when they find you on the marketplace</p>
        </div>
        {user.role === "TRADIE" && user.slug && (
          <Link
            href={`/tradies/${user.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm text-orange-500 hover:underline"
          >
            View public profile <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {user.isVerified && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-semibold text-green-900 text-sm">Verified Tradie</p>
            <p className="text-xs text-green-700">Your active licence has been verified. Homeowners see this badge on your profile.</p>
          </div>
        </div>
      )}

      <ProfileForm user={JSON.parse(JSON.stringify(user))} />
    </div>
  );
}
