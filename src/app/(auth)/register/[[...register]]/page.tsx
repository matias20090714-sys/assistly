import { SignUp } from '@clerk/nextjs';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(40rem_40rem_at_center,var(--color-primary-foreground),transparent)] opacity-10 dark:opacity-20" />
      <SignUp
        appearance={{
          elements: {
            card: 'bg-card border border-border shadow-2xl rounded-2xl w-full max-w-md p-6',
            headerTitle: 'text-2xl font-bold tracking-tight text-foreground',
            headerSubtitle: 'text-sm text-muted-foreground font-light',
            socialButtonsBlockButton: 'border border-border bg-background hover:bg-accent text-foreground transition-all duration-150 rounded-lg',
            formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/95 transition-all rounded-lg text-sm font-medium h-10',
            formFieldInput: 'bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-ring focus:border-border h-10 px-3',
            footerActionText: 'text-muted-foreground font-light text-xs',
            footerActionLink: 'text-primary hover:text-primary/90 font-medium text-xs',
          },
        }}
      />
    </div>
  );
}
