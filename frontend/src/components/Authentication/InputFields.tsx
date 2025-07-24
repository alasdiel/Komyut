export function Username(){
  return (
    <div>
      <label htmlFor="username" className="text-sm font-medium text-gray-700">
        Username
      </label>
      <input
        id="username"
        type="text"
        name="username"
        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />
    </div>
  )
}

export function Password(){
  return(
    <div>
      <label htmlFor="password" className="text-sm font-medium text-gray-700">
      Password
      </label>
      <input
        id="password"
        type="password"
        name="password"
        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />
    </div>
  )
}

