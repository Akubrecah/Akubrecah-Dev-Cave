import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="flex h-full min-h-[calc(100vh-64px)] w-full items-center justify-center p-4">
      <SignIn 
        appearance={{
          elements: {
            card: 'bg-[#111111] border border-white/10 shadow-2xl rounded-2xl',
            headerTitle: 'text-white font-bold text-2xl',
            headerSubtitle: 'text-[var(--color-text-secondary)]',
            socialButtonsBlockButton: 'bg-black/50 border border-white/10 text-white hover:bg-white/5 transition-colors',
            socialButtonsBlockButtonText: 'font-semibold',
            dividerLine: 'bg-white/10',
            dividerText: 'text-white/40 text-xs uppercase',
            formFieldLabel: 'text-white/70 font-semibold',
            formFieldInput: 'bg-black/50 border-white/10 text-white focus:border-[var(--color-brand-red)] rounded-xl py-3',
            formButtonPrimary: 'bg-[var(--color-brand-red)] hover:bg-[var(--color-deep-crimson)] text-white font-bold py-3 rounded-xl transition-colors',
            footerActionText: 'text-white/60',
            footerActionLink: 'text-[#F5C200] hover:text-yellow-400 font-bold',
            identityPreviewText: 'text-white',
            identityPreviewEditButton: 'text-[var(--color-brand-red)] hover:text-[var(--color-deep-crimson)]',
            formFieldAction: 'text-[#F5C200] hover:text-yellow-400',
            logoImage: 'filter invert contrast-200'
          }
        }}
      />
    </div>
  )
}
