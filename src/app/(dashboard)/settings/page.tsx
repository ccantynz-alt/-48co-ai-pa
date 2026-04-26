import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ShieldCheck, ExternalLink, Settings as SettingsIcon, AlertTriangle } from "lucide-react";
import { ConnectStripeButton } from "./ConnectStripeButton";
import { formatDate } from "@/lib/utils";

export default async function SettingsPage() {
  const session = await getSession();
  const [user, subscription, stripeAccount] = await Promise.all([
    prisma.user.findUnique({ where: { id: session!.userId } }),
    prisma.subscription.findUnique({ where: { userId: session!.userId } }),
    prisma.stripeAccount.findUnique({ where: { userId: session!.userId } }),
  ]);

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Settings</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Manage your subscription, payments, and account</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between"><span className="text-sm text-zinc-500">Email</span><span className="text-sm font-medium text-zinc-900">{user?.email}</span></div>
          <div className="flex justify-between"><span className="text-sm text-zinc-500">Role</span><Badge variant={user?.role === "TRADIE" ? "default" : "secondary"}>{user?.role}</Badge></div>
          <div className="flex justify-between"><span className="text-sm text-zinc-500">Country</span><span className="text-sm font-medium">{user?.country === "NZ" ? "New Zealand" : "Australia"}</span></div>
          <div className="pt-3 border-t border-zinc-100">
            <Link href="/profile" className="text-sm text-orange-500 hover:underline inline-flex items-center gap-1">
              Edit profile <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {user?.role === "TRADIE" && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Subscription</CardTitle>
                <Link href="/pricing" className="text-sm text-orange-500 hover:underline">Compare plans</Link>
              </div>
            </CardHeader>
            <CardContent>
              {subscription ? (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-zinc-900">{subscription.plan}</p>
                      <p className="text-sm text-zinc-500">
                        {subscription.status === "TRIAL" && subscription.trialEndsAt
                          ? `Trial ends ${formatDate(subscription.trialEndsAt)}`
                          : subscription.status}
                      </p>
                    </div>
                    <Badge variant={subscription.status === "ACTIVE" ? "success" : subscription.status === "TRIAL" ? "warning" : "destructive"}>
                      {subscription.status}
                    </Badge>
                  </div>
                  {subscription.status === "TRIAL" && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700 flex gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      You&apos;re on a 14-day free trial. Upgrade anytime — no surprises.
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-zinc-500">No subscription yet. <Link href="/pricing" className="text-orange-500 hover:underline">View plans</Link></p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-zinc-500" />
                <CardTitle className="text-base">Marketplace Payouts (Stripe Connect)</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-500 mb-4">
                Connect your Stripe account to receive payments from marketplace jobs. 48co takes a 6% platform fee on completed work — no other fees.
              </p>
              {stripeAccount?.payoutsEnabled ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Payouts enabled · {stripeAccount.stripeAccountId}</span>
                </div>
              ) : (
                <ConnectStripeButton hasAccount={!!stripeAccount} />
              )}
            </CardContent>
          </Card>
        </>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-zinc-500" />
            <CardTitle className="text-base">Danger Zone</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500 mb-3">Need to delete your account? Email support@48co.app</p>
        </CardContent>
      </Card>
    </div>
  );
}
