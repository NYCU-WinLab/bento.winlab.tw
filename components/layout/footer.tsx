export function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-5xl items-center justify-center p-4 pb-8">
      <p className="text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} NYCU Winlab.
      </p>
    </footer>
  )
}
