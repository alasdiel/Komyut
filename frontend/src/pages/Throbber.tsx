export default function PingThrobber() {
  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-primary">
      <div className="relative w-1/4 aspect-square">
        <span className="absolute inset-0 rounded-full bg-orange-300 opacity-75 animate-ping duration-2000"></span>
        <span className="relative inline-flex h-full w-full rounded-full bg-orange-300"></span>
      </div>
    </div>
  )
}
