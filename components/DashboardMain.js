import { useState } from "react";
import { useRouter } from "next/router"; 
import { signOut } from "next-auth/react";
import apiClient from "@/libs/api";
import { usePrivate } from "@/hooks/usePrivate";
import TagSEO from "@/components/TagSEO";
import ButtonCheckout from "@/components/pricing";
import { getServerSession } from "next-auth/next";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import config from "@/config";



export default function DashboardMain() {
  // Custom hook to make private pages easier to deal with (see /hooks folder)
  const [isEditing, setIsEditing] = useState(false);
  const [session, status, updateSession] = usePrivate({}); // Add updateSession function
  const router = useRouter();


  const email =session?.user?.email;

  const [hasAccess, setHasAccess] = useState(false);
  const [accessStatus, setAccessStatus] = useState('pending');


  const [formData, setFormData] = useState({
    firstName: session?.user?.name?.split(" ")[0] || "",
    lastName: session?.user?.name?.split(" ")[1] || "",
    email: session?.user?.email || "",
    password: "********",
  });

  useEffect(() => {
    if (status === "authenticated") {
      setAccessStatus('pending'); // Initially set to pending
      fetch('/api/user/hasAccess')
        .then(res => res.json())
        .then(data => {
          if (data.hasAccess !== undefined) {
            setHasAccess(data.hasAccess);
            setAccessStatus(data.hasAccess ? 'granted' : 'denied');
          }
        })
        .catch(error => {
          console.error('Error fetching access status:', error);
          setAccessStatus('error');
        });
    }
  }, [status]);



  const handleClick = (e) => {
    router.push('/#pricing');
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const renderActionButton = () => {
    switch (accessStatus) {
      case 'pending':
        // Return nothing if the status is pending
        return null;
      case 'granted':
        // Return a button to manage subscription if the user has access
        return (
          <button className="btn btn-primary btn-wide" onClick={() => router.push(config.stripe.portalLink)}>
            Manage Subscription
          </button>
        );
      case 'denied':
        // Return the ButtonGet component if the user does not have access
        return <ButtonCheckout />;
      default:
        // Handle other cases or return null if no other cases are expected
        return null;
    }
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
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                name="email"
                className="input input-bordered"
                value={email}
                onChange={handleChange}
                disabled='true'
              />
            </div>


            {/* Styled Access Status Field */}
            <div className="form-control">
            <label className="label">
              <span className="label-text">Access Status</span>
            </label>
            <div className={`input input-bordered text-center justify-center flex-col flex 
              ${accessStatus === 'granted' ? "bg-green-100" : accessStatus === 'denied' ? "bg-red-100" : "bg-yellow-100"}`}>
              {accessStatus === 'pending' && "Checking Access..."}
              {accessStatus === 'granted' && "Subscription Active"}
              {accessStatus === 'denied' && "No Active Subscription"}
              {accessStatus === 'error' && "Error Checking Access"}
            </div>
          </div>

          </form>

          {renderActionButton()}

          <button
            className="btn m-2 bg-red-300"
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            Logout
          </button>

          

        </section>
      </main>
    </section>
  );
}

