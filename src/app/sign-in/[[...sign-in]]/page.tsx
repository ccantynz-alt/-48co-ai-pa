import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-in" />
    </main>
  );
}
