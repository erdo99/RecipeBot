
import { signIn,signOut } from "@/auth"
import { FcGoogle } from 'react-icons/fc';

import { PowerIcon } from '@heroicons/react/24/outline';

export default function SignIn() {
  return (
    <form
      action={async (formData) => {
        "use server"
        await signIn("credentials", formData)
      }}
    >
      <label>
        Email
        <input name="email" type="email" />
      </label>
      <label>
        Password
        <input name="password" type="password" />
      </label>
      <button>Sign In</button>
      <button
        type="button"
        onClick={() => signIn('google')}
        className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
      >
        <FcGoogle className="inline-block mr-2" />
        Sign in with Google
      </button>
      <button
        type="button"
        onClick={() => signIn('GitHub')}
        className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
      >
        <FcGoogle className="inline-block mr-2" />
        Sign in with GitHub
      </button>
    </form>
  )
} 