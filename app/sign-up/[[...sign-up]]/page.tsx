import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#FBE9D0] flex items-center justify-center p-4">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-white/90 shadow-xl border border-[#90AEAD]",
            headerTitle: "text-[#244855]",
            headerSubtitle: "text-[#874F41]",
            formButtonPrimary: "bg-[#E64833] hover:bg-[#E64833]/90",
            formFieldInput: "border-[#90AEAD] focus:border-[#244855]",
            footerActionLink: "text-[#244855] hover:text-[#244855]/80",
          },
        }}
      />
    </div>
  );
} 