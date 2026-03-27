export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md text-center max-w-sm w-full">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <p className="text-gray-600 mb-6">Please log in to your account.</p>
        <form className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" className="w-full border p-2 rounded" placeholder="Enter email" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" className="w-full border p-2 rounded" placeholder="Enter password" />
          </div>
          <button className="w-full bg-primary text-white py-2 rounded font-bold">Sign In</button>
        </form>
      </div>
    </div>
  )
}
