import { useState } from "react";
import { signOut } from "next-auth/react";
import apiClient from "@/libs/api";
import { usePrivate } from "@/hooks/usePrivate";
import TagSEO from "@/components/TagSEO";
import ButtonCheckout from "@/components/ButtonCheckout"

export default function DashboardMain() {
  // Custom hook to make private pages easier to deal with (see /hooks folder)
  const [isEditing, setIsEditing] = useState(false);
  const [session, status] = usePrivate({});

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: session?.user?.name?.split(" ")[0] || '', // Assuming the first name is the first part of the full name
    lastName: session?.user?.name?.split(" ")[1] || '', // Assuming the last name is the second part of the full name
    email: session?.user?.email || '',
    password: '********', // Placeholder for password
  });


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    // Here, implement the logic to save the updated information.
    setIsEditing(false);
  };

  // Show a loader when the session is loading.
  if (status === "loading") {
    return <p>Loading...</p>;
  }

  return (
    <section>
      <main className="min-h-screen p-8 pb-24">
        <section className="max-w-md mx-auto space-y-8 bg-white p-4 rounded-lg shadow-md"> {/* Adjusted width */}
          <h1 className="text-3xl md:text-4xl font-extrabold">My Account:</h1>

          <form>
            <div className="form-control">
              <label className="label">
                <span className="label-text">First Name</span>
              </label>
              <input
                type="text"
                name="firstName"
                className="input input-bordered"
                value={formData.firstName}
                onChange={handleChange}
                disabled={!isEditing} 
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Last Name</span>
              </label>
              <input
                type="text"
                name="lastName"
                className="input input-bordered"
                value={formData.lastName}
                onChange={handleChange}
                disabled={!isEditing} 
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                name="email"
                className="input input-bordered"
                value={formData.email}
                onChange={handleChange}
                disabled='true'
              />
            </div>
          </form>

          

          <button
            className="btn m-2 btn-primary"
            onClick={isEditing ? handleSave : handleEditToggle}
          >
            {isEditing ? 'Save' : 'Edit'}
          </button>

          <button
            className="btn m-2 bg-red-300"
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            Logout
          </button>

          <ButtonCheckout/>


        </section>
      </main>
    </section>
  );
}