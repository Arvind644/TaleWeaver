import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#244855] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        {/* Test Credentials Box */}
        <div className="bg-[#FBE9D0] p-6 rounded-lg shadow-lg border border-[#90AEAD]">
          <h2 className="text-xl font-bold text-[#244855] mb-3">Test Account</h2>
          <div className="space-y-2 text-[#874F41]">
            <div className="flex items-center justify-between">
              <span>Email:</span>
              <code className="bg-white px-2 py-1 rounded">hello+clerk_test@example.com</code>
            </div>
            <div className="flex items-center justify-between">
              <span>OTP:</span>
              <code className="bg-white px-2 py-1 rounded">424242</code>
            </div>
          </div>
        </div>

        {/* Clerk Sign In Form */}
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: "bg-[#E64833] hover:bg-[#E64833]/90",
              card: "bg-[#FBE9D0]",
              headerTitle: "text-[#244855]",
              headerSubtitle: "text-[#874F41]",
              formFieldLabel: "text-[#244855]",
              formFieldInput: "border-[#90AEAD]",
              footerActionLink: "text-[#244855] hover:text-[#244855]/80",
              dividerLine: "bg-[#90AEAD]",
              dividerText: "text-[#874F41]",
              socialButtonsBlockButton: "border-[#90AEAD] text-[#244855]",
              socialButtonsBlockButtonText: "text-[#244855]",
              formFieldInputShowPasswordButton: "text-[#874F41]",
            },
          }}
        />
      </div>
    </div>
  );
} 